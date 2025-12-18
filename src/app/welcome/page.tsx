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

  // ✅ Universal UUID generator
  const generateUUID = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // 🔥 Fixed geolocation with IP fallback
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initLocation = async () => {
      // 1. Check cached location first
      const lat = localStorage.getItem("latitude");
      const lng = localStorage.getItem("longitude");
      
      if (lat && lng) {
        console.log("✅ Using cached location:", { lat, lng });
        return;
      }

      // 2. Try GPS (shorter timeout)
      if (navigator.geolocation) {
        console.log("🔄 Requesting GPS location...");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLat = position.coords.latitude.toString();
            const newLng = position.coords.longitude.toString();
            localStorage.setItem("latitude", newLat);
            localStorage.setItem("longitude", newLng);
            console.log("✅ GPS location saved:", { lat: newLat, lng: newLng });
          },
          (error) => {
            console.log("❌ GPS failed:", error.message);
            getIPLocation(); // Fallback to IP
          },
          {
            enableHighAccuracy: false, // Faster, less accurate
            timeout: 5000, // 5s max
            maximumAge: 5 * 60 * 1000 // 5min cache
          }
        );
      } else {
        getIPLocation();
      }
    };

    // 🔥 IP Geolocation fallback (no permission needed)
    const getIPLocation = async () => {
      try {
        console.log("🔄 Fetching IP location...");
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.latitude && data.longitude) {
          localStorage.setItem("latitude", data.latitude.toString());
          localStorage.setItem("longitude", data.longitude.toString());
          console.log("✅ IP location saved:", { 
            lat: data.latitude, 
            lng: data.longitude,
            city: data.city 
          });
        }
      } catch (error) {
        console.log("❌ IP location failed:", error);
        // Use default location (your area)
        localStorage.setItem("latitude", "40.7128");  // NYC fallback
        localStorage.setItem("longitude", "-74.0060");
        console.log("📍 Using default location: NYC");
      }
    };

    // Generate device ID
    let deviceId = localStorage.getItem("device_id");
    if (!deviceId) {
      deviceId = generateUUID();
      localStorage.setItem("device_id", deviceId);
      console.log("✅ Device ID created:", deviceId);
    }

    // Start location process
    initLocation();

    // Final check
    setTimeout(() => {
      const lat = localStorage.getItem("latitude");
      const lng = localStorage.getItem("longitude");
      console.log("📍 FINAL location state:", { lat, lng });
    }, 3000);

  }, []);

  // Auto redirect if logged in
  useEffect(() => {
    if (typeof window === "undefined") return;
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn === "true") {
      router.replace("/home");
    }
  }, [router]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = eventCode.trim();
    if (!trimmed) {
      alert("Please enter an event code");
      return;
    }
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
