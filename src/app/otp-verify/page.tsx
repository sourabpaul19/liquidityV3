"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import styles from "./otp.module.scss";
import toast from "react-hot-toast";

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

interface TempCartResponse {
  status: string | number | boolean;
  message?: string;
  cartItems?: unknown[];
  data?: unknown[];
  [key: string]: unknown;
}

interface TransferCartResponse {
  status: string | number | boolean;
  message?: string;
  [key: string]: unknown;
}

export default function OTPVerify() {
  const router = useRouter();
  const params = useSearchParams();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefill mobile
  useEffect(() => {
    const phoneParam = params.get("phone");
    const savedMobile =
      typeof window !== "undefined"
        ? localStorage.getItem("user_mobile")
        : null;

    if (phoneParam) setMobile(phoneParam);
    else if (savedMobile) setMobile(savedMobile);
  }, [params]);

  const handleBack = () => router.back();

  // --- API helpers ---

  const fetchTempCart = async (
    userId: string,
    deviceId: string
  ): Promise<TempCartResponse | null> => {
    try {
      const body = new URLSearchParams();
      body.append("device_id", deviceId);
      body.append("user_id", userId);

      const res = await fetch(
        "https://liquiditybars.com/canada/backend/admin/api/getTempCartDetailsForUser/",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        }
      );

      const data: TempCartResponse = await res.json();
      console.log("getTempCartDetailsForUser RESPONSE:", data);
      return data;
    } catch (err) {
      console.error("getTempCartDetailsForUser error:", err);
      return null;
    }
  };

  const transferFromTempCart = async (
    userId: string,
    deviceId: string
  ): Promise<TransferCartResponse | null> => {
    try {
      const body = new URLSearchParams();
      body.append("device_id", deviceId);
      body.append("user_id", userId);

      const res = await fetch(
        "https://liquiditybars.com/canada/backend/admin/api/transferFromTempCart",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        }
      );

      const data: TransferCartResponse = await res.json();
      console.log("transferFromTempCart RESPONSE:", data);
      return data;
    } catch (err) {
      console.error("transferFromTempCart error:", err);
      return null;
    }
  };

  // --- OTP handler ---

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();

    if (!mobile || !otp) {
      toast.error("Please enter both mobile number and OTP.");
      return;
    }

    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("mobile", mobile.startsWith("+") ? mobile : mobile);
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
      console.log("otpVerification RESPONSE:", data);

      const ok =
        data.status === "1" || data.status === 1 || data.status === true;

      if (!ok) {
        toast.error(data.message || "Invalid OTP, please try again.");
        return;
      }

      if (!data.user) {
        toast.error("User details missing in response.");
        return;
      }

      toast.success("OTP verified successfully!");
      const user = data.user;

      const deviceId =
        (typeof window !== "undefined" &&
          (localStorage.getItem("device_id") || "")) ||
        "";

      // Save session
      if (typeof window !== "undefined") {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user_id", user.id || "");
        localStorage.setItem("user_name", user.name || "");
        localStorage.setItem("user_email", user.email || "");
        localStorage.setItem("user_mobile", user.mobile || mobile);
        localStorage.setItem("user_dob", user.dob || "");
        localStorage.setItem("userData", JSON.stringify(user));
      }

      // Temp cart → user cart using transferFromTempCart
      if (deviceId) {
        const loadingToast = toast.loading("Transferring your cart...");

        // First check if temp cart exists
        const tempCartRes = await fetchTempCart(user.id, deviceId);

        const hasTempCart =
          !!tempCartRes &&
          (tempCartRes.status === "1" ||
            tempCartRes.status === 1 ||
            tempCartRes.status === true) &&
          (
            (Array.isArray(tempCartRes.cartItems) &&
              tempCartRes.cartItems!.length > 0) ||
            (Array.isArray(tempCartRes.data) &&
              tempCartRes.data!.length > 0)
          );

        if (hasTempCart) {
          // Transfer temp cart to user cart
          const transferRes = await transferFromTempCart(user.id, deviceId);

          toast.dismiss(loadingToast);

          const transferOk =
            !!transferRes &&
            (transferRes.status === "1" ||
              transferRes.status === 1 ||
              transferRes.status === true);

          if (transferOk) {
            toast.success("Cart transferred successfully!");
          } else {
            toast.error(
              "Cart transfer failed but continuing to checkout. You can add items again."
            );
          }

          router.push("/checkout");
          return;
        }

        toast.dismiss(loadingToast);
        toast.success("No previous cart found. Starting fresh!");
      }

      // No temp cart – go by profile
      if (!user.name || user.name.trim() === "") {
        router.push("/new-account");
      } else {
        router.push("/home");
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
        <button type="button" className="icon_only" onClick={handleBack}>
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
                className="bg-primary px-3 py-3 rounded-lg w-full text-white disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Confirm"}
              </button>
            </form>
          </div>
        </div>

        <div className={styles.otpFooter}>
          <p className="text-center">Didn't receive a code? Resend</p>
        </div>
      </section>
    </>
  );
}
