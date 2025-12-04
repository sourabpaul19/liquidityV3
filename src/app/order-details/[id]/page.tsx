"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "../order-details.module.scss";
import Header from "@/components/common/Header/Header";
import BottomNavigation from "@/components/common/BottomNavigation/BottomNavigation";
import Link from "next/link";
import { ChevronRight, MapPin, PhoneCall, Mail } from "lucide-react";
import { useParams } from "next/navigation";

interface Shop {
  name: string;
  address: string;
  phone: string;
  email: string;
  image: string;
}

interface Product {
  product_name: string;
  quantity: string;
  price: string;
  unit: string;
  choice_of_mixer_name?: string;
  is_double_shot?: string;
  double_shot_price?: string;
  special_instruction?: string;
}

interface Order {
  id: string;
  unique_id: string;
  created_at: string;
  order_type: string;
  payment_type: string;
  status: string;
  amount: string;
  tax_amount: string;
  tips: string;
  total_amount: string;
  products: Product[];
  shop: Shop;
}

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(
          `https://liquiditybars.com/canada/backend/admin/api/orderDetails/${id}`
        );
        const data = await res.json();

        if (data.status === "1" && data.order) {
          setOrder(data.order);
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-10 text-gray-500">Order not found</div>
    );
  }

  // ✅ Status mapping
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "0":
        return "🕒 Pending";
      case "1":
        return "🆕 New";
      case "2":
        return "✅ Accepted";
      case "3":
        return "🍽️ Served";
      case "4":
        return "❌ Cancelled";
      default:
        return "Unknown";
    }
  };

  // ✅ Order type mapping
  const getOrderTypeLabel = (type: string) => {
    switch (type) {
      case "1":
        return "1st Floor\nLounge";
      case "2":
        return "2nd Floor\nDance Floor";
      case "3":
        return "Basement\nNightclub";
      default:
        return "N/A";
    }
  };

  // ✅ Payment type mapping
  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case "1":
        return "💳 Online";
      case "2":
        return "👛 Wallet";
      default:
        return "N/A";
    }
  };

  const getFormattedDate = (created_at: string) => {
    if (!created_at) return "N/A";
    const date = new Date(created_at.replace(" ", "T"));
    return date.toLocaleDateString("en-GB"); // DD/MM/YYYY format
  };

  const getFormattedTime = (created_at: string) => {
    if (!created_at) return "N/A";
    const date = new Date(created_at.replace(" ", "T"));
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      <Header title="My Orders" />
      <section className="pageWrapper hasHeader hasFooter">
        <div className="pageContainer">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
            {/* SHOP INFO */}
            <div>
              <div className={styles.barWrapper}>
                <figure className="relative w-full h-48 rounded overflow-hidden">
                  <Image
                    src={order.shop?.image || "/images/bar.jpg"}
                    alt={order.shop?.name || "Shop"}
                    fill
                    className="object-cover"
                  />
                </figure>
                <figcaption>
                  <h4>{order.shop?.name}</h4>
                  <p>
                    <MapPin size={14} /> <span>{order.shop?.address}</span>
                  </p>
                  <p>
                    <PhoneCall size={14} /> <span>{order.shop?.phone}</span>
                  </p>
                  <p>
                    <Mail size={14} /> <span>{order.shop?.email}</span>
                  </p>
                </figcaption>
              </div>

              {/* ORDER DETAILS */}
              <h5 className="mb-4">Order Details</h5>
              <div className={styles.historyBlock}>
                <div className={styles.faqItem}>
                  <p>Date</p>
                  <h5>{getFormattedDate(order.created_at)}</h5>
                </div>
                <div className={styles.faqItem}>
                  <p>Time</p>
                  <h5>{getFormattedTime(order.created_at)}</h5>
                </div>
                <div className={styles.faqItem}>
                  <p>Order Type</p>
                  <h5>{getOrderTypeLabel(order.order_type)}</h5>
                </div>
                <div className={styles.faqItem}>
                  <p>Payment Mode</p>
                  <h5>{getPaymentTypeLabel(order.payment_type)}</h5>
                </div>
                <div className={styles.faqItem}>
                  <p>Order ID</p>
                  <h5>{order.unique_id}</h5>
                </div>
                <div className={styles.faqItem}>
                  <p>Status</p>
                  <h5>{getStatusLabel(order.status)}</h5>
                </div>
              </div>

              {/* ITEMS */}
              <h5 className="mb-4">Items</h5>
              <div className={styles.historyBlock}>
                {Array.isArray(order.products) && order.products.length > 0 ? (
                  order.products.map((item, index) => (
                    <div key={index} className={styles.orderItem}>
                      <div>
                        <h5>
                          {item.quantity} × {item.product_name}{" "}
                          {item.unit && <span>({item.unit})</span>}
                        </h5>
                        {item.choice_of_mixer_name && (
                          <p>Mixer: {item.choice_of_mixer_name}</p>
                        )}
                        {item.is_double_shot === "1" && (
                          <p>Double Shot (+${item.double_shot_price})</p>
                        )}
                        {item.special_instruction &&
                          item.special_instruction !== "undefined" && (
                            <p>Instruction: {item.special_instruction}</p>
                          )}
                      </div>
                      <div>
                        <h5>${item.price}</h5>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    No items found for this order.
                  </p>
                )}
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div>
              <h5 className="mb-4">Order Summary</h5>
              <div className={styles.historyBlock}>
                <div className={styles.faqItem}>
                  <p>Subtotal</p>
                  <h5>${order.amount}</h5>
                </div>
                <div className={styles.faqItem}>
                  <p>Taxes & Charges</p>
                  <h5>${order.tax_amount}</h5>
                </div>
                <div className={styles.faqItem}>
                  <p>Tips</p>
                  <h5>${order.tips}</h5>
                </div>
                <div className={styles.row}>
                  <div className={styles.totalItem}>
                    <h5>Grand Total</h5>
                    <h5>${order.total_amount}</h5>
                  </div>
                </div>
              </div>

              {/* HELP SECTION */}
              <h5 className="mb-4">Help</h5>
              <div className={styles.historyBlock}>
                <Link href="#" className={styles.faqItem}>
                  <h5>My order is taking too long</h5>
                  <ChevronRight size={16} />
                </Link>
                <Link href="#" className={styles.faqItem}>
                  <h5>My order is incorrect</h5>
                  <ChevronRight size={16} />
                </Link>
                <Link href="#" className={styles.faqItem}>
                  <h5>There is something wrong with my order</h5>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <BottomNavigation />
    </>
  );
}
