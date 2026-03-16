"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { EllipsisVertical, ClockFading, AlertTriangle, X } from "lucide-react";
import BottomNavigation from "@/components/common/BottomNavigation/BottomNavigation";
import styles from "../table-order-success.module.scss";
import statusImg from "../../../../public/images/cheers.png";

// -----------------------------------------
// TYPES
// -----------------------------------------
interface OrderProduct {
  id: string;
  product_name: string;
  quantity: string;
  unit: string;
  choice_of_mixer_name?: string;
  shot_count?: string;
  special_instruction?: string;
  price: string;
}

interface Order {
  id: string;
  outlet_slug?: string;
  status?: string; // "1" | "2"
  is_ready?: string; // "0" | "1"
  sqaure_order_id?: string;
  table_no: string;
  order_date: string;
  shop_id?: string;
  order_type?: string;
  tax_amount?: string;
  products?: OrderProduct[];
}

type SquareStatus = "PROPOSED" | "RESERVED" | "PREPARED" | "COMPLETED" | null;

// -----------------------------------------
// STATUS TEXT
// -----------------------------------------
const STATUS_MESSAGES: Record<string, string> = {
  PROPOSED: "Your order has been placed, and will be with you shortly",
  RESERVED: "The Bar Is Preparing Your Order",
  PREPARED: "Your Order Is Ready For Pickup",
  COMPLETED: "Your Order Has Been Collected",
  null: "Your order has been placed, and will be with you shortly",
};

const getStatusMessage = (status: SquareStatus) => {
  const key = status ?? "null";
  return STATUS_MESSAGES[key] ?? STATUS_MESSAGES.null;
};

const getLocalStorage = (key: string): string => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(key) || "";
};

// ✅ Get current shop ID helper
const getShopId = (): string => {
  const selected_shop = getLocalStorage("selected_shop");
  return selected_shop
    ? JSON.parse(selected_shop)?.id || getLocalStorage("shop_id")
    : getLocalStorage("shop_id");
};

// ✅ Get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

