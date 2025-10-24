"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./checkout.module.scss";
import Image from 'next/image';
import visa from '../../../public/images/visa.png';
import user from '../../../public/images/3177440.png';
import Button from '@/components/common/Button/Button';
import Link from "next/link";
import QuantityButton from "@/components/common/QuantityButton/QuantityButton";
import { ChevronDown } from "lucide-react"; 
import CardSelector from "@/components/common/CardSelector/CardSelector";
import TipsSelector from "@/components/common/TipsSelector/TipsSelector";

// ✅ Define Card type
interface Card {
  id: string;
  type: string;
  last4: string;
  image: string;
}

export default function Checkout() {
    const router = useRouter();
    const [otp, setOtp] = useState("");
    const [active, setActive] = useState<string | null>(null);

    const handleButtonClick = () => {
        router.back();
    };

    const handleVerify = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); 
        router.push("/acknowledgement"); 
    };

    const handleClick = (value: string) => {
        setActive(value);
    };

    // ✅ Typed cards array
    const cards: Card[] = [
        { id: "1", type: "Visa", last4: "2304", image: "/images/visa.png" },
        { id: "2", type: "MasterCard", last4: "5478", image: "/images/card.png" },
        { id: "3", type: "Amex", last4: "7821", image: "/images/amex.png" },
    ];

    // ✅ Typed card select handler
    const handleCardSelect = (card: Card) => {
        console.log("Selected card:", card);
    };

    return (
        <>
        <header className='header'>
            <button type='button' className='icon_only' onClick={handleButtonClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            <Link href="" className={styles.user}>
                <Image alt="Liquidity Logo" src={user} />
            </Link>
        </header>

        <section className='pageWrapper hasHeader hasFooter'>
            <div className='pageContainer'>
                <div className={styles.stickyHeader}>
                    Vertige Investment Group Annual Summit
                </div>

                {/* Item cards */}
                <div className={`${styles.itemCard}`}>
                    <div className={styles.itemleft}>
                        <h4>1 x Gin Shot <span>(1oz)</span></h4>
                        <p><strong>Choice of Gin:</strong> Cranberry Juice</p>
                        <p><strong>Additional shots:</strong> 1 Additional Shot</p>
                        <p><strong>Special Instruction:</strong> New Chilled</p>
                    </div>
                    <div className={styles.itemRight}>
                        <h4>$ 20.00</h4>
                        <QuantityButton
                            min={1}
                            max={10}
                            initialValue={2}
                            onChange={(val) => console.log("Quantity:", val)}
                            onDelete={() => console.log("Item removed")}
                        />
                    </div>
                </div>

                <div className={`${styles.itemCard}`}>
                    <div className={styles.itemleft}>
                        <h4>1 x Gin Shot <span>(1oz)</span></h4>
                        <p><strong>Choice of Gin:</strong> Cranberry Juice</p>
                        <p><strong>Additional shots:</strong> None</p>
                        <p><strong>Special Instruction:</strong> New Chilled</p>
                    </div>
                    <div className={styles.itemRight}>
                        <h4>$ 20.00</h4>
                        <QuantityButton
                            min={1}
                            max={10}
                            initialValue={1}
                            onChange={(val) => console.log("Quantity:", val)}
                            onDelete={() => console.log("Item removed")}
                        />
                    </div>
                </div>

                <div className={styles.itemCard}>
                    <Link href='/outlet' className={styles.addItemButton}>+ Add Items</Link>
                </div>

                {/* Pickup Location */}
                <div className={`${styles.pickupArea}`}>
                    <h4 className="text-lg font-semibold mb-3">Pickup Location</h4>
                    <div className={`${styles.pickupBlock} flex gap-3`}>
                        {[
                            { id: 'lounge', label: '1st Floor\nLounge' },
                            { id: 'dance', label: '2nd Floor\nDance Floor' },
                            { id: 'nightclub', label: 'Basement\nNightclub' },
                        ].map(({ id, label }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => handleClick(id)}
                                className={`${styles.pickupItem} ${active === id ? 'bg-primary text-white' : ''}`}
                            >
                                {label.split('\n').map((line, i) => (
                                    <span key={i} className="block">{line}</span>
                                ))}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Billing */}
                <div className={`${styles.billingArea}`}>
                    <h4 className="text-lg font-semibold mb-3">Billing Summary</h4>
                    <div className={styles.billingItem}>
                        <p>Subtotal</p>
                        <p>$ 17.95</p>
                    </div>
                    <div className={styles.billingItem}>
                        <p>Liquidity Cash</p>
                        <p>-$ 0.44</p>
                    </div>
                    <div className={styles.billingItem}>
                        <p>Service Fee</p>
                        <p>$ 1.00</p>
                    </div>
                    <div className={styles.billingItem}>
                        <p>Taxes & Other Fees</p>
                        <p>$ 3.57</p>
                    </div>
                    <div className={styles.billingItem}>
                        <h4>Total</h4>
                        <h4>$ 22.08</h4>
                    </div>

                    {/* ✅ Card Selector with typed cards */}
                    <CardSelector cards={cards} onSelect={handleCardSelect} defaultCardId="1" />
                </div>

                {/* Tips Selector */}
                <TipsSelector />

                {/* Checkout button */}
                <div className={styles.bottomArea}>
                    <form onSubmit={handleVerify}>
                        <button type='submit' className='bg-primary px-3 py-3 rounded-lg w-full text-white'>Checkout</button>
                    </form>
                </div>
            </div>
        </section>
        </>    
    );
}
