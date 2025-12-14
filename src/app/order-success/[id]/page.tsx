"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "../order-success.module.scss";
import Image from "next/image";
import status from "../../../../public/images/status.png";
import Link from "next/link";
import { EllipsisVertical, ClockFading } from "lucide-react";
import BottomNavigation from "@/components/common/BottomNavigation/BottomNavigation";

// -----------------------------------------
// ✅ TYPES (Fixes all "any" errors)
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
  products?: OrderProduct[];
}

// -----------------------------------------

export default function OrderSuccess() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Back button logic
  const handleBack = () => {
    if (order?.outlet_slug) {
      router.push(`/outlet-menu/${order.outlet_slug}`);
    } else {
      router.push("/outlet-menu");
    }
  };

  // 🔥 Fetch order details
  useEffect(() => {
    if (!id) return;

    async function fetchOrder() {
      try {
        const res = await fetch(
          `https://liquiditybars.com/canada/backend/admin/api/orderDetails/${id}`
        );
        const data = await res.json();

        if (data.status === "1" && data.order) {
          setOrder(data.order as Order);
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error("Order fetch error:", error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id]);

  // 🔹 Loading UI
  if (loading) {
    return (
      <section className="pageWrapper hasHeader">
        <div className="pageContainer">
          <p className="text-center mt-10">Loading order...</p>
        </div>
      </section>
    );
  }

  // 🔹 If no order found
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

        <Link href="https://liquiditybars.com/faq.html" className="icon_only ml-auto">
          <EllipsisVertical />
        </Link>
      </header>

      <section className="pageWrapper hasHeader">
        <div className="pageContainer">
          <div className={styles.successWrapper}>
            <h4 className="text-center mb-2">The Bar Has Received Your Order!</h4>
            <h5 className="text-center">Please wait near the bar</h5>

            <div className={styles.progress}>
              <div className={`${styles.progressLayer} ${styles.animated}`}>
                <div className={styles.progressBar}></div>
              </div>
              <div className={`${styles.progressLayer}`}>
                <div className={styles.progressBar}></div>
              </div>
              <div className={`${styles.progressLayer}`}>
                <div className={styles.progressBar}></div>
              </div>
            </div>

            <div className={styles.successIcon}>
              <Image src={status} alt="Order Success" fill />
            </div>

            <div className={styles.orderDetails}>
              <h4 className="mb-2">Estimated order completion time</h4>
              <p className="flex gap-3">
                <ClockFading /> 3 - 7 minutes
              </p>

              <h4 className="mt-4">Order Details</h4>

              {order.products?.map((p) => (
                <div key={p.id} className="py-4 border-b border-gray-200">
                  <h5>
                    {p.quantity} X {p.product_name} <span>({p.unit || "1oz"})</span>
                  </h5>

                  <p>
                    Mixer Name :<span> {p.choice_of_mixer_name || "N/A"}</span>
                    <br />
                    Additional Shots :
                    <span> {p.shot_count ?? 0}</span>
                    <br />
                    Special Instruction :
                    <span> {p.special_instruction || "—"}</span>
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
