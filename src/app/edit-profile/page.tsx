"use client";

import React, { useState } from "react";
import Header from "@/components/common/Header/Header";
import BottomNavigation from "@/components/common/BottomNavigation/BottomNavigation";
import Button from "@/components/common/Button/Button";
import DatePicker from "react-datepicker";
import styles from "./edit-profile.module.scss";

export default function EditProfile() {
  const today = new Date();
  const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

  // ✅ Allow dob to be Date or null
  const [form, setForm] = useState<{
    name: string;
    contact: string;
    email: string;
    dob: Date | null;
  }>({
    name: "Sourab Paul",
    contact: "+13430240534",
    email: "sourab@liquiditybars.com",
    dob: new Date("1994-05-20"), // Default DOB
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.dob) {
      alert("Please select your date of birth");
      return;
    }

    alert("Profile updated successfully!");
  };

  return (
    <>
      <Header title="Edit Profile" />
      <section className='pageWrapper hasHeader hasFooter'>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-4 pt-4 gap-4"
        >
          <input
            type="text"
            className={`${styles.textbox} rounded-lg`}
            placeholder="Enter Your Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="tel"
            className={`${styles.textbox} rounded-lg`}
            placeholder="Contact No"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
          />

          <input
            type="email"
            className={`${styles.textbox} rounded-lg`}
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <DatePicker
            selected={form.dob}
            onChange={(date: Date | null) => setForm({ ...form, dob: date })}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select Date of Birth"
            maxDate={minAgeDate}
            showYearDropdown
            scrollableYearDropdown
            className={`${styles.textbox} rounded-lg w-full`}
          />

          <div className={`${styles.fixedbottom} pt-4 left-0 bottomButton fixed`}>
            <button type="submit" className="bg-primary px-3 py-3 rounded-lg w-full text-white text-center">Update Profile</button>
          </div>
        </form>
      </section>
      <BottomNavigation />
    </>
  );
}
