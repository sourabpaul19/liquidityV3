"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import styles from "./cart.module.scss";
import Header from "@/components/common/Header/Header";
import BottomNavigation from "@/components/common/BottomNavigation/BottomNavigation";
import QuantityButton from "@/components/common/QuantityButton/QuantityButton";
import TipsSelector from "@/components/common/TipsSelector/TipsSelector";

// ---------- Stripe ----------
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

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

interface SavedCard {
  id: string;
  stripe_payment_method_id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
}

type PayMode = "new_card" | "saved_card";

// ---------- Saved Card Selector ----------
function SavedCardSelector({
  cards,
  selectedId,
  onSelect,
}: {
  cards: SavedCard[];
  selectedId: string | null;
  onSelect: (card: SavedCard) => void;
}) {
  if (!cards.length) {
    return (
      <p className="text-sm text-gray-500 mt-2">
        No saved cards found. Use a new card to save one.
      </p>
    );
  }

  return (
    <div className="space-y-2 mt-3">
      <h4 className="text-sm font-semibold">Saved cards</h4>
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={() => onSelect(card)}
          className={`w-full flex items-center justify-between border rounded-lg px-3 py-2 text-left ${
            selectedId === card.id
              ? "border-primary bg-primary/5"
              : "border-gray-200"
          }`}
        >
          <div>
            <p className="text-sm font-medium capitalize">
              {card.brand} •••• {card.last4}
            </p>
            <p className="text-xs text-gray-500">
              Expires {card.exp_month}/{card.exp_year}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ---------- Stripe Payment Form (new card) ----------
function NewCardPaymentForm({
  clientSecret,
  amountLabel,
  onSuccess,
}: {
  clientSecret: string | null;
  amountLabel: string;
  onSuccess: (paymentIntentId: string) => Promise<void>;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: localStorage.getItem("user_name") || "",
            email: localStorage.getItem("user_email") || "",
          },
        },
      }
    );

    setProcessing(false);

    if (error) {
      alert(error.message || "Payment failed");
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      await onSuccess(paymentIntent.id);
    } else {
      alert("Payment did not complete.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="p-3 bg-gray-50 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#1f2933",
                "::placeholder": { color: "#9ca3af" },
              },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || !clientSecret || processing}
        className={`w-full py-3 px-4 rounded-lg font-medium transition ${
          !stripe || !clientSecret || processing
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg-primary text-white hover:bg-primary/90"
        }`}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing…
          </span>
        ) : (
          `Pay ${amountLabel}`
        )}
      </button>
    </form>
  );
}

