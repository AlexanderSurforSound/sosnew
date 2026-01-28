'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin,
  Star,
  Phone,
  Waves,
  Heart,
  Users,
  Home,
  ArrowRight,
  Check,
  Sparkles,
  Calendar,
  Car,
  Utensils,
  Sun,
  Wind,
  Fish,
  Camera
} from 'lucide-react';
import HeroSection from '@/components/home/HeroSection';
import { DreamMatcher } from '@/components/search/DreamMatcher';
import { PropertyCard } from '@/components/property/PropertyCard';
import RecentlyViewed from '@/components/property/RecentlyViewed';
import PersonalizedRecommendations from '@/components/property/PersonalizedRecommendations';
import type { Property } from '@/lib/api';

interface HomePageClientProps {
  featuredProperties: Property[];
}

const villages = [
  {
    name: 'Rodanthe',
    slug: 'rodanthe',
    tagline: 'Northern gateway',
    icon: Wind,
    color: 'from-sky-500 to-blue-600',
    highlights: ['Kiteboarding', 'Chicamacomico Station'],
  },
  {
    name: 'Waves',
    slug: 'waves',
    tagline: 'Quiet beaches',
    icon: Waves,
    color: 'from-cyan-500 to-teal-600',
    highlights: ['Surfing', 'Peaceful Setting'],
  },
  {
    name: 'Salvo',
    slug: 'salvo',
    tagline: 'Family favorite',
    icon: Heart,
    color: 'from-rose-500 to-pink-600',
    highlights: ['Family Beaches', 'Sound Access'],
  },
  {
    name: 'Avon',
    slug: 'avon',
    tagline: 'Central hub',
    icon: Utensils,
    color: 'from-amber-500 to-orange-600',
    highlights: ['Restaurants', 'Avon Pier'],
  },
  {
    name: 'Buxton',
    slug: 'buxton',
    tagline: 'Lighthouse village',
    icon: Sun,
    color: 'from-yellow-500 to-amber-600',
    highlights: ['Cape Hatteras Lighthouse', 'Surfing'],
  },
  {
    name: 'Frisco',
    slug: 'frisco',
    tagline: 'Quiet community',
    icon: Camera,
    color: 'from-purple-500 to-violet-600',
    highlights: ['Frisco Pier', 'Native American Museum'],
  },
  {
    name: 'Hatteras Village',
    slug: 'hatteras-village',
    tagline: 'Fishing village',
    icon: Fish,
    color: 'from-emerald-500 to-green-600',
    highlights: ['Charter Fishing', 'Ocracoke Ferry'],
  },
];

const features = [
  {
    icon: Star,
    title: 'Inspected Properties',
    description: 'We know every home we rent. Our team visits properties regularly.',
  },
  {
    icon: Phone,
    title: 'Local Offices',
    description: 'Three locations on Hatteras Island. Open daily 8:30am - 5pm.',
  },
  {
    icon: Users,
    title: 'Local Expertise',
    description: 'Our staff lives on the island. We know the best spots.',
  },
];

const stats = [
  { value: '7', label: 'Villages Served' },
  { value: '3', label: 'Office Locations' },
  { value: 'Daily', label: 'Open 8:30am-5pm' },
  { value: '800.237.1138', label: 'Call Us' },
];


export default function HomePageClient({ featuredProperties }: HomePageClientProps) {
  return (
    <div>
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="container-page">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-cyan-600 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      <RecentlyViewed />

      {/* Personalized Recommendations */}
      <PersonalizedRecommendations />

      {/* AI Dream Matcher */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <DreamMatcher />
          </motion.div>
        </div>
      </section>

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-page">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row md:items-end justify-between mb-10"
            >
              <div>
                <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider mb-2 block">
                  Handpicked for you
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Featured Properties
                </h2>
                <p className="text-gray-600 max-w-xl">
                  Our most popular vacation rentals, loved by thousands of guests
                </p>
              </div>
              <Link
                href="/properties"
                className="hidden md:flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold mt-4 md:mt-0"
              >
                View all properties
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {featuredProperties.slice(0, 10).map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))}
            </div>

            <div className="mt-10 text-center md:hidden">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-colors"
              >
                View All Properties
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Villages Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider mb-2 block">
              Discover your perfect spot
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Seven Unique Villages
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From the kiteboarding haven of Rodanthe to the historic fishing village of Hatteras,
              each community offers its own character and charm.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {villages.map((village, index) => {
              const Icon = village.icon;
              return (
                <motion.div
                  key={village.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/villages/${village.slug}`}
                    className="group block bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100 h-full"
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${village.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-cyan-600 transition-colors">
                      {village.name}
                    </h3>
                    <p className="text-cyan-600 text-sm font-medium mb-3">
                      {village.tagline}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {village.highlights.map((h) => (
                        <span key={h} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {h}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                      <span className="text-sm text-cyan-600 font-medium group-hover:underline">View rentals</span>
                      <ArrowRight className="w-4 h-4 text-cyan-600 ml-1 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 text-center"
          >
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-colors"
            >
              <MapPin className="w-5 h-5" />
              Explore Interactive Map
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider mb-2 block">
              The Surf or Sound difference
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Book Direct With Us?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Local offices, inspected properties, and staff who know the island
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-cyan-50 transition-colors"
                >
                  <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-cyan-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-cyan-600 via-cyan-700 to-blue-800 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cta-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-pattern)" />
          </svg>
        </div>

        <div className="container-page relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Plan Your Beach Vacation?
            </h2>
            <p className="text-cyan-100 text-lg mb-8 max-w-2xl mx-auto">
              Browse our vacation rentals across all seven Hatteras Island villages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/properties"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-cyan-700 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Browse All Properties
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Contact Us
              </Link>
            </div>
            <p className="mt-6 text-cyan-200 text-sm">
              Call us: <a href="tel:800-237-1138" className="font-semibold hover:text-white">800.237.1138</a> • Open daily 8:30am - 5pm
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
