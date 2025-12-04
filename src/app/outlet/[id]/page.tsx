"use client";
import { useRouter, usePathname, useParams } from "next/navigation";
import BottomNavigation from "@/components/common/BottomNavigation/BottomNavigation";
import Header from "@/components/common/Header/Header";
import styles from '../outlet.module.scss';
import Image from 'next/image';
import { Plus, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Modal from "@/components/common/Modal/Modal";
import bar from '../../../../public/images/bar.jpg';
import QuantityButton from "@/components/common/QuantityButton/QuantityButton";
import Link from "next/link";
import classNames from 'classnames';
import toast from "react-hot-toast";

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  image: string;
  is_double_shot?: number;
  double_shot_price?: number;
  is_add_mixture?: number;
  price_display?: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  is_double_shot?: boolean;
  double_shot_price?: number;
  extraShotQty?: number;
  specialInstructions?: string;
  selectedMixer?: MenuItem | null;
  choice_of_mixer_name?: string;
  addOns?: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
  }[];
}

interface LocalCartItem {
  device_id: string;
  user_id: string;
  cartProductIds: string;
  cartProductsNames: string;
  cartProductPrices: number;
  cartQuantities: number;
  cartIsLiquors: string;
  units: string;
  is_double_shots: number;
  double_shot_prices: number;
  shot_count: number;
  choice_of_mixer_names: string;
  special_instructions: string;
  shop_id: string;
}

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

