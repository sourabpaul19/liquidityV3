import React from 'react'
import Image from 'next/image';
import bar from '../../../public/images/bar.jpg';
import styles from "./my-orders.module.scss";
import Header from '@/components/common/Header/Header';
import BottomNavigation from '@/components/common/BottomNavigation/BottomNavigation';
import Link from 'next/link';

export default function MyOrders() {
  return (
    <>
        <Header title="My Orders" buttonType='menu' />
        <section className='page_content'>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-4">
                <div className={styles.orderCard}>
                    <div className='flex gap-4 p-4 justify-between'>
                        <figure>
                            <Image src={bar} alt='' fill />
                        </figure>
                        <div className={styles.orderText}>
                            <h5>Casa Mezcal</h5>
                            <p>12 Oct 2025, 7:33 AM</p>
                        </div>
                        <div>
                            <h5>$ 9.04</h5>
                        </div>
                    </div>
                    <div className={styles.orderBottom}>
                        <div className={`{styles.orderText} color-primary`}>Order Placed</div>
                        <Link href="/order-details" className='color-primary'>View Details</Link>
                    </div>
                </div>
                <div className={styles.orderCard}>
                    <div className='flex gap-4 p-4 justify-between'>
                        <figure>
                            <Image src={bar} alt='' fill />
                        </figure>
                        <div className={styles.orderText}>
                            <h5>Casa Mezcal</h5>
                            <p>12 Oct 2025, 7:33 AM</p>
                        </div>
                        <div>
                            <h5>$ 9.04</h5>
                        </div>
                    </div>
                    <div className={styles.orderBottom}>
                        <div className={`{styles.orderText} color-primary`}>Order Placed</div>
                        <Link href="/order-details" className='color-primary'>View Details</Link>
                    </div>
                </div>
            </div>
        </section> 
        <BottomNavigation />
    </> 
  )
}
