'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import styles from './ongoing-orders.module.scss';
import Header from '@/components/common/Header/Header';
import BottomNavigation from '@/components/common/BottomNavigation/BottomNavigation';

interface Order {
  id: string;
  total_amount: string;
  order_date: string;
  created_at: string;
  square_status?: string;
  sqaure_order_id?: string;
  shop: {
    name: string;
    image: string;
  };
}

export default function OngoingOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Square status for a specific Square order id
  const fetchSquareStatus = async (
    squareOrderId: string
  ): Promise<string | null> => {
    try {
      const url = `https://liquiditybars.com/canada/backend/admin/api/getSquareOrderStatus/${squareOrderId}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`Square status HTTP ${res.status} for ${squareOrderId}`);
        return null;
      }
      
      const data = await res.json();
      console.log(`Square status for ${squareOrderId}:`, data);

      if (data.status === "1" && data.square_order_status) {
        return data.square_order_status as string;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching Square status for ${squareOrderId}:`, error);
      return null;
    }
  };

  const fetchOngoingOrders = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);
    setError(null);
    
    try {
      const userId = localStorage.getItem("user_id");
      console.log('🔄 Fetching orders for user:', userId);
      
      if (!userId) {
        setError("No user ID found. Please login again.");
        if (isInitial) setLoading(false);
        else setRefreshing(false);
        return;
      }

      const res = await fetch(
        `https://liquiditybars.com/canada/backend/admin/api/orderList/${userId}`,
        { 
          cache: 'no-store',
          next: { revalidate: 0 }
        }
      );
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('📋 Order list response:', data);

      if (data.status === "1" && data.orders && data.orders.length > 0) {
        console.log(`✅ Found ${data.orders.length} orders`);

        // Filter for ongoing orders only (not COMPLETED)
        const ongoingOrders = data.orders.filter((order: any) => {
          const status = order.square_status || 'PENDING';
          const isOngoing = status.toUpperCase() !== 'COMPLETED';
          console.log(`Order ${order.id}: ${status} → ${isOngoing ? 'SHOW' : 'HIDE'}`);
          return isOngoing;
        });

        console.log(`🎯 ${ongoingOrders.length} ongoing orders after filter`);

        // ALWAYS fetch fresh Square status for accurate first load
        const ordersWithSquareStatus = await Promise.all(
          ongoingOrders.map(async (order: Order) => {
            console.log(`🔍 Checking Square status for ${order.id} (${order.sqaure_order_id})`);
            
            let finalStatus = order.square_status || 'PENDING';
            const squareOrderId = order.sqaure_order_id;
            
            if (squareOrderId) {
              const squareStatus = await fetchSquareStatus(squareOrderId);
              if (squareStatus) {
                finalStatus = squareStatus;
                console.log(`✅ Updated ${order.id} to Square status: ${squareStatus}`);
              }
            }
            
            return {
              ...order,
              square_status: finalStatus,
            };
          })
        );

        console.log('🎉 Final orders with status:', ordersWithSquareStatus);
        setOrders(ordersWithSquareStatus);
      } else {
        console.log('❌ No orders found:', data.message || data);
        setOrders([]);
      }
    } catch (error) {
      console.error("❌ Error fetching ongoing orders:", error);
      setError(`Failed to load orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load + fetch Square status immediately
  useEffect(() => {
    fetchOngoingOrders(true);
  }, [fetchOngoingOrders]);

  // 10 second refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOngoingOrders(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchOngoingOrders]);

  const getOrderStatus = (square_status?: string) => {
    const status = (square_status || 'PENDING').toUpperCase();
    switch (status) {
      case "PROPOSED":
        return "Received";
      case "RESERVED":
        return "Preparing";
      case "PREPARED":
        return "Ready";
      case "COMPLETED":
        return "Completed";
      default:
        return "Received";
    }
  };

  const getFormattedDateTime = (created_at: string) => {
    if (!created_at) return "N/A";
    const date = new Date(created_at.replace(" ", "T"));
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " | " + date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper to determine correct href based on status
  const getOrderLinkHref = (orderId: string, square_status?: string) => {
    const status = (square_status || 'PENDING').toUpperCase();
    return status === 'COMPLETED' ? `/order-details/${orderId}` : `/order-status/${orderId}`;
  };

  if (loading) {
    return (
      <>
        <Header title="Ongoing Orders" />
        <section className="pageWrapper hasHeader">
          <div className='pageContainer'>
            <div className="flex flex-col gap-4 p-4">
              <div className="text-center py-10 text-gray-500">
                Loading ongoing orders...
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Header title="Ongoing Orders" />
      <section className="pageWrapper hasHeader">
        <div className='pageContainer'>
          <div className="flex flex-col gap-4 p-4">
            {/* Error display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
                <button 
                  onClick={() => fetchOngoingOrders(false)}
                  className="ml-2 underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            )}

            {orders.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No ongoing orders
                {refreshing && (
                  <div className="text-xs mt-2 opacity-75">
                    Auto-refreshing every 10 seconds...
                  </div>
                )}
              </div>
            ) : (
              <>
                {orders.map((order) => {
                  const isCompleted = (order.square_status || 'PENDING').toUpperCase() === 'COMPLETED';
                  const href = getOrderLinkHref(order.id, order.square_status);
                  
                  return (
                    <Link 
                      key={order.id} 
                      href={href}
                      className={`${styles.orderCard} flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <figure className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={order.shop?.image || "/images/bar.jpg"}
                            alt={order.shop?.name || "Shop"}
                            fill
                            className="object-cover"
                          />
                        </figure>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-lg truncate">
                            LIQ-{order.id.slice(-6)} - {order.shop?.name || 'Unknown'}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {getFormattedDateTime(order.created_at)} -{' '}
                            <span className={`font-medium ${isCompleted ? 'text-green-600' : 'text-primary'}`}>
                              {getOrderStatus(order.square_status)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={22} color="gray" />
                    </Link>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </section>
      <BottomNavigation />
    </>
  );
}
