'use client';

import React from 'react'
import Image from 'next/image';
import wallet from '../../../public/images/wallet_bg.svg';
import cartempty from '../../../public/images/Cards_empty.svg';
import styles from "./wallet.module.scss";
import BottomNavigation from '@/components/common/BottomNavigation/BottomNavigation';
import Header from '@/components/common/Header/Header';
import Button from '@/components/common/Button/Button';
import { useState } from 'react';
import Modal from '@/components/common/Modal/Modal';


export default function Wallet() {

  const [open, setOpen] = useState(false);

  return (
    <>
    <Header title="Wallet" />
    <section className='pageWrapper hasHeader hasFooter hasBottomNav'>
      <div className={styles.walletBox}>
        <h4>Liquidity Cash</h4>
        <h2>$0.00</h2>
        <Image src={wallet} alt='' width={225} height={214} className={styles.walletIcon} />
      </div>
      <div className='sectionHeading'>
          <h4 className='section_title'>Transactions</h4>
      </div>

      <div className={styles.emptyCart}>
        <Image src={cartempty} alt='' width={120} height={120} className={styles.walletIcon} />
        <p>Your wallet is empty.</p>
      </div>

      <div className={`${styles.walletList} px-4`}>
        <div className={styles.walletItem}>
          <div>
            <h5>LIQ-3423420</h5>
            <p>29 Oct 2025, 08:40 pm</p>
          </div>
          <div>
            <p className='text-danger'>- $ 50.00</p>
          </div>
        </div>

        <div className={styles.walletItem}>
          <div>
            <h5>Cash Credit</h5>
            <p>29 Oct 2025, 08:40 pm</p>
          </div>
          <div>
            <p className='text-success'>+ $ 50.00</p>
          </div>
        </div>
      </div>
      <div className="container-fluid pt-4 px-4 bottomButton fixed">
        <button className='bg-primary px-3 py-3 rounded-lg w-full text-white text-center' onClick={() => setOpen(true)}>+ Add to balance</button>
      </div>
    </section>
    <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Liquidity Cash">  
        <h5 className="mb-2">Enter amount here</h5>
        <form>
          <input type='text' placeholder="Enter amount" className={styles.textbox} />
        </form>    
        <div className="flex items-center justify-between mb-4">
          <h3>New Balance</h3>
          <h3>$ 100.00</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
            <button className="bg-primary px-3 py-3 rounded-lg w-full text-white text-center">Add cash</button>
        </div>
    </Modal>
    <BottomNavigation />
    </>
  )
}
