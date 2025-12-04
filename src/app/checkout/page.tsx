"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./checkout.module.scss";
import Image from 'next/image';
import user from '../../../public/images/3177440.png';
import Link from "next/link";
import QuantityButton from "@/components/common/QuantityButton/QuantityButton";
import CardSelector from "@/components/common/CardSelector/CardSelector";
import TipsSelector from "@/components/common/TipsSelector/TipsSelector";
import toast from "react-hot-toast";

// Cart item typing (adjust fields as per backend response)
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  choice_of_mixer_name?: string;
  extraShotQty?: number;
  specialInstructions?: string;
}

export default function Checkout() {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Get user info from localStorage
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") || "" : "";
  const deviceId = typeof window !== "undefined" ? localStorage.getItem("device_id") || "" : "";

  const cards = [
    { id: "1", type: "Visa", last4: "2304", image: "/images/visa.png" },
    { id: "2", type: "MasterCard", last4: "5478", image: "/images/card.png" },
    { id: "3", type: "Amex", last4: "7821", image: "/images/amex.png" },
  ];

  const handleButtonClick = () => {
    router.push("/home");
  };

  const handleClick = (value: string) => {
    setActive(value);
  };

  const handleCardSelect = (card: typeof cards[0]) => {
    console.log("Selected card:", card);
  };

  // Retrieve guest cart from localStorage
  const getLocalCart = (): any[] => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("local_cart") || "[]");
    } catch {
      return [];
    }
  };

  // Clear guest cart from localStorage
  const clearLocalCart = () => {
    localStorage.removeItem("local_cart");
  };

  // API call to add multiple cart items for user on backend
  const addGuestCartToBackend = async (items: any[]) => {
  try {
    const payload = {
      user_id: userId,
      device_id: deviceId,
      cart_items: items,
    };

    const response = await fetch("/api/cartProxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && (data.status === "1" || data.success)) {
      console.log("Cart items successfully added to backend via proxy.");
      return data;
    } else {
      console.warn("Failed to add cart items via proxy:", data);
      return data;
    }
  } catch (error) {
    console.error("Error calling proxy API:", error);
    return { success: false, message: "Network or proxy error" };
  }
};



  // API call to fetch updated cart details from backend
  const fetchBackendCartDetails = async () => {
    try {
      const response = await fetch("/api/getBackendCart", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ user_id: userId, device_id: deviceId }),
});

      const data = await response.json();
      if (data && Array.isArray(data.cartItems)) {
        setCartItems(data.cartItems);
      }
    } catch (error) {
      console.error("Failed to fetch cart details:", error);
    }
  };

  // On mount: sync guest cart if any and fetch updated cart details
  useEffect(() => {
    const syncCart = async () => {
      if (!userId || !deviceId) return;
      setLoading(true);
      const guestCart = getLocalCart();
      if (guestCart.length > 0) {
        const addRes = await addGuestCartToBackend(guestCart);
        if (addRes && (addRes.status === "1" || addRes.success)) {
          clearLocalCart();
          await fetchBackendCartDetails();
          toast.success("Guest cart synchronized successfully.");
        } else {
          toast.error("Failed to synchronize guest cart.");
          await fetchBackendCartDetails();
        }
      } else {
        await fetchBackendCartDetails();
      }
      setLoading(false);
    };
    syncCart();
  }, [userId, deviceId]);

  const handleVerify = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push("/acknowledgement");
  };

  return (
    <>
      <header className='header'>
        <button type="button" className={styles.icon_only} onClick={handleButtonClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <Link href="" className={styles.user}>
          <Image alt="User" src={user} />
        </Link>
      </header>

      <section className="pageWrapper hasHeader hasFooter">
        <div className="pageContainer">
          <div className={styles.stickyHeader}>Vertige Investment Group Annual Summit</div>

          {loading && <p>Loading cart...</p>}
          {!loading && cartItems.length === 0 && <p>Your cart is empty.</p>}

          {!loading && cartItems.map(item => (
            <div key={item.id} className={styles.itemCard}>
              <div className={styles.itemleft}>
                <h4>{item.quantity} x {item.name} <span>(1oz)</span></h4>
                {item.choice_of_mixer_name && <p><strong>Choice of Mixer:</strong> {item.choice_of_mixer_name}</p>}
                {item.extraShotQty ? (
                  <p><strong>Additional shots:</strong> {item.extraShotQty} Additional Shot{item.extraShotQty > 1 ? "s" : ""}</p>
                ) : null}
                {item.specialInstructions && <p><strong>Special Instruction:</strong> {item.specialInstructions}</p>}
              </div>
              <div className={styles.itemRight}>
                <h4>${(item.price * item.quantity).toFixed(2)}</h4>
                <QuantityButton
                  min={1}
                  max={10}
                  initialValue={item.quantity}
                  onChange={(val) => console.log("Quantity changed for", item.id, val)}
                  onDelete={() => console.log("Delete item", item.id)}
                />
              </div>
            </div>
          ))}

          <div className={styles.itemCard}>
            <Link href="/outlet" className={styles.addItemButton}>+ Add Items</Link>
          </div>

          <div className={styles.pickupArea}>
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

          <div className={styles.billingArea}>
            <h4 className="text-lg font-semibold mb-3">Billing Summary</h4>

            {/* Example static billing summary. Replace with dynamic values as needed */}
            <div className={styles.billingItem}><p>Subtotal</p><p>$ 17.95</p></div>
            <div className={styles.billingItem}><p>Liquidity Cash</p><p>-$ 0.44</p></div>
            <div className={styles.billingItem}><p>Service Fee</p><p>$ 1.00</p></div>
            <div className={styles.billingItem}><p>Taxes & Other Fees</p><p>$ 3.57</p></div>
            <div className={styles.billingItem}><h4>Total</h4><h4>$ 22.08</h4></div>

            <CardSelector cards={cards} onSelect={handleCardSelect} defaultCardId="1" />
          </div>

          {/* <TipsSelector /> */}

          <div className={styles.bottomArea}>
            <form onSubmit={handleVerify}>
              <button type="submit" className="bg-primary px-3 py-3 rounded-lg w-full text-white">
                Checkout
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
