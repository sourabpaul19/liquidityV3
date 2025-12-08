'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from "./my-orders.module.scss";
import Header from '@/components/common/Header/Header';
import BottomNavigation from '@/components/common/BottomNavigation/BottomNavigation';
import Link from 'next/link';

interface Order {
  id: string;
  total_amount: string;
  order_date: string;
  created_at: string;
  status: string;
  shop: {
    name: string;
    image: string;
  };
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          console.error('No user ID found');
          setLoading(false);
          return;
        }

        const res = await fetch(`http://liquiditybars.com/canada/backend/admin/api/orderList/${userId}`);
        const data = await res.json();

        if (data.status === "1" && data.orders) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getOrderStatus = (status: string) => {
    switch (status) {
      case '0':
        return 'Order Placed';
      case '1':
        return 'Accepted';
      case '2':
        return 'Ready';
      case '3':
        return 'Completed';
      case '4':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  };

  return (
    <>
      <Header title="My Orders" />
      <section className="pageWrapper hasHeader">
        <div className="pageContainer py-4">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No orders found</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
              {orders.map((order) => (
                <div key={order.id} className={styles.orderCard}>
                  <div className="flex gap-4 p-4 justify-between items-center">
                    <figure className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={order.shop?.image || '/images/bar.jpg'}
                        alt={order.shop?.name || 'Shop'}
                        fill
                        className="object-cover"
                      />
                    </figure>

                    <div className={styles.orderText + " flex-1"}>
                      <h5>{order.shop?.name}</h5>
                      <p>{order.order_date || order.created_at}</p>
                    </div>

                    <div className="text-right">
                      <h5>${order.total_amount}</h5>
                    </div>
                  </div>

                  <div className={styles.orderBottom}>
                    <div className="text-primary font-medium">
                      {getOrderStatus(order.status)}
                    </div>
                    <Link href={`/order-details/${order.id}`} className="text-primary font-medium">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <BottomNavigation />
    </>
  );
}
