'use client';

import React from 'react'
import Image from 'next/image';
import logo from '../../../public/images/logo.png';
import styles from "./choose.module.scss";
import Link from 'next/link';

import { useRouter } from 'next/navigation';

export default function Choose() {

    const router = useRouter();

    const handleButtonClick = () => {
        router.back();
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
      <div className={styles.choose_wrapper}>
        {/* <div className="logoArea mb-auto">
          <Image alt="Liquidity Logo" src={logo} />
        </div> */}
        <div className={`${styles.welcomeForm}`}>
            <h3>Sign In</h3>
            {/* <p>Please sign in or create account to continue</p> */}
            <div className="grid grid-cols-1 mt-7 gap-4">
                <Link href="/login" className='border-primary border px-3 py-3 rounded-lg w-full color-primary text-center'>Login</Link>
                <p className='text-center'>or</p>
                <Link href="/new-account" className='bg-primary px-3 py-3 rounded-lg w-full text-white text-center'>Create Account</Link>
            </div>
        </div>
        {/* <figure className="logoImage">
          <Image alt="Liquidity Logo" src={drink} />
        </figure> */}
      </div>
      </section>
    </>    
  )
}