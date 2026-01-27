'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  Calendar,
  ArrowRight,
  Bell,
  MapPin,
  Users,
  Bed,
  Bath,
  Sparkles,
  PawPrint,
} from 'lucide-react';

interface LastMinuteProperty {
  id: string;
  trackId: string;
  name: string;
  slug: string;
  bedrooms: number;
  bathrooms: number;
  sleeps: number;
  petFriendly: boolean;
  village: { name: string; slug: string };
  images: Array<{ url: string; alt: string }>;
  firstAvailableDate?: string;
  rate?: number;
  availableDays: number;
}

export default function SpecialsPage() {
  const [properties, setProperties] = useState<LastMinuteProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const fetchLastMinute = async () => {
      try {
        const response = await fetch('/api/properties/last-minute');
        const data = await response.json();
        setProperties(data.properties || []);
        setDateRange(data.dateRange || { start: '', end: '' });
      } catch (error) {
        console.error('Failed to fetch last minute properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLastMinute();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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
              <Clock className="w-6 h-6" />
              <span className="font-medium">Last Minute Availability</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Book This Week
            </h1>
            <p className="text-xl text-cyan-100 mb-4">
              These vacation homes have availability in the next 7 days. Perfect for a spontaneous beach getaway.
            </p>
            {dateRange.start && dateRange.end && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm">
                <Calendar className="w-4 h-4" />
                {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
              </div>
            )}

            {/* Alert Signup */}
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 max-w-md mx-auto mt-8">
              <div className="flex items-center gap-3 mb-3">
                <Bell className="w-5 h-5" />
                <span className="font-semibold">Get Last Minute Alerts</span>
              </div>
              <p className="text-sm text-cyan-100 mb-3">
                Be the first to know when new openings become available
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="px-4 py-2 bg-white text-cyan-600 rounded-lg font-semibold hover:bg-cyan-50 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Properties */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-6 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Last Minute Openings</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              All of our properties are currently booked for this week. Check back soon or browse our full catalog.
            </p>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors"
            >
              Browse All Properties
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Available This Week</h2>
                <p className="text-gray-600">{properties.length} homes with immediate availability</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/properties/${property.slug}`}
                    className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gray-100">
                      {property.images[0] ? (
                        <Image
                          src={property.images[0].url}
                          alt={property.images[0].alt}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <span className="px-3 py-1 bg-cyan-600 text-white rounded-full text-xs font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Available Now
                        </span>
                        {property.petFriendly && (
                          <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                            <PawPrint className="w-3 h-3" />
                            Pet Friendly
                          </span>
                        )}
                      </div>

                      {/* Available days badge */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-black/60 backdrop-blur text-white rounded-full text-xs">
                          {property.availableDays} days open
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{property.village.name}</span>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-gray-900 text-lg mb-3 group-hover:text-cyan-600 transition-colors line-clamp-1">
                        {property.name}
                      </h3>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-gray-600 text-sm mb-4">
                        <span className="flex items-center gap-1.5">
                          <Bed className="w-4 h-4 text-gray-400" />
                          {property.bedrooms} beds
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Bath className="w-4 h-4 text-gray-400" />
                          {property.bathrooms} baths
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-gray-400" />
                          {property.sleeps} guests
                        </span>
                      </div>

                      {/* First available date & CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        {property.firstAvailableDate && (
                          <div className="text-sm">
                            <span className="text-gray-500">First available:</span>
                            <span className="font-medium text-gray-900 ml-1">
                              {formatDate(property.firstAvailableDate)}
                            </span>
                          </div>
                        )}
                        <span className="text-cyan-600 font-medium text-sm group-hover:underline flex items-center gap-1">
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Browse All CTA */}
        {properties.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Browse All Properties
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
