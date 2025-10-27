'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Thumbs, Navigation, Autoplay } from 'swiper/modules';
import { Swiper as SwiperCore } from 'swiper/types';
import { useRouter } from "next/navigation";
import 'swiper/css';
import 'swiper/css/thumbs';
import 'swiper/css/navigation';
import Image from 'next/image';
import styles from "./home.module.scss";
import BottomNavigation from '@/components/common/BottomNavigation/BottomNavigation';
import Header from '@/components/common/Header/Header';
import { Star, Heart, ChevronRight, SlidersHorizontal, MapPinned } from "lucide-react";
import Link from 'next/link';

import app from '../../../public/images/app.svg';
import date from '../../../public/images/date.svg';
import submit from '../../../public/images/submit_btn.svg';
import event from '../../../public/images/event.png';
import eventbg from '../../../public/images/event_bg.png';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';

export default function NewAccount() {

  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/outlet");
  };

  const slides = [
    { id: 1, img: "/images/banner_10.jpeg", title: "Explore Amazing Places" },
    { id: 2, img: "/images/app.svg", title: "Discover New Adventures" },
    { id: 3, img: "/images/bar.jpg", title: "Discover New Adventures" },
    { id: 4, img: "/images/event.png", title: "Your Journey Begins Here" },
    { id: 5, img: "/images/login_bg.jpg", title: "Dream. Explore. Travel." },
    { id: 6, img: "/images/account_bg.jpg", title: "Dream. Explore. Travel." },
  ];

  const orders = [
    { id: 1, orderid: 'LIQ-241136', title: "Casa Mezcal", ordertime: 'Oct 10, 2025 | 20:01', orderStatus: 'Order Received' },
    { id: 2, orderid: 'LIQ-241136', title: "Casa Mezcal", ordertime: 'Oct 10, 2025 | 20:01', orderStatus: 'Order Received' },
    { id: 3, orderid: 'LIQ-241136', title: "Casa Mezcal", ordertime: 'Oct 10, 2025 | 20:01', orderStatus: 'Order Received' },
    { id: 4, orderid: 'LIQ-241136', title: "Casa Mezcal", ordertime: 'Oct 10, 2025 | 20:01', orderStatus: 'Order Received' },
    { id: 5, orderid: 'LIQ-241136', title: "Casa Mezcal", ordertime: 'Oct 10, 2025 | 20:01', orderStatus: 'Order Received' },
    { id: 6, orderid: 'LIQ-241136', title: "Casa Mezcal", ordertime: 'Oct 10, 2025 | 20:01', orderStatus: 'Order Received' },
  ];

  const bars = [
    { id: 1, img: "/images/bar.jpg", title: "Casa Mezcal", address: '291 King St W, Toronto, ON M5V 1J5' },
    { id: 2, img: "/images/bar.jpg", title: "Casa Mezcal", address: '291 King St W, Toronto, ON M5V 1J5' },
    { id: 3, img: "/images/bar.jpg", title: "Casa Mezcal", address: '291 King St W, Toronto, ON M5V 1J5' },
    { id: 4, img: "/images/bar.jpg", title: "Casa Mezcal", address: '291 King St W, Toronto, ON M5V 1J5' },
    { id: 5, img: "/images/bar.jpg", title: "Casa Mezcal", address: '291 King St W, Toronto, ON M5V 1J5' },
    { id: 6, img: "/images/bar.jpg", title: "Casa Mezcal", address: '291 King St W, Toronto, ON M5V 1J5' },
  ];

  const [showDistanceModal, setShowDistanceModal] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState<{ id: number; name: string } | null>(null);
  const [tempSelectedDistance, setTempSelectedDistance] = useState<{ id: number; name: string } | null>(null);

  const distances = [
    { id: 1, name: "5 km" },
    { id: 2, name: "10 km" },
    { id: 3, name: "15 km" },
    { id: 4, name: "20 km" },
    { id: 5, name: "25 km" },
    { id: 6, name: "30 km" },
    { id: 7, name: "35 km" },
    { id: 8, name: "40 km" },
    { id: 9, name: "45 km" },
    { id: 10, name: "50 km" },
    { id: 11, name: "100 km" },
  ];

  // Handle distance select
  const handleDistanceSelect = (distance: { id: number; name: string }) => {
    setSelectedDistance(distance);
    setShowDistanceModal(false);
  };

  // Remove distance
  const handleRemoveDistance = () => {
    setSelectedDistance(null);
  };

  return (
    <>
      <Header buttonType="menu" />
      <section className='pageWrapper hasHeader hasFooter hasBottomNav'>
        <div className='pageContainer py-4'>

          {/* Banner Slider */}
          <Swiper
            modules={[Thumbs, Navigation, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000 }}
            loop={false}
            spaceBetween={16}
            breakpoints={{
              320: { slidesPerView: 1.05 },
              640: { slidesPerView: 2.2 },
              768: { slidesPerView: 3.3 },
              1024: { slidesPerView: 3.3 },
            }}
            className={styles.bannerSlider}
          >
            {slides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className="relative overflow-hidden rounded-xl shadow-md">
                  <figure className={styles.bannerImage}>
                    <Image src={slide.img} alt={slide.title} fill />
                  </figure>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 px-4">
            <div>
              <figure className={styles.appImage}>
                <Image src={app} alt='' fill />
              </figure>
            </div>
          </div> */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 px-4">
                {/* <Link href='/ongoing-orders' className='bg-primary px-3 py-3 flex justify-center rounded-lg w-full text-white'>Ongoing Orders</Link> */}
                <Link href='/cart' className='bg-black px-3 py-3 flex justify-center rounded-lg w-full text-white'>Ongoing and Past Orders</Link>
          </div>

          {/* Past Orders */}
          {/* <div className='container-fluid'>
            <div className='sectionHeading'>
              <h4 className='section_title'>Past Orders</h4>
            </div>
            <Swiper
              modules={[Thumbs, Navigation, Autoplay]}
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000 }}
              loop={false}
              spaceBetween={16}
              breakpoints={{
                320: { slidesPerView: 1.05 },
                640: { slidesPerView: 2.2 },
                768: { slidesPerView: 3.5 },
                1024: { slidesPerView: 4.5 },
              }}
              className={styles.orderSlider}
            >
              {orders.map((order) => (
                <SwiperSlide key={order.id}>
                  <Link href="/order-status" className={styles.orderCard}>
                    <div>
                      <h3>{order.orderid} - {order.title}</h3>
                      <p>{order.ordertime} - {order.orderStatus}</p>
                    </div>
                    <ChevronRight size={24} color="gray" />
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div> */}

          {/* Bars Section */}
          <div className='container-fluid'>
            <div className='sectionHeading'>
              <h4 className='section_title'>Bars</h4>
              <button
                className={styles.mixerButton}
                onClick={() => setShowDistanceModal(true)}
              >
                <SlidersHorizontal size={20} />
              </button>
            </div>

            <Modal
  isOpen={showDistanceModal}
  onClose={() => setShowDistanceModal(false)}
  title="Choose Distance"
>
  <div className="flex flex-col items-center justify-center">
    <div className="flex items-center gap-2 mb-4">
      <MapPinned size={20} />
      <span className="text-sm font-medium">
        Select Distance:{" "}
        <strong>
          {tempSelectedDistance ? `${tempSelectedDistance.name}` : "0"} km
        </strong>
      </span>
    </div>

    <input
      type="range"
      min="1"
      max="100"
      step="1"
      value={tempSelectedDistance?.id || 0}
      onChange={(e) =>
        setTempSelectedDistance({
          id: Number(e.target.value),
          name: `${e.target.value}`,
        })
      }
      className="w-full accent-primary cursor-pointer"
    />

    <div className="flex justify-between w-full text-xs text-gray-500 mt-2">
      <span>1 km</span>
      <span>100 km</span>
    </div>
  </div>

  <div className="mt-6 flex justify-end gap-3">
    <button
      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
      onClick={() => setShowDistanceModal(false)}
    >
      Cancel
    </button>
    <button
      className="bg-primary text-white px-4 py-2 rounded-lg"
      onClick={() => {
        if (tempSelectedDistance) {
          setSelectedDistance(tempSelectedDistance);
          setShowDistanceModal(false);
        }
      }}
    >
      Confirm
    </button>
  </div>
</Modal>



            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
              {bars.map((bar) => (
                <article key={bar.id}>
                  <Link href="/bars">
                    <figure className={styles.barImage}>
                      <Image src={bar.img} alt={bar.title} fill />
                    </figure>
                  </Link>
                  <figcaption className={styles.barContent}>
                    <div className={styles.left}>
                      <h4>{bar.title}</h4>
                      <p>{bar.address}</p>
                    </div>
                    <div className={styles.right}>
                      <Heart size={16} color="black" />
                      <p>4.4 <Star size={12} color="gray" /> (600+)</p>
                    </div>
                  </figcaption>
                </article>
              ))}
            </div>
          </div>
        </div>
        <Link href="/order-status" className={styles.stickyMessage}>
            <p>You have an Order In-Progress. Click to see your order status.</p>
            <div className={`${styles.progressLayer}`}>
                <div className={styles.progressBar}></div>
            </div>
        </Link>
      </section>
      <BottomNavigation />
    </>
  )
}
