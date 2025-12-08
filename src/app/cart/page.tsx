"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import styles from "./cart.module.scss";
import Header from "@/components/common/Header/Header";
import BottomNavigation from "@/components/common/BottomNavigation/BottomNavigation";
import QuantityButton from "@/components/common/QuantityButton/QuantityButton";
import CardSelector from "@/components/common/CardSelector/CardSelector";
import TipsSelector from "@/components/common/TipsSelector/TipsSelector";

interface Card {
  id: string;
  type: string;
  last4: string;
  image: string;
}

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

interface OldOrder {
  id: string;
  unique_id: string;
  order_date: string;
  status: string;
}

export default function Cart() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const [activePickup, setActivePickup] = useState<string | null>(null);
  const [oldOrders, setOldOrders] = useState<OldOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);

  const [showAcknowledgement, setShowAcknowledgement] = useState(false);
  const [tipPercent, setTipPercent] = useState<number>(20);
  const [tipIsAmount, setTipIsAmount] = useState<boolean>(false);
  const [tipAmount, setTipAmount] = useState<number>(0);

  const [deviceId, setDeviceId] = useState("web");

  const cards: Card[] = [
    { id: "1", type: "Visa", last4: "2304", image: "/images/visa.png" },
    { id: "2", type: "MasterCard", last4: "5478", image: "/images/card.png" },
    { id: "3", type: "Amex", last4: "7821", image: "/images/amex.png" },
  ];

  // Load User ID
  useEffect(() => {
    const stored = localStorage.getItem("user_id");
    if (stored) setUserId(stored);
  }, []);

  // Load Device ID
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedId = localStorage.getItem("device_id");
    if (storedId) setDeviceId(storedId);
  }, []);

  // Fetch Cart
  const fetchCart = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const res = await fetch("/api/getCart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, device_id: deviceId }),
      });

      const data = await res.json();

      if (data.status === "1") {
        setCartItems(data.cartItems || []);
        setCartTotal(Number(data.total_price || 0));
      } else {
        setCartItems([]);
        setCartTotal(0);
      }
    } catch (e) {
      console.error("Cart fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [userId, deviceId]);

  // Fetch Old Orders
  const fetchOldOrders = useCallback(async () => {
    if (!userId) return;
    setLoadingOrders(true);

    try {
      const res = await fetch(
        `http://liquiditybars.com/canada/backend/admin/api/orderList/${userId}`
      );
      const data = await res.json();

      if (data.status === "1" && Array.isArray(data.orders)) {
        const filtered = data.orders.filter(
          (order: OldOrder) =>
            order.status === "0" || order.status === "1" || order.status === "2"
        );
        setOldOrders(filtered);
      } else {
        setOldOrders([]);
      }
    } catch (e) {
      console.error("Order fetch error:", e);
      setOldOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchCart();
      fetchOldOrders();
    }
  }, [userId, fetchCart, fetchOldOrders]);

  const tipValue = tipIsAmount ? tipAmount : (cartTotal * tipPercent) / 100;

  // Remove item
  const removeItem = async (itemId: string) => {
    if (!userId || !itemId) return;
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("user_id", userId);
      params.append("item_id", itemId);

      const res = await fetch("/api/deleteCartItem", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });

      const data = await res.json();
      if (data.status === "1") {
        await fetchCart();
      } else {
        alert(data.message || "Could not remove item");
      }
    } finally {
      setLoading(false);
    }
  };

  // Update Quantity
  const updateQuantity = async (itemId: string, newQty: number) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;

    if (newQty === 0) return removeItem(itemId);

    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("user_id", userId || "");
      params.append("item_id", itemId);
      params.append("quantity", newQty.toString());

      const res = await fetch("/api/updateCartItem", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });

      const data = await res.json();

      if (data.status === "1") {
        await fetchCart();
      } else {
        alert(data.message || "Could not update quantity.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getOrderType = () => {
    if (activePickup === "lounge") return "1";
    if (activePickup === "dance") return "2";
    if (activePickup === "nightclub") return "3";
    return "1";
  };

  // Create Order
  const createOrderNow = async () => {
    const user_name = localStorage.getItem("user_name") || "";
    const user_email = localStorage.getItem("user_email") || "";
    const user_mobile = localStorage.getItem("user_mobile") || "";

    const selected_shop = JSON.parse(localStorage.getItem("selected_shop") || "{}");
    const shop_id = selected_shop?.id || "";

    const localCart = JSON.parse(localStorage.getItem("liquidity_cart_cache") || "[]");

    if (!userId || !user_name || !user_email || !user_mobile) {
      alert("User information missing.");
      return;
    }

    if (!activePickup) {
      alert("Please select pickup location.");
      return;
    }

    if (localCart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    const finalTotal = Number(
      cartTotal + 1 + 3.57 + tipValue
    ).toFixed(2);

    const formData = new FormData();
    formData.append("name", user_name);
    formData.append("email", user_email);
    formData.append("mobile", user_mobile);
    formData.append("user_id", userId);
    formData.append("payment_type", "2");
    formData.append("transaction_id", "");
    formData.append("order_time", new Date().toISOString());
    formData.append("table_no", "");
    formData.append("device_id", deviceId);
    formData.append("order_date", new Date().toISOString().split("T")[0]);
    formData.append("shop_id", shop_id);
    formData.append("wallet_amount", "0.00");
    formData.append("online_amount", finalTotal);
    formData.append("order_type", getOrderType());
    formData.append("tips", Number(tipValue).toFixed(2));

    try {
      const res = await fetch(
        "http://liquiditybars.com/canada/backend/admin/api/createOrder",
        { method: "POST", body: formData }
      );

      const data = await res.json();

      if (data.status === 1 || data.status === "1") {
        router.push(`/order-success/${data.order_id}`);
      } else {
        alert(data.message || "Order failed");
      }
    } catch (e) {
      alert("Something went wrong.");
    }
  };

  // Checkout handler
  const handleCheckout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const skip = localStorage.getItem("ack_skip_popup");
    if (!skip) {
      setShowAcknowledgement(true);
      return;
    }

    createOrderNow();
  };

  const AcknowledgementPopup = () => (
    <div className="fixed top-0 left-0 w-full h-full bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 max-w-md p-5 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Acknowledgement</h2>
        <p className="text-gray-700 mb-5">
          I understand that it is my responsibility to pick up my drink when it is ready, and that failure to do so in a timely manner means my drink could get stolen or disposed of by the bar.
        </p>

        <div className="flex flex-col gap-3">
          <button
            className="bg-primary text-white p-3 rounded-lg"
            onClick={() => {
              setShowAcknowledgement(false);
              createOrderNow();
            }}
          >
            I Understand
          </button>

          <button
            className="bg-green-600 text-white p-3 rounded-lg"
            onClick={() => {
              localStorage.setItem("ack_skip_popup", "1");
              setShowAcknowledgement(false);
              createOrderNow();
            }}
          >
            Yes, Don’t Show Again
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

  const finalTotalAmount = Number(
    cartTotal + 1 + 3.57 + tipValue
  ).toFixed(2);

  return (
    <>
      {showAcknowledgement && <AcknowledgementPopup />}

      <Header title="Casa Mezcal" />

      <section className="pageWrapper hasHeader hasFooter">
        <div className="pageContainer">
          {/* ---------------- PREVIOUS ORDERS ---------------- */}
          <div className="flex flex-col gap-4 p-4">
            {loadingOrders ? (
              <p className="text-gray-500">Loading previous orders...</p>
            ) : oldOrders.length === 0 ? (
              <p className="text-gray-500">No previous orders found.</p>
            ) : (
              oldOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/order-status/${order.id}`}
                  className={`${styles.orderCard} flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition`}
                >
                  <div>
                    <h3 className="font-semibold text-lg">{order.unique_id}</h3>
                    <p className="text-sm text-gray-600">
                      {order.order_date} -
                      <span className="text-primary font-medium ml-1">
                        {order.status === "1" ? "New" : "Accepted"}
                      </span>
                    </p>
                  </div>
                  <ChevronRight size={22} color="gray" />
                </Link>
              ))
            )}
          </div>

          {/* ---------------- CART ITEMS ---------------- */}
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
                        <strong>Additional shots:</strong>{" "}
                        {item.shot_count}
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
                      ${(
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
                <Link href="/outlet-menu" className={styles.addItemButton}>
                  + Add Items
                </Link>
              </div>
            </>
          )}

          {/* ---------------- PICKUP LOCATION ---------------- */}
          <div className={styles.pickupArea}>
            <h4 className="text-lg font-semibold mb-3">Pickup Location</h4>

            <div className={`${styles.pickupBlock} flex gap-3`}>
              {[
                { id: "lounge", label: "1st Floor\nLounge" },
                { id: "dance", label: "2nd Floor\nDance Floor" },
                { id: "nightclub", label: "Basement\nNightclub" },
              ].map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setActivePickup(loc.id)}
                  className={`${styles.pickupItem} ${
                    activePickup === loc.id ? "bg-primary text-white" : ""
                  }`}
                >
                  {loc.label.split("\n").map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </button>
              ))}
            </div>
          </div>

          {/* ---------------- BILLING SUMMARY ---------------- */}
          <div className={styles.billingArea}>
            <h4 className="text-lg font-semibold mb-3">Billing Summary</h4>

            <div className={styles.billingItem}>
              <p>Subtotal</p>
              <p>${cartTotal.toFixed(2)}</p>
            </div>

            <div className={styles.billingItem}>
              <p>Liquidity Cash</p>
              <p>-$0.00</p>
            </div>

            <div className={styles.billingItem}>
              <p>Service Fee</p>
              <p>$1.00</p>
            </div>

            <div className={styles.billingItem}>
              <p>Taxes & Other Fees</p>
              <p>$3.57</p>
            </div>

            <div className={styles.billingItem}>
              <p>Tips</p>
              <p>${tipValue.toFixed(2)}</p>
            </div>

            <div className={styles.billingItem}>
              <h4>Total</h4>
              <h4>${finalTotalAmount}</h4>
            </div>

            <CardSelector
              cards={cards}
              onSelect={() => {}}
              defaultCardId="1"
            />
          </div>

          {/* ---------------- TIP SELECTOR ---------------- */}
          <TipsSelector
            value={tipPercent}
            onChange={(val: number, isAmount: boolean) => {
              if (isAmount) {
                setTipAmount(val);
              } else {
                setTipPercent(val);
              }
              setTipIsAmount(isAmount);
            }}
          />

          {/* ---------------- CHECKOUT BUTTON ---------------- */}
          <div className={styles.bottomArea}>
            <form onSubmit={handleCheckout}>
              <button
                type="submit"
                className="bg-primary px-3 py-3 rounded-lg w-full text-white"
              >
                Checkout
              </button>
            </form>
          </div>
        </div>
      </section>

      <BottomNavigation />
    </>
  );
}
