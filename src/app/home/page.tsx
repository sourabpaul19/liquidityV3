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
import { Star, Heart, ChevronRight } from "lucide-react";
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
        {
            id: 1,
            img: "/images/banner_10.jpeg",
            title: "Explore Amazing Places",
        },
        {
            id: 2,
            img: "/images/bar.jpg",
            title: "Discover New Adventures",
        },
        {
            id: 3,
            img: "/images/event.png",
            title: "Your Journey Begins Here",
        },
        {
            id: 4,
            img: "/images/login_bg.jpg",
            title: "Dream. Explore. Travel.",
        },
        {
            id: 5,
            img: "/images/account_bg.jpg",
            title: "Dream. Explore. Travel.",
        },
    ];

    const orders = [
        {
            id: 1,
            orderid: 'LIQ-241136',
            title: "Casa Mezcal",
            ordertime: 'Oct 10, 2025 | 20:01',
            orderStatus: 'Order Received',
        },
        {
            id: 2,
            orderid: 'LIQ-241136',
            title: "Casa Mezcal",
            ordertime: 'Oct 10, 2025 | 20:01',
            orderStatus: 'Order Received',
        },
        {
            id: 3,
            orderid: 'LIQ-241136',
            title: "Casa Mezcal",
            ordertime: 'Oct 10, 2025 | 20:01',
            orderStatus: 'Order Received',
        },
        {
            id: 4,
            orderid: 'LIQ-241136',
            title: "Casa Mezcal",
            ordertime: 'Oct 10, 2025 | 20:01',
            orderStatus: 'Order Received',
        },
        {
            id: 5,
            orderid: 'LIQ-241136',
            title: "Casa Mezcal",
            ordertime: 'Oct 10, 2025 | 20:01',
            orderStatus: 'Order Received',
        },
        {
            id: 6,
            orderid: 'LIQ-241136',
            title: "Casa Mezcal",
            ordertime: 'Oct 10, 2025 | 20:01',
            orderStatus: 'Order Received',
        },
    ];

    const bars = [
        {
            id: 1,
            img: "/images/bar.jpg",
            title: "Casa Mezcal",
            address: '291 King St W, Toronto, ON M5V 1J5',
        },
        {
            id: 2,
            img: "/images/bar.jpg",
            title: "Casa Mezcal",
            address: '291 King St W, Toronto, ON M5V 1J5',
        },
        {
            id: 3,
            img: "/images/bar.jpg",
            title: "Casa Mezcal",
            address: '291 King St W, Toronto, ON M5V 1J5',
        },
        {
            id: 4,
            img: "/images/bar.jpg",
            title: "Casa Mezcal",
            address: '291 King St W, Toronto, ON M5V 1J5',
        },
        {
            id: 5,
            img: "/images/bar.jpg",
            title: "Casa Mezcal",
            address: '291 King St W, Toronto, ON M5V 1J5',
        },
        {
            id: 6,
            img: "/images/bar.jpg",
            title: "Casa Mezcal",
            address: '291 King St W, Toronto, ON M5V 1J5',
        },
    ];
  return (
    <>
    <Header buttonType="menu" />
    <section className='pageWrapper hasHeader hasFooter'>
        <div className='pageContainer py-4'>
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
                    <Image src={slide.img} alt={slide.title} fill></Image>
                </figure>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 px-4">
          <div>
            <div className={styles.eventBanner}>
                <Image src={event} alt='' fill className="" ></Image>
            </div>
            <form className={styles.eventForm} onSubmit={handleVerify}>
                <span><Image src={date} alt='' fill className="" ></Image></span>
                <input type='text' placeholder='Enter event code here'></input>
                <button type="submit"><Image src={submit} alt='' fill className="" ></Image></button>
            </form>
          </div>
          <div>
            <figure className={styles.appImage}>
                <Image src={app} alt='' fill className="" ></Image>
            </figure>
          </div>
        </div>
        <div className='container-fluid'>
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
        </div>
        <div className='container-fluid'>
            <div className='sectionHeading'>
                <h4 className='section_title'>Bars</h4>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.923077 4.92302C0.678262 4.92302 0.443473 5.02027 0.270363 5.19338C0.0972524 5.36649 0 5.60128 0 5.8461C0 6.09091 0.0972524 6.3257 0.270363 6.49881C0.443473 6.67192 0.678262 6.76918 0.923077 6.76918V4.92302ZM0.923077 17.2307C0.678262 17.2307 0.443473 17.328 0.270363 17.5011C0.0972524 17.6742 0 17.909 0 18.1538C0 18.3986 0.0972524 18.6334 0.270363 18.8065C0.443473 18.9796 0.678262 19.0769 0.923077 19.0769V17.2307ZM8.30769 19.0769C8.55251 19.0769 8.7873 18.9796 8.96041 18.8065C9.13352 18.6334 9.23077 18.3986 9.23077 18.1538C9.23077 17.909 9.13352 17.6742 8.96041 17.5011C8.7873 17.328 8.55251 17.2307 8.30769 17.2307V19.0769ZM23.0769 19.0769C23.3217 19.0769 23.5565 18.9796 23.7296 18.8065C23.9027 18.6334 24 18.3986 24 18.1538C24 17.909 23.9027 17.6742 23.7296 17.5011C23.5565 17.328 23.3217 17.2307 23.0769 17.2307V19.0769ZM15.6923 4.92302C15.4475 4.92302 15.2127 5.02027 15.0396 5.19338C14.8665 5.36649 14.7692 5.60128 14.7692 5.8461C14.7692 6.09091 14.8665 6.3257 15.0396 6.49881C15.2127 6.67192 15.4475 6.76918 15.6923 6.76918V4.92302ZM23.0769 6.76918C23.3217 6.76918 23.5565 6.67192 23.7296 6.49881C23.9027 6.3257 24 6.09091 24 5.8461C24 5.60128 23.9027 5.36649 23.7296 5.19338C23.5565 5.02027 23.3217 4.92302 23.0769 4.92302V6.76918ZM0.923077 6.76918H4.61538V4.92302H0.923077V6.76918ZM0.923077 19.0769H8.30769V17.2307H0.923077V19.0769ZM19.3846 19.0769H23.0769V17.2307H19.3846V19.0769ZM15.6923 6.76918H23.0769V4.92302H15.6923V6.76918ZM18.4615 18.1538C18.4615 18.8882 18.1698 19.5926 17.6504 20.1119C17.1311 20.6313 16.4268 20.923 15.6923 20.923V22.7692C16.9164 22.7692 18.0903 22.2829 18.9559 21.4174C19.8214 20.5518 20.3077 19.3779 20.3077 18.1538H18.4615ZM15.6923 20.923C14.9579 20.923 14.2535 20.6313 13.7342 20.1119C13.2148 19.5926 12.9231 18.8882 12.9231 18.1538H11.0769C11.0769 19.3779 11.5632 20.5518 12.4287 21.4174C13.2943 22.2829 14.4682 22.7692 15.6923 22.7692V20.923ZM12.9231 18.1538C12.9231 17.4193 13.2148 16.715 13.7342 16.1957C14.2535 15.6763 14.9579 15.3846 15.6923 15.3846V13.5384C14.4682 13.5384 13.2943 14.0247 12.4287 14.8902C11.5632 15.7558 11.0769 16.9297 11.0769 18.1538H12.9231ZM15.6923 15.3846C16.4268 15.3846 17.1311 15.6763 17.6504 16.1957C18.1698 16.715 18.4615 17.4193 18.4615 18.1538H20.3077C20.3077 16.9297 19.8214 15.7558 18.9559 14.8902C18.0903 14.0247 16.9164 13.5384 15.6923 13.5384V15.3846ZM11.0769 5.8461C11.0769 6.58054 10.7852 7.28491 10.2658 7.80424C9.7465 8.32357 9.04214 8.61533 8.30769 8.61533V10.4615C9.53177 10.4615 10.7057 9.97522 11.5713 9.10967C12.4368 8.24412 12.9231 7.07017 12.9231 5.8461H11.0769ZM8.30769 8.61533C7.57325 8.61533 6.86888 8.32357 6.34955 7.80424C5.83022 7.28491 5.53846 6.58054 5.53846 5.8461H3.69231C3.69231 7.07017 4.17857 8.24412 5.04412 9.10967C5.90968 9.97522 7.08362 10.4615 8.30769 10.4615V8.61533ZM5.53846 5.8461C5.53846 5.11165 5.83022 4.40729 6.34955 3.88796C6.86888 3.36862 7.57325 3.07687 8.30769 3.07687V1.23071C7.08362 1.23071 5.90968 1.71698 5.04412 2.58253C4.17857 3.44808 3.69231 4.62202 3.69231 5.8461H5.53846ZM8.30769 3.07687C9.04214 3.07687 9.7465 3.36862 10.2658 3.88796C10.7852 4.40729 11.0769 5.11165 11.0769 5.8461H12.9231C12.9231 4.62202 12.4368 3.44808 11.5713 2.58253C10.7057 1.71698 9.53177 1.23071 8.30769 1.23071V3.07687Z" fill="#28303F"/>
                </svg>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
                {bars.map((bar) => (
                    <article key={bar.id}>
                        <Link href="/bars">
                        <figure className={styles.barImage}> 
                            <Image src={bar.img} alt={bar.title} fill className="" ></Image> 
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
    </section>
    <BottomNavigation />
    </>
  )
}
