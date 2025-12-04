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

const BACKEND_ADD_CART_URL = "https://liquiditybars.com/canada/backend/admin/api/addMultipleCartItems"; // replace with your endpoint


export default function Bars() {
  const router = useRouter();
  const pathname = usePathname();
  const shopIdFromUrl = pathname.split("/").pop();

  if (!shopIdFromUrl) {
    return <p className="text-red-600 text-center mt-10">Invalid shop ID</p>;
  }

  const [open, setOpen] = useState(false);
  const [shop, setShop] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
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

  // Fetch shop and recent orders
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        let shopData: any = null;
        const storedShop = typeof window !== "undefined" ? localStorage.getItem("selected_shop") : null;

        if (storedShop) {
          shopData = JSON.parse(storedShop);
        } else if (shopIdFromUrl) {
          const response = await fetch(
            `https://liquiditybars.com/canada/backend/admin/api/fetchDashboardDataForUsers/${userId}`
          );
          const data = await response.json();

          if (data.status === "1") {
            shopData = data.orders
              .map((o: any) => o.shop)
              .find((s: any) => s.id === shopIdFromUrl);

            if (shopData) localStorage.setItem("selected_shop", JSON.stringify(shopData));
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
        if (!userId) {
          setError("User not logged in.");
          setLoading(false);
          return;
        }

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

  // Calculate total price dynamically based on quantity
  const calculateTotal = () => {
    if (!selectedOrder) return 0;
    return selectedOrder.products.reduce((sum: number, product: any) => {
      return sum + parseFloat(product.price) * parseInt(product.quantity);
    }, 0);
  };

  const handleAddToCart = async () => {
  if (!selectedOrder) return;

  // 1️⃣ Validate quantities first
  const invalidProduct = selectedOrder.products.find(
    (product: any) => !product || parseInt(product.quantity) <= 0
  );
  if (invalidProduct) {
    alert("Please choose a quantity for all items");
    return; // stop here before sending anything
  }

  // 2️⃣ Loop through products and send to backend
  for (const product of selectedOrder.products) {
    const params = new URLSearchParams();
    params.append("device_id", deviceId || "web");
    params.append("user_id", userId || "951");
    params.append("cartProductIds", String(product.id));
    params.append("cartProductsNames", product.product_name);
    params.append("cartProductPrices", String(product.price));
    params.append("cartQuantities", String(product.quantity));
    params.append("cartIsLiquors", "1");
    params.append("units", product.size || "1oz");

    const isDouble = product.is_double_shot && product.extraShotQty > 0 ? "1" : "0";
    params.append("is_double_shot", isDouble);
    params.append(
      "double_shot_price",
      isDouble === "1" ? String(product.double_shot_price || 0) : "0"
    );
    params.append("shot_count", isDouble === "1" ? String(product.extraShotQty || 0) : "0");

    const mixerName = product.selectedMixer?.name || "";
    const mixerPrice = product.selectedMixer?.price ? String(product.selectedMixer.price) : "0";
    const instructions = product.specialInstructions || "";

    params.append("choice_of_mixer_name", mixerName);
    params.append("choice_of_mixer_price", mixerPrice);
    params.append("special_instruction", instructions);

    // Add-ons placeholders
    params.append("add_on_id", "0");
    params.append("add_on_name1", "");
    params.append("add_on_name2", "");
    params.append("add_on_price1", "0");
    params.append("add_on_price2", "0");
    params.append("add_on_quantity", "0");
    params.append("add_on_unit", "0");

    params.append("is_active", "1");
    params.append("is_deleted", "0");
    params.append("is_liquor", "1");
    params.append("choice_of_alcohol_name", "");

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
        console.error("No JSON in addToCart response:", raw);
        alert("Server error while adding to cart. See console.");
        return;
      }

      const data = JSON.parse(jsonMatch[0]);
      if (!(data && (data.status === "1" || data.status === 1))) {
        console.error("Add to cart failed:", data);
        alert(data.message || "Failed to add to cart");
        return;
      }
    } catch (err) {
      console.error("addToCart network error:", err);
      alert("Network error while adding to cart");
      return;
    }
  }

  try { localStorage.setItem("cart_shop_id", shopIdFromUrl); } catch {}
  alert("All items added to cart successfully!");
  setSelectedOrder(null);
  setOpen(false);
};


  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;

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
            <figcaption>
              <div className={styles.barLeft}>
                <h2 className={styles.barTitle}>{shop?.name}</h2>
                <div className={styles.barType}>Rooftop Patio Resto & Bar</div>
                <div className={styles.barAddress}>
                  <span>{shop?.address}</span>
                </div>
              </div>
            </figcaption>

            <h3 className="sectionHead">Order Again</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id}>
                    <div className={styles.repeatOrderCard}>
                      {Array.isArray(order.products) && order.products.length > 0 ? (
                        order.products.map((product: any) => (
                          <div key={product.id} className={styles.orderItem}>
                            <span>{product.product_name}</span>
                            <span>x{product.quantity}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No products in this order.</p>
                      )}
                      <div className={styles.orderTotal}>
                        <span>Order Amount - ${order.total_amount || order.amount}</span>
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
          </div>

          <div className="container-fluid pt-4 px-4 bottomButton">
            <Link
              href="/outlet-menu"
              onClick={() => {
                if (shop?.id) localStorage.setItem("shop_id", String(shop.id));
              }}
              className="bg-primary px-3 py-3 rounded-lg w-full text-white block text-center"
            >
              View Menu
            </Link>

            <Modal isOpen={open} onClose={() => setOpen(false)} title="Order Again!">
              {selectedOrder ? (
                <div className={styles.itemWrapper}>
                  {selectedOrder.products.map((product: any) => (
                    <div key={product.id} className={styles.itemCard}>
                      <div className={styles.itemDetails}>
                        <h4>{product.product_name}</h4>
                        <p>({product.size || "1oz"})</p>
                      </div>
                      <div className={styles.itemMeta}>
                        <p className={styles.itemPrice}>$ {product.price}</p>
                        <QuantityButton
  min={1}
  max={10}
  initialValue={parseInt(product.quantity)} // <-- use initialValue
  onChange={(qty) => {
    setSelectedOrder((prev: any) => {
      if (!prev) return prev;
      const updatedProducts = prev.products.map((p: any) =>
        p.id === product.id ? { ...p, quantity: qty.toString() } : p
      );
      return { ...prev, products: updatedProducts };
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
                <p className="text-gray-500">No items to show.</p>
              )}
            </Modal>
          </div>
        </div>
      </section>
      <BottomNavigation />
    </>
  );
}
