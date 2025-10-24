'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import React from 'react'
import Image from 'next/image';
import logo from '../../../public/images/logo.png';
import google from "../../../public/images/google.png";
import styles from "./login.module.scss";
import Link from 'next/link';

export default function Choose() {

    const router = useRouter();

    const handleButtonClick = () => {
        router.back();
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        router.push("/otp-verify");
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
    <section className='pageWrapper'>
      <div className={styles.loginWrapper}>
        {/* <div className="logoArea mb-auto">
          <Image alt="Liquidity Logo" src={logo} />
        </div> */}
        <div className={`${styles.loginForm}`}>
            <h3>Sign In</h3>
            {/* <p>Please sign in to enjoy our services</p> */}
            <div className="grid grid-cols-1 mt-7 gap-4">
              <form onSubmit={handleVerify} className="space-y-4">
                <input type="text" className={`${styles.textbox} rounded-lg`} placeholder='Email or Phone Number' />
                <button type='submit' className='bg-primary px-3 py-3 rounded-lg w-full text-white'>Push Code</button>
              </form>
              <p className='text-center'>or</p>
              <button type='submit' className={`${styles.loginButton} border flex items-center gap-6 border-gray-900 px-3 py-3 rounded-lg w-full text-gray-900`}>
                <Image src={google} alt="" width={20} height={20} />
                <span>Sign in with Google</span>
              </button>
            </div>
        </div>
      </div>
      </section>
    </>    
  )
}