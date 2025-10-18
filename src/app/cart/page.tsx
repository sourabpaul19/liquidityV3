"use client";
import { useState } from "react";
import styles from "./cart.module.scss";
import Image from "next/image";
import Header from "@/components/common/Header/Header";
import QuantityButton from "@/components/common/QuantityButton/QuantityButton";
import Button from "@/components/common/Button/Button";
import BottomNavigation from "@/components/common/BottomNavigation/BottomNavigation";

export default function Cart() {
  const [selected, setSelected] = useState<string>("creditcard");

  const handleQuantityChange = (qty: number) => {
    console.log("Quantity changed:", qty);
  };

  const [selectedTip, setSelectedTip] = useState<string>("20");
  const [customTip, setCustomTip] = useState<string>("");

  const handleTipClick = (tip: string) => {
    setSelectedTip(tip);
    if (tip !== "other") setCustomTip(""); // clear custom tip when selecting preset
  };


  return (
    <>
      <section className="pageWrapper">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
          {/* 🛍️ Items Section */}
          <div>
            <h5 className="mb-4">Items</h5>
            <div className={styles.cartBlock}>
              <div className={styles.cartItem}>
                <div>
                  <h4>
                    1 X Gin Shot <span>(1oz)</span>
                  </h4>
                  <p>
                    Mixer Name : Cranberry Juice
                    <br />
                    Extra Shots Unit : 1
                    <br />
                    Special Instruction : New Chilled
                  </p>
                </div>
                <div className="flex flex-col items-end justify-end">
                  <h4 className="mb-auto">$ 10.00</h4>
                  <QuantityButton min={1} max={10} onChange={handleQuantityChange} />
                </div>
              </div>

              <div className={styles.cartItem}>
                <div>
                  <h4>
                    1 X Gin Shot <span>(1oz)</span>
                  </h4>
                  <p>Mixer Name : Cranberry Juice</p>
                </div>
                <div className="flex flex-col items-end justify-end">
                  <h4 className="mb-auto">$ 10.00</h4>
                  <QuantityButton min={1} max={10} onChange={handleQuantityChange} />
                </div>
              </div>

              <div className={styles.cartItem}>
                <div>
                  <h4>
                    1 X Gin Shot <span>(1oz)</span>
                  </h4>
                  <p>
                    Extra Shots Unit : 1
                    <br />
                    Special Instruction : New Chilled
                  </p>
                </div>
                <div className="flex flex-col items-end justify-end">
                  <h4 className="mb-auto">$ 10.00</h4>
                  <QuantityButton min={1} max={10} onChange={handleQuantityChange} />
                </div>
              </div>
            </div>
          </div>

          {/* 💳 Billing Summary */}
          <div>
            <h5 className="mb-4">Billing Summary</h5>
            <div className={styles.cartBlock}>
              <div className={styles.cartItem}>
                <h4>Sub Totals</h4>
                <h4>$120.00</h4>
              </div>
              <div className={styles.cartItem}>
                <h4>Taxes & Other Fees</h4>
                <h4>$20.00</h4>
              </div>
              <div className={styles.cartItem}>
                <h4>Total</h4>
                <h4>$140.00</h4>
              </div>
            </div>
          

          {/* 💰 Payment Method */}
       
            <h5 className="mb-4">Payment Method</h5>
            <div className={styles.cartBlock}>
              <label className={`${styles.cartItem} cursor-pointer`}>
                <h4>Credit Card</h4>
                <input
                  type="radio"
                  name="paymentType"
                  value="creditcard"
                  checked={selected === "creditcard"}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300 cursor-pointer"
                />
              </label>

              <label className={`${styles.cartItem} cursor-pointer`}>
                <h4>Apple Pay</h4>
                <input
                  type="radio"
                  name="paymentType"
                  value="applepay"
                  checked={selected === "applepay"}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300 cursor-pointer"
                />
              </label>
            </div>
    
      <h5 className="mb-4">Add a Tip</h5>
      <div className="flex gap-3">
        {["10", "15", "20"].map((tip) => (
          <button
            key={tip}
            onClick={() => handleTipClick(tip)}
            className={`px-4 py-2 rounded-lg border text-sm transition-all duration-200 ${
              selectedTip === tip
                ? "border-black text-black bg-white"
                : "border-transparent bg-white text-gray-500 hover:bg-gray-200"
            }`}
          >
            {tip}%
          </button>
        ))}

        {/* Other option — input box replaces button */}
        {selectedTip === "other" ? (
          <input
            type="number"
            value={customTip}
            onChange={(e) => setCustomTip(e.target.value)}
            placeholder="Other %"
            className="w-20 px-3 py-2 rounded-lg border bg-white border-black text-sm focus:outline-none"
          />
        ) : (
          <button
            onClick={() => handleTipClick("other")}
            className={`px-4 py-2 rounded-lg border text-sm transition-all duration-200 ${
              selectedTip === "other"
                ? "border-black text-black bg-white"
                : "border-transparent bg-white text-gray-500 hover:bg-gray-200"
            }`}
          >
            Other %
          </button>
        )}
      </div>
      <div className="container-fluid pt-4 bottomButton">
            <Button href="/order-success">Place Order</Button>
            </div>
        </div>
    </div>
      </section>
    </>
  );
}
