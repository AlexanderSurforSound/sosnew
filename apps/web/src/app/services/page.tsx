'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Gift,
  Utensils,
  Sparkles,
  ChevronRight,
  Star,
} from 'lucide-react';
import GiftCards from '@/components/giftcards/GiftCards';
import GroceryPrestock from '@/components/services/GroceryPrestock';
import RestaurantReservations from '@/components/dining/RestaurantReservations';

type ServiceTab = 'groceries' | 'dining' | 'giftcards';

const services = [
  {
    id: 'groceries' as ServiceTab,
    name: 'Grocery Pre-Stocking',
    description: 'Arrive to a fully stocked kitchen',
    icon: ShoppingCart,
    color: 'from-green-500 to-emerald-600',
    popular: true,
  },
  {
    id: 'dining' as ServiceTab,
    name: 'Restaurant Reservations',
    description: 'Book the best local restaurants',
    icon: Utensils,
    color: 'from-orange-500 to-red-600',
    popular: false,
  },
  {
    id: 'giftcards' as ServiceTab,
    name: 'Gift Cards',
    description: 'Give the gift of a beach vacation',
    icon: Gift,
    color: 'from-pink-500 to-rose-600',
    popular: false,
  },
];

export default function ServicesPage() {
  const [activeService, setActiveService] = useState<ServiceTab>('groceries');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6" />
              <span className="text-ocean-100 font-medium">Enhance Your Stay</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Vacation Services & Extras
            </h1>
            <p className="text-xl text-ocean-100">
              Make your Hatteras Island getaway even more special with our curated services and local partnerships.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Service Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid sm:grid-cols-3 gap-4">
          {services.map((service, index) => (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveService(service.id)}
              className={`relative bg-white rounded-2xl p-6 text-left shadow-lg hover:shadow-xl transition-all group ${
                activeService === service.id ? 'ring-2 ring-ocean-500' : ''
              }`}
            >
              {service.popular && (
                <div className="absolute -top-2 -right-2">
                  <span className="flex items-center gap-1 px-2 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
                    <Star className="w-3 h-3" />
                    Popular
                  </span>
                </div>
              )}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <service.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
              <p className="text-sm text-gray-500">{service.description}</p>
              <ChevronRight className={`absolute bottom-6 right-6 w-5 h-5 transition-colors ${
                activeService === service.id ? 'text-ocean-600' : 'text-gray-300'
              }`} />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Service Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          key={activeService}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeService === 'groceries' && <GroceryPrestock />}
          {activeService === 'dining' && <RestaurantReservations />}
          {activeService === 'giftcards' && <GiftCards />}
        </motion.div>
      </div>

      {/* Why Book Services */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Why Book Through Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Local Partnerships',
                description: 'We work with trusted local businesses to bring you the best services and experiences.',
              },
              {
                title: 'Seamless Experience',
                description: 'All services are coordinated with your stay for a hassle-free vacation.',
              },
              {
                title: 'Guest Discounts',
                description: 'Exclusive pricing and perks only available to our vacation rental guests.',
              },
            ].map((benefit, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-ocean-600 font-bold text-xl">{i + 1}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
