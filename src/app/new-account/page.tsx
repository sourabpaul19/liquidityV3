"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./account.module.scss";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import google from "../../../public/images/google.png";
import Button from "@/components/common/Button/Button";
import DatePicker from "react-datepicker";

export default function NewAccount() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    dob: null as Date | null,
  });

  const handleButtonClick = () => {
        router.back();
    };

  // Calculate the latest allowed date (today - 18 years)
  const today = new Date();
  const minAgeDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.dob) {
      alert("Please select your date of birth");
      return;
    }
    if (form.dob > minAgeDate) {
      alert("You must be at least 18 years old to sign up");
      return;
    }
    router.push("/checkout");
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
      <div className={styles.loginWrapper}>
        <div className="logoArea mb-auto">
          <Image alt="Liquidity Logo" src={logo} />
        </div>
        <div className={`${styles.loginForm}`}>
            <h3>Create Account</h3>
            <p>Help us get to know you better</p>
            <div className="grid grid-cols-1 mt-7 gap-4">
              <form onSubmit={handleVerify} className="space-y-4">
                <input type="text" className={`${styles.textbox} rounded-lg`} placeholder='First Name' />
                <input type="text" className={`${styles.textbox} rounded-lg`} placeholder='Last Name' />
                <DatePicker
                  selected={form.dob}
                  onChange={(date) => setForm({ ...form, dob: date })}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Date of Birth"
                  maxDate={minAgeDate} // Restrict future dates beyond 18 years
                  showYearDropdown
                  scrollableYearDropdown
                  className={`${styles.textbox} rounded-lg`}
                />
                <input type="email" className={`${styles.textbox} rounded-lg`} placeholder='Email' />
                <input type="tel" className={`${styles.textbox} rounded-lg`} placeholder='Phone Number' />
                <input type="password" className={`${styles.textbox} rounded-lg`} placeholder='Password' />
                <input type="password" className={`${styles.textbox} rounded-lg`} placeholder='Confirm Password' />
                <button type='submit' className='bg-primary px-3 py-3 rounded-lg w-full text-white'>Create Account</button>
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
  );
}
