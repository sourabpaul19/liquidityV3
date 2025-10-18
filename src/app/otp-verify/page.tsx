"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./otp.module.scss";
import Image from 'next/image';
import logo from '../../../public/images/logo.png';
import otp_bg from '../../../public/images/otp_bg.svg';
import Button from '@/components/common/Button/Button';

export default function OTPVerify() {

    const router = useRouter();
    const [otp, setOtp] = useState("");

    const handleButtonClick = () => {
        router.back();
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        router.push("/home");
    };
  
  return (
    <>
    <header className='header'>
        <button type='button' className='icon_only' onClick={handleButtonClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 6L9 12L15 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    </header>
    <section className='pageWrapper hasHeader'>
      <div className={styles.otpWrapper}>
        {/* <div className="logoArea mb-auto">
          <Image alt="Liquidity Logo" src={logo} />
        </div> */}
        <div className={`${styles.otpForm}`}>
            <h3>Sign In</h3>
            {/* <p>Please sign in to enjoy our services</p> */}
            <div className="grid grid-cols-1 mt-7 gap-4">
              <form onSubmit={handleVerify} className="space-y-4">
                <input type="text" className={`${styles.textbox} rounded-lg`} placeholder='One Time Password' />
                <button type='submit' className='bg-primary px-3 py-3 rounded-lg w-full text-white'>Confirm</button>
              </form>
            </div>
        </div>
      </div>
            <div className={`${styles.otpFooter}`}>
                <p className="text-center">Didn't received a code? Resend</p>
            </div>
    </section>
    </>    
  )
}
