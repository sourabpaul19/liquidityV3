'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import styles from './ongoing-orders.module.scss'; // create this file or adjust path
import Header from '@/components/common/Header/Header';

export default function OngoingOrders() {
  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/outlet');
  };

  const orders = [
    { id: 1, orderid: 'LIQ-241136', title: 'Casa Mezcal', ordertime: 'Oct 10, 2025 | 20:01', orderStatus: 'Order Received' },
    { id: 2, orderid: 'LIQ-241137', title: 'Bar Azul', ordertime: 'Oct 12, 2025 | 19:45', orderStatus: 'Preparing Order' },
    { id: 3, orderid: 'LIQ-241138', title: 'Sky Lounge', ordertime: 'Oct 14, 2025 | 22:15', orderStatus: 'Ready for Pickup' },
  ];

  return (
    <>
    <Header title="Ongoing Orders" />
    <section className="pageWrapper hasHeader">
        <div className='pageContainer'>
      <div className="flex flex-col gap-4 p-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/order-status/`} className={`${styles.orderCard} flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition`}>
            <div>
              <h3 className="font-semibold text-lg">
                {order.orderid} - {order.title}
              </h3>
              <p className="text-sm text-gray-600">
                {order.ordertime} - <span className="text-primary font-medium">{order.orderStatus}</span>
              </p>
            </div>
            <ChevronRight size={22} color="gray" />
          </Link>
        ))}
      </div>
      </div>
    </section>
    </>
  );
}
