'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Thumbs, Navigation, Autoplay } from 'swiper/modules';
import { useRouter } from 'next/navigation';
import 'swiper/css';
import 'swiper/css/thumbs';
import 'swiper/css/navigation';
import Image from 'next/image';
import styles from './home.module.scss';
import BottomNavigation from '@/components/common/BottomNavigation/BottomNavigation';
import Header from '@/components/common/Header/Header';
import { Star, Heart, SlidersHorizontal, MapPinned } from 'lucide-react';
import Link from 'next/link';
import Modal from '@/components/common/Modal/Modal';

// -------------------------------
// Types
// -------------------------------
interface Banner {
  id: number;
  image: string;
}

interface Shop {
  id: number;
  name: string;
  address: string;
  image: string;
  rating: number;
}

interface Order {
  id: string | number;
  status: number | string;
  sqaure_order_id?: string;
  square_order_status?: string;
}

interface DashboardResponse {
  status: string | number;
  banners?: Banner[];
  shops?: Shop[];
  last_orders?: Order[];
  message?: string;
}

// --------------------------------
// Component
// --------------------------------
export default function HomePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ongoingOrder, setOngoingOrder] = useState<Order | null>(null);

  const [showDistanceModal, setShowDistanceModal] = useState(false);
  const [tempSelectedDistance, setTempSelectedDistance] =
    useState<{ id: number; name: string } | null>(null);

  // --------------------------------
  // Initial load: use cache first, then fetch
  // --------------------------------
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      router.push('/');
      return;
    }

    // 1) Hydrate from localStorage to reduce perceived loading
    const cachedShops = localStorage.getItem('shops');
    if (cachedShops) {
      try {
        const parsed = JSON.parse(cachedShops) as Shop[];
        if (Array.isArray(parsed)) {
          setShops(parsed);
          setLoading(false); // show UI quickly
        }
      } catch {
        // ignore JSON error, will refetch
      }
    }

    // 2) Fetch fresh dashboard data
    const fetchDashboardData = async () => {
      try {
        const dashboardRes = await fetch(
          `https://liquiditybars.com/canada/backend/admin/api/fetchDashboardDataForUsers/${userId}`,
          { cache: 'no-store' }
        );
        const dashboardData: DashboardResponse = await dashboardRes.json();

        if (dashboardData.status === '1' || dashboardData.status === 1) {
          setBanners(dashboardData.banners || []);
          setShops(dashboardData.shops || []);

          if ((dashboardData.shops?.length ?? 0) > 0) {
            localStorage.setItem('shops', JSON.stringify(dashboardData.shops));
          }

          // ✅ Only treat PROPOSED orders as ongoing
          const lastOrders: Order[] = dashboardData.last_orders || [];
          const proposedOrders = lastOrders.filter(
            (o) => o.square_order_status === 'PROPOSED'
          );
          const lastProposedOrder =
            proposedOrders.length > 0
              ? proposedOrders[proposedOrders.length - 1]
              : null;

          setOngoingOrder(lastProposedOrder);
        } else {
          setError(dashboardData.message || 'Failed to load data');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (shops.length === 0) {
          setError('Something went wrong while fetching data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router, shops.length]);

  // --------------------------------
  // Store selected shop
  // --------------------------------
  const handleSelectShop = (shop: Shop) => {
    localStorage.setItem('selected_shop', JSON.stringify(shop));
    router.push(`/bars/${shop.id}`);
  };

  // --------------------------------
  // Loading / Error UI
  // --------------------------------
  if (loading && shops.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error && shops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => router.refresh()}
          className="mt-4 bg-primary text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <Header buttonType="menu" />

      <section className="pageWrapper hasHeader hasFooter">
        <div className="pageContainer py-4">
          {/* Banner Slider */}
          {banners.length > 0 && (
            <Swiper
              modules={[Thumbs, Navigation, Autoplay]}
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
              {banners.map((banner, index) => (
                <SwiperSlide key={banner.id}>
                  <div className="relative overflow-hidden rounded-xl shadow-md">
                    <figure className={styles.bannerImage}>
                      <Image
                        src={banner.image}
                        alt="Banner"
                        fill
                        sizes="100vw"
                        // priority only on first image to reduce load
                        priority={index === 0}
                      />
                    </figure>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 px-4">
            <Link
              href="/ongoing-orders"
              className="bg-black px-3 py-3 flex justify-center rounded-lg w-full text-white"
            >
              Ongoing and Past Orders
            </Link>
          </div>

          {/* Bars Section */}
          <div className="container-fluid mt-6">
            <div className="sectionHeading flex justify-between items-center">
              <h4 className="section_title">Bars</h4>
              <button
                className={styles.mixerButton}
                onClick={() => setShowDistanceModal(true)}
              >
                <SlidersHorizontal size={20} />
              </button>
            </div>

            {/* Distance Modal */}
            <Modal
              isOpen={showDistanceModal}
              onClose={() => setShowDistanceModal(false)}
              title="Choose Distance"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <MapPinned size={20} />
                  <span className="text-sm font-medium">
                    Select Distance:{' '}
                    <strong>
                      {tempSelectedDistance ? `${tempSelectedDistance.name}` : '0'} km
                    </strong>
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="100"
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

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                    onClick={() => setShowDistanceModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-primary text-white px-4 py-2 rounded-lg"
                    onClick={() => setShowDistanceModal(false)}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </Modal>

            {shops.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
                {shops.map((shop) => (
                  <article
                    key={shop.id}
                    onClick={() => handleSelectShop(shop)}
                    className="cursor-pointer"
                  >
                    <figure className={styles.barImage}>
                      <Image
                        src={shop.image}
                        alt={shop.name}
                        fill
                        sizes="100vw"
                        className="rounded-xl object-cover"
                      />
                    </figure>
                    <figcaption className={styles.barContent}>
                      <div className={styles.left}>
                        <h4>{shop.name}</h4>
                        <p>{shop.address}</p>
                      </div>
                      <div className={styles.right}>
                        <Heart size={16} color="black" />
                        <p>
                          {shop.rating} <Star size={12} color="gray" /> (600+)
                        </p>
                      </div>
                    </figcaption>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-4">No bars available.</p>
            )}
          </div>
        </div>

        {/* Sticky Active Order - PROPOSED only */}
        {ongoingOrder && (
          <Link href={`/order-status/${ongoingOrder.id}`} className={styles.stickyMessage}>
            <p>You have an Order In-Progress. Click to see your order status.</p>
            <div className={styles.progressLayer}>
              <div className={styles.progressBar}></div>
            </div>
          </Link>
        )}
      </section>

      <BottomNavigation />
    </>
  );
}
