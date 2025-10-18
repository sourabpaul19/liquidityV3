"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./order-status.module.scss";
import Image from 'next/image';
import accepted from '../../../public/images/accepted.png';
import Button from '@/components/common/Button/Button';
import Header from "@/components/common/Header/Header";
import Link from "next/link";
import { Star, Heart, ChevronRight } from "lucide-react";
import BottomNavigation from "@/components/common/BottomNavigation/BottomNavigation";

export default function OrderSuccess() {

    const router = useRouter();
    const [otp, setOtp] = useState("");

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        router.push("/new-account");
    };
  
  return (
    <>
    <Header title="Order Success" />
    <section className='page_content'>
        <div className={styles.successWrapper}>
            <div className={styles.successIcon}>
                <Image src={accepted} alt="" fill />
            </div>
            <h4 className="text-center mb-4">The Bar Has Received Your Order!</h4>

            <div className={styles.successBlock}>
                <div className="flex justify-between py-4 border-b border-gray-200">
                    <div className="flex flex-col">
                        <h5>Order for Test</h5>
                        <p className="text-green-50">The Bar Has Received Your Order!</p>
                    </div>
                    <div className="flex flex-col justify-end items-end">
                        <h5>ID: LIQD 3456 6604</h5>
                        <p>Pickup at Bar</p>
                    </div>
                </div>
                <div className="py-4 border-b border-gray-200">
                    <h5>1 X Gin Shot <span>(1oz)</span></h5>
                    <p>
                        Mixer Name : Cranberry Juice
                        <br />
                        Extra Shots Unit : 1
                        <br />
                        Special Instruction : New Chilled
                    </p>
                </div>
                <div className="flex justify-between py-4">
                    <div className="flex flex-col">
                        <h5>$ 37.29</h5>
                        <p>Ordered on 21 Nov at 5:35 PM</p>
                    </div>
                    <div className="flex flex-col">
                        <Link href='/receipt' className="bg-primary text-white py-2 px-4 rounded-lg">View Receipt</Link>
                    </div>
                </div>
            </div>
            <h5 className="mb-4">Help</h5>
            <div className={styles.successBlock}>
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
            <div className="bottomButton">
                <Button href="/order-success" variant="danger">Cancel Order</Button>
            </div>
        </div>
    </section>
    <BottomNavigation />
    </>
  )
}
