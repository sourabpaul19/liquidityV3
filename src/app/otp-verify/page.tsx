"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import styles from "./otp.module.scss";
import toast from "react-hot-toast";

// ----------------------
// TYPES
// ----------------------
interface CartItem {
  product_id: string;
  qty: number;
  price?: number;
  mixer_id?: string;
  mixer_qty?: number;
  [key: string]: string | number | undefined;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  mobile: string;
  dob?: string;
}

interface OTPResponse {
  status: string | number | boolean;
  message?: string;
  user?: UserData;
}

export default function OTPVerify() {
  const router = useRouter();
  const params = useSearchParams();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Get mobile number from URL or localStorage
  useEffect(() => {
    const phoneParam = params.get("phone");
    const savedMobile = localStorage.getItem("user_mobile");

    if (phoneParam) setMobile(phoneParam);
    else if (savedMobile) setMobile(savedMobile);
  }, [params]);

  // Go back
  const handleButtonClick = () => router.back();

  // -------------------------------
  // GUEST CART HELPERS
  // -------------------------------
  const getLocalCart = (): CartItem[] => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[];
    } catch {
      return [];
    }
  };

  const clearLocalCart = () => {
    localStorage.removeItem("cart");
  };

  // Send guest cart items to backend
  const addGuestCartToBackend = async (
    userId: string,
    deviceId: string,
    items: CartItem[]
  ): Promise<any> => {
    try {
      const payload = {
        user_id: userId,
        device_id: deviceId,
        cart_items: items,
      };

      const res = await fetch(
        "https://liquiditybars.com/canada/backend/admin/api/addMultipleCartItems/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      return await res.json();
    } catch (err) {
      console.error("Error adding multiple cart items:", err);
      return null;
    }
  };

  // -------------------------------
  // VERIFY OTP
  // -------------------------------
  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();

    if (!mobile || !otp) {
      toast.error("Please enter both mobile number and OTP.");
      return;
    }

    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("mobile", mobile.startsWith("+") ? mobile : `${mobile}`);
      formData.append("otp", otp);

      const response = await fetch(
        "https://liquiditybars.com/canada/backend/admin/api/otpVerification/",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        }
      );

      const data: OTPResponse = await response.json();
      console.log("OTP Verify Response:", data);

      if (data.status === "1" || data.status === 1 || data.status === true) {
        toast.success("OTP verified successfully!");

        if (!data.user) {
          toast.error("User details missing in response.");
          setLoading(false);
          return;
        }

        // ------------------------------
        // SAVE USER SESSION
        // ------------------------------
        const user = data.user;

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user_id", user.id || "");
        localStorage.setItem("user_name", user.name || "");
        localStorage.setItem("user_email", user.email || "");
        localStorage.setItem("user_mobile", user.mobile || mobile);
        localStorage.setItem("user_dob", user.dob || "");
        localStorage.setItem("userData", JSON.stringify(user));

        // ------------------------------
        // MOVE GUEST CART TO BACKEND
        // ------------------------------
        const guestCart = getLocalCart();

        if (guestCart.length > 0) {
          toast.loading("Adding items to your cart...");

          const deviceId = localStorage.getItem("device_id") || "";

          const addCartRes = await addGuestCartToBackend(
            user.id,
            deviceId,
            guestCart
          );

          if (addCartRes && (addCartRes.status === "1" || addCartRes.success)) {
            toast.success("Items added to your cart!");
            clearLocalCart();
            router.push("/checkout");
            return;
          } else {
            toast.error("Failed to add items to cart.");
          }
        }

        // ------------------------------
        // REDIRECT BASED ON PROFILE
        // ------------------------------
        if (!user.name || user.name.trim() === "") {
          router.push("/new-account");
        } else {
          router.push("/home");
        }
      } else {
        toast.error(data.message || "Invalid OTP, please try again.");
      }
    } catch (error) {
      console.error("OTP Verify Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  //     UI
  // ===============================
  return (
    <>
      <header className="header">
        <button type="button" className="icon_only" onClick={handleButtonClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 6L9 12L15 18"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      <section className="pageWrapper hasHeader">
        <div className={styles.otpWrapper}>
          <div className={styles.otpForm}>
            <h3>Verify OTP</h3>

            <form onSubmit={handleVerify} className="space-y-4 mt-6">
              <input
                type="text"
                className={`${styles.textbox} rounded-lg`}
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-primary px-3 py-3 rounded-lg w-full text-white"
              >
                {loading ? "Verifying..." : "Confirm"}
              </button>
            </form>
          </div>
        </div>

        <div className={styles.otpFooter}>
          <p className="text-center">Didn’t receive a code? Resend</p>
        </div>
      </section>
    </>
  );
}
