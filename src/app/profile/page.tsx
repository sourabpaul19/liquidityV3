'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import BottomNavigation from '@/components/common/BottomNavigation/BottomNavigation';
import Header from '@/components/common/Header/Header';
import styles from "./profile.module.scss";
import { UserRoundPen, ChevronRight, Wallet, History, Settings, LogOut } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; phone: string } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userName = localStorage.getItem('user_name');
    const userPhone = localStorage.getItem('user_mobile');
    const userId = localStorage.getItem('user_id');

    if (isLoggedIn === 'true' && userName && userId) {
      setUser({
        id: userId,
        name: userName,
        phone: userPhone || 'N/A',
      });
    } else {
      router.replace('/');
    }
  }, [isClient, router]);

  // ✅ Fetch wallet balance and overwrite localStorage
  useEffect(() => {
    if (!user?.id) return;

    async function fetchWalletBalance() {
      try {
        const response = await fetch(
          `https://liquiditybars.com/canada/backend/admin/api/fetch_wallet_balance/${user?.id}`
        );
        const data = await response.json();
        console.log("Wallet API:", data);

        if (data.status === "1" && data.wallet_balance) {
          // Overwrite state with latest backend value
          setWalletBalance(data.wallet_balance);
          // Overwrite localStorage with latest value
          localStorage.setItem("wallet_balance", data.wallet_balance);
        } else {
          console.warn("Wallet fetch failed:", data.message);
          // Optional fallback: localStorage only if backend fails
          const savedWallet = localStorage.getItem("wallet_balance");
          if (savedWallet) setWalletBalance(savedWallet);
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        const savedWallet = localStorage.getItem("wallet_balance");
        if (savedWallet) setWalletBalance(savedWallet);
      }
    }

    fetchWalletBalance();
  }, [user?.id]);

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (!confirmLogout) return;

    try {
      localStorage.clear();
      sessionStorage.clear();
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isClient) return <div className="text-center py-10">Loading...</div>;
  if (!user) return <div className="text-center py-10">Loading profile...</div>;

  return (
    <>
      <Header title="My Profile" />
      <section className="pageWrapper hasHeader hasBottomNav">
        <div className="pageContainer">
          <div className={styles.profileHeader}>
            <div className={styles.profileCard}>
              <div className={styles.profileTop}>
                <figure>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 1.25C9.37665 1.25 7.25 3.37665 7.25 6C7.25 8.62335 9.37665 10.75 12 10.75C14.6234 10.75 16.75 8.62335 16.75 6C16.75 3.37665 14.6234 1.25 12 1.25ZM8.75 6C8.75 4.20507 10.2051 2.75 12 2.75C13.7949 2.75 15.25 4.20507 15.25 6C15.25 7.79493 13.7949 9.25 12 9.25C10.2051 9.25 8.75 7.79493 8.75 6Z"
                      fill="currentColor"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9 12.25C6.37665 12.25 4.25 14.3766 4.25 17C4.25 19.6234 6.37665 21.75 9 21.75H15C17.6234 21.75 19.75 19.6234 19.75 17C19.75 14.3766 17.6234 12.25 15 12.25H9ZM5.75 17C5.75 15.2051 7.20507 13.75 9 13.75H15C16.7949 13.75 18.25 15.2051 18.25 17C18.25 18.7949 16.7949 20.25 15 20.25H9C7.20507 20.25 5.75 18.7949 5.75 17Z"
                      fill="currentColor"
                    />
                  </svg>
                </figure>
                <figcaption>
                  <h4>{user.name}</h4>
                  <p>{user.phone}</p>
                </figcaption>
                <Link href="/edit-profile"><UserRoundPen /></Link>
              </div>
              <div className={styles.profileBottom}>
                <div className={styles.walletHeading}>
                  <Wallet size={24} />
                  <span>Wallet Balance</span>
                </div>
                <h4>
                  {walletBalance !== null ? `$ ${walletBalance}` : 'Loading...'}
                </h4>
              </div>
            </div>
          </div>

          <nav className={styles.menu}>
            <div className={styles.menuList}>
              <Link className={styles.menuItem} href="/my-orders">
                <span className={styles.menuIcon}><History size={20} /></span>
                <span className={styles.menuText}><h5>Order History</h5></span>
                <ChevronRight size={16} />
              </Link>
              <Link className={styles.menuItem} href="/settings">
                <span className={styles.menuIcon}><Settings size={20} /></span>
                <span className={styles.menuText}><h5>Settings</h5></span>
                <ChevronRight size={16} />
              </Link>
              <button onClick={handleLogout} className={styles.menuItem}>
                <span className={styles.menuIcon}><LogOut size={20} /></span>
                <span className={styles.menuText}><h5>Log Out</h5></span>
                <ChevronRight size={16} />
              </button>
            </div>
          </nav>

          <div className="container-fluid pt-4 px-4 bottomButton fixed">
            <button className="bg-red-500 px-3 py-3 rounded-lg w-full text-white text-center">
              Delete Account
            </button>
          </div>
        </div>
      </section>
      <BottomNavigation />
    </>
  );
}
