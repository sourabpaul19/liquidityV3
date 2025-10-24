'use client';
import { useRouter } from "next/navigation";
import React from 'react'
import Image from 'next/image';
import logo from '../../../public/images/logo.png';
import drink from "../../../public/images/drink.png";
import styles from "./welcome.module.scss";
import Link from 'next/link';

export default function Welcome() {

  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
      e.preventDefault();
      router.push("/outlet");
  };
  return (
    <>
      <div className={styles.welcome_wrapper}>
        <div className="logoArea">
          <Image alt="Liquidity Logo" src={logo} />
        </div>
        <p>Welcome, please sign in or enter<br/>your event information</p>

        <form onSubmit={handleVerify} className={`${styles.welcomeForm} mt-5 mb-3`}>
            <input type='text' className={`${styles.textbox} rounded-lg `} placeholder='Enter event code' />
        </form>
        <p>or</p>
        <div className={styles.welcomeForm}>
            <div className="grid grid-cols-1 sm:grid-cols-1 my-3 gap-4">
                {/* <Link href="/outlet" className='bg-primary px-3 py-3 rounded-lg w-full text-white text-center'>Scan Event QR</Link> */}
                <Link href="/choose" className='bg-primary px-3 py-3 rounded-lg w-full text-white text-center'>Sign Up / Sign In</Link>
            </div>
        </div>
        {/* <figure className="logoImage">
          <Image alt="Liquidity Logo" src={drink} />
        </figure> */}
      </div>
    </>    
  )
}