"use client";
import { useRouter } from "next/navigation";
import BottomNavigation from "@/components/common/BottomNavigation/BottomNavigation";
import Header from "@/components/common/Header/Header";
import styles from './outlet-menu.module.scss';
import Image from 'next/image';
import { Plus, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Modal from "@/components/common/Modal/Modal";
import bar from '../../../public/images/bar.jpg';
import QuantityButton from "@/components/common/QuantityButton/QuantityButton";
import Link from "next/link";
import classNames from 'classnames';

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
      {
        id: 5,
        name: "Margarita",
        description: "A cocktail consisting of tequila, triple sec, and lime juice",
        price: 17.0,
        image: "/images/margarita.jpg",
      },
      {
        id: 6,
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
      {
        id: 9,
        name: "Corona",
        description: "Crisp and refreshing lager beer",
        price: 9.0,
        image: "/images/Corona.jpeg",
      },
      {
        id: 10,
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
        id: 11,
        name: "Whiskey",
        description: "Smooth aged whiskey on the rocks",
        price: 12.0,
        image: "/images/whiskey.webp",
      },
      {
        id: 12,
        name: "Whiskey",
        description: "Smooth aged whiskey on the rocks",
        price: 12.0,
        image: "/images/whiskey.webp",
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
    id: "bar-rail",
    name: "Bar Rail",
    items: [
      {
        id: 14,
        name: "Rum Coke",
        description: "Smooth aged whiskey on the rocks",
        price: 12.0,
        image: "/images/rum-and-coke.webp",
      },
      {
        id: 15,
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
        id: 16,
        name: "Mango Pineapple Juice",
        description: "Smooth aged whiskey on the rocks",
        price: 12.0,
        image: "/images/mango-pineapple-juice.jpg",
      },
    ],
  },
];

const OutletPage: React.FC = () => {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeCategory, setActiveCategory] = useState<string>(categories[0].id);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [cartCount, setCartCount] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [modalQty, setModalQty] = useState<number>(1);
  const [cartItems, setCartItems] = useState<{ [key: number]: number }>({});
  const categoryButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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

  // Center active category button in the scroll bar
  useEffect(() => {
    const activeButton = categoryButtonRefs.current[activeCategory];
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: "smooth",
        inline: "center",  // 👈 ensures it scrolls to the center horizontally
        block: "nearest",
      });
    }
  }, [activeCategory]);

  const addToCart = (item: MenuItem, qty: number = 1) => {
    setCartItems((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + qty,
    }));
    setCartCount((prev) => prev + qty);
    setCartTotal((prev) => prev + item.price * qty);
    setSelectedItem(null);
    setModalQty(1);
  };

  const handleQuantityChange = (itemId: number, qty: number, price: number) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (qty <= 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = qty;
      }

      // Recalculate totals
      const newTotal = Object.entries(updated).reduce(
        (sum, [id, q]) => {
          const item = categories.flatMap(c => c.items).find(i => i.id === parseInt(id));
          return sum + (item ? item.price * q : 0);
        },
        0
      );
      const newCount = Object.values(updated).reduce((sum, q) => sum + q, 0);

      setCartTotal(newTotal);
      setCartCount(newCount);

      return updated;
    });
  };


const [showMixerModal, setShowMixerModal] = useState(false);
const [selectedMixer, setSelectedMixer] = useState<{ id: number; name: string; image: string } | null>(null);
const [tempSelectedMixer, setTempSelectedMixer] = useState<{ id: number; name: string; image: string } | null>(null);

const mixers = [
  {
    id: 1,
    name: "Coke",
    image: "/images/coke.jpeg",
  },
  {
    id: 2,
    name: "Sprite",
    image: "/images/sprite.jpg",
  },
  {
    id: 3,
    name: "Soda",
    image: "/images/soda.jpg",
  },
  {
    id: 4,
    name: "Tonic Water",
    image: "/images/tonic.jpg",
  },
  {
    id: 5,
    name: "Red Bull",
    image: "/images/redbull.jpg",
  },
];


// Handle mixer select
const handleMixerSelect = (mixer: { id: number; name: string; image: string }) => {
  setSelectedMixer(mixer); // Pass the object, not just the name
  setShowMixerModal(false);
};


