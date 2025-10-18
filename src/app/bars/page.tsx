'use client';

import BottomNavigation from "@/components/common/BottomNavigation/BottomNavigation";
import Header from "@/components/common/Header/Header";
import Image from 'next/image';
import bar from '../../../public/images/bar.jpg';
import styles from "./bars.module.scss";
import { Plus } from "lucide-react";
import Button from "@/components/common/Button/Button";
import Modal from '@/components/common/Modal/Modal';
import { useState } from 'react';
import QuantityButton from "@/components/common/QuantityButton/QuantityButton";


export default function Bars() {
  

    const [open, setOpen] = useState(false);

    const handleQuantityChange = (qty: number) => {
        console.log("Quantity changed:", qty);
    };

  return (
    <>
    <Header title="Casa Mezcal" />
    <section className='page_content'>
        <div className="container-fluid px-4">
            <figure className={styles.barBanner}>
                <Image src={bar} fill alt="" />
            </figure>
            <figcaption>
                <div className={styles.barLeft}>
                    <h2 className={styles.barTitle}>Vic Pool Society at Casa Mezcal</h2>
                    <div className={styles.barType}>Rooftop Patio Resto & Bar</div>
                    <div className={styles.barAddress}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_27_103)">
                                <path d="M17.5 8.33333C17.5 14.1667 10 19.1667 10 19.1667C10 19.1667 2.5 14.1667 2.5 8.33333C2.5 6.34421 3.29018 4.43655 4.6967 3.03003C6.10322 1.62351 8.01088 0.833332 10 0.833332C11.9891 0.833332 13.8968 1.62351 15.3033 3.03003C16.7098 4.43655 17.5 6.34421 17.5 8.33333Z" stroke="#19A83E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M10 10.8333C11.3807 10.8333 12.5 9.71404 12.5 8.33333C12.5 6.95262 11.3807 5.83333 10 5.83333C8.61929 5.83333 7.5 6.95262 7.5 8.33333C7.5 9.71404 8.61929 10.8333 10 10.8333Z" stroke="#19A83E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_27_103">
                                    <rect width="20" height="20" fill="white"/>
                                </clipPath>
                            </defs>
                        </svg>
                        <span>291 King St W, Toronto, ON M5V 1J5</span>
                    </div>
                </div>
                <div className={styles.barRight}>

                </div>
            </figcaption>
            <h3 className="sectionHead">View House Rules</h3>
            <p>By Placing an Order or Booking, You are Accepting Liquidity&apos;s Ordering & Booking Terms and Conditions, And Assume Full Responsibility for any Associated Charges or Fees.</p>
            <h3 className="sectionHead">Order Again</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                    <div className={styles.repeatOrderCard}>
                        <div className={styles.orderItem}><span>Pineapple</span><span>x1</span></div>
                        <div className={styles.orderItem}><span>Pineapple</span><span>x1</span></div>
                        <div className={styles.orderTotal}><span>Order Amount - $4</span><button onClick={() => setOpen(true)} className={styles.add_btn}><Plus size={16} /></button></div>
                    </div>
                </div>
                <div>
                    <div className={styles.repeatOrderCard}>
                        <div className={styles.orderItem}><span>Pineapple</span><span>x1</span></div>
                        <div className={styles.orderItem}><span>Pineapple</span><span>x1</span></div>
                        <div className={styles.orderTotal}><span>Order Amount - $4</span><button onClick={() => setOpen(true)} className={styles.add_btn}><Plus size={16} /></button></div>
                    </div>
                </div>
                <div>
                    <div className={styles.repeatOrderCard}>
                        <div className={styles.orderItem}><span>Pineapple</span><span>x1</span></div>
                        <div className={styles.orderItem}><span>Pineapple</span><span>x1</span></div>
                        <div className={styles.orderTotal}><span>Order Amount - $4</span><button onClick={() => setOpen(true)} className={styles.add_btn}><Plus size={16} /></button></div>
                    </div>
                </div>
                <div>
                    <div className={styles.repeatOrderCard}>
                        <div className={styles.orderItem}><span>Pineapple</span><span>x1</span></div>
                        <div className={styles.orderItem}><span>Pineapple</span><span>x1</span></div>
                        <div className={styles.orderTotal}><span>Order Amount - $4</span><button onClick={() => setOpen(true)} className={styles.add_btn}><Plus size={16} /></button></div>
                    </div>
                </div>
                <div>
                    <div className={styles.repeatOrderCard}>
                        <div className={styles.orderItem}><span>Pineapple</span><span>x1</span></div>
                        <div className={styles.orderItem}><span>Pineapple</span><span>x1</span></div>
                        <div className={styles.orderTotal}><span>Order Amount - $4</span><button onClick={() => setOpen(true)} className={styles.add_btn}><Plus size={16} /></button></div>
                    </div>
                </div>
                <div>
                    <div className={styles.repeatOrderCard}>
                        <div className={styles.orderItem}><span>Pineapple</span><span>x1</span></div>
                        <div className={styles.orderItem}><span>Pineapple</span><span>x1</span></div>
                        <div className={styles.orderTotal}><span>Order Amount - $4</span><button onClick={() => setOpen(true)} className={styles.add_btn}><Plus size={16} /></button></div>
                    </div>
                </div>
                <div>
                    <div className={styles.repeatOrderCard}>
                        <div className={styles.orderItem}><span>Pineapple</span><span>x1</span></div>
                        <div className={styles.orderItem}><span>Pineapple</span><span>x1</span></div>
                        <div className={styles.orderTotal}><span>Order Amount - $4</span><button onClick={() => setOpen(true)} className={styles.add_btn}><Plus size={16} /></button></div>
                    </div>
                </div>
            </div>

        </div>
        <div className="container-fluid pt-4 px-4 bottomButton">
            <Button href="/outlet-menu">View Menu</Button>
            

            <Modal isOpen={open} onClose={() => setOpen(false)} title="Order Again!">
                <div className={styles.itemWrapper}>
                    <div className={styles.itemCard}>
                        <div className={styles.itemDetails}>
                            <h4>Pineapple Juice</h4>
                            <p>(1oz)</p>
                        </div>
                        <div className={styles.itemMeta}>
                            <p className={styles.itemPrice}>$ 1.00</p>
                            <QuantityButton min={1} max={10} onChange={handleQuantityChange} />
                        </div>
                    </div>
                    <div className={styles.itemCard}>
                        <div className={styles.itemDetails}>
                            <h4>Pineapple Juice</h4>
                            <p>(1oz)</p>
                        </div>
                        <div className={styles.itemMeta}>
                            <p className={styles.itemPrice}>$ 1.00</p>
                            <QuantityButton min={1} max={10} onChange={handleQuantityChange} />
                        </div>
                    </div>
                    <div className={styles.itemCard}>
                        <div className={styles.itemDetails}>
                            <h4>Pineapple Juice</h4>
                            <p>(1oz)</p>
                        </div>
                        <div className={styles.itemMeta}>
                            <p className={styles.itemPrice}>$ 1.00</p>
                            <QuantityButton min={1} max={10} onChange={handleQuantityChange} />
                        </div>
                    </div>
                </div>

                <div className={styles.itemWrapper}>
                    <div className={styles.itemCard}>
                        <div className={styles.itemDetails}>
                            <h4>Total</h4>
                        </div>
                        <div className={styles.itemMeta}>
                            <h4>$ 10.00</h4>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button className="w-full bg-primary text-white py-2 rounded-lg">Add to cart</button>
                    <button className="w-full bg-black text-white py-2 rounded-lg">Checkout</button>
                </div>
            </Modal>
        </div>
    </section>
    <BottomNavigation />
    </>
  );
}
