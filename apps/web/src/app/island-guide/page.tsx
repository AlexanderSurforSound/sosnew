'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Map,
  Utensils,
  Calendar,
  Waves,
  Camera,
  Fish,
  Sun,
  Wind,
  Heart,
  ArrowRight,
  MapPin,
} from 'lucide-react';

const villages = [
  { name: 'Rodanthe', slug: 'rodanthe', description: 'Northern gateway with amazing kiteboarding' },
  { name: 'Waves', slug: 'waves', description: 'Quiet beaches and peaceful setting' },
  { name: 'Salvo', slug: 'salvo', description: 'Family-friendly with sound access' },
  { name: 'Avon', slug: 'avon', description: 'Central hub with restaurants and Avon Pier' },
  { name: 'Buxton', slug: 'buxton', description: 'Home of Cape Hatteras Lighthouse' },
  { name: 'Frisco', slug: 'frisco', description: 'Quiet community with Native American Museum' },
  { name: 'Hatteras Village', slug: 'hatteras-village', description: 'Historic fishing village' },
];

const categories = [
  { id: 'all', label: 'All', icon: Map },
  { id: 'dining', label: 'Dining', icon: Utensils },
  { id: 'activities', label: 'Activities', icon: Waves },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'attractions', label: 'Attractions', icon: Camera },
  { id: 'fishing', label: 'Fishing', icon: Fish },
];

const highlights = [
  {
    title: 'Cape Hatteras Lighthouse',
    category: 'attractions',
    village: 'Buxton',
    description: 'America\'s tallest brick lighthouse. Climb 257 steps for panoramic views.',
    image: '/images/lighthouse.jpg',
  },
  {
    title: 'Avon Pier',
    category: 'fishing',
    village: 'Avon',
    description: 'Premier fishing pier with tackle shop and daily catches.',
    image: '/images/avon-pier.jpg',
  },
  {
    title: 'Canadian Hole',
    category: 'activities',
    village: 'Buxton',
    description: 'World-famous kiteboarding and windsurfing destination.',
    image: '/images/canadian-hole.jpg',
  },
  {
    title: 'Hatteras Ferry',
    category: 'attractions',
    village: 'Hatteras Village',
    description: 'Free ferry to Ocracoke Island. A scenic 40-minute ride.',
    image: '/images/ferry.jpg',
  },
];

export default function IslandGuidePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeVillage, setActiveVillage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Map className="w-6 h-6" />
              <span className="font-medium">Discover Hatteras Island</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Island Guide
            </h1>
            <p className="text-xl text-cyan-100 mb-8">
              Everything you need to know about dining, activities, events, and attractions on Hatteras Island.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Interactive Map Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore the Seven Villages</h2>
          <div className="grid md:grid-cols-7 gap-4">
            {villages.map((village) => (
              <button
                key={village.slug}
                onClick={() => setActiveVillage(activeVillage === village.slug ? null : village.slug)}
                className={`p-4 rounded-xl text-left transition-all ${
                  activeVillage === village.slug
                    ? 'bg-cyan-600 text-white shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                }`}
              >
                <div className="font-semibold mb-1">{village.name}</div>
                <div className={`text-xs ${activeVillage === village.slug ? 'text-cyan-100' : 'text-gray-500'}`}>
                  {village.description}
                </div>
              </button>
            ))}
          </div>

          {activeVillage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 pt-6 border-t"
            >
              <Link
                href={`/villages/${activeVillage}`}
                className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium"
              >
                View {villages.find(v => v.slug === activeVillage)?.name} Properties
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Highlights Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights
            .filter(h => activeCategory === 'all' || h.category === activeCategory)
            .map((highlight, index) => (
              <motion.div
                key={highlight.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-white/30" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{highlight.village}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{highlight.title}</h3>
                  <p className="text-sm text-gray-600">{highlight.description}</p>
                </div>
              </motion.div>
            ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-colors"
          >
            Find Your Perfect Rental
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