// Remove mixer
const handleRemoveMixer = () => {
  setSelectedMixer(null);
};


  return (
    <>
    

    
      <Header title="Casa Mezcal" />
      <section className='pageWrapper hasHeader hasMenu hasFooter'>
        
        {/* 🧭 Category bar */}
        <div className={`${styles.catMenu} bg-white border-b-4 border-gray-200 overflow-x-auto no-scrollbar w-full z-40 transition-all duration-300`}>
          <div className="flex">
            {categories.map((cat) => (
              <button
                key={cat.id}
                ref={(el) => { categoryButtonRefs.current[cat.id] = el; }}
                onClick={() => scrollToSection(cat.id)}
                className={`whitespace-nowrap px-5 py-3 font-medium ${
                  activeCategory === cat.id
                    ? "bg-gray-200 text-black text-gray-600"
                    : "text-gray-600"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        

        {/* 📜 Menu sections */}
        <div className="px-4 pb-20">
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

                          {cartItems[item.id] ? (
                            <QuantityButton
  min={0}
  max={10}
  initialValue={cartItems[item.id] || 0}
  onChange={(qty) => handleQuantityChange(item.id, qty, item.price)}
  onDelete={() => handleQuantityChange(item.id, 0, item.price)}
/>

                          ) : (
                            <button
                              onClick={() => setSelectedItem(item)}
                              className={styles.addButton}
                            >
                              <Plus size={16} />
                            </button>
                          )}
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
              href="/cart"
              className="bg-primary px-4 py-3 rounded-lg w-full text-white flex justify-between"
            >
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
            <QuantityButton min={1} max={2} onChange={() => {}} />
          </div>

          <div className="flex items-center justify-between mb-4 pb-4 border-b border-blue-200">
  <p>Add Mixer (Optional)</p>

  {selectedMixer ? (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {/* <div className="relative w-8 h-8 rounded overflow-hidden">
          <Image src={selectedMixer.image} alt={selectedMixer.name} fill className="object-cover" />
        </div> */}
        <span className="text-sm text-gray-700">{selectedMixer.name}</span>
      </div>
      <button
        className={`flex items-center justify-center p-2 rounded-full bg-red-100`}
        onClick={() => setSelectedMixer(null)}
      >
        <Trash2 size={16} className="text-red-500" />
      </button>
    </div>
  ) : (
    <button
      className={styles.mixerButton}
      onClick={() => setShowMixerModal(true)}
    >
      <Plus size={16} />
    </button>
  )}
</div>


          <h5 className="mb-2">Special Instructions</h5>
          <form>
            <textarea placeholder="Enter your special instructions here"  className={styles.textarea}></textarea>
          </form>

          <p className="mb-3">
            Any allergies or dietary restrictions must be disclosed in the special instructions; you may be charged for extras.
          </p>
          

          <div className="flex items-center justify-center mb-3">
            <QuantityButton min={1} initialValue={1} max={10} onChange={() => {}} />
            {/* <QuantityButton
              min={1}
              max={10}
              value={modalQty}
              onChange={setModalQty}
            /> */}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              className="w-full bg-primary text-white py-2 rounded-lg"
              onClick={() => addToCart(selectedItem, modalQty)}
            >
              Add to cart
            </button>
          </div>
        </Modal>
      )}

      {/* 🧃 Mixer Selection Modal */}

<Modal
  isOpen={showMixerModal}
  onClose={() => setShowMixerModal(false)}
  title="Choose a Mixer"
>
  <div className="grid grid-cols-1 gap-4">
    {mixers.map((mixer) => (
      <label
        key={mixer.id}
        className={`cursor-pointer border rounded-lg p-3 flex items-center justify-between transition ${
          tempSelectedMixer?.id === mixer.id
            ? "border-primary bg-blue-50"
            : "border-gray-200"
        }`}
      >
        {/* <div className="relative w-10 h-10">
          <Image
            src={mixer.image}
            alt={mixer.name}
            fill
            className="object-cover rounded-md"
          />
        </div> */}
        <span className="text-sm mr-auto text-center">{mixer.name}</span>
        <input
          type="radio"
          name="mixer"
          value={mixer.id}
          checked={tempSelectedMixer?.id === mixer.id}
          onChange={() => setTempSelectedMixer(mixer)}
          className=""
        />
      </label>
    ))}
  </div>

  <div className="mt-6 flex justify-end gap-3">
    <button
      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
      onClick={() => setShowMixerModal(false)}
    >
      Cancel
    </button>
    <button
      className="bg-primary text-white px-4 py-2 rounded-lg"
      onClick={() => {
        if (tempSelectedMixer) {
          setSelectedMixer(tempSelectedMixer);
          setShowMixerModal(false);
        }
      }}
    >
      Confirm
    </button>
  </div>
</Modal>

<BottomNavigation />
    </>
  );
};

export default OutletPage;
