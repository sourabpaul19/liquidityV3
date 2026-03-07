"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import statusImg from "../../../../public/images/bill.png";
import styles from "../bill-success.module.scss";

type ParamsType = Promise<{ id: string }>;

export default function BillSuccess({ params }: { params: ParamsType }) {
  const router = useRouter();

  const { id } = use(params);   // unwrap params
  const orderId = id;

  console.log("Order ID:", orderId);

  return (
    <section className="pageWrapper">
      <div className="pageContainer vMiddle">
        <div className={styles.successWrapper}>
          <div className={styles.successIcon}>
            <Image src={statusImg} alt="Order status" fill />
          </div>

          <h4 className="text-center mb-2">
            Your bill is on the way
          </h4>

          <p className="text-center">
            Please speak with your server if you encounter any issues
          </p>

          <button
            onClick={() => router.push(`/bill/${orderId}`)}
            className="mt-6 bg-primary text-white px-6 py-3 rounded-lg w-full max-w-sm"
          >
            View Receipt
          </button>
        </div>
      </div>
    </section>
  );
}