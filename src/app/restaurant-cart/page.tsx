"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import styles from "./restaurant-cart.module.scss";
import Header from "@/components/common/Header/Header";
import BottomNavigation from "@/components/common/BottomNavigation/BottomNavigation";
import QuantityButton from "@/components/common/QuantityButton/QuantityButton";

interface CartItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  choice_of_mixer_name?: string;
  is_double_shot?: boolean;
  shot_count?: number;
  special_instruction?: string;
}

interface OrderProduct {
  id: string;
  product_name: string;
  quantity: string;
  price: string;
  choice_of_mixer_name?: string;
  is_double_shot: string;
  shot_count: string;
  special_instruction?: string;
  unit: string;
}

interface Order {
  id: string;
  unique_id: string;
  amount: string;
  tax_amount: string;
  total_amount: string;
  tips: string;
  order_date: string;
  order_time: string;
  created_at?: string;
  table_no: string;
  status: string;
  order_type?: string; // ✅ Added for filtering
  products: OrderProduct[];
}

export default function RestaurantCart() {
  const router = useRouter();

  const [deviceId, setDeviceId] = useState<string>("");
  const [tableNo, setTableNo] = useState<string>("");
  const [shopId, setShopId] = useState<string>("");
  const [shopName, setShopName] = useState<string>("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [matchedOrders, setMatchedOrders] = useState<Order[]>([]);

  // Load device_id, table info, shop_id, and shop_name from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedDevice = localStorage.getItem("device_id") || "";
    const storedTable =
      localStorage.getItem("table_number") ||
      localStorage.getItem("table_no") ||
      "";
    const storedShop = JSON.parse(localStorage.getItem("selected_shop") || "{}");
    const storedShopId = storedShop?.id || localStorage.getItem("shop_id") || "";
    const storedShopName = storedShop?.name || "";

    const storedUserEmail = localStorage.getItem("user_email") || "";
    const storedUserMobile = localStorage.getItem("user_mobile") || "";

    if (!storedUserEmail) {
      localStorage.setItem("user_email", "user@liquiditybars.com");
    }
    if (!storedUserMobile) {
      localStorage.setItem("user_mobile", "+10000000000");
    }

    setDeviceId(storedDevice);
    setTableNo(storedTable);
    setShopId(storedShopId);
    setShopName(storedShopName);
  }, []);

  // ✅ PERFECT FILTERING LOGIC
  const filterOrdersByTable = useCallback((allOrders: Order[]) => {
    console.log("🔍 Filtering orders:", { 
      allOrders: allOrders.length, 
      tableNo, 
      hasTableNumber: !!localStorage.getItem("table_number") 
    });
    
    const hasTableNumber = !!localStorage.getItem("table_number");
    
    if (hasTableNumber && tableNo) {
      // Table mode: table_no MATCH + order_type = "2"
      const tableOrders = allOrders.filter((order) => {
        const tableMatch = order.table_no === tableNo;
        const typeMatch = order.order_type === "2";
        return tableMatch && typeMatch;
      });
      console.log("📋 Table orders (type 2) found:", tableOrders.length);
      return tableOrders;
    } else {
      // Bar mode: order_type = "1" ONLY
      const barOrders = allOrders.filter((order) => {
        return order.order_type === "1";
      });
      console.log("📋 Bar orders (type 1) found:", barOrders.length);
      return barOrders;
    }
  }, [tableNo]);

  // Fetch past orders
  const fetchOrders = useCallback(async () => {
    if (!deviceId) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(
        `https://liquiditybars.com/canada/backend/admin/api/tblOrderList/${deviceId}`
      );
      const data = await res.json();
      console.log("📡 Raw orders API:", data.orders?.length);

      if (data.status === "1") {
        const filteredOrders = (data.orders || [])
          .filter((order: Order) => order.products && order.products.length > 0)
          .sort((a: Order, b: Order) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : new Date(a.order_time).getTime();
            const dateB = b.created_at ? new Date(b.created_at).getTime() : new Date(b.order_time).getTime();
            return dateB - dateA;
          });
        setOrders(filteredOrders);
      }
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setLoadingOrders(false);
    }
  }, [deviceId]);

  // Update matched orders
  useEffect(() => {
    const matched = filterOrdersByTable(orders);
    setMatchedOrders(matched);
  }, [orders, tableNo, filterOrdersByTable]);

  // Fetch cart
  const fetchCart = useCallback(async () => {
    if (!deviceId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/getCart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: deviceId }),
      });
      const data = await res.json();

      if (data.status === "1" || data.status === 1) {
        setCartItems(data.cartItems || []);
        setCartTotal(Number(data.total_price || 0));
      } else {
        setCartItems([]);
        setCartTotal(0);
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  // Remove item
  const removeItem = async (itemId: string) => {
    if (!deviceId || !itemId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/deleteFromTempCart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId }),
      });

      const data = await res.json();
      if (data.status === "1" || data.status === 1) {
        await fetchCart();
      } else {
        alert(data.message || "Could not remove item");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to remove item");
    } finally {
      setLoading(false);
    }
  };

  // Update quantity
  const updateQuantity = async (itemId: string, newQty: number) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;
    if (newQty === 0) return removeItem(itemId);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("device_id", deviceId);
      formData.append("id", itemId);
      formData.append("quantity", String(newQty));

      const res = await fetch(
        "https://liquiditybars.com/canada/backend/admin/api/updateTempCartData",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.status === "1" || data.status === 1) {
        await fetchCart();
      } else {
        alert(data.message || "Could not update quantity.");
      }
    } catch (err) {
      console.error("Cart update error:", err);
      alert("Failed to update cart.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart and orders when deviceId ready
  useEffect(() => {
    if (deviceId) {
      fetchCart();
      fetchOrders();
    }
  }, [deviceId, fetchCart, fetchOrders]);

  // Calculate totals
  const taxes = cartTotal * 0.13;
  const totalAmount = cartTotal + taxes;
  const finalTotalAmount = totalAmount.toFixed(2);

  // ✅ Order type based on table_number
  const getOrderType = (): string => {
    const tableNumber = localStorage.getItem("table_number");
    return tableNumber ? "2" : "1";
  };

  const getUserInfo = () => {
    const user_name = localStorage.getItem("user_name") || "Guest";
    const user_email = localStorage.getItem("user_email") || "user@liquiditybars.com";
    const user_mobile = localStorage.getItem("user_mobile") || "+10000000000";
    return { user_name, user_email, user_mobile };
  };

  // ✅ Create order with conditional success page
  const createLiquidityOrder = async () => {
    const { user_name, user_email, user_mobile } = getUserInfo();
    const selected_shop = JSON.parse(localStorage.getItem("selected_shop") || "{}");
    const shop_id = selected_shop?.id || localStorage.getItem("shop_id") || "";

    if (!deviceId) {
      alert("Device ID missing.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Cart is empty.");
      return;
    }

    const transactionId = `LIQUIDITY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orderType = getOrderType();

    const formData = new FormData();
    formData.append("name", user_name);
    formData.append("email", user_email);
    formData.append("mobile", user_mobile);
    formData.append("device_id", deviceId);
    formData.append("payment_type", "1");
    formData.append("transaction_id", transactionId);
    formData.append("order_time", new Date().toISOString());
    formData.append("table_no", tableNo);
    formData.append("order_date", new Date().toISOString().split("T")[0]);
    formData.append("shop_id", shop_id);
    formData.append("wallet_amount", "0.00");
    formData.append("online_amount", totalAmount.toFixed(2));
    formData.append("order_type", orderType);
    formData.append("tips", "0.00");

    try {
      const res = await fetch(
        "https://liquiditybars.com/canada/backend/admin/api/createTblOrder",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      
      if (data.status === 1 || data.status === "1") {
        // ✅ Conditional navigation
        if (orderType === "1") {
          router.push(`/bar-order-success/${data.order_id}`);
        } else {
          router.push(`/table-order-success/${data.order_id}`);
        }
      } else {
        alert(data.message || "Order failed");
      }
    } catch {
      alert("Something went wrong while creating order.");
    }
  };

  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();
    await createLiquidityOrder();
  };

  const restaurantLink = `/restaurant/${shopId}?table=${tableNo}`;

  const getLocalStorage = (key: string): string => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(key) || "";
  };

  const handleBack = () => {
    const shopId = getLocalStorage("shop_id") || getLocalStorage("restaurant_id");
    const tableNo = getLocalStorage("table_no") || getLocalStorage("table_number");

    if (shopId && tableNo) {
      router.push(`/restaurant/${shopId}?table=${tableNo}`);
    } else {
      router.push(`/restaurant/${shopId}`);
    }
  };

  // Dynamic section title
  const getSectionTitle = () => {
    const hasTableNumber = !!localStorage.getItem("table_number");
    return hasTableNumber && tableNo 
      ? `Current tab (Table #${tableNo})` 
      : "Current Bar Tab";
  };

  return (
    <>
      <header className="header">
        <button type="button" className="icon_only" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 6L9 12L15 18"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="pageTitle">{shopName || "Menu"}</div>
        <button type="button" className="icon_only"></button>
      </header>

      <section className="pageWrapper hasHeader hasFooter">
        <div className="pageContainer">
          {/* Cart Items */}
          {loading ? (
            <p className="p-4 text-center text-gray-500">Loading cart...</p>
          ) : cartItems.length === 0 ? (
            <p className="p-4 text-center text-gray-500">Cart is empty</p>
          ) : (
            <>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.itemCard}>
                  <div className={styles.itemleft}>
                    <h4>{item.product_name} <span>(1oz)</span></h4>
                    {item.choice_of_mixer_name && (
                      <p><strong>Choice of mixer:</strong> {item.choice_of_mixer_name}</p>
                    )}
                    {item.is_double_shot && (
                      <p><strong>Additional shots:</strong> {item.shot_count}</p>
                    )}
                    {item.special_instruction && (
                      <p><strong>Special Instruction:</strong> {item.special_instruction}</p>
                    )}
                  </div>
                  <div className={styles.itemRight}>
                    <h4>${(Number(item.price) * Number(item.quantity)).toFixed(2)}</h4>
                    <QuantityButton
                      min={0}
                      max={10}
                      initialValue={Number(item.quantity)}
                      onChange={(val) => updateQuantity(item.id, val)}
                      onDelete={() => removeItem(item.id)}
                    />
                  </div>
                </div>
              ))}
              <div className={styles.itemCard}>
                <Link href={restaurantLink} className={styles.addItemButton}>
                  + Add Items
                </Link>
              </div>
            </>
          )}

          {/* Billing Summary */}
          <div className={styles.billingArea}>
            <h4 className="text-lg font-semibold mb-4">Billing Summary</h4>

            {/* Previous Orders */}
            <h5 className="text-lg font-semibold mb-3">{getSectionTitle()}</h5>
            
            {loadingOrders ? (
              <p className="p-2 text-center text-gray-500 text-sm">Loading previous orders...</p>
            ) : matchedOrders.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                <p className="italic">
                  {localStorage.getItem("table_number") 
                    ? `No previous orders for Table #${tableNo}` 
                    : "No previous bar orders (type 1)"
                  }
                </p>
              </div>
            ) : (
              <div className="">
                {matchedOrders.map((order) => (
                  <div key={order.id}>
                    {/* Order Header */}
                                        
                    {/* Order Products */}
                    
                      {order.products.map((product) => (
                        <div key={product.id} className={`${styles.billingItem}`}>
                          <div className={styles.itemleft}>
                            <p>
                              {product.product_name}
                              {product.unit && ` (${product.unit})`}
                              {parseInt(product.quantity || '1') > 1 && ` x${product.quantity}`}
                            </p>
                          </div>
                          <div className={styles.itemRight}>
                            <p>
                              ${(parseFloat(product.price || '0') * parseFloat(product.quantity || '1')).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            )}

            {/* Current Cart */}
            <h5 className="text-lg font-semibold mb-3">Latest Cart</h5>
            {loading ? (
              <p className="p-2 text-center text-gray-500 text-sm">Loading...</p>
            ) : cartItems.length === 0 ? (
              <p className="p-2 text-center text-gray-500 text-sm">No items</p>
            ) : (
              <div className="">
                {cartItems.map((item) => (
                  <div key={item.id} className={styles.billingItem}>
                    <div className={styles.itemleft}>
                      <p>{item.product_name} <span className="text-xs">(1oz)</span></p>
                    </div>
                    <div className={styles.itemRight}>
                      <p>${(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            <div className={styles.billingItem}>
              <p>Taxes & Other Fees</p>
              <p>${taxes.toFixed(2)}</p>
            </div>
            <div className={styles.billingItem}>
              <h4>Total</h4>
              <h4>${finalTotalAmount}</h4>
            </div>
          </div>

          {/* Checkout */}
          <div className={styles.bottomArea}>
            <form onSubmit={handleCheckout}>
              <button
                type="submit"
                disabled={cartItems.length === 0 || loading}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                  cartItems.length === 0 || loading
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary/90 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin inline mr-2" />
                    Loading...
                  </>
                ) : (
                  `Place Order $${finalTotalAmount}`
                )}
              </button>
            </form>
          </div>
        </div>
        <div className={styles.cartFooter}>
          <p>
            To close your bill, or for any questions regarding<br />
            your bill, please speak to your server
          </p>
        </div>
      </section>
    </>
  );
}
