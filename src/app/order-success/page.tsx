"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./order-success.module.scss";
import Image from 'next/image';
import status from '../../../public/images/status.png';
import Button from '@/components/common/Button/Button';
import Header from "@/components/common/Header/Header";
import Link from "next/link";
import { EllipsisVertical, ClockFading } from "lucide-react";
import BottomNavigation from "@/components/common/BottomNavigation/BottomNavigation";

export default function OrderSuccess() {

    const router = useRouter();
    const [otp, setOtp] = useState("");

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        router.push("/new-account");
    };

     const handleButtonClick = () => {
        router.back();
    };
  
  return (
    <>
    <header className="header">
        <button className="icon_only" onClick={handleButtonClick}>
            <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 6L9 12L15 18"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        </button>
        <button className="icon_only ml-auto">
            <EllipsisVertical />
        </button>

    </header>
    <section className='pageWrapper hasHeader'>
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
                <div className={styles.progressLayer}>
                    <div className={styles.progressBar}></div>
                </div>
            </div>

            <div className={styles.successIcon}>
                <Image src={status} alt="" fill />
            </div>

            <div className={styles.orderDetails}>
                <h4 className="mb-2">Estimated order completion time</h4>
                <p className="flex gap-3"><ClockFading /> 3 - 7 minutes</p>

                <h4 className="mt-4">Order Details</h4>

                <div className="py-4 border-b border-gray-200">
                    <h5>1 X Gin Shot <span>(1oz)</span></h5>
                    <p>
                        Mixer Name :<span> Cranberry Juice</span>
                        <br />
                        Additional Shots :<span> 1</span>
                        <br />
                        Special Instruction :<span> New Chilled</span>
                    </p>
                </div>
                <div className="py-4 border-b border-gray-200">
                    <h5>1 X Gin Shot <span>(1oz)</span></h5>
                    <p>
                        Mixer Name :<span> Cranberry Juice</span>
                        <br />
                        Additional Shots :<span> 1</span>
                        <br />
                        Special Instruction :<span> New Chilled</span>
                    </p>
                </div>
            </div>
            
            
        </div>
        </div>
    </section>
    </>
  )
}