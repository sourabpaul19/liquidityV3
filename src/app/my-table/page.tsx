"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./my-table.module.scss";
import BottomNavigation from "@/components/common/BottomNavigation/BottomNavigation";

interface OrderProduct {
  id: string;
  product_name: string;
  price: string;
  quantity: string;
  unit: string;
}

interface Order {
  id: string;
  unique_id: string;
  total_amount: string;
  products: OrderProduct[];
}

const getLocalStorage = (key: string): string => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(key) || "";
};

export default function MyTable() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const handleBack = () => {
    router.back();
  };

  const handleOrderAnother = () => {
    const shopId = getLocalStorage("shop_id") || getLocalStorage("restaurant_id");
    const tableNo = getLocalStorage("table_no") || getLocalStorage("table_number");

    if (shopId && tableNo) {
      router.push(`/restaurant/${shopId}?table=${tableNo}`);
    } else {
      router.push("/restaurant");
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const deviceId =
          getLocalStorage("device_id") || getLocalStorage("deviceId");

        if (!deviceId) {
          setLoading(false);
          return;
        }

        const res = await fetch(
          `https://liquiditybars.com/canada/backend/admin/api/tblOrderList/${deviceId}`
        );
        if (!res.ok) {
          setLoading(false);
          return;
        }

        const data = await res.json();
        const list: Order[] = Array.isArray(data) ? data : data.orders || [];
        setOrders(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Flatten all products from all orders into one array
  const allProducts: OrderProduct[] = orders.flatMap((order) => order.products || []);

  // Grand total across all orders: sum(price * quantity) for every product
  const grandTotal = allProducts.reduce((sum, product) => {
    const lineTotal =
      parseFloat(product.price || "0") * parseFloat(product.quantity || "0");
    return sum + lineTotal;
  }, 0); // reduce pattern for totals [web:57][web:66]

  const renderBody = () => {
    if (loading) {
      return (
        <div className="pageContainer py-4">
          <div className={styles.billCard}>
            <h4 className={styles.sectionTitle}>Items</h4>
            <p className="text-sm text-gray-500 text-center">Loading...</p>
          </div>
        </div>
      );
    }

    if (allProducts.length === 0) {
      return (
        <div className="pageContainer py-4">
          <div className={styles.billCard}>
            <h4 className={styles.sectionTitle}>Items</h4>
            <p className="text-sm text-gray-400 italic">
              No items on this tab yet
            </p>

            <div className={styles.subtotalRow}>
              <p className={styles.subtotalLabel}>Subtotal</p>
              <p className={styles.subtotalValue}>$0.00</p>
            </div>

            <button
              type="button"
              onClick={handleOrderAnother}
              className={styles.primaryButton}
            >
              Order Another Item
            </button>
          </div>

          <p className={styles.footerNote}>
            To close your bill, or for any questions about your order,
            please speak to your server.
          </p>
        </div>
      );
    }

    return (
      <div className="pageContainer py-4">
        <div className={styles.billingArea}>
          {/* Items heading */}
          <h4 className={styles.sectionTitle}>Items</h4>

          {/* Every product from every order */}
          {allProducts.map((product) => {
            const lineTotal =
              parseFloat(product.price || "0") *
              parseFloat(product.quantity || "0");

            return (
              <div key={product.id + product.product_name} className={styles.billingItem}>
                <p className={styles.itemName}>
                  {product.product_name}
                  {parseInt(product.quantity) > 1 && ` x${product.quantity}`}
                </p>
                <p className={styles.itemPrice}>${lineTotal.toFixed(2)}</p>
              </div>
            );
          })}

          {/* Grand subtotal for all orders */}
          <div className={styles.billingItem}>
            <h4 className={styles.subtotalLabel}>Subtotal</h4>
            <h4 className={styles.subtotalValue}>${grandTotal.toFixed(2)}</h4>
          </div>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={handleOrderAnother}
            className='mt-6 px-6 py-3 rounded-lg w-full text-white bg-primary transition-all hover:bg-primary/90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
          >
            Order Another Item
          </button>
        </div>

        <div className={styles.footerNote}>
          <p>To close your bill, or for any questions about your order,
          please speak to your server.</p>
        </div>
      </div>
    );
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
        <div className="pageTitle">Current Tab</div>
        <button type="button" className="icon_only"></button>
      </header>

      <section className="pageWrapper hasHeader">
        {renderBody()}
      </section>
    </>
  );
}
