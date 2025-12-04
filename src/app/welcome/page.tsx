'use client';
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import logo from '../../../public/images/logo.png';
import styles from "./welcome.module.scss";
import Link from 'next/link';

export default function Welcome() {
  const router = useRouter();
  const [eventCode, setEventCode] = useState("");

  // 🔥 Auto redirect if user already logged in
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");

    if (loggedIn === "true") {
      router.replace("/home");
      return;
    }
  }, [router]);

  // Generate & store unique device id only once
  useEffect(() => {
    if (typeof window !== "undefined") {
      let deviceId = localStorage.getItem("device_id");

      if (!deviceId) {
        deviceId = crypto.randomUUID();   // creates unique device ID
        localStorage.setItem("device_id", deviceId);
      }

      console.log("Device ID:", deviceId);
    }
  }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventCode.trim()) {
      alert("Please enter an event code");
      return;
    }

    // SAVE SHOP ID
    localStorage.setItem("shop_id", eventCode);

    router.push(`/outlet/${encodeURIComponent(eventCode)}`);
  };

  return (
    <div className={styles.welcome_wrapper}>
      <div className="logoArea">
        <Image alt="Liquidity Logo" src={logo} />
      </div>

      <p>
        Welcome, please sign in or enter<br />
        your event information
      </p>

      <form onSubmit={handleVerify} className={`${styles.welcomeForm} mt-5 mb-3`}>
        <input
          type='text'
          value={eventCode}
          onChange={(e) => setEventCode(e.target.value)}
          className={`${styles.textbox} rounded-lg`}
          placeholder='Enter event code'
          autoFocus
        />
        <button type="submit" style={{ display: 'none' }}>Submit</button>
      </form>

      <p>or</p>

      <div className={styles.welcomeForm}>
        <div className="grid grid-cols-1 sm:grid-cols-1 my-3 gap-4">
          <Link href="/choose" className='bg-primary px-3 py-3 rounded-lg w-full text-white text-center'>
            Sign Up / Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