// -----------------------------------------
// COMPONENT
// -----------------------------------------
export default function OrderSuccess() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [squareStatus, setSquareStatus] = useState<SquareStatus>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleBack = useCallback(() => {
    clearPolling();
    if (order?.outlet_slug) {
      router.push(`/outlet-menu/${order.outlet_slug}`);
    } else {
      router.push("/outlet-menu");
    }
  }, [order?.outlet_slug, router, clearPolling]);

  // -----------------------------
  // GET LOCALSTORAGE VALUES
  // -----------------------------
  const getLocalStorageValues = useCallback(() => {
    if (typeof window === "undefined") return { shopId: "", tableNo: "" };
    
    const shopId = localStorage.getItem("shop_id") || "";
    const tableNo = localStorage.getItem("table_number") || localStorage.getItem("table_no") || "";
    
    return { shopId, tableNo };
  }, []);

  const handleOrderAnother = useCallback(() => {
    clearPolling();
    const { shopId, tableNo } = getLocalStorageValues();
    router.push(`/restaurant/${shopId}?table=${tableNo}`);
  }, [router, clearPolling, getLocalStorageValues]);

  const handleViewTab = useCallback(() => {
    clearPolling();
    router.push("/my-table");
  }, [router, clearPolling]);

  // ✅ Filter orders by shop_id, table, order_type, AND TODAY'S DATE ONLY
  const filterOrders = (allOrders: Order[]): Order[] => {
    const hasTableNumber = !!getLocalStorage("table_number");
    const currentTableNo = getLocalStorage("table_number") || "";
    const currentShopId = getShopId();
    const todayDate = getTodayDate();
    
    console.log("🔍 MyTable Filtering:", { 
      allOrders: allOrders.length, 
      tableNo: currentTableNo, 
      hasTableNumber,
      currentShopId,
      todayDate
    });
    
    return allOrders.filter((order) => {
      // ✅ Must match today's date ONLY
      if (order.order_date !== todayDate) return false;

      // ✅ Must match shop_id
      if (currentShopId && order.shop_id !== currentShopId) return false;

      if (hasTableNumber && currentTableNo) {
        // Table mode: table_no MATCH + order_type = "2"
        return order.table_no === currentTableNo && order.order_type === "2";
      } else {
        // Bar mode: order_type = "1" ONLY
        return order.order_type === "1";
      }
    });
  };

  // Flatten all products from FILTERED orders only
  const allProducts: OrderProduct[] = filteredOrders.flatMap((order) => order.products || []);
  
  // Grand subtotal across FILTERED orders: sum(price * quantity) for every product
  const grandSubtotal = allProducts.reduce((sum, product) => {
    const lineTotal = parseFloat(product.price || "0") * parseFloat(product.quantity || "0");
    return sum + lineTotal;
  }, 0);
  
  // Sum all tax_amount from FILTERED orders (API field) or calculate 13% of subtotal
  const grandTax = filteredOrders.reduce((sum, order) => {
    if (order.tax_amount) {
      return sum + parseFloat(order.tax_amount || "0");
    }
    // Fallback: 13% tax rate if no tax_amount provided
    return sum + grandSubtotal * 0.13;
  }, 0);
  
  // Grand total = subtotal + tax
  const grandTotal = grandSubtotal + grandTax;

  // -----------------------------
  // API HELPERS
  // -----------------------------
  const fetchOrderDetails = useCallback(async (): Promise<Order | null> => {
    try {
      const res = await fetch(
        `https://admin.liquiditybars.com/admin/api/tblOrderDetails/${id}`,
        { cache: "no-store" }
      );
      const data = await res.json();

      if (data.status === "1" && data.order) {
        const safeOrder: Order = {
          ...data.order,
          products: Array.isArray(data.order.products)
            ? data.order.products
            : [],
        };
        return safeOrder;
      }

      return null;
    } catch (e) {
      console.error("orderDetails error", e);
      return null;
    }
  }, [id]);

  const fetchSquareStatus = useCallback(
    async (squareOrderId: string): Promise<SquareStatus> => {
      try {
        const res = await fetch(
          `https://admin.liquiditybars.com/admin/api/getSquareOrderStatus/${squareOrderId}`,
          { cache: "no-store" }
        );
        const data = await res.json();

        if (data.status === "1" && typeof data.square_order_status === "string") {
          const raw = data.square_order_status as string;

          if (
            raw === "PROPOSED" ||
            raw === "RESERVED" ||
            raw === "PREPARED" ||
            raw === "COMPLETED"
          ) {
            return raw as SquareStatus;
          }
        }

        return null;
      } catch (e) {
        console.error("square status error", e);
        return null;
      }
    },
    []
  );

  const fetchOrders = useCallback(async () => {
    try {
      const deviceId = getLocalStorage("device_id") || getLocalStorage("deviceId");
      const tableNo = getLocalStorage("table_number") || "";
      const todayDate = getTodayDate();

      if (!deviceId) return;

      const url = `https://admin.liquiditybars.com/admin/api/tblOrderList/${deviceId}/${todayDate}/${tableNo}`;
      const res = await fetch(url);
      
      if (!res.ok) return;

      const data = await res.json();
      const list: Order[] = Array.isArray(data) ? data : data.orders || [];
      
      // Filter immediately
      const filteredList = filterOrders(list);
      setOrders(filteredList);
    } catch (e) {
      console.error("fetchOrders error:", e);
    }
  }, []);

  const handleCancel = () => setShowConfirmModal(false);

  const handleConfirm = async () => {
    setShowConfirmModal(false);

    // Run the merge-orders API call
    const orderIds = filteredOrders.map(o => o.id);

    try {
      const res = await fetch("/api/merge-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ order_ids: orderIds })
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/bill-success/${data.square_order_id}`);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while merging orders.");
    }
  };

  // ✅ MAIN EFFECT: INITIAL LOAD + POLLING (CONSOLIDATED)
  useEffect(() => {
    if (!id) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    let mounted = true;

    const initialize = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch specific order details FIRST (critical for this page)
        const orderData = await fetchOrderDetails();
        
        if (!mounted) return;

        if (!orderData) {
          setError("Order not found or deleted.");
          setOrder(null);
          setLoading(false);
          return;
        }

        setOrder(orderData);

        // 2. Fetch orders list in parallel
        await fetchOrders();

        // 3. Check Square status if available
        if (orderData.sqaure_order_id) {
          const sq = await fetchSquareStatus(orderData.sqaure_order_id);
          if (mounted) {
            setSquareStatus(sq);
            
            // Update order status based on Square
            if (sq === "RESERVED") {
              const updated = { ...orderData, status: "2", is_ready: "0" };
              setOrder(updated);
            } else if (sq === "PREPARED" || sq === "COMPLETED") {
              const updated = { ...orderData, status: "2", is_ready: "1" };
              setOrder(updated);
            }
          }
        }

      } catch (e) {
        console.error("Initialization error:", e);
        if (mounted) {
          setError("Failed to load order details.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    // Start polling after initial load
    intervalRef.current = setInterval(async () => {
      if (!mounted || !order?.sqaure_order_id) return;
      
      const sq = await fetchSquareStatus(order.sqaure_order_id);
      if (!mounted) return;

      setSquareStatus(sq);
      
      if (sq === "COMPLETED") {
        clearPolling();
      }
    }, 10000);

    return () => {
      mounted = false;
      clearPolling();
    };
  }, [id, fetchOrderDetails, fetchSquareStatus, fetchOrders]);

  // ✅ Filter orders whenever orders change
  useEffect(() => {
    const filtered = filterOrders(orders);
    setFilteredOrders(filtered);
  }, [orders]);

  const lastOrder = filteredOrders[0];
  const lastOrderStatus = lastOrder?.status;

  // -----------------------------
  // RENDER
  // -----------------------------
  if (loading) {
    return (
      <section className="pageWrapper hasHeader">
        <div className="pageContainer">
          <div className="text-center mt-10">
            {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Loading order details...</p> */}
          </div>
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="pageWrapper hasHeader">
        <div className="pageContainer">
          <h2 className="text-center mt-10 text-red-500 text-xl font-bold">
            {error || "Order not found or deleted."}
          </h2>
          <button 
            onClick={handleBack}
            className="mt-6 px-6 py-3 rounded-lg w-full text-white bg-primary transition-all hover:bg-primary/90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
          >
            Go Back
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* BODY */}
      <section className="pageWrapper">
        <div className="pageContainer vMiddle">
          <div className={styles.successWrapper}>
            <div className={styles.successIcon}>
              <Image src={statusImg} alt="Order status" fill />
            </div>

            <h4 className="text-center mb-2">
              {getStatusMessage(squareStatus) || 'Your order has been placed, and will be with you shortly'}
            </h4>

            <p className="text-center">
              To close your bill, or for any questions<br/>regarding your bill, 
              please speak to<br/>your server
            </p>

            <button 
              type="button"
              onClick={handleOrderAnother}
              className="mt-6 px-6 py-3 rounded-lg w-full text-white bg-primary transition-all hover:bg-primary/90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Order Another Item
            </button>

            <button 
              type="button"
              onClick={handleViewTab}
              className="mt-3 px-6 py-3 rounded-lg w-full text-white bg-gray-600 hover:bg-gray-700 transition-all hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              View Tab
            </button>
            
            {filteredOrders.length > 0 && lastOrderStatus !== "5" && (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="mt-3 px-6 py-3 rounded-lg w-full text-white bg-black transition-all hover:bg-black/90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Get My Bill
              </button>
            )}
          </div>
        </div>
        
        {showConfirmModal && (
          <div
            className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center p-4"
            onClick={handleCancel}
          >
            <div
              className="bg-white rounded-2xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center flex-col gap-3 mb-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">Get My Bill</h3>
                  <p className="text-sm text-gray-500">
                    Warning: Once you request your bill, you cannot place any more orders. Are you sure you want to do this?
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Get Bill
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
