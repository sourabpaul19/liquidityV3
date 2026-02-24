"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";

import styles from "./bar-cart.module.scss";
import Header from "@/components/common/Header/Header";
import BottomNavigation from "@/components/common/BottomNavigation/BottomNavigation";
import QuantityButton from "@/components/common/QuantityButton/QuantityButton";
import TipsSelector from "@/components/common/TipsSelector/TipsSelector";

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

type PayMode = "new_card" | "apple_pay";

/* ================= APPLE PAY ================= */

function StripeApplePayButton({
  stripe,
  amount,
  onSuccess,
}: {
  stripe: any;
  amount: number;
  onSuccess: (id: string) => Promise<void>;
}) {
  const [paymentRequest, setPaymentRequest] = useState<any>(null);

  useEffect(() => {
    if (!stripe || amount <= 0) return;

    const pr = stripe.paymentRequest({
      country: "CA",
      currency: "cad",
      total: {
        label: "Bar Order",
        amount: Math.round(amount * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result: any) => {
      if (result) setPaymentRequest(pr);
    });

    pr.on("paymentmethod", async (ev: any) => {
      try {
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            currency: "cad",
          }),
        });

        const data = await res.json();

        const { paymentIntent, error } = await stripe.confirmCardPayment(
          data.client_secret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        );

        if (error) {
          ev.complete("fail");
          return;
        }

        ev.complete("success");

        if (paymentIntent.status === "requires_action") {
          await stripe.confirmCardPayment(data.client_secret);
        }

        await onSuccess(paymentIntent.id);
      } catch {
        ev.complete("fail");
      }
    });
  }, [stripe, amount, onSuccess]);

  if (!paymentRequest) return null;

  return <PaymentRequestButtonElement options={{ paymentRequest }} />;
}

/* ================= NEW CARD ================= */

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      { payment_method: { card: cardElement } }
    );

    setProcessing(false);

    if (error) {
      alert(error.message || "Payment failed");
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      await onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="p-3 bg-gray-50 border rounded-lg">
        <CardElement />
      </div>
      <button
        type="submit"
        disabled={processing}
        className="w-full py-3 bg-primary text-white rounded-lg"
      >
        {processing ? "Processing..." : `Pay ${amountLabel}`}
      </button>
    </form>
  );
}

/* ================= MAIN ================= */

export default function Cart() {
  const router = useRouter();

  const [deviceId, setDeviceId] = useState("web");
  const [tableNo, setTableNo] = useState("");

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [tipPercent, setTipPercent] = useState(20);
  const [tipIsAmount, setTipIsAmount] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);

  const [payMode, setPayMode] = useState<PayMode>("new_card");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [initializingPayment, setInitializingPayment] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDeviceId(localStorage.getItem("device_id") || "web");
    setTableNo(localStorage.getItem("table_number") || "");
  }, []);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/tableGetCart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id: deviceId }),
    });
    const data = await res.json();
    if (data.status === "1") {
      setCartItems(data.cartItems || []);
      setCartTotal(Number(data.total_price || 0));
    } else {
      setCartItems([]);
      setCartTotal(0);
    }
    setLoading(false);
  }, [deviceId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const tipValue = tipIsAmount ? tipAmount : (cartTotal * tipPercent) / 100;
  const taxes = cartTotal * 0.13;
  const finalTotal = cartTotal + taxes + tipValue;

  const createBarOrder = async (transactionId: string) => {
    const selected_shop = JSON.parse(
      localStorage.getItem("selected_shop") || "{}"
    );

    const formData = new FormData();
    formData.append("device_id", deviceId);
    formData.append("table_no", tableNo);
    formData.append("shop_id", selected_shop?.id || "");
    formData.append("payment_type", "1");
    formData.append("transaction_id", transactionId);
    formData.append("wallet_amount", "0");
    formData.append("online_amount", finalTotal.toFixed(2));
    formData.append("tips", tipValue.toFixed(2));
    formData.append("order_type", "1");

    const res = await fetch(
      "https://dev2024.co.in/web/liquidity-backend/admin/api/createTblOrder",
      { method: "POST", body: formData }
    );

    const data = await res.json();
    if (data.status === "1") {
      router.push(`/order-success/${data.order_id}`);
    } else {
      alert(data.message || "Order failed");
    }
  };

  const initStripePaymentIntent = async () => {
    setInitializingPayment(true);
    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(finalTotal * 100),
        currency: "cad",
      }),
    });
    const data = await res.json();
    setClientSecret(data.client_secret);
    setInitializingPayment(false);
  };

  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert("Cart empty");
    await initStripePaymentIntent();
  };

  return (
    <>
      <Header title="Bar Cart" />

      <section className="pageWrapper hasHeader hasFooter">
        <div className="pageContainer">
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : cartItems.length === 0 ? (
            <p className="text-center">Cart empty</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className={styles.itemCard}>
                <div>
                  <h4>{item.product_name}</h4>
                </div>
                <div>
                  <h4>${(item.price * item.quantity).toFixed(2)}</h4>
                  <QuantityButton
                    min={0}
                    max={10}
                    initialValue={item.quantity}
                    onChange={() => fetchCart()}
                  />
                </div>
              </div>
            ))
          )}

          <Elements stripe={stripePromise}>
            <div className={styles.billingArea}>
              <div><p>Subtotal</p><p>${cartTotal.toFixed(2)}</p></div>
              <div><p>Taxes</p><p>${taxes.toFixed(2)}</p></div>
              <div><p>Tips</p><p>${tipValue.toFixed(2)}</p></div>
              <div><h4>Total</h4><h4>${finalTotal.toFixed(2)}</h4></div>

              <button onClick={() => setPayMode("new_card")}>Card</button>
              <button onClick={() => setPayMode("apple_pay")}> Apple Pay</button>

              {clientSecret && payMode === "new_card" && (
                <NewCardPaymentForm
                  clientSecret={clientSecret}
                  amountLabel={`$${finalTotal.toFixed(2)}`}
                  onSuccess={createBarOrder}
                />
              )}

              {payMode === "apple_pay" && (
                <StripeApplePayButton
                  stripe={undefined}
                  amount={finalTotal}
                  onSuccess={createBarOrder}
                />
              )}
            </div>
          </Elements>

          <TipsSelector
            value={tipPercent}
            onChange={(val: number, isAmount: boolean) => {
              if (isAmount) setTipAmount(val);
              else setTipPercent(val);
              setTipIsAmount(isAmount);
            }}
          />

          {!clientSecret && (
            <div className={styles.bottomArea}>
              <form onSubmit={handleCheckout}>
                <button
                  type="submit"
                  disabled={initializingPayment}
                  className="w-full py-4 bg-primary text-white rounded-xl"
                >
                  {initializingPayment ? "Starting..." : `Pay $${finalTotal.toFixed(2)}`}
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