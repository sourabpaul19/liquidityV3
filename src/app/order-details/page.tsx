import React from 'react'
import Image from 'next/image';
import bar from '../../../public/images/bar.jpg';
import styles from "./order-details.module.scss";
import Header from '@/components/common/Header/Header';
import BottomNavigation from '@/components/common/BottomNavigation/BottomNavigation';
import Link from 'next/link';
import { ChevronRight, MapPin, PhoneCall, Mail } from "lucide-react";

export default function OrderDetails() {
  return (
    <>
        <Header title="My Orders" />
        <section className='pageWrapper hasHeader hasFooter'>
            <div className='pageContainer'>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
                <div>
                    <div className={styles.barWrapper}>
                        <figure>
                            <Image src={bar} alt='' fill />
                        </figure>
                        <figcaption>
                            <h4>Casa Mezcal</h4>
                            <p><MapPin size={14} /> <span>291 King St W, Toronto, ON M5V 1J5</span></p>
                            <p><PhoneCall size={14} /> <span>+911123456789</span></p>
                            <p><Mail size={14} /> <span>baradmin@casamezcal.com</span></p>
                        </figcaption>
                    </div>
                    <h5 className="mb-4">Order Details</h5>
                    <div className={styles.historyBlock}>
                        <Link href="#" className={styles.faqItem}>
                            <p>Date</p>
                            <h5>10-12-2025</h5>
                        </Link>
                        <Link href="#" className={styles.faqItem}>
                            <p>Time</p>
                            <h5>07:33 AM</h5>
                        </Link>
                        <Link href="#" className={styles.faqItem}>
                            <p>Order Type</p>
                            <h5>Bar order</h5>
                        </Link>
                        <Link href="#" className={styles.faqItem}>
                            <p>Payment Mode</p>
                            <h5>Credit Card</h5>
                        </Link>
                        <Link href="#" className={styles.faqItem}>
                            <p>order ID</p>
                            <h5>LIQ-995240</h5>
                        </Link>
                        <Link href="#" className={styles.faqItem}>
                            <p>Order Status</p>
                            <h5>Placed</h5>
                        </Link>
                    </div>
                    <h5 className="mb-4">Items</h5>
                    <div className={styles.historyBlock}>
                        <div className={`${styles.orderItem}`}>
                            <div>
                            <h5>
                                1 X Gin Shot <span>(1oz)</span>
                            </h5>
                            <p>
                                Mixer Name : Cranberry Juice
                                <br />
                                Extra Shots Unit : 1
                                <br />
                                Special Instruction : New Chilled
                            </p>
                            </div>
                            <div>
                                <h5>$ 11.00</h5>
                            </div>
                        </div>
                        <div className={`${styles.orderItem}`}>
                            <div>
                            <h4>
                            1 X Gin Shot <span>(1oz)</span>
                            </h4>
                            <p>Mixer Name : Cranberry Juice</p>
                        </div>
                            <div>
                                <h5>$ 11.00</h5>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <h5 className="mb-4">Order Summary</h5>
                    <div className={styles.historyBlock}>
                        <Link href="#" className={styles.faqItem}>
                            <p>Subtotal</p>
                            <h5>$ 8.00</h5>
                        </Link>
                        <Link href="#" className={styles.faqItem}>
                            <p>Taxes & Charges</p>
                            <h5>$ 2.00</h5>
                        </Link>
                        <Link href="#" className={styles.faqItem}>
                            <p>Tips</p>
                            <h5>$ 2.00</h5>
                        </Link>
                        <div className={styles.row}>
                            <Link href="#" className={`${styles.totalItem}`}>
                                <h5>Grand Total</h5>
                                <h5>$ 2.00</h5>
                            </Link>
                        </div>
                    </div>
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
  )
}
