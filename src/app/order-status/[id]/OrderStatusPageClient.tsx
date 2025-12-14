"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "../order-status.module.scss";
import Image from "next/image";
import statusImg from "../../../../public/images/status.png";
import { EllipsisVertical, ClockFading } from "lucide-react";
import Link from "next/link";

// ------------------------------------------
// TYPES
// ------------------------------------------
interface OrderProduct {
  id: string;
  quantity: string;
  product_name: string;
  unit: string;
  choice_of_mixer_name?: string;
  shot_count?: string;
  special_instruction?: string;
}

interface OrderData {
  status: string;
  is_ready: string;
  square_order_id?: string;
  products?: OrderProduct[];
}

export default function OrderStatusPageClient({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [squareStatus, setSquareStatus] = useState<string | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // ------------------------------------------
  // STATUS MESSAGES - SQUARE ONLY
  // ------------------------------------------
  const getStatusMessage = useCallback((status: string | null) => {
    switch (status) {
      case "PROPOSED":
        return "The Bar Has Received Your Order";
      case "RESERVED":
        return "The Bar Is Preparing Your Order";
      case "PREPARED":
        return "Your Order Is Ready For Pickup";
      default:
        return "Your order is being processed";
    }
  }, []);

  // ------------------------------------------
  // FETCH ORDER DETAILS
  // ------------------------------------------
  const fetchOrderDetails = useCallback(async () => {
    try {
      const res = await fetch(
        `https://liquiditybars.com/canada/backend/admin/api/orderDetails/${id}`,
        { cache: "no-store" }
      );

      const data = await res.json();

      if (data.status === "1" && data.order) {
        return data.order;
      }
      return null;
    } catch (err) {
      console.error("Order fetch error", err);
      return null;
    }
  }, [id]);

  // ------------------------------------------
  // FETCH SQUARE ORDER STATUS
  // ------------------------------------------
  const fetchSquareStatus = useCallback(async (squareOrderId: string) => {
    try {
      const res = await fetch(
        `https://liquiditybars.com/canada/backend/admin/api/getSquareOrderStatus/${squareOrderId}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      
      // Handle the new response format: {"status":"1","message":"...","square_order_status":"PREPARED"}
      if (data.status === "1" && data.square_order_status) {
        return data.square_order_status;
      }
      return null;
    } catch (err) {
      console.error("Square status fetch error", err);
      return null;
    }
  }, []);

  // ------------------------------------------
  // POLLING LOGIC
  // ------------------------------------------
  useEffect(() => {
    const pollOrderStatus = async () => {
      const orderData = await fetchOrderDetails();
      
      if (!orderData) {
        setOrder(null);
        return;
      }

      setOrder(orderData);

      // If we have square_order_id, fetch Square status
      if (orderData.square_order_id) {
        const newSquareStatus = await fetchSquareStatus(orderData.square_order_id);
        if (newSquareStatus) {
          setSquareStatus(newSquareStatus);
          
          // Update progress bar mapping
          if (newSquareStatus === "RESERVED") {
            orderData.status = "2";
            orderData.is_ready = "0";
          } else if (newSquareStatus === "PREPARED") {
            orderData.status = "2";
            orderData.is_ready = "1";
          }
          
          setOrder({ ...orderData });
        }
      }

      // Stop polling when PREPARED (final state)
      if (squareStatus === "PREPARED") {
        stopPolling();
      }
    };

    const startPolling = async () => {
      setLoading(true);
      await pollOrderStatus();
      setLoading(false);
      
      // Start interval polling every 5 seconds (unless already PREPARED)
      if (squareStatus !== "PREPARED") {
        const interval = setInterval(pollOrderStatus, 5000);
        setPollInterval(interval);
      }
    };

    const stopPolling = () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        setPollInterval(null);
      }
    };

    startPolling();

    // Cleanup
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [id, fetchOrderDetails, fetchSquareStatus, squareStatus]);

  const backClick = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
    }
    router.back();
  };

  // ------------------------------------------
  // LOADING
  // ------------------------------------------
  if (loading) {
    return <p className="text-center mt-10">Loading order…</p>;
  }

  // ------------------------------------------
  // NOT FOUND
  // ------------------------------------------
  if (!order) {
    return (
      <section className="pageWrapper hasHeader">
        <div className="pageContainer">
          <h2 className="text-center mt-10 text-red-500">
            Order not found or deleted
          </h2>
        </div>
      </section>
    );
  }

  // ------------------------------------------
  // MAIN UI
  // ------------------------------------------
  return (
    <>
      {/* HEADER */}
      <header className="header">
        <button className="icon_only" onClick={backClick}>
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

        <Link href="https://liquiditybars.com/faq.html" className="icon_only ml-auto">
          <EllipsisVertical />
        </Link>
      </header>

      {/* PAGE */}
      <section className="pageWrapper hasHeader">
        <div className="pageContainer">
          <div className={styles.successWrapper}>
            {/* STATUS TITLE - SQUARE STATUS ONLY */}
            <h4 className="text-center mb-2">
              {getStatusMessage(squareStatus)}
            </h4>

            <h5 className="text-center">Please wait near the bar</h5>

            {/* PROGRESS BAR */}
            <div className={styles.progress}>
              <div className={`${styles.progressLayer} ${styles.animated}`}>
                <div className={styles.progressBar}></div>
              </div>

              <div
                className={`${styles.progressLayer} ${
                  order.status === "2" && order.is_ready === "0"
                    ? styles.completed
                    : ""
                }`}
              >
                <div className={styles.progressBar}></div>
              </div>

              <div
                className={`${styles.progressLayer} ${
                  order.status === "2" && order.is_ready === "1"
                    ? styles.completed
                    : ""
                }`}
              >
                <div className={styles.progressBar}></div>
              </div>
            </div>

            {/* STATUS IMAGE */}
            <div className={styles.successIcon}>
              <Image src={statusImg} alt="" fill />
            </div>

            {/* ORDER DETAILS */}
            <div className={styles.orderDetails}>
              <h4 className="mb-2">Estimated order completion time</h4>
              <p className="flex gap-3">
                <ClockFading /> 3 - 7 minutes
              </p>

              <h4 className="mt-4">Order Details</h4>

              {order.products?.map((p) => (
                <div key={p.id} className="py-4 border-b border-gray-200">
                  <h5>
                    {p.quantity} X {p.product_name} <span>({p.unit})</span>
                  </h5>
                  <p>
                    Mixer Name: <span>{p.choice_of_mixer_name || "N/A"}</span>
                    <br />
                    Additional Shots: <span>{p.shot_count || 0}</span>
                    <br />
                    Special Instruction:{" "}
                    <span>{p.special_instruction || "—"}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
