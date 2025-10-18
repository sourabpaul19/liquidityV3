"use client";
import BottomNavigation from "@/components/common/BottomNavigation/BottomNavigation";
import Header from "@/components/common/Header/Header";
import styles from './outlet-menu.module.scss';
import Image from 'next/image';
import { Plus } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Modal from "@/components/common/Modal/Modal";
import QuantityButton from "@/components/common/QuantityButton/QuantityButton";
import Link from "next/link";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

const categories: Category[] = [
  {
    id: "speciality",
    name: "Specialty Cocktails",
    items: [
      {
        id: 1,
        name: "Margarita",
        description: "A cocktail consisting of tequila, triple sec, and lime juice",
        price: 17.0,
        image: "/images/margarita.jpg",
      },
      {
        id: 2,
        name: "Margarita",
        description: "A cocktail consisting of tequila, triple sec, and lime juice",
        price: 17.0,
        image: "/images/margarita.jpg",
      },
      {
        id: 3,
        name: "Margarita",
        description: "A cocktail consisting of tequila, triple sec, and lime juice",
        price: 17.0,
        image: "/images/margarita.jpg",
      },
      {
        id: 4,
        name: "Margarita",
        description: "A cocktail consisting of tequila, triple sec, and lime juice",
        price: 17.0,
        image: "/images/margarita.jpg",
      },
    ],
  },
  {
    id: "beer",
    name: "Beer",
    items: [
      {
        id: 5,
        name: "Corona",
        description: "Crisp and refreshing lager beer",
        price: 9.0,
        image: "/images/Corona.jpeg",
      },
      {
        id: 6,
        name: "Corona",
        description: "Crisp and refreshing lager beer",
        price: 9.0,
        image: "/images/Corona.jpeg",
      },
      {
        id: 7,
        name: "Corona",
        description: "Crisp and refreshing lager beer",
        price: 9.0,
        image: "/images/Corona.jpeg",
      },
      {
        id: 8,
        name: "Corona",
        description: "Crisp and refreshing lager beer",
        price: 9.0,
        image: "/images/Corona.jpeg",
      },
    ],
  },
  {
    id: "liquor",
    name: "Liquor",
    items: [
      {
        id: 9,
        name: "Whiskey",
        description: "Smooth aged whiskey on the rocks",
        price: 12.0,
        image: "/images/whiskey.webp",
      },
      {
        id: 10,
        name: "Whiskey",
        description: "Smooth aged whiskey on the rocks",
        price: 12.0,
        image: "/images/whiskey.webp",
      },
      {
        id: 11,
        name: "Whiskey",
        description: "Smooth aged whiskey on the rocks",
        price: 12.0,
        image: "/images/whiskey.webp",
      },
    ],
  },
  {
    id: "bar-rail",
    name: "Bar Rail",
    items: [
      {
        id: 12,
        name: "Rum Coke",
        description: "Smooth aged whiskey on the rocks",
        price: 12.0,
        image: "/images/rum-and-coke.webp",
      },
      {
        id: 13,
        name: "Whiskey",
        description: "Smooth aged whiskey on the rocks",
        price: 12.0,
        image: "/images/whiskey.webp",
      },
    ],
  },
  {
    id: "non-alcoholic",
    name: "Non Alcoholic",
    items: [
      {
        id: 14,
        name: "Mango Pineapple Juice",
        description: "Smooth aged whiskey on the rocks",
        price: 12.0,
        image: "/images/mango-pineapple-juice.jpg",
      },
    ],
  },
];

const MenuPage: React.FC = () => {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeCategory, setActiveCategory] = useState<string>(categories[0].id);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [cartCount, setCartCount] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

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
          const { offsetTop, offsetHeight } = section;
          if (scrollY >= offsetTop && scrollY < offsetTop + offsetHeight) {
            setActiveCategory(cat.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const addToCart = (price: number) => {
    setCartCount((prev) => prev + 1);
    setCartTotal((prev) => prev + price);
    setSelectedItem(null);
  };

  const handleQuantityChange = (qty: number) => {
    console.log("Quantity changed:", qty);
  };

  return (
    <>
      <Header title="Casa Mezcal" />

      <section className='page_content padding_top'>
        {/* 🧭 Category bar */}
        <div className={`${styles.catMenu} bg-white overflow-x-auto no-scrollbar`}>
          <div className="flex space-x-6 px-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToSection(cat.id)}
                className={`whitespace-nowrap pb-2 font-medium ${
                  activeCategory === cat.id
                    ? "color-primary border-b-2 border-primary"
                    : "text-gray-600"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 📜 Menu sections */}
        <div className="px-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              ref={(el) => {
                sectionRefs.current[cat.id] = el;
              }}
              className="pt-4 scroll-mt-24"
            >
              <h2 className="text-xl mb-4">{cat.name}</h2>
              <div className="space-y-4">
                {cat.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between w-full">
                    <div className={styles.itemCard}>
                      <figure>
                        <Image src={item.image} alt={item.name} fill />
                      </figure>
                      <div className={styles.itemContent}>
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <div className="flex items-center justify-between">
                          <p className={styles.price}>${item.price.toFixed(2)}</p>
                          <button
                            onClick={() => setSelectedItem(item)}
                            className={styles.addButton}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 🛒 Sticky Cart Bar */}
        {cartCount > 0 && (
          <div className={styles.bottomButton}>
            <Link
             href='/cart' className="w-full bg-primary text-white py-2 rounded-lg flex justify-between px-4">
              <span>
                {cartCount} item{cartCount > 1 && "s"} | ${cartTotal.toFixed(2)}
              </span>
              <span>View Cart</span>
            </Link>
          </div>
        )}
      </section>

      {/* 🍹 Item Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title="Customization"
        >
          <div className="flex items-center justify-between mb-4">
            <h3>{selectedItem.name}</h3>
            <h3 className={styles.itemPrice}>${selectedItem.price.toFixed(2)}</h3>
          </div>
          <p className="mb-3">Item Description: {selectedItem.description}</p>
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-blue-200">
            <div>
              <h4>Add Extra Shots</h4>
              <p>$10.00/additional shot</p>
            </div>
            <QuantityButton min={1} max={10} onChange={handleQuantityChange} />
          </div>
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-blue-200">
            <p>Add Mixer (Optional)</p>
            <button className={styles.mixerButton} ><Plus size={16} /></button>
          </div>
          <h5 className="mb-2">Special Instructions</h5>
          <form>
            <textarea placeholder="Enter your special instructions here" className="textarea"></textarea>
          </form>
          <p className="mb-3">Any allergies or dietary restrictions must be disclosed in the special instructions; you may be charged for extras.</p>
          <div className="flex items-center justify-center mb-3">
            <QuantityButton min={1} max={10} onChange={handleQuantityChange} />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <button
              className="w-full bg-primary text-white py-2 rounded-lg"
              onClick={() => addToCart(selectedItem.price)}
            >
              Add to cart
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default MenuPage;
