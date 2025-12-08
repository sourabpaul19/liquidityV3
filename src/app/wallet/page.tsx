'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import wallet from '../../../public/images/wallet_bg.svg';
import cartempty from '../../../public/images/Cards_empty.svg';
import styles from "./wallet.module.scss";
import BottomNavigation from '@/components/common/BottomNavigation/BottomNavigation';
import Header from '@/components/common/Header/Header';
import Modal from '@/components/common/Modal/Modal';

// -------------------------
// ✅ Transaction Type
// -------------------------
interface Transaction {
  type: string;           // "1" or "2"
  credit_type?: string;   // "1" | "2"
  amount: string;
  date_time: string;
}

export default function Wallet() {
  const [open, setOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]); // ✅ FIXED
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState<string>("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const storedId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    setUserId(storedId);
  }, []);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchWalletData = async () => {
      try {
        const res = await fetch(`http://liquiditybars.com/canada/backend/admin/api/fetch_wallet_balance/${userId}`);
        const data = await res.json();

        if (data.status === "1") {
          setWalletBalance(Number(data.wallet_balance));
          setTransactions(data.wallets || []);
          localStorage.setItem('wallet_balance', data.wallet_balance);
          localStorage.setItem('wallet_transactions', JSON.stringify(data.wallets || []));
        } else {
          setWalletBalance(0);
          setTransactions([]);
        }
      } catch (error) {
        console.error('Wallet fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [userId]);

  const formatDateTime = (dateString: string) => {
    const dateObj = new Date(dateString.replace(" ", "T"));
    const date = dateObj.toLocaleDateString('en-GB');
    const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  };

  // -------------------------
  // ✅ Updated param type: Transaction
  // -------------------------
  const getTransactionLabel = (txn: Transaction) => {
    if (txn.type === "1") {
      if (txn.credit_type === "1") return "Online Payment";
      if (txn.credit_type === "2") return "Referral Bonus";
      return "Wallet Credit";
    }
    if (txn.type === "2") return "Wallet Deduction";
    return "Transaction";
  };

  const handleAddBalance = async () => {
    if (!userId || !addAmount || isNaN(Number(addAmount))) {
      alert("Please enter a valid amount");
      return;
    }

    setAdding(true);

    try {
      const res = await fetch("/api/addWalletBalance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, amount: Number(addAmount) }),
      });

      const data = await res.json();
      console.log("Add Wallet Response:", data);

      if (data.status === "1") {
        alert("Wallet balance added successfully!");

        setWalletBalance(prev => prev + Number(addAmount));

        if (data.wallets) setTransactions(data.wallets);

        localStorage.setItem(
          'wallet_balance',
          (walletBalance + Number(addAmount)).toString()
        );

        setOpen(false);
        setAddAmount("");
      } else {
        alert(data.message || "Failed to add balance");
      }
    } catch (error) {
      console.error("Add Wallet Error:", error);
      alert("Something went wrong while adding balance");
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <Header title="Wallet" />
      <section className="pageWrapper hasHeader hasFooter hasBottomNav">
        <div className="pageContainer">
          {loading ? (
            <p className="text-center py-3">Loading wallet data...</p>
          ) : (
            <>
              <div className={styles.walletBox}>
                <h4>Liquidity Cash</h4>
                <h2>${walletBalance.toFixed(2)}</h2>
                <Image src={wallet} alt="" width={225} height={214} className={styles.walletIcon} />
              </div>

              <div className="sectionHeading">
                <h4 className="section_title">Transactions</h4>
              </div>

              {transactions.length === 0 ? (
                <div className={styles.emptyCart}>
                  <Image src={cartempty} alt="" width={120} height={120} className={styles.walletIcon} />
                  <p>Your wallet is empty.</p>
                </div>
              ) : (
                <div className={`${styles.walletList} px-4`}>
                  {transactions.map((txn, index) => {
                    const { date, time } = formatDateTime(txn.date_time);
                    const amount = parseFloat(txn.amount);
                    const isCredit = txn.type === "1";

                    return (
                      <div key={index} className={styles.walletItem}>
                        <div>
                          <h5>{getTransactionLabel(txn)}</h5>
                          <p>{date} • {time}</p>
                        </div>
                        <div>
                          <p className={isCredit ? 'text-success' : 'text-danger'}>
                            {isCredit ? `+ $${amount.toFixed(2)}` : `- $${amount.toFixed(2)}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="container-fluid pt-4 px-4 bottomButton fixed">
                <button
                  className="bg-primary px-3 py-3 rounded-lg w-full text-white text-center"
                  onClick={() => setOpen(true)}
                >
                  + Add to balance
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Liquidity Cash">
        <h5 className="mb-2">Enter amount here</h5>
        <input
          type="text"
          placeholder="Enter amount"
          className={styles.textbox}
          value={addAmount}
          onChange={(e) => setAddAmount(e.target.value)}
        />
        <div className="flex items-center justify-between mb-4">
          <h3>New Balance</h3>
          <h3>${(walletBalance + Number(addAmount || 0)).toFixed(2)}</h3>
        </div>
        <button
          className="bg-primary px-3 py-3 rounded-lg w-full text-white text-center"
          onClick={handleAddBalance}
          disabled={adding}
        >
          {adding ? "Adding..." : "Add cash"}
        </button>
      </Modal>

      <BottomNavigation />
    </>
  );
}
