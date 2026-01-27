'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Store,
  Bike,
  Waves,
  Camera,
  Utensils,
  Car,
  Fish,
  Umbrella,
  Star,
  ArrowRight,
  Phone,
  MapPin,
  Clock,
  ShoppingCart,
} from 'lucide-react';

const categories = [
  { id: 'all', label: 'All Services', icon: Store },
  { id: 'rentals', label: 'Beach Rentals', icon: Umbrella },
  { id: 'watersports', label: 'Watersports', icon: Waves },
  { id: 'tours', label: 'Tours & Charters', icon: Fish },
  { id: 'transportation', label: 'Transportation', icon: Car },
  { id: 'dining', label: 'Dining & Catering', icon: Utensils },
];

const services = [
  {
    id: '1',
    name: 'Ocean Atlantic Rentals',
    category: 'rentals',
    description: 'Beach chairs, umbrellas, bikes, kayaks, and more delivered to your rental.',
    rating: 4.9,
    reviews: 234,
    price: 'From $25/day',
    village: 'All Villages',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    featured: true,
  },
  {
    id: '2',
    name: 'Kitty Hawk Kites',
    category: 'watersports',
    description: 'Kiteboarding lessons, hang gliding, kayak tours, and watersports equipment.',
    rating: 4.8,
    reviews: 567,
    price: 'From $75/lesson',
    village: 'Avon',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80',
    featured: true,
  },
  {
    id: '3',
    name: 'Hatteras Harbor Charters',
    category: 'tours',
    description: 'Deep sea fishing, offshore charters, and inshore fishing trips.',
    rating: 4.9,
    reviews: 189,
    price: 'From $600/trip',
    village: 'Hatteras Village',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80',
    featured: true,
  },
  {
    id: '4',
    name: 'Island Grocery Delivery',
    category: 'dining',
    description: 'Pre-stock your rental with groceries before you arrive.',
    rating: 4.7,
    reviews: 145,
    price: 'From $50 + groceries',
    village: 'All Villages',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
    featured: false,
  },
  {
    id: '5',
    name: 'OBX Shuttle',
    category: 'transportation',
    description: 'Airport transfers, island tours, and group transportation.',
    rating: 4.8,
    reviews: 98,
    price: 'From $75/transfer',
    village: 'All Villages',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80',
    featured: false,
  },
  {
    id: '6',
    name: 'Surf Lessons Hatteras',
    category: 'watersports',
    description: 'Professional surf instruction for all ages and skill levels.',
    rating: 4.9,
    reviews: 312,
    price: 'From $65/lesson',
    village: 'Buxton',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&q=80',
    featured: false,
  },
  {
    id: '7',
    name: 'Beach Bonfire Setup',
    category: 'rentals',
    description: 'Complete beach bonfire experience with chairs, s\'mores kit, and cleanup.',
    rating: 5.0,
    reviews: 78,
    price: 'From $150',
    village: 'All Villages',
    image: 'https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=400&q=80',
    featured: false,
  },
  {
    id: '8',
    name: 'Private Chef Services',
    category: 'dining',
    description: 'In-home dining experiences with local seafood specialties.',
    rating: 4.9,
    reviews: 56,
    price: 'From $85/person',
    village: 'All Villages',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=80',
    featured: false,
  },
];

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredServices = activeCategory === 'all'
    ? services
    : services.filter(s => s.category === activeCategory);

  const featuredServices = services.filter(s => s.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Store className="w-6 h-6" />
              <span className="font-medium">Services & Rentals</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Marketplace
            </h1>
            <p className="text-xl text-emerald-100 mb-8">
              Book beach rentals, watersports, fishing charters, and more to make your vacation unforgettable.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Featured Services */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid md:grid-cols-3 gap-6">
          {featuredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="relative h-48">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{service.village}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{service.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="font-medium">{service.rating}</span>
                    <span className="text-gray-400 text-sm">({service.reviews})</span>
                  </div>
                  <span className="font-semibold text-emerald-600">{service.price}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Categories & All Services */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="relative h-40">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                  <MapPin className="w-3 h-3" />
                  <span>{service.village}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                    <span className="font-medium">{service.rating}</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{service.price}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Partner CTA */}
        <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">List Your Business</h2>
              <p className="text-gray-300 mb-6">
                Are you a local business on Hatteras Island? Partner with us to reach thousands of vacation rental guests.
              </p>
              <Link
                href="/contact?subject=marketplace"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Become a Partner
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold">Reach More Guests</p>
                  <p className="text-sm text-gray-400">Exposure to 50,000+ annual visitors</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold">Easy Booking</p>
                  <p className="text-sm text-gray-400">Integrated booking and payments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
