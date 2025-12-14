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

  // ✅ Universal UUID generator (fallback if crypto.randomUUID is missing)
  const generateUUID = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback UUID v4 generator
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // 🔥 Auto redirect if user already logged in
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loggedIn = localStorage.getItem("isLoggedIn");

    if (loggedIn === "true") {
      router.replace("/home");
    }
  }, [router]);

  // Generate & store unique device id only once
  useEffect(() => {
    if (typeof window === "undefined") return;

    let deviceId = localStorage.getItem("device_id");

    if (!deviceId) {
      deviceId = generateUUID(); // ✔ Works in all browsers
      localStorage.setItem("device_id", deviceId);
    }

    console.log("Device ID:", deviceId);
  }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = eventCode.trim();

    if (!trimmed) {
      alert("Please enter an event code");
      return;
    }

    // Save SHOP ID
    localStorage.setItem("shop_id", trimmed);

    router.push(`/outlet/${encodeURIComponent(trimmed)}`);
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
          type="text"
          value={eventCode}
          onChange={(e) => setEventCode(e.target.value)}
          className={`${styles.textbox} rounded-lg`}
          placeholder="Enter event code"
          autoFocus
        />

        {/* Hidden submit button so Enter key works */}
        <button type="submit" style={{ display: "none" }}>Submit</button>
      </form>

      <p>or</p>

      <div className={styles.welcomeForm}>
        <div className="grid grid-cols-1 sm:grid-cols-1 my-3 gap-4">
          <Link
            href="/choose"
            className="bg-primary px-3 py-3 rounded-lg w-full text-white text-center"
          >
            Sign Up / Sign In
          </Link>
        </div>
      </div>

    </div>
  );
}
