'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';

export default function RecentlyViewed() {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (recentlyViewed.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container-page">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ocean-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-ocean-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recently Viewed</h2>
              <p className="text-sm text-gray-500">Pick up where you left off</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearRecentlyViewed}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear all
            </button>
            <div className="hidden sm:flex gap-1 ml-4">
              <button
                onClick={() => scroll('left')}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {recentlyViewed.map(({ property, viewedAt }, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-72 snap-start"
            >
              <Link
                href={`/properties/${property.slug}`}
                className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="relative aspect-[16/10]">
                  {property.primaryImage ? (
                    <Image
                      src={property.primaryImage}
                      alt={property.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-ocean-100 to-ocean-200" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white">
                    {formatTimeAgo(viewedAt)}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-ocean-600 transition-colors">
                    {property.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-500">
                      {property.bedrooms} bed · {property.bathrooms} bath
                    </span>
                    {property.pricePerNight && (
                      <span className="text-sm font-semibold text-gray-900">
                        ${property.pricePerNight}/nt
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
