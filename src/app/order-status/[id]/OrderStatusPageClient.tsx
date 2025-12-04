"use client";

import { useEffect, useState } from "react";
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
  products?: OrderProduct[];
}

export default function OrderStatusPageClient({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderData | null>(null);

  // ------------------------------------------
  // FETCH ORDER DETAILS
  // ------------------------------------------
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(
          `https://liquiditybars.com/canada/backend/admin/api/orderDetails/${id}`,
          { cache: "no-store" }
        );

        const data = await res.json();

        if (data.status === "1" && data.order) {
          setOrder(data.order);
        } else {
          setOrder(null);
        }
      } catch (err) {
        console.error("Order fetch error", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const backClick = () => router.back();

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
  // EXPIRED / INVALID STATUS
  // ------------------------------------------
  if (!["0", "1", "2"].includes(order.status)) {
    return (
      <section className="pageWrapper hasHeader">
        <div className="pageContainer">
          <h2 className="text-center mt-10 text-gray-600">
            This order is no longer active.
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

        <Link
          href="https://liquiditybars.com/faq.html"
          className="icon_only ml-auto"
        >
          <EllipsisVertical />
        </Link>
      </header>

      {/* PAGE */}
      <section className="pageWrapper hasHeader">
        <div className="pageContainer">
          <div className={styles.successWrapper}>
            {/* STATUS TITLE */}
            <h4 className="text-center mb-2">
              {order.status === "0" && "Your order was placed successfully!"}
              {order.status === "2" &&
                order.is_ready === "0" &&
                "The Bar is Preparing Your Order!"}
              {order.status === "2" &&
                order.is_ready === "1" &&
                "Your order is ready for pickup!"}
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