// ---------- Main Cart Component ----------
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

  // payment mode and saved cards
  const [payMode, setPayMode] = useState<PayMode>("new_card");
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState<SavedCard | null>(
    null
  );

  // Stripe: client secret for new-card flow
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [initializingPayment, setInitializingPayment] = useState(false);

  // ---------- Load basic info ----------
  useEffect(() => {
    const storedUser = typeof window !== "undefined"
      ? localStorage.getItem("user_id")
      : null;
    if (storedUser) setUserId(storedUser);

    const storedDevice =
      typeof window !== "undefined"
        ? localStorage.getItem("device_id")
        : null;
    if (storedDevice) setDeviceId(storedDevice);
  }, []);

  // ---------- Fetch Cart ----------
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
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, deviceId]);

  // ---------- Fetch Old Orders ----------
  const fetchOldOrders = useCallback(async () => {
    if (!userId) return;
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
    } catch (err) {
      console.error("Order fetch error:", err);
      setOldOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, [userId]);

  // ---------- Fetch Saved Cards ----------
  const fetchSavedCards = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await fetch("/api/savecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await res.json();
      if (data.status === "1" && Array.isArray(data.cards)) {
        setSavedCards(data.cards);
      } else {
        setSavedCards([]);
      }
    } catch (err) {
      console.error("Saved card fetch error:", err);
      setSavedCards([]);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchCart();
    fetchOldOrders();
    fetchSavedCards();
  }, [userId, fetchCart, fetchOldOrders, fetchSavedCards]);

  const tipValue = tipIsAmount ? tipAmount : (cartTotal * tipPercent) / 100;
  const finalTotalAmountNum = cartTotal + 1 + 3.57 + tipValue;
  const finalTotalAmount = finalTotalAmountNum.toFixed(2);

  // ---------- Cart item operations ----------
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

  // ---------- Create Liquidity Order ----------
  const createLiquidityOrder = async (transactionId: string) => {
    const user_name = localStorage.getItem("user_name") || "";
    const user_email = localStorage.getItem("user_email") || "";
    const user_mobile = localStorage.getItem("user_mobile") || "";

    const selected_shop = JSON.parse(
      localStorage.getItem("selected_shop") || "{}"
    );
    const shop_id = selected_shop?.id || "";

    const localCart = JSON.parse(
      localStorage.getItem("liquidity_cart_cache") || "[]"
    );

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

    const formData = new FormData();
    formData.append("name", user_name);
    formData.append("email", user_email);
    formData.append("mobile", user_mobile);
    formData.append("user_id", userId);
    formData.append("payment_type", "2");
    formData.append("transaction_id", transactionId);
    formData.append("order_time", new Date().toISOString());
    formData.append("table_no", "");
    formData.append("device_id", deviceId);
    formData.append("order_date", new Date().toISOString().split("T")[0]);
    formData.append("shop_id", shop_id);
    formData.append("wallet_amount", "0.00");
    formData.append("online_amount", finalTotalAmount);
    formData.append("order_type", getOrderType());
    formData.append("tips", Number(tipValue).toFixed(2));

    try {
      const res = await fetch(
        "https://liquiditybars.com/canada/backend/admin/api/createOrder",
        { method: "POST", body: formData }
      );
      const data = await res.json();

      if (data.status === 1 || data.status === "1") {
        localStorage.removeItem("liquidity_cart_cache");
        router.push(`/order-success/${data.order_id}`);
      } else {
        alert(data.message || "Order failed");
      }
    } catch (err) {
      alert("Something went wrong while creating order.");
    }
  };

  // ---------- Initialize PaymentIntent for new-card flow ----------
  const initNewCardPayment = async () => {
    if (!userId) {
      alert("User not found.");
      return false;
    }
    if (!activePickup) {
      alert("Please select pickup location.");
      return false;
    }

    setInitializingPayment(true);

    try {
      const amount = Math.round(finalTotalAmountNum * 100);
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "cad",
          // optionally send userId to tie to customer
          user_id: userId,
        }),
      });

      const data = await res.json();
      if (!data.client_secret) {
        alert(data.error || "Failed to start payment.");
        setInitializingPayment(false);
        return false;
      }

      setClientSecret(data.client_secret);
      return true;
    } catch (err) {
      console.error(err);
      alert("Failed to start payment.");
      return false;
    } finally {
      setInitializingPayment(false);
    }
  };

  // ---------- Pay with Saved Card ----------
  const payWithSavedCard = async () => {
    if (!selectedSavedCard) {
      alert("Please select a saved card.");
      return;
    }
    if (!userId) {
      alert("User not found.");
      return;
    }
    if (!activePickup) {
      alert("Please select pickup location.");
      return;
    }

    const customerId = localStorage.getItem("stripe_customer_id") || "";
    if (!customerId) {
      alert("Stripe customer not found.");
      return;
    }

    const amount = Math.round(finalTotalAmountNum * 100);

    try {
      const res = await fetch("/api/pay-with-saved-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "cad",
          customerId,
          paymentMethodId: selectedSavedCard.stripe_payment_method_id,
        }),
      });

      const data = await res.json();

      if (data.status === "success" && data.payment_intent_id) {
        await createLiquidityOrder(data.payment_intent_id);
      } else {
        alert(data.message || "Payment failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Payment failed.");
    }
  };

  // ---------- Acknowledgement Popup ----------
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
              if (payMode === "saved_card") {
                await payWithSavedCard();
              } else {
                await initNewCardPayment();
              }
            }}
          >
            I Understand
          </button>

          <button
            className="bg-green-600 text-white p-3 rounded-lg"
            onClick={async () => {
              localStorage.setItem("ack_skip_popup", "1");
              setShowAcknowledgement(false);
              if (payMode === "saved_card") {
                await payWithSavedCard();
              } else {
                await initNewCardPayment();
              }
            }}
          >
            Yes, Don&apos;t Show Again
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

  // ---------- Checkout submit ----------
  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const skip = localStorage.getItem("ack_skip_popup");
    if (!skip) {
      setShowAcknowledgement(true);
      return;
    }

    if (payMode === "saved_card") {
      await payWithSavedCard();
    } else {
      await initNewCardPayment();
    }
  };

  return (
    <>
      {showAcknowledgement && <AcknowledgementPopup />}

      <Header title="Casa Mezcal" />

      <section className="pageWrapper hasHeader hasFooter">
        <div className="pageContainer">
          {/* Previous Orders */}
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
                <Link href="/outlet-menu" className={styles.addItemButton}>
                  + Add Items
                </Link>
              </div>
            </>
          )}

          {/* Pickup Location */}
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

          {/* Billing + Payment */}
          <Elements
            stripe={stripePromise}
            options={clientSecret ? { clientSecret } : undefined}
          >
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
                <p>Taxes &amp; Other Fees</p>
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

              {/* Payment Mode Toggle */}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPayMode("new_card")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
                    payMode === "new_card"
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  New card
                </button>
                <button
                  type="button"
                  onClick={() => setPayMode("saved_card")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
                    payMode === "saved_card"
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  Saved card
                </button>
              </div>

              {/* Saved Cards UI */}
              {payMode === "saved_card" && (
                <SavedCardSelector
                  cards={savedCards}
                  selectedId={selectedSavedCard?.id || null}
                  onSelect={(card) => setSelectedSavedCard(card)}
                />
              )}

              {/* New Card Payment UI */}
              {payMode === "new_card" && clientSecret && (
                <NewCardPaymentForm
                  clientSecret={clientSecret}
                  amountLabel={`$${finalTotalAmount}`}
                  onSuccess={createLiquidityOrder}
                />
              )}
            </div>
          </Elements>

          {/* Tips Selector */}
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

          {/* Checkout Button (when no clientSecret yet for new card) */}
          {payMode === "new_card" && !clientSecret && (
            <div className={styles.bottomArea}>
              <form onSubmit={handleCheckout}>
                <button
                  type="submit"
                  disabled={
                    initializingPayment ||
                    !activePickup ||
                    cartItems.length === 0
                  }
                  className={`bg-primary px-3 py-3 rounded-lg w-full text-white ${
                    initializingPayment ||
                    !activePickup ||
                    cartItems.length === 0
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {initializingPayment ? "Starting payment..." : "Checkout"}
                </button>
              </form>
            </div>
          )}

          {/* Saved card checkout button */}
          {payMode === "saved_card" && (
            <div className={styles.bottomArea}>
              <form onSubmit={handleCheckout}>
                <button
                  type="submit"
                  disabled={
                    !selectedSavedCard ||
                    !activePickup ||
                    cartItems.length === 0
                  }
                  className={`bg-primary px-3 py-3 rounded-lg w-full text-white ${
                    !selectedSavedCard ||
                    !activePickup ||
                    cartItems.length === 0
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Pay with saved card
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      <BottomNavigation />
    </>
  );
}
