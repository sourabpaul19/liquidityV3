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
  tax_amount?: string;
  order_date: string;
  shop_id?: string;
  table_no: string;
  order_type?: string;
  products: OrderProduct[];
}

const getLocalStorage = (key: string): string => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(key) || "";
};

// ✅ Get current shop ID helper
const getShopId = (): string => {
  const selected_shop = getLocalStorage("selected_shop");
  return selected_shop
    ? JSON.parse(selected_shop)?.id || getLocalStorage("shop_id")
    : getLocalStorage("shop_id");
};

// ✅ Get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

export default function MyTable() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  const handleBack = () => {
    router.back();
  };

  const handleOrderAnother = () => {
    const shopId = getShopId();
    const tableNo = getLocalStorage("table_no") || getLocalStorage("table_number");

    if (shopId && tableNo) {
      router.push(`/restaurant/${shopId}?table=${tableNo}`);
    } else if (shopId) {
      router.push(`/restaurant/${shopId}`);
    } else {
      router.push("/restaurant");
    }
  };

  // ✅ Filter orders by shop_id, table, order_type, AND TODAY'S DATE ONLY
  const filterOrders = (allOrders: Order[]): Order[] => {
    const hasTableNumber = !!getLocalStorage("table_number");
    const currentTableNo = getLocalStorage("table_number") || "";
    const currentShopId = getShopId();
    const todayDate = getTodayDate();

    console.log("🔍 MyTable Filtering:", { 
      allOrders: allOrders.length, 
      tableNo: currentTableNo, 
      hasTableNumber,
      currentShopId,
      todayDate
    });

    return allOrders.filter((order) => {
      // ✅ Must match today's date ONLY
      if (order.order_date !== todayDate) return false;

      // ✅ Must match shop_id
      if (currentShopId && order.shop_id !== currentShopId) return false;

      if (hasTableNumber && currentTableNo) {
        // Table mode: table_no MATCH + order_type = "2"
        return order.table_no === currentTableNo && order.order_type === "2";
      } else {
        // Bar mode: order_type = "1" ONLY
        return order.order_type === "1";
      }
    });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const deviceId = getLocalStorage("device_id") || getLocalStorage("deviceId");

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
        
        // Initial filter
        const filteredList = list.filter((order: Order) => 
          order.products && order.products.length > 0
        );
        setOrders(filteredList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ✅ Filter orders whenever orders or localStorage changes
  useEffect(() => {
    const filtered = filterOrders(orders);
    setFilteredOrders(filtered);
  }, [orders]);

  // Flatten all products from FILTERED orders only
  const allProducts: OrderProduct[] = filteredOrders.flatMap((order) => order.products || []);

  // Grand subtotal across FILTERED orders: sum(price * quantity) for every product
  const grandSubtotal = allProducts.reduce((sum, product) => {
    const lineTotal = parseFloat(product.price || "0") * parseFloat(product.quantity || "0");
    return sum + lineTotal;
  }, 0);

  // Sum all tax_amount from FILTERED orders (API field) or calculate 13% of subtotal
  const grandTax = filteredOrders.reduce((sum, order) => {
    if (order.tax_amount) {
      return sum + parseFloat(order.tax_amount || "0");
    }
    // Fallback: 13% tax rate if no tax_amount provided
    return sum + grandSubtotal * 0.13;
  }, 0);

  // Grand total = subtotal + tax
  const grandTotal = grandSubtotal + grandTax;

  const renderBody = () => {
    if (loading) {
      return (
        <div className="pageContainer py-4">
          <div className={styles.billCard}>
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
              {getLocalStorage("table_number") 
                ? `No items on Table #${getLocalStorage("table_number")} tab today`
                : "No items on this bar tab today"
              }
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

          {/* Every product from every FILTERED order */}
          {allProducts.map((product) => {
            const lineTotal = parseFloat(product.price || "0") * parseFloat(product.quantity || "0");

            return (
              <div key={product.id + product.product_name} className={styles.billingItem}>
                <p className={styles.itemName}>
                  {product.product_name}
                  {product.unit && ` (${product.unit})`}
                  {parseInt(product.quantity) > 1 && ` x${product.quantity}`}
                </p>
                <p className={styles.itemPrice}>${lineTotal.toFixed(2)}</p>
              </div>
            );
          })}

          {/* Tax row */}
          <div className={styles.billingItem}>
            <p className={styles.subtotalLabel}>Taxes &amp; Other Fees</p>
            <p className={styles.subtotalValue}>${grandTax.toFixed(2)}</p>
          </div>

          {/* Subtotal row */}
          <div className={styles.billingItem}>
            <h4 className={styles.subtotalLabel}>Subtotal</h4>
            <h4 className={styles.subtotalValue}>${grandSubtotal.toFixed(2)}</h4>
          </div>

          {/* TOTAL row - NEW & MOST PROMINENT */}
          <div className={styles.billingItem}>
            <h4 className={styles.totalLabel}>Total</h4>
            <h4 className={styles.totalValue}>${grandTotal.toFixed(2)}</h4>
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