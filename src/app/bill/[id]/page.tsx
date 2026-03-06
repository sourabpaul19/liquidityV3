"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

interface LineItem {
  uid: string;
  name: string;
  quantity: string;
  base_price_money: {
    amount: number;
    currency: string;
  };
}

interface Order {
  id: string;
  line_items: LineItem[];
  total_money: {
    amount: number;
  };
  total_tax_money?: {
    amount: number;
  };
}

export default function BillPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      const res = await fetch(
        `https://dev2024.co.in/web/liquidity-backend/admin/api/getSquareOrder/${orderId}`
      );

      const data = await res.json();

      if (data.order) {
        setOrder(data.order);
      } else {
        setOrder(null);
      }
    } catch (err) {
      console.error(err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleViewTab = useCallback(() => {
    router.push("/my-table");
  }, [router]);

  if (loading) return <p style={{ padding: 20 }}>Loading bill...</p>;
  if (!order) return <p style={{ padding: 20 }}>Order not found</p>;

  const subtotal =
    order.line_items?.reduce((sum, item) => {
      const price = item.base_price_money.amount / 100;
      return sum + price * Number(item.quantity);
    }, 0) || 0;

  const tax = (order.total_tax_money?.amount || 0) / 100;
  const total = subtotal + tax;

  return (
    <>
      <header className="header flex items-center justify-between p-4 border-b border-gray-200">
        <button
          type="button"
          className="icon_only"
          onClick={handleViewTab} // fixed
        >
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
        <div className="pageTitle font-bold text-lg">View Bill</div>
        <button type="button" className="icon_only"></button>
      </header>

      <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
        <h2 className="text-xl font-bold mb-4">Bill</h2>

        <div className="mb-4">
          {order.line_items?.map((item) => {
            const price = item.base_price_money.amount / 100;
            const lineTotal = price * Number(item.quantity);

            return (
              <div
                key={item.uid}
                className="flex justify-between mb-2 text-gray-800"
              >
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>${lineTotal.toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        <hr className="my-2" />

        <div className="flex justify-between mb-1">
          <strong>Subtotal</strong>
          <strong>${subtotal.toFixed(2)}</strong>
        </div>

        <div className="flex justify-between mb-1">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>

        <hr className="my-2" />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </>
  );
}