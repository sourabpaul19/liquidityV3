"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./checkout.module.scss";
import Image from "next/image";
import user from "../../../public/images/3177440.png";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import QuantityButton from "@/components/common/QuantityButton/QuantityButton";
import CardSelector from "@/components/common/CardSelector/CardSelector";
import TipsSelector from "@/components/common/TipsSelector/TipsSelector";
import toast from "react-hot-toast";

interface CartItem {
  id: string;
  product_id?: string;
  name: string;
  price: number;
  quantity: number;
  choice_of_mixer_name?: string;
  extraShotQty?: number;
  specialInstructions?: string;
}

interface OldOrder {
  id: string;
  unique_id: string;
  order_date: string;
  status: string;
}

const SERVICE_FEE = 1;
const TAXES_AND_FEES = 3.57;

export default function Checkout() {
  const router = useRouter();

  const [activePickup, setActivePickup] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [oldOrders, setOldOrders] = useState<OldOrder[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [showAcknowledgement, setShowAcknowledgement] = useState(false);
  const [tipPercent, setTipPercent] = useState<number>(20);
  const [tipIsAmount, setTipIsAmount] = useState<boolean>(false);
  const [tipAmount, setTipAmount] = useState<number>(0);

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("user_id") || ""
      : "";
  const deviceId =
    typeof window !== "undefined"
      ? localStorage.getItem("device_id") || "web"
      : "web";

  const cards = [
    { id: "1", type: "Visa", last4: "2304", image: "/images/visa.png" },
    { id: "2", type: "MasterCard", last4: "5478", image: "/images/card.png" },
    { id: "3", type: "Amex", last4: "7821", image: "/images/amex.png" },
  ];

  // ------- MEMOIZED TOTALS -------

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const tipValue = useMemo(
    () => (tipIsAmount ? tipAmount : (subtotal * tipPercent) / 100),
    [tipIsAmount, tipAmount, tipPercent, subtotal]
  );

  const finalTotalAmount = useMemo(
    () => Number(subtotal + SERVICE_FEE + TAXES_AND_FEES + tipValue).toFixed(2),
    [subtotal, tipValue]
  );

  // ------- FETCH CART -------

  const fetchBackendCartDetails = useCallback(async () => {
    if (!deviceId) return;
    setLoading(true);

    try {
      const res = await fetch("/api/getBackendCart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, device_id: deviceId }),
      });

      const data = await res.json();

      if (data.status === "1" || data.status === 1) {
        if (Array.isArray(data.cartItems)) {
          setCartItems(data.cartItems as CartItem[]);
          const calculatedTotal = data.cartItems.reduce(
            (sum: number, item: CartItem) => sum + item.price * item.quantity,
            0
          );
          setCartTotal(calculatedTotal);
        } else {
          setCartItems([]);
          setCartTotal(0);
        }
      } else {
        setCartItems([]);
        setCartTotal(0);
      }
    } catch (err) {
      console.error("Failed to fetch cart details:", err);
      setCartItems([]);
      setCartTotal(0);
    } finally {
      setLoading(false);
    }
  }, [userId, deviceId]);

  // ------- FETCH OLD ORDERS -------

  const fetchOldOrders = useCallback(async () => {
    if (!userId) {
      setLoadingOrders(false);
      setOldOrders([]);
      return;
    }
    setLoadingOrders(true);

    try {
      const res = await fetch(
        `https://liquiditybars.com/canada/backend/admin/api/orderList/${userId}`
      );
      const data = await res.json();

      if (data.status === "1" && Array.isArray(data.orders)) {
        const filtered = data.orders.filter(
          (order: OldOrder) =>
            order.status === "0" ||
            order.status === "1" ||
            order.status === "2"
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

  // ------- FETCH DASHBOARD (SHOPS + WALLET) -------

  const fetchDashboardData = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await fetch(
        `https://liquiditybars.com/canada/backend/admin/api/fetchDashboardDataForUsers/${userId}`
      );
      const data = await res.json();

      if (data.status === "1") {
        const shops = Array.isArray(data.shops) ? data.shops : [];
        const walletBalance = data.wallet_balance ?? 0;

        localStorage.setItem("shops", JSON.stringify(shops));
        if (shops.length > 0) {
          // choose first shop by default; you can change this selection later
          localStorage.setItem("selected_shop", JSON.stringify(shops[0]));
        }
        localStorage.setItem("wallet_balance", String(walletBalance));
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    }
  }, [userId]);

  // ------- INITIAL LOAD -------

  useEffect(() => {
    if (deviceId) {
      fetchBackendCartDetails();
    }
    if (userId) {
      fetchOldOrders();
      fetchDashboardData();
    }
  }, [
    deviceId,
    userId,
    fetchBackendCartDetails,
    fetchOldOrders,
    fetchDashboardData,
  ]);

  // ------- DELETE ITEM -------

  const deleteTempCartItem = async (item: CartItem) => {
    try {
      setLoading(true);
      const res = await fetch("/api/deleteFromTempCart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });

      const data = await res.json();

      if (data.status === "1" || data.status === 1) {
        toast.success("Item removed from cart");
        await fetchBackendCartDetails();
      } else {
        toast.error(data.message || "Failed to remove item");
      }
    } catch (err) {
      console.error("deleteFromTempCart error:", err);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  // ------- UPDATE QTY -------

  const updateQuantity = async (itemId: string, newQty: number) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;

    if (newQty === 0) {
      await deleteTempCartItem(item);
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("user_id", userId);
      params.append("item_id", itemId);
      params.append("quantity", newQty.toString());

      const res = await fetch("/api/updateTempCartItem", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });

      const data = await res.json();

      if (data.status === "1" || data.status === 1) {
        await fetchBackendCartDetails();
      } else {
        toast.error(data.message || "Could not update quantity.");
      }
    } catch (e) {
      console.error("Update quantity error:", e);
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ------- ORDER TYPE -------

  const getOrderType = () => {
    if (activePickup === "lounge") return "1";
    if (activePickup === "dance") return "2";
    if (activePickup === "nightclub") return "3";
    return "1";
  };

  // ------- CREATE ORDER -------

  const createOrderNow = async () => {
    const user_name = localStorage.getItem("user_name") || "";
    const user_email = localStorage.getItem("user_email") || "";
    const user_mobile = localStorage.getItem("user_mobile") || "";

    const selected_shop = JSON.parse(
      localStorage.getItem("selected_shop") || "{}"
    );
    const shop_id = selected_shop?.id || "";

    if (!userId || !user_name || !user_email || !user_mobile) {
      toast.error("User information missing.");
      return;
    }

    if (!shop_id) {
      toast.error("Shop data missing. Please reload.");
      return;
    }

    if (!activePickup) {
      toast.error("Please select pickup location.");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Cart is empty.");
      return;
    }

    const finalTotal = Number(
      subtotal + SERVICE_FEE + TAXES_AND_FEES + tipValue
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
      setLoading(true);
      const res = await fetch(
        "https://liquiditybars.com/canada/backend/admin/api/createOrder",
        { method: "POST", body: formData }
      );

      const data = await res.json();
      console.log("Create order response:", data);

      if (data.status === 1 || data.status === "1") {
        localStorage.removeItem("liquidity_cart_cache");
        toast.success("Order created successfully!");
        const orderId =
          data.order_id || data.orderId || data.data?.order_id || "";
        router.push(`/order-success/${orderId}`);
      } else {
        toast.error(data.message || "Order failed");
      }
    } catch (e) {
      console.error("Create order error:", e);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ------- CHECKOUT HANDLER -------

  const handleCheckout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const skip = localStorage.getItem("ack_skip_popup");
    if (!skip) {
      setShowAcknowledgement(true);
      return;
    }

    createOrderNow();
  };

  // ------- ACK POPUP -------

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

  const handleCardSelect = (card: (typeof cards)[0]) => {
    console.log("Selected card:", card);
  };

  const handleButtonClick = () => {
    router.push("/home");
  };

  return (
    <>
      {showAcknowledgement && <AcknowledgementPopup />}

      <header className="header">
        <button
          type="button"
          className={styles.icon_only}
          onClick={handleButtonClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <Link href="" className={styles.user}>
          <Image alt="User" src={user} />
        </Link>
      </header>

      <section className="pageWrapper hasHeader hasFooter">
        <div className="pageContainer">
          {/* PREVIOUS ORDERS */}
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
                  className={`${styles.orderCard} flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-all`}
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

          {/* CART ITEMS */}
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
                      {item.name} <span>(1oz)</span>
                    </h4>
                    {item.choice_of_mixer_name && (
                      <p>
                        <strong>Choice of mixer:</strong>{" "}
                        {item.choice_of_mixer_name}
                      </p>
                    )}
                    {item.extraShotQty ? (
                      <p>
                        <strong>Additional shots:</strong> {item.extraShotQty}
                      </p>
                    ) : null}
                    {item.specialInstructions && (
                      <p>
                        <strong>Special Instruction:</strong>{" "}
                        {item.specialInstructions}
                      </p>
                    )}
                  </div>
                  <div className={styles.itemRight}>
                    <h4>${(item.price * item.quantity).toFixed(2)}</h4>
                    <QuantityButton
                      min={0}
                      max={10}
                      initialValue={item.quantity}
                      onChange={(val) => updateQuantity(item.id, val)}
                      onDelete={() => deleteTempCartItem(item)}
                    />
                  </div>
                </div>
              ))}

              <div className={styles.itemCard}>
                <Link href="/outlet" className={styles.addItemButton}>
                  + Add Items
                </Link>
              </div>
            </>
          )}

          {/* PICKUP LOCATION */}
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
                  className={`${
                    styles.pickupItem
                  } ${activePickup === loc.id ? "bg-primary text-white" : ""}`}
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

          {/* BILLING SUMMARY */}
          <div className={styles.billingArea}>
            <h4 className="text-lg font-semibold mb-3">Billing Summary</h4>

            <div className={styles.billingItem}>
              <p>Subtotal</p>
              <p>${subtotal.toFixed(2)}</p>
            </div>

            <div className={styles.billingItem}>
              <p>Liquidity Cash</p>
              <p>-$0.00</p>
            </div>

            <div className={styles.billingItem}>
              <p>Service Fee</p>
              <p>${SERVICE_FEE.toFixed(2)}</p>
            </div>

            <div className={styles.billingItem}>
              <p>Taxes & Other Fees</p>
              <p>${TAXES_AND_FEES.toFixed(2)}</p>
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
              onSelect={handleCardSelect}
              defaultCardId="1"
            />
          </div>

          {/* TIP SELECTOR */}
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

          {/* CHECKOUT BUTTON */}
          <div className={styles.bottomArea}>
            <form onSubmit={handleCheckout}>
              <button
                type="submit"
                disabled={loading || cartItems.length === 0 || !activePickup}
                className="bg-primary px-3 py-3 rounded-lg w-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Checkout"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
