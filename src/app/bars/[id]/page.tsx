"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import BottomNavigation from "@/components/common/BottomNavigation/BottomNavigation";
import Header from "@/components/common/Header/Header";
import Image from "next/image";
import Modal from "@/components/common/Modal/Modal";
import QuantityButton from "@/components/common/QuantityButton/QuantityButton";
import Link from "next/link";
import { Plus } from "lucide-react";
import styles from "../bars.module.scss";

const BACKEND_ADD_CART_URL =
  "https://liquiditybars.com/canada/backend/admin/api/addMultipleCartItems";

// ---------------- TYPES -----------------

type Product = {
  id: string;
  product_name: string;
  size?: string;
  price: string;
  quantity: string;
  double_shot_price?: number;
  is_double_shot?: boolean;
  extraShotQty?: number;
  selectedMixer?: { name: string; price: number };
  specialInstructions?: string;
};

type Order = {
  id: string;
  products: Product[];
  total_amount?: number;
  amount?: number;
};

type Shop = {
  id: string;
  name: string;
  image?: string;
  address?: string;
};

// ---------------- COMPONENT --------------

export default function Bars() {
  const router = useRouter();
  const pathname = usePathname();
  const shopIdFromUrl = pathname.split("/").pop() || "";

  // All hooks must be here — BEFORE any conditional return
  const [open, setOpen] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("user_id") || "951"
      : "951";

  const deviceId =
    typeof window !== "undefined"
      ? localStorage.getItem("device_id") || "web"
      : "web";

  // ----------- USE EFFECT ----------------

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        let shopData: Shop | null = null;

        const storedShop =
          typeof window !== "undefined"
            ? localStorage.getItem("selected_shop")
            : null;

        if (storedShop) {
          shopData = JSON.parse(storedShop);
        } else {
          const response = await fetch(
            `https://liquiditybars.com/canada/backend/admin/api/fetchDashboardDataForUsers/${userId}`
          );
          const data = await response.json();

          if (data.status === "1") {
            shopData = data.orders
              .map((o: any) => o.shop)
              .find((s: Shop) => String(s.id) === shopIdFromUrl);

            if (shopData)
              localStorage.setItem("selected_shop", JSON.stringify(shopData));
          }
        }

        if (!shopData) {
          setError("Shop not found.");
          setLoading(false);
          return;
        }

        setShop(shopData);
        fetchRecentOrders(shopIdFromUrl);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch shop data.");
        setLoading(false);
      }
    };

    const fetchRecentOrders = async (shopId: string) => {
      try {
        const response = await fetch(
          `https://liquiditybars.com/canada/backend/admin/api/myRecenntOrdersShopWise/${userId}/${shopId}`
        );
        const data = await response.json();

        if (data.status === "1") {
          setRecentOrders(data.orders || []);
        } else {
          setError(data.message || "Failed to fetch recent orders");
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong while fetching recent orders");
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [shopIdFromUrl, userId]);

  // ------------------ HELPERS ------------------

  const calculateTotal = () => {
    if (!selectedOrder) return 0;
    return selectedOrder.products.reduce((sum, p) => {
      return sum + Number(p.price) * Number(p.quantity);
    }, 0);
  };

  // ------------------ ADD TO CART -----------------

  const handleAddToCart = async () => {
    if (!selectedOrder) return;

    for (const product of selectedOrder.products) {
      if (Number(product.quantity) <= 0) {
        alert("Please choose a quantity for all items");
        return;
      }
    }

    for (const product of selectedOrder.products) {
      const params = new URLSearchParams();
      params.append("device_id", deviceId);
      params.append("user_id", userId);
      params.append("cartProductIds", product.id);
      params.append("cartProductsNames", product.product_name);
      params.append("cartProductPrices", product.price);
      params.append("cartQuantities", product.quantity);
      params.append("cartIsLiquors", "1");
      params.append("units", product.size || "1oz");

      const isDouble =
        product.is_double_shot && product.extraShotQty ? "1" : "0";

      params.append("is_double_shot", isDouble);
      params.append(
        "double_shot_price",
        isDouble === "1" ? String(product.double_shot_price || 0) : "0"
      );
      params.append(
        "shot_count",
        isDouble === "1" ? String(product.extraShotQty || 0) : "0"
      );

      params.append("choice_of_mixer_name", product.selectedMixer?.name || "");
      params.append(
        "choice_of_mixer_price",
        product.selectedMixer?.price
          ? String(product.selectedMixer.price)
          : "0"
      );

      params.append(
        "special_instruction",
        product.specialInstructions || ""
      );

      try {
        const res = await fetch(BACKEND_ADD_CART_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json, text/plain, */*",
          },
          body: params.toString(),
        });

        const raw = await res.text();
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          alert("Server error while adding to cart");
          return;
        }

        const data = JSON.parse(jsonMatch[0]);
        if (!(data.status === "1" || data.status === 1)) {
          alert(data.message || "Failed to add to cart");
          return;
        }
      } catch (err) {
        alert("Network error while adding to cart");
        return;
      }
    }

    localStorage.setItem("cart_shop_id", shopIdFromUrl);
    alert("All items added to cart successfully!");
    setSelectedOrder(null);
    setOpen(false);
  };

  // ------------------ EARLY RETURNS AFTER HOOKS ------------------

  if (!shopIdFromUrl) {
    return <p className="text-red-600 text-center mt-10">Invalid shop ID</p>;
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;

  // ------------------ UI ------------------

  return (
    <>
      <Header title={shop?.name || "Bar"} />

      <section className="pageWrapper hasHeader hasFooter">
        <div className="pageContainer">
          <div className="container-fluid px-4">
            {shop?.image && (
              <figure className={styles.barBanner}>
                <Image src={shop.image} fill alt={shop.name} />
              </figure>
            )}

            <h3 className="sectionHead">Order Again</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id}>
                    <div className={styles.repeatOrderCard}>
                      {order.products.map((prod) => (
                        <div key={prod.id} className={styles.orderItem}>
                          <span>{prod.product_name}</span>
                          <span>x{prod.quantity}</span>
                        </div>
                      ))}
                      <div className={styles.orderTotal}>
                        <span>
                          Order Amount – $
                          {order.total_amount || order.amount}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setOpen(true);
                          }}
                          className={styles.add_btn}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No recent orders.</p>
              )}
            </div>

            <Modal
              isOpen={open}
              onClose={() => setOpen(false)}
              title="Order Again!"
            >
              {selectedOrder ? (
                <div className={styles.itemWrapper}>
                  {selectedOrder.products.map((p) => (
                    <div key={p.id} className={styles.itemCard}>
                      <div>
                        <h4>{p.product_name}</h4>
                      </div>

                      <div>
                        <p>$ {p.price}</p>

                        <QuantityButton
                          min={1}
                          max={10}
                          initialValue={Number(p.quantity)}
                          onChange={(qty) => {
                            setSelectedOrder((prev) => {
                              if (!prev) return prev;
                              const updated = prev.products.map((x) =>
                                x.id === p.id
                                  ? { ...x, quantity: String(qty) }
                                  : x
                              );
                              return { ...prev, products: updated };
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="text-right font-semibold mt-2">
                    Total: $ {calculateTotal().toFixed(2)}
                  </div>

                  <button
                    className="bg-primary text-white w-full py-3 mt-4 rounded-lg"
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </button>
                </div>
              ) : (
                <p>No items to show.</p>
              )}
            </Modal>
          </div>

          <div className="container-fluid pt-4 bottomButton px-4">
            <Link
              href="/outlet-menu"
              onClick={() => shop?.id && localStorage.setItem("shop_id", shop.id)}
              className="bg-primary px-3 py-3 rounded-lg w-full text-white block text-center"
            >
              View Menu
            </Link>
          </div>
        </div>
      </section>

      <BottomNavigation />
    </>
  );
}
