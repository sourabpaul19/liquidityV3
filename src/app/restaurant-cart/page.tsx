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
  products: OrderProduct[];
}

export default function RestaurantCart() {
  const router = useRouter();

  const [deviceId, setDeviceId] = useState<string>("");
  const [tableNo, setTableNo] = useState<string>("");
  const [shopId, setShopId] = useState<string>("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);

  const [showAcknowledgement, setShowAcknowledgement] = useState(false);

  // Load device_id, table info, and shop_id from localStorage with defaults
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedDevice = localStorage.getItem("device_id") || "";
    const storedTable =
      localStorage.getItem("table_number") ||
      localStorage.getItem("table_no") ||
      "";
    const storedShopId = JSON.parse(localStorage.getItem("selected_shop") || "{}")?.id || localStorage.getItem("shop_id") || "";

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
  }, []);

  // Fetch past orders
  const fetchOrders = useCallback(async () => {
    if (!deviceId) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(
        `https://liquiditybars.com/canada/backend/admin/api/tblOrderList/${deviceId}`
      );
      const data = await res.json();

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

  // Fetch cart using device_id only
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
      console.log("Delete response:", data);

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
        {
          method: "POST",
          body: formData,
        }
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

  // Fetch cart and orders when deviceId is available
  useEffect(() => {
    if (deviceId) {
      fetchCart();
      fetchOrders();
    }
  }, [deviceId, fetchCart, fetchOrders]);

  // Totals (no tips)
  const taxes = cartTotal * 0.13;
  const totalAmount = cartTotal + taxes;
  const finalTotalAmount = totalAmount.toFixed(2);

  const getOrderType = () => "1";

  // Get user info (no user_id)
  const getUserInfo = () => {
    const user_name = localStorage.getItem("user_name") || "Guest";
    const user_email =
      localStorage.getItem("user_email") || "user@liquiditybars.com";
    const user_mobile =
      localStorage.getItem("user_mobile") || "+10000000000";

    return { user_name, user_email, user_mobile };
  };

  const createLiquidityOrder = async () => {
    const { user_name, user_email, user_mobile } = getUserInfo();

    const selected_shop = JSON.parse(
      localStorage.getItem("selected_shop") || "{}"
    );
    const shop_id = selected_shop?.id || localStorage.getItem("shop_id") || "";

    if (!deviceId) {
      alert("Device ID missing.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Cart is empty.");
      return;
    }

    const transactionId = `LIQUIDITY_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

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
    formData.append("order_type", getOrderType());
    formData.append("tips", "0.00");

    try {
      const res = await fetch(
        "https://liquiditybars.com/canada/backend/admin/api/createTblOrder",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.status === 1 || data.status === "1") {
        router.push(`/table-order-success/${data.order_id}`);
      } else {
        alert(data.message || "Order failed");
      }
    } catch {
      alert("Something went wrong while creating order.");
    }
  };

  const AcknowledgementPopup = () => (
    <div className="fixed top-0 left-0 w-full h-full bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 max-w-md p-5 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Acknowledgement</h2>
        <p className="text-gray-700 mb-5">
          I understand that it is my responsibility to pick up my drink when it
          is ready, and that failure to do so in a timely manner means my drink
          could get stolen or disposed of by the bar.
        </p>
        <div className="flex flex-col gap-3">
          <button
            className="bg-primary text-white p-3 rounded-lg"
            onClick={async () => {
              setShowAcknowledgement(false);
              await createLiquidityOrder();
            }}
          >
            I Understand
          </button>
          <button
            className="bg-green-600 text-white p-3 rounded-lg"
            onClick={async () => {
              localStorage.setItem("ack_skip_popup", "1");
              setShowAcknowledgement(false);
              await createLiquidityOrder();
            }}
          >
            Yes, Don't Show Again
          </button>
          <button
            className="bg-gray-300 text-black p-3 rounded-lg"
            onClick={() => setShowAcknowledgement(false)}
          >
            No, Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();
    const skip =
      typeof window !== "undefined"
        ? localStorage.getItem("ack_skip_popup")
        : null;
    if (!skip) {
      setShowAcknowledgement(true);
      return;
    }
    await createLiquidityOrder();
  };

  // Build restaurant link with shop_id and table_no
  const restaurantLink = `/restaurant/${shopId}?table=${tableNo}`;

  return (
    <>
      {showAcknowledgement && <AcknowledgementPopup />}

      <Header title="Casa Mezcal" />

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
                    <h4>
                      {item.product_name} <span>(1oz)</span>
                    </h4>
                    {item.choice_of_mixer_name && (
                      <p>
                        <strong>Choice of mixer:</strong>{" "}
                        {item.choice_of_mixer_name}
                      </p>
                    )}
                    {item.is_double_shot && (
                      <p>
                        <strong>Additional shots:</strong> {item.shot_count}
                      </p>
                    )}
                    {item.special_instruction && (
                      <p>
                        <strong>Special Instruction:</strong>{" "}
                        {item.special_instruction}
                      </p>
                    )}
                  </div>
                  <div className={styles.itemRight}>
                    <h4>
                      {(
                        Number(item.price) * Number(item.quantity)
                      ).toFixed(2)}
                    </h4>
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
            <h4 className="text-lg font-semibold">Billing Summary</h4>

            <h5 className="text-lg font-semibold">Current tab</h5>
            {loadingOrders ? (
              <p className="p-2 text-center text-gray-500 text-sm">Loading...</p>
            ) : orders.length === 0 ? (
              <p className="p-2 text-center text-gray-400 text-sm italic">No previous orders</p>
            ) : (
              orders.map((order) => (
                <div key={order.id}>
                  {order.products.map((product) => (
                    <div key={product.id} className={`${styles.billingItem}`}>
                      <div className={styles.itemleft}>
                        <p>
                          {product.product_name} <span className="text-xs">({product.unit})</span>
                          {parseInt(product.quantity) > 1 && ` x${product.quantity}`}
                        </p>
                      </div>
                      <div className={styles.itemRight}>
                        <p>
                          ${(parseFloat(product.price) * parseFloat(product.quantity)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}

            <h5 className="text-lg font-semibold">Latest Orders</h5>
            {loading ? (
              <p className="p-2 text-center text-gray-500 text-sm">Loading...</p>
            ) : cartItems.length === 0 ? (
              <p className="p-2 text-center text-gray-500 text-sm">No items</p>
            ) : (
              <>
                {cartItems.map((item) => (
                  <div key={item.id} className={styles.billingItem}>
                    <div className={styles.itemleft}>
                      <p>
                        {item.product_name} <span className="text-xs">(1oz)</span>
                      </p>
                    </div>
                    <div className={styles.itemRight}>
                      <p>
                        $
                        {(
                          Number(item.price) * Number(item.quantity)
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}

            <div className={styles.billingItem}>
              <p>Taxes &amp; Other Fees</p>
              <p>${taxes.toFixed(2)}</p>
            </div>

            <div className={styles.billingItem}>
              <h4>Total</h4>
              <h4>${finalTotalAmount}</h4>
            </div>
          </div>

          {/* Checkout Button */}
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
