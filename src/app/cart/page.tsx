"use client";

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    ApplePaySession?: any;
  }
}

interface Props {
  amountCents: number;
  onSuccess: (transactionId: string) => Promise<void>;
}

export default function ApplePayButtonDynamic({ amountCents, onSuccess }: Props) {
  const [supported, setSupported] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (session) session.abort();
    };
  }, [session]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkApplePay = async () => {
      try {
        if (!window.ApplePaySession?.supportsVersion(3)) {
          setError("Apple Pay not supported");
          return;
        }

        const canPay = await window.ApplePaySession.canMakePayments();
        setSupported(!!canPay);
      } catch (err: any) {
        console.error('Apple Pay check failed:', err);
        setError("Apple Pay unavailable");
      }
    };

    checkApplePay();
  }, []);

  const startApplePay = useCallback(async () => {
    if (processing || !window.ApplePaySession || session) return;

    setProcessing(true);
    setError(null);

    const request: any = {
      countryCode: "CA",
      currencyCode: "CAD",
      total: {
        label: "Liquidity Bars Order",
        amount: (amountCents / 100).toFixed(2),
      },
      merchantCapabilities: ["supports3DS"],
      supportedNetworks: ["visa", "masterCard", "amex"],
    };

    const newSession = new window.ApplePaySession(3, request);
    setSession(newSession);

    newSession.onvalidatemerchant = async (event: any) => {
      try {
        const res = await fetch("/api/apple-pay/validate-merchant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ validationURL: event.validationURL }),
        });
        if (!res.ok) throw new Error("Merchant validation failed");
        
        const merchantSession = await res.json();
        newSession.completeMerchantValidation(merchantSession);
      } catch (err) {
        console.error("Merchant validation error:", err);
        newSession.abort();
      }
    };

    newSession.onpaymentauthorized = async (event: any) => {
      try {
        const token = event.payment.token?.paymentData;
        if (!token) {
          newSession.completePayment(window.ApplePaySession.STATUS_FAILURE);
          return;
        }

        const res = await fetch("/api/apple-pay/charge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, amount: amountCents }),
        });

        const data = await res.json();

        if (data.status === "success" && data.transaction_id) {
          newSession.completePayment(window.ApplePaySession.STATUS_SUCCESS);
          setProcessing(false);
          setSession(null);
          await onSuccess(data.transaction_id);
        } else {
          newSession.completePayment(window.ApplePaySession.STATUS_FAILURE);
          setError(data.message || "Payment failed");
        }
      } catch (err) {
        console.error("Payment error:", err);
        newSession.completePayment(window.ApplePaySession.STATUS_FAILURE);
        setError("Payment processing failed");
      }
    };

    newSession.oncancel = () => {
      setProcessing(false);
      setSession(null);
    };

    newSession.begin();
  }, [amountCents, onSuccess]);

  if (error) {
    return (
      <button disabled className="w-full py-4 px-6 border-2 border-gray-200 bg-gray-50 text-gray-500 rounded-xl text-sm font-medium">
        {error}
      </button>
    );
  }

  if (!supported) {
    return (
      <button disabled className="w-full py-4 px-6 border-2 border-gray-200 bg-gray-50 text-gray-500 rounded-xl text-sm font-medium">
        Apple Pay not available
      </button>
    );
  }

  return (
    <button
      onClick={startApplePay}
      disabled={processing}
      className="w-full py-4 px-6 bg-black text-white border-2 border-black rounded-xl font-bold text-lg shadow-2xl hover:bg-gray-900 hover:shadow-3xl transition-all flex items-center justify-center gap-2"
    >
      {processing ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <span className="text-xl">🍎</span>
          Pay with Apple Pay
        </>
      )}
    </button>
  );
}
