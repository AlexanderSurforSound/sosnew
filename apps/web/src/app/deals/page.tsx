'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Tag,
  Clock,
  Calendar,
  Percent,
  Sparkles,
  ArrowRight,
  Bell,
  MapPin,
  Users,
  Bed,
  Star,
  Flame,
} from 'lucide-react';

const deals = [
  {
    id: '1',
    type: 'flash',
    title: 'Flash Sale: Oceanfront Paradise',
    property: 'Oceanfront Paradise',
    village: 'Buxton',
    discount: 30,
    originalPrice: 350,
    salePrice: 245,
    validUntil: '2024-02-15',
    checkIn: '2024-03-01',
    checkOut: '2024-03-08',
    bedrooms: 4,
    sleeps: 10,
    image: '/images/deals/oceanfront.jpg',
    featured: true,
  },
  {
    id: '2',
    type: 'lastMinute',
    title: 'Last Minute: This Weekend!',
    property: 'Sunset Retreat',
    village: 'Avon',
    discount: 25,
    originalPrice: 280,
    salePrice: 210,
    validUntil: '2024-02-10',
    checkIn: '2024-02-09',
    checkOut: '2024-02-11',
    bedrooms: 3,
    sleeps: 8,
    image: '/images/deals/sunset.jpg',
    featured: true,
  },
  {
    id: '3',
    type: 'earlyBird',
    title: 'Early Bird Summer 2024',
    property: 'Multiple Properties',
    village: 'All Villages',
    discount: 15,
    originalPrice: null,
    salePrice: null,
    validUntil: '2024-03-31',
    checkIn: '2024-06-01',
    checkOut: '2024-08-31',
    bedrooms: null,
    sleeps: null,
    image: '/images/deals/summer.jpg',
    featured: false,
    code: 'SUMMER15',
  },
  {
    id: '4',
    type: 'weekly',
    title: 'Stay 7, Pay 6',
    property: 'Waves Wonder',
    village: 'Waves',
    discount: 14,
    originalPrice: 2100,
    salePrice: 1800,
    validUntil: '2024-04-30',
    checkIn: 'Flexible',
    checkOut: 'Flexible',
    bedrooms: 5,
    sleeps: 12,
    image: '/images/deals/waves.jpg',
    featured: false,
  },
  {
    id: '5',
    type: 'returning',
    title: 'Returning Guest Discount',
    property: 'All Properties',
    village: 'All Villages',
    discount: 10,
    originalPrice: null,
    salePrice: null,
    validUntil: '2024-12-31',
    checkIn: 'Any',
    checkOut: 'Any',
    bedrooms: null,
    sleeps: null,
    image: '/images/deals/returning.jpg',
    featured: false,
    code: 'WELCOME10',
  },
  {
    id: '6',
    type: 'offSeason',
    title: 'Off-Season Escape',
    property: 'Lighthouse View',
    village: 'Hatteras',
    discount: 35,
    originalPrice: 320,
    salePrice: 208,
    validUntil: '2024-02-28',
    checkIn: '2024-02-15',
    checkOut: '2024-02-22',
    bedrooms: 4,
    sleeps: 10,
    image: '/images/deals/lighthouse.jpg',
    featured: false,
  },
];

const dealTypes = [
  { id: 'all', label: 'All Deals', icon: Tag },
  { id: 'flash', label: 'Flash Sales', icon: Flame },
  { id: 'lastMinute', label: 'Last Minute', icon: Clock },
  { id: 'earlyBird', label: 'Early Bird', icon: Calendar },
  { id: 'weekly', label: 'Weekly Specials', icon: Percent },
];

export default function DealsPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredDeals = activeFilter === 'all'
    ? deals
    : deals.filter((deal) => deal.type === activeFilter);

  const featuredDeals = deals.filter((deal) => deal.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-rose-600 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6" />
              <span className="font-medium">Special Offers</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Deals & Discounts
            </h1>
            <p className="text-xl text-rose-100 mb-8">
              Save big on your Hatteras Island vacation with our exclusive offers and last-minute deals.
            </p>

            {/* Alert Signup */}
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 max-w-md mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <Bell className="w-5 h-5" />
                <span className="font-semibold">Get Deal Alerts</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="px-4 py-2 bg-white text-rose-600 rounded-lg font-semibold hover:bg-rose-50 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Featured Deals */}
      {featuredDeals.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="grid md:grid-cols-2 gap-6">
            {featuredDeals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center">
                    <Tag className="w-16 h-16 text-white/30" />
                  </div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-rose-600 text-white rounded-full text-sm font-bold flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      {deal.discount}% OFF
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-black/50 backdrop-blur text-white rounded-full text-sm flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Ends {new Date(deal.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{deal.title}</h3>
                  <p className="text-gray-600 mb-4">{deal.property}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {deal.village}
                    </span>
                    {deal.bedrooms && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        {deal.bedrooms} bed
                      </span>
                    )}
                    {deal.sleeps && (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Sleeps {deal.sleeps}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      {deal.originalPrice && (
                        <>
                          <span className="text-gray-400 line-through text-lg">${deal.originalPrice}</span>
                          <span className="text-2xl font-bold text-gray-900 ml-2">${deal.salePrice}</span>
                          <span className="text-gray-500 text-sm">/night</span>
                        </>
                      )}
                    </div>
                    <Link
                      href={`/properties/${deal.property.toLowerCase().replace(/ /g, '-')}`}
                      className="px-5 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-colors flex items-center gap-2"
                    >
                      Book Now
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2">
          {dealTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveFilter(type.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                activeFilter === type.id
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <type.icon className="w-4 h-4" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* All Deals */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.filter((d) => !d.featured).map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="relative h-40 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <Percent className="w-12 h-12 text-gray-400" />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-rose-600 text-white rounded-full text-xs font-bold">
                    {deal.discount}% OFF
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-gray-900 mb-1">{deal.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{deal.property}</p>

                {deal.code && (
                  <div className="mb-3 p-2 bg-rose-50 rounded-lg border border-rose-100">
                    <span className="text-xs text-rose-600">Use code: </span>
                    <span className="font-mono font-bold text-rose-700">{deal.code}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {deal.village}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Until {new Date(deal.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  {deal.originalPrice ? (
                    <div>
                      <span className="text-gray-400 line-through">${deal.originalPrice}</span>
                      <span className="text-lg font-bold text-gray-900 ml-1">${deal.salePrice}</span>
                      <span className="text-gray-500 text-xs">/night</span>
                    </div>
                  ) : (
                    <span className="text-rose-600 font-semibold">{deal.discount}% off</span>
                  )}
                  <Link
                    href="/properties"
                    className="text-rose-600 font-medium hover:text-rose-700 flex items-center gap-1"
                  >
                    View
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Promo Codes Section */}
        <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Have a Promo Code?</h2>
              <p className="text-gray-300 mb-6">
                Enter your code at checkout to apply your discount. Promo codes can be combined with some offers.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-white"
                />
                <button className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Apply
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold">FIRST10</p>
                  <p className="text-sm text-gray-400">10% off your first booking</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold">REFERRAL20</p>
                  <p className="text-sm text-gray-400">$20 off when referred by a friend</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