export default function Outlet() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const shopId = params?.id ? String(params.id) : "25";

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const categoryButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [cartCount, setCartCount] = useState<number>(0);

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [modalQty, setModalQty] = useState<number>(1);
  const [extraShotQty, setExtraShotQty] = useState<number>(0);
  const [showMixerModal, setShowMixerModal] = useState(false);
  const [mixers, setMixers] = useState<MenuItem[]>([]);
  const [selectedMixer, setSelectedMixer] = useState<MenuItem | null>(null);
  const [tempSelectedMixer, setTempSelectedMixer] = useState<MenuItem | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState<string>("");

  const [deviceId, setDeviceId] = useState("web");
  const [userId, setUserId] = useState("");

  const handleButtonClick = () => {
    router.back();
  };

  const [headerWhite, setHeaderWhite] = useState(false);
  const [showCategoryBar, setShowCategoryBar] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const AdsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const bannerBottom = bannerRef.current ? bannerRef.current.offsetTop + bannerRef.current.offsetHeight : 0;
      const adsBottom = AdsRef.current ? AdsRef.current.offsetTop + AdsRef.current.offsetHeight : 0;
      const scrollY = window.scrollY;

      setHeaderWhite(scrollY > bannerBottom - 100);
      setShowCategoryBar(scrollY > adsBottom - 120);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const uid = localStorage.getItem("user_id");
    setUserId(uid || "");
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem("device_id");
    if (storedId) setDeviceId(storedId);
  }, []);

  const normalizeCartItem = (item: any): CartItem => ({
    ...item,
    is_double_shot: Boolean(item.is_double_shot),
    selectedMixer:
      item.choice_of_mixer_name && mixers.length > 0
        ? mixers.find(mix => mix.name === item.choice_of_mixer_name) || null
        : null,
    extraShotQty: item.shot_count || 0,
    specialInstructions: item.special_instruction || "",
  });

  // Clear cart on page load (backend and local)
  useEffect(() => {
    const clearCartOnLoad = async () => {
      const uid = localStorage.getItem("user_id") || "";
      const did = localStorage.getItem("device_id") || "";

      try {
        await fetch("/api/deleteAllCartItems", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: uid || "",
            device_id: did,
          }),
        });

        localStorage.removeItem("liquidity_cart_cache");
        localStorage.removeItem("liquidity_cart_total");
        localStorage.removeItem("liquidity_cart_count");
        localStorage.removeItem("guestCart");

        setCartCount(0);
        setCartTotal(0);

        console.log("Cart cleared on page load.");
      } catch (err) {
        console.error("Failed to clear cart:", err);
      }
    };
    clearCartOnLoad();
  }, []);

  // Hydrate cart from localStorage or backend depending on login state
  const hydrateCart = () => {
    try {
      if (userId && userId !== "") {
        // Logged-in users hydrate from liquidity_cart_cache keys
        const itemsRaw = localStorage.getItem("liquidity_cart_cache");
        const totalRaw = localStorage.getItem("liquidity_cart_total");
        const countRaw = localStorage.getItem("liquidity_cart_count");
        setCartItems(itemsRaw ? JSON.parse(itemsRaw) : []);
        setCartTotal(totalRaw ? Number(totalRaw) : 0);
        setCartCount(countRaw ? Number(countRaw) : 0);
      } else {
        // Logged-out users hydrate full cart objects from guestCart
        const itemsRaw = localStorage.getItem("guestCart");
        const items: LocalCartItem[] = itemsRaw ? JSON.parse(itemsRaw) : [];

        const cartItemsFromLocal: CartItem[] = items.map((item) => ({
          id: item.cartProductIds,
          name: item.cartProductsNames,
          price: item.cartProductPrices,
          quantity: item.cartQuantities,
          is_double_shot: item.cartIsLiquors === "1",
          double_shot_price: item.double_shot_prices,
          extraShotQty: item.shot_count,
          specialInstructions: item.special_instructions,
          choice_of_mixer_name: item.choice_of_mixer_names,
        }));

        const total = cartItemsFromLocal.reduce((acc, ci) => acc + ci.price * ci.quantity, 0);
        const count = cartItemsFromLocal.reduce((acc, ci) => acc + ci.quantity, 0);

        setCartItems(cartItemsFromLocal);
        setCartTotal(total);
        setCartCount(count);
      }
    } catch (e) {
      console.error("Error hydrating cart:", e);
    }
  };

  useEffect(() => {
    if (userId && userId !== "") {
      fetchCartFromBackend();
    } else {
      hydrateCart();
    }
  }, [pathname, userId]);

  useEffect(() => {
    if (!userId || userId === "") return;

    const handleFocus = () => fetchCartFromBackend();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchCartFromBackend();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    fetch(`https://liquiditybars.com/canada/backend/admin/api/fetchCategoriesByShop/${shopId}`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        if (data && (data.status === "1" || data.status === 1) && Array.isArray(data.categories)) {
          const mapped: Category[] = data.categories.map((cat: { id: any; name: any; products: any[]; }) => ({
            id: String(cat.id),
            name: cat.name,
            items: Array.isArray(cat.products)
              ? cat.products.map((p: any) => ({
                id: Number(p.id),
                name: p.name,
                description: p.description || "",
                price: Number(p.current_price ?? p.price ?? 0) || 0,
                image: `https://liquiditybars.com/canada/backend/assets/upload/sub_categories/${encodeURIComponent(p.image || "")}`,
                is_double_shot: Number(p.is_double_shot) || 0,
                double_shot_price: Number(p.double_shot_price || 0),
                is_add_mixture: Number(p.is_add_mixture) || 0,
                price_display: Number(p.current_price ?? p.price ?? 0) || 0,
              }))
              : [],
          }));
          const reversed = mapped.reverse();
          setCategories(reversed);
          if (reversed.length > 0) setActiveCategory(reversed[0].id);
        } else {
          setCategories([]);
        }
      })
      .catch(err => console.error("Error fetching categories:", err));
    return () => {
      cancelled = true;
    };
  }, [shopId]);

  useEffect(() => {
    if (categories.length > 0) {
      const mixerCategory = categories.find(c => c.id === "12");
      if (mixerCategory) setMixers(mixerCategory.items);
    }
  }, [categories]);

  const setCategoryButtonRef = (id: string, el: HTMLButtonElement | null) => {
    categoryButtonRefs.current[id] = el;
  };
  const setSectionRef = (id: string, el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  };
  const scrollToSection = (id: string) => {
    const section = sectionRefs.current[id];
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveCategory(id);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 150;
      for (const cat of categories) {
        const section = sectionRefs.current[cat.id];
        if (section) {
          if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
            setActiveCategory(cat.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  useEffect(() => {
    const activeBtn = categoryButtonRefs.current[activeCategory];
    if (activeBtn) {
      try {
        activeBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      } catch { }
    }
  }, [activeCategory]);

  const fetchCartFromBackend = async () => {
    try {
      const res = await fetch("/api/getCart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, device_id: deviceId }),
      });
      const data = await res.json();

      const itemsBackend = data.cartItems ?? data.cart_items ?? data.data ?? [];
      const items = itemsBackend.map((item: any) => normalizeCartItem(item));
      const total = Number(data.total_price ?? data.totalPrice ?? 0);
      const count = Number(data.total_quantity ?? data.total_qty ?? data.totalQuantity ?? 0);
      setCartItems(items);
      setCartTotal(total);
      setCartCount(count);
      persistCart(items, total, count);
    } catch (err) {
      console.error("fetchCartFromBackend error:", err);
    }
  };

  const clearCartFromBackend = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/deleteAllCartItems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, device_id: deviceId }),
      });
      const data = await res.json();
      return (data && (data.status === "1" || data.status === 1));
    } catch (err) {
      console.error("clearCartFromBackend error:", err);
      return false;
    }
  };

  const clearLocalCart = async () => {
    if (userId) await clearCartFromBackend();
    try {
      localStorage.removeItem("liquidity_cart_cache");
      localStorage.removeItem("liquidity_cart_total");
      localStorage.removeItem("liquidity_cart_count");
      localStorage.removeItem("cart_shop_id");
      localStorage.removeItem("guestCart");
    } catch { }
    setCartItems([]);
    setCartCount(0);
    setCartTotal(0);
  };

  const checkShopBeforeAdd = async (item: MenuItem | null, qty: number) => {
    if (!item) return;

    const currentShop = shopId;
    const cartShop = localStorage.getItem("cart_shop_id");

    if (!cartShop) {
      await addToCart(item, qty);
      return;
    }

    if (cartShop !== currentShop) {
      const confirmed = confirm("Your cart has items from another store. Clear cart and continue?");
      if (!confirmed) return;

      await clearLocalCart();
      if (userId) await fetchCartFromBackend();
      await addToCart(item, qty);
      return;
    }

    await addToCart(item, qty);
  };

  const persistCart = (items: CartItem[], total: number, count: number) => {
    try {
      if (userId && userId !== "") {
        localStorage.setItem("liquidity_cart_cache", JSON.stringify(items));
        localStorage.setItem("liquidity_cart_total", String(total));
        localStorage.setItem("liquidity_cart_count", String(count));
      }
    } catch { }
  };

  const addToCart = async (item: MenuItem, qty: number) => {
    if (!item || qty <= 0) {
      toast.success("Please choose a quantity");
      return;
    }

    const isDouble = extraShotQty > 0 ? 1 : 0;
    const doubleShotPrice = extraShotQty > 0 ? item.double_shot_price || 0 : 0;
    const price = extraShotQty > 0 ? item.price + doubleShotPrice * extraShotQty : item.price;

    const localCartItem: LocalCartItem = {
      device_id: deviceId || "",
      user_id: userId,
      cartProductIds: String(item.id),
      cartProductsNames: item.name,
      cartProductPrices: price,
      cartQuantities: qty,
      cartIsLiquors: item.is_double_shot ? "1" : "0",
      units: "1oz",
      is_double_shots: isDouble,
      double_shot_prices: doubleShotPrice * extraShotQty,
      shot_count: extraShotQty,
      choice_of_mixer_names: selectedMixer?.name || "",
      special_instructions: specialInstructions || "",
      shop_id: shopId,
    };

    let localCart: LocalCartItem[] = [];
    try {
      localCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    } catch { }

    const existingIndex = localCart.findIndex(c => c.cartProductIds === localCartItem.cartProductIds);
    if (existingIndex >= 0) {
      localCart[existingIndex].cartQuantities += qty;
    } else {
      localCart.push(localCartItem);
    }
    localStorage.setItem("guestCart", JSON.stringify(localCart));

    if (!userId || userId === "") {
      // Update React cart state for logged out users
      const newCartItems = [...cartItems];
      const existingIdx = newCartItems.findIndex(ci => ci.id === String(item.id));
      if (existingIdx >= 0) {
        newCartItems[existingIdx].quantity += qty;
      } else {
        newCartItems.push({
          id: String(item.id),
          name: item.name,
          price: price,
          quantity: qty,
          is_double_shot: Boolean(isDouble),
          double_shot_price: doubleShotPrice * extraShotQty,
          extraShotQty,
          specialInstructions,
          selectedMixer,
          choice_of_mixer_name: selectedMixer?.name || "",
        });
      }
      const total = newCartItems.reduce((acc, c) => acc + c.price * c.quantity, 0);
      const count = newCartItems.reduce((acc, c) => acc + c.quantity, 0);
      setCartItems(newCartItems);
      setCartTotal(total);
      setCartCount(count);

      toast.success("Item added to cart");
      setSelectedItem(null);
      setModalQty(1);
      setExtraShotQty(0);
      setSelectedMixer(null);
      setTempSelectedMixer(null);
      setSpecialInstructions("");
      return;
    }

    // For logged-in users: send to backend
    const data = {
      device_id: deviceId || "",
      user_id: userId,
      cartProductIds: String(item.id),
      cartProductsNames: item.name,
      cartProductPrices: price,
      cartQuantities: qty,
      cartIsLiquors: item.is_double_shot ? "1" : "0",
      units: "1oz",
      is_double_shots: isDouble,
      double_shot_prices: doubleShotPrice * extraShotQty,
      shot_count: extraShotQty,
      choice_of_mixer_names: selectedMixer?.name || "",
      special_instructions: specialInstructions || "",
    };

    const formBody = new URLSearchParams(data as any).toString();

    try {
      const res = await fetch("/api/addToCart", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody,
      });
      const result = await res.json();
      if (result.status === "1" || result.status === 1) {
        try {
          localStorage.setItem("cart_shop_id", shopId);
        } catch { }

        await fetchCartFromBackend();

        toast.success(result.message || "Item added to cart");

        setSelectedItem(null);
        setModalQty(1);
        setExtraShotQty(0);
        setSelectedMixer(null);
        setTempSelectedMixer(null);
        setSpecialInstructions("");
      } else {
        alert(result.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error("addToCart network error:", err);
      alert("Network error while adding to cart");
    }
  };

  return (
    <>
      {/* Header */}
      <header
        className={classNames(
          styles.outletHeader,
          'header',
          { 'bg-white': headerWhite, 'bg-transparent': !headerWhite }
        )}
      >
        <button
          type="button"
          className={classNames(styles.icon_only, 'icon_only', { 'bg-white': headerWhite, 'bg-transparent': !headerWhite })}
          onClick={handleButtonClick}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className={`${styles.outletTitle} pageTitle transition-colors duration-300 ${headerWhite ? 'text-black opacity-100' : 'text-white opacity-0'}`}>
          Vertige Investment Group Annual Summit
        </div>
      </header>

      {/* Main Page */}
      <section className="pageWrapper">
        <div ref={bannerRef} className={styles.outletBanner}>
          <Image src={bar} alt="" fill />
        </div>
        <div className={styles.outletName}>Welcome to the Vertige Investment Group Annual Summit</div>
        <div ref={AdsRef} className={styles.outletAds}>
          <div>
            <h5>Sign in for a smoother checkout experience!</h5>
            <Link href="/login" className={styles.signInBtn}>Take me there</Link>
          </div>
          <div className="flex items-center justify-center">
            <div className="chevron bg-[#0a4dad] animate-arrow delay-[0ms]" />
            <div className="chevron bg-[#3aa3ff] animate-arrow delay-[200ms]" />
            <div className="chevron bg-[#62e7e1] animate-arrow delay-[400ms]" />
          </div>
        </div>

        {/* Category bar */}
        <div
          className={classNames(
            styles.catMenu,
            "bg-white border-b-4 border-gray-200 overflow-x-auto no-scrollbar w-full z-40 transition-all duration-300",
            {
              "fixed top-[56px] opacity-100 translate-y-0": showCategoryBar,
              "fixed top-[0px] opacity-0 -translate-y-full pointer-events-none": !showCategoryBar,
            }
          )}
        >
          <div className="flex">
            {categories.map(cat => (
              <button
                key={cat.id}
                ref={el => { categoryButtonRefs.current[cat.id] = el; }}
                onClick={() => scrollToSection(cat.id)}
                className={`whitespace-nowrap px-5 py-3 font-medium ${activeCategory === cat.id ? "bg-gray-200 text-black text-gray-600" : "text-gray-600"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu sections */}
        <div className="px-4 pb-20">
          {categories.map(cat => (
            <div key={cat.id} ref={el => setSectionRef(cat.id, el)} className="pt-4 scroll-mt-24">
              <h2 className="text-xl mb-4">{cat.name}</h2>
              <div className="space-y-4">
                {cat.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between w-full">
                    <div className={styles.itemCard}>
                      <figure className="relative h-28 w-28">
                        <Image src={item.image} alt={item.name} fill className="object-cover rounded-lg" />
                      </figure>
                      <div className={styles.itemContent}>
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <div className="flex items-center justify-between">
                          <p className={styles.price}>${item.price.toFixed(2)}</p>
                          <button className={styles.addButton} onClick={() => setSelectedItem(item)}><Plus size={16} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sticky Cart */}
        {cartCount > 0 && (
          <div className={styles.bottomButton}>
            <div className="flex gap-3">
              <button onClick={() => router.push("/login")} className="bg-primary px-4 py-4 rounded-lg w-full text-white flex justify-between items-center">
                <span>({cartCount} items | ${cartTotal.toFixed(2)})</span>
                <span>View Cart</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Item Modal */}
      {selectedItem && (
        <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title="Customization">
          <div className="flex items-center justify-between mb-4">
            <h3>{selectedItem.name}</h3>
            <h3 className={styles.itemPrice}>${selectedItem.price.toFixed(2)}</h3>
          </div>
         {/* Extra Shots */}
          {selectedItem?.is_double_shot ? (
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-blue-200">
              <div>
                <h4>Add Extra Shots</h4>
                <p>${(selectedItem.double_shot_price || 0).toFixed(2)}/additional shot</p>
              </div>
              <QuantityButton min={0} max={5} initialValue={extraShotQty} onChange={setExtraShotQty} />
            </div>
          ) : null}
          {/* Mixer */}
          {selectedItem?.is_add_mixture ? (
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-blue-200">
              <p>Add Mixer (Non-Alcoholic)</p>
              {selectedMixer ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700">{selectedMixer.name} - ${selectedMixer.price}</span>
                  <button className="flex items-center justify-center p-2 rounded-full bg-red-100" onClick={() => setSelectedMixer(null)}>
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              ) : (
                <button className={styles.mixerButton} onClick={() => setShowMixerModal(true)}>
                  <Plus size={16} />
                </button>
              )}
            </div>
          ) : null}
          <h5 className="mb-2">Special Instructions</h5>
          <textarea placeholder="Enter your special instructions here" className={styles.textarea} value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} />
          <div className="flex items-center justify-center mb-3">
            <QuantityButton min={1} max={10} initialValue={modalQty} onChange={setModalQty} />
          </div>
          <button className="w-full bg-primary text-white py-2 rounded-lg" onClick={() => checkShopBeforeAdd(selectedItem!, modalQty)}>
            Add to cart
          </button>
        </Modal>
      )}

      {/* Mixer Modal */}
      <Modal isOpen={showMixerModal} onClose={() => { setShowMixerModal(false); setTempSelectedMixer(null); }} title="Choose a Mixer">
        <div className="grid grid-cols-1 gap-4">
          {mixers.map(mixer => (
            <label key={mixer.id} className={`cursor-pointer border rounded-lg p-3 flex items-center justify-between transition ${tempSelectedMixer?.id === mixer.id ? "border-primary bg-blue-50" : "border-gray-200"}`}>
              <span className="text-sm mr-auto text-center">{mixer.name} - ${mixer.price_display ?? mixer.price}</span>
              <input type="radio" name="mixer" value={mixer.id} checked={tempSelectedMixer?.id === mixer.id} onChange={() => setTempSelectedMixer(mixer)} />
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg" onClick={() => { setShowMixerModal(false); setTempSelectedMixer(null); }}>Cancel</button>
          <button className="bg-primary text-white px-4 py-2 rounded-lg" onClick={() => {
            if (tempSelectedMixer) setSelectedMixer(tempSelectedMixer);
            setTempSelectedMixer(null);
            setShowMixerModal(false);
          }}>Apply</button>
        </div>
      </Modal>

    </>
  );
}
