"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./otp.module.scss";
import toast from "react-hot-toast";

export default function OTPVerify() {
  const router = useRouter();
  const params = useSearchParams();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const phoneParam = params.get("phone");
    const savedMobile = localStorage.getItem("user_mobile");
    if (phoneParam) setMobile(phoneParam);
    else if (savedMobile) setMobile(savedMobile);
  }, [params]);

  const handleButtonClick = () => {
    router.back();
  };

  // Read guest cart from localStorage
  const getLocalCart = () => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  };

  // Clear guest cart from localStorage
  const clearLocalCart = () => {
    localStorage.removeItem("cart");
  };

  // Send guest cart items to backend API to add them to user cart
  const addGuestCartToBackend = async (userId: string, deviceId: string, items: any[]) => {
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

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error adding multiple cart items:", err);
      return null;
    }
  };

  const handleVerify = async (e: { preventDefault: () => void }) => {
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

      const data = await response.json();
      console.log("OTP Verify Response:", data);

      if (data.status === "1" || data.status === 1 || data.status === true) {
        toast.success("OTP verified successfully!");

        if (!data.user) {
          toast.error("User details missing in response.");
          setLoading(false);
          return;
        }

        // Save user info
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user_id", data.user.id || "");
        localStorage.setItem("user_name", data.user.name || "");
        localStorage.setItem("user_email", data.user.email || "");
        localStorage.setItem("user_mobile", data.user.mobile || mobile);
        localStorage.setItem("user_dob", data.user.dob || "");
        localStorage.setItem("userData", JSON.stringify(data.user));

        // STEP 1: Check guest cart from localStorage
        const guestCart = getLocalCart();

        if (guestCart.length > 0) {
          toast.loading("Adding items to your cart...");

          // STEP 2: Send guest cart items to backend cart API
          const deviceId = localStorage.getItem("device_id") || "";
          const addCartRes = await addGuestCartToBackend(data.user.id, deviceId, guestCart);

          if (addCartRes && (addCartRes.status === "1" || addCartRes.success)) {
            toast.success("Items added to your cart!");

            // STEP 3: Clear local guest cart
            clearLocalCart();

            // STEP 4: Redirect to cart or checkout page
            router.push("/checkout");
            return;
          } else {
            toast.error("Failed to add items to cart.");
          }
        }

        // No guest cart, redirect based on user name presence
        if (!data.user.name || data.user.name.trim() === "") {
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

  return (
    <>
      <header className="header">
        <button type="button" className="icon_only" onClick={handleButtonClick}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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
