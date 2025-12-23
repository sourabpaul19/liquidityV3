'use client';

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from "./table.module.scss";

interface Shop {
  id: string;
  name: string;
  image: string;
  address: string;
}

export default function TablePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [eventCode, setEventCode] = useState('');
  const [shopName, setShopName] = useState('Liquidity Bars');
  const [shopDetails, setShopDetails] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const shopId = searchParams.get('shop') || '';

  // Canvas fingerprint
  const getCanvasFingerprint = async (): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Liquidity Bars Fingerprint', 2, 2);
    return canvas.toDataURL();
  };

  // SHA-256 helper
  const sha256 = async (str: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  // Stable device ID from multiple signals
  const generateStableDeviceId = async (): Promise<string> => {
    const canvas = await getCanvasFingerprint();
    const hardware = `${navigator.hardwareConcurrency || 0}`;
    const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    const platform = navigator.platform;

    const signals = {
      canvas,
      hardware,
      screen: screenInfo,
      timezone,
      language,
      platform,
    };

    return sha256(JSON.stringify(signals));
  };

  // Initialize device ID on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initDeviceId = async () => {
      let deviceId = localStorage.getItem("device_id");
      if (!deviceId) {
        console.log("🔄 Generating stable device fingerprint...");
        deviceId = await generateStableDeviceId();
        localStorage.setItem("device_id", deviceId);
        console.log("✅ NEW STABLE Device ID:", deviceId);
      } else {
        console.log("✅ EXISTING STABLE Device ID:", deviceId);
      }
    };

    void initDeviceId();
  }, []);

  // Fetch shop details from API
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const response = await fetch('https://liquiditybars.com/canada/backend/admin/api/fetchDashboardDataForTempUsers');
        const data = await response.json();
        
        if (data.status === '1' && data.shops) {
          const shop = data.shops.find((s: Shop) => s.id === shopId);
          if (shop) {
            setShopDetails(shop);
            setShopName(shop.name);
          }
        }
      } catch (error) {
        console.error('Failed to fetch shop data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      fetchShopData();
    } else {
      setLoading(false);
    }
  }, [shopId]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const tableNumber = eventCode.trim();
    
    if (tableNumber) {
      // Store in localStorage
      localStorage.setItem('shop_id', shopId);
      localStorage.setItem('table_number', tableNumber);
      
      // Navigate to login with params
      router.push(`/guest?shop=${shopId}&table=${tableNumber}`);
    }
  };

  const handleGuestProceed = () => {
    const tableNumber = eventCode.trim();
    
    if (tableNumber) {
      // Store in localStorage
      localStorage.setItem('shop_id', shopId);
      localStorage.setItem('table_number', tableNumber);
      
      // Navigate to name with params
      router.push(`/guest?shop=${shopId}&table=${tableNumber}`);
    } else {
      alert('Please enter table number first');
    }
  };

  if (loading) {
    return (
      <div className={styles.welcome_wrapper}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.welcome_wrapper}>
      {/* Shop Header */}
      {shopDetails ? (
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-primary mb-1">Welcome to</h2>
          <h1 className="text-2xl font-black text-gray-900">{shopName}</h1>
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-primary">Welcome to</h2>
          <h1 className="text-2xl font-black text-gray-900 mb-4">{shopName}</h1>
        </>
      )}

      <p className="text-lg text-center mb-8 leading-relaxed">
        Please enter your table number, and<br/>
        <span className="font-semibold">sign in</span> or <span className="font-semibold">proceed as a guest</span>
      </p>

      {/* Table Input Form */}
      <form onSubmit={handleVerify} className={`${styles.welcomeForm} mb-3`}>
        <input
          type="text"
          value={eventCode}
          onChange={(e) => setEventCode(e.target.value)}
          className={`${styles.textbox} rounded-lg`}
          placeholder="Enter your table number"
          autoFocus
        />
        
        {/* Sign In Button */}
        <button 
          type="submit" 
          className="bg-primary px-3 py-3 rounded-lg w-full text-white text-center mt-3"
          disabled={!eventCode.trim()}
        >
          Sign Up / Sign In
        </button>
      </form>

      <p className="text-center text-lg font-semibold text-gray-600 mb-3">or</p>

      {/* Guest Button */}
      <div className={styles.welcomeForm}>
        <button
          onClick={handleGuestProceed}
          disabled={!eventCode.trim()}
          className="bg-primary px-3 py-3 rounded-lg w-full text-white hover:from-blue-700 hover:to-primary-dark transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed as Guest
        </button>
      </div>

      <div className={styles.otpFooter}>
        <p className="text-center">Ordering at the bar ?</p>
    </div>
    </div>
  );
}
