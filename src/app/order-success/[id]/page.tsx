"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "../order-success.module.scss";
import Image from "next/image";
import statusImg from "../../../../public/images/status.png";
import Link from "next/link";
import { EllipsisVertical, ClockFading } from "lucide-react";
import BottomNavigation from "@/components/common/BottomNavigation/BottomNavigation";

// -----------------------------------------
// TYPES
// -----------------------------------------
interface OrderProduct {
  id: string;
  product_name: string;
  quantity: number;
  unit: string;
  choice_of_mixer_name?: string;
  shot_count?: string;
  special_instruction?: string;
}

interface Order {
  id: string;
  outlet_slug?: string;
  status?: string;       // "1" / "2"
  is_ready?: string;     // "0" / "1"
  square_order_id?: string;
  products?: OrderProduct[];
}

// -----------------------------------------
// STATUS MESSAGE (SQUARE)
// -----------------------------------------
const getStatusMessage = (status: string | null) => {
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
};

export default function OrderSuccess() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [squareStatus, setSquareStatus] = useState<string | null>(null);

  // store single interval id
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ------------------------------------------
  // HELPERS
  // ------------------------------------------
  const clearPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleBack = () => {
    clearPolling();
    if (order?.outlet_slug) {
      router.push(`/outlet-menu/${order.outlet_slug}`);
    } else {
      router.push("/outlet-menu");
    }
  };

  // fetch order
  const fetchOrderDetails = useCallback(async () => {
    try {
      const res = await fetch(
        `https://liquiditybars.com/canada/backend/admin/api/orderDetails/${id}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (data.status === "1" && data.order) {
        return data.order as Order;
      }
      return null;
    } catch (err) {
      console.error("Order fetch error", err);
      return null;
    }
  }, [id]);

  // fetch square status
  const fetchSquareStatus = useCallback(async (squareOrderId: string) => {
    try {
      const res = await fetch(
        `https://liquiditybars.com/canada/backend/admin/api/getSquareOrderStatus/${squareOrderId}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (data.status === "1" && data.square_order_status) {
        return data.square_order_status as string;
      }
      return null;
    } catch (err) {
      console.error("Square status fetch error", err);
      return null;
    }
  }, []);

  // ------------------------------------------
  // POLLING EFFECT (1 MINUTE, SINGLE INTERVAL)
  // ------------------------------------------
  useEffect(() => {
    if (!id) return;

    const pollOrderStatus = async () => {
      const orderData = await fetchOrderDetails();
      if (!orderData) {
        setOrder(null);
        return;
      }

      // base order from backend
      let updatedOrder: Order = { ...orderData };
      setOrder(updatedOrder);

      // if square order exists, sync status
      if (orderData.square_order_id) {
        const sqStatus = await fetchSquareStatus(orderData.square_order_id);
        if (sqStatus) {
          setSquareStatus(sqStatus);

          if (sqStatus === "RESERVED") {
            updatedOrder = { ...updatedOrder, status: "2", is_ready: "0" };
          } else if (sqStatus === "PREPARED") {
            updatedOrder = { ...updatedOrder, status: "2", is_ready: "1" };
          }

          setOrder(updatedOrder);
        }
      }

      // stop polling when prepared
      if (updatedOrder.is_ready === "1") {
        clearPolling();
      }
    };

    // first fetch
    setLoading(true);
    pollOrderStatus().finally(() => setLoading(false));

    // start polling only once
    if (!intervalRef.current) {
      intervalRef.current = setInterval(pollOrderStatus, 30000); // 1 minute
    }

    // cleanup on unmount
    return () => {
      clearPolling();
    };
  }, [id, fetchOrderDetails, fetchSquareStatus]);

  // ------------------------------------------
  // RENDER
  // ------------------------------------------
  if (loading) {
    return (
      <section className="pageWrapper hasHeader">
        <div className="pageContainer">
          <p className="text-center mt-10">Loading order...</p>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="pageWrapper hasHeader">
        <div className="pageContainer">
          <h2 className="text-center mt-10 text-red-500">
            Order not found or deleted.
          </h2>
        </div>
      </section>
    );
  }

  return (
    <>
      <header className="header">
        <button className="icon_only" onClick={handleBack}>
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

        <Link
          href="https://liquiditybars.com/faq.html"
          className="icon_only ml-auto"
        >
          <EllipsisVertical />
        </Link>
      </header>

      <section className="pageWrapper hasHeader">
        <div className="pageContainer">
          <div className={styles.successWrapper}>
            <h4 className="text-center mb-2">
              {getStatusMessage(squareStatus)}
            </h4>

            <h5 className="text-center">Please wait near the bar</h5>

            {/* progress bar driven by status/is_ready */}
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

            <div className={styles.successIcon}>
              <Image src={statusImg} alt="Order status" fill />
            </div>

            <div className={styles.orderDetails}>
              <h4 className="mb-2">Estimated order completion time</h4>
              <p className="flex gap-3">
                <ClockFading /> 3 - 7 minutes
              </p>

              <h4 className="mt-4">Order Details</h4>

              {order.products?.map((p) => (
                <div
                  key={p.id}
                  className="py-4 border-b border-gray-200"
                >
                  <h5>
                    {p.quantity} X {p.product_name}{" "}
                    <span>({p.unit || "1oz"})</span>
                  </h5>
                  <p>
                    Mixer Name:{" "}
                    <span>{p.choice_of_mixer_name || "N/A"}</span>
                    <br />
                    Additional Shots: <span>{p.shot_count ?? 0}</span>
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

      <BottomNavigation />
    </>
  );
}
