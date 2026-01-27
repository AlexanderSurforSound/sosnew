'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  MessageSquare,
  Star,
} from 'lucide-react';

interface Booking {
  id: string;
  propertyName: string;
  propertySlug: string;
  propertyImage: string;
  village: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  total: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  confirmationCode: string;
}

const mockBookings: Booking[] = [
  {
    id: '1',
    propertyName: 'Oceanfront Paradise',
    propertySlug: 'oceanfront-paradise',
    propertyImage: '/images/properties/oceanfront-1.jpg',
    village: 'Rodanthe',
    checkIn: '2024-07-15',
    checkOut: '2024-07-22',
    guests: 6,
    total: 3150,
    status: 'upcoming',
    confirmationCode: 'SOS-2024-1234',
  },
  {
    id: '2',
    propertyName: 'Sunset Retreat',
    propertySlug: 'sunset-retreat',
    propertyImage: '/images/properties/sunset-1.jpg',
    village: 'Avon',
    checkIn: '2024-03-10',
    checkOut: '2024-03-17',
    guests: 4,
    total: 2275,
    status: 'completed',
    confirmationCode: 'SOS-2024-0892',
  },
  {
    id: '3',
    propertyName: 'Beach Haven',
    propertySlug: 'beach-haven',
    propertyImage: '/images/properties/beach-1.jpg',
    village: 'Buxton',
    checkIn: '2023-08-05',
    checkOut: '2023-08-12',
    guests: 8,
    total: 3675,
    status: 'completed',
    confirmationCode: 'SOS-2023-4521',
  },
];

export default function BookingsPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  const filteredBookings = filter === 'all'
    ? mockBookings
    : mockBookings.filter(b => b.status === filter);

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-ocean-100">View and manage your reservations</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {[
              { href: '/account/profile', label: 'Profile' },
              { href: '/account/bookings', label: 'Bookings', active: true },
              { href: '/account/settings', label: 'Settings' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  item.active
                    ? 'border-ocean-600 text-ocean-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { value: 'all', label: 'All' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as typeof filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f.value
                  ? 'bg-ocean-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You haven't made any reservations yet."
                : `No ${filter} reservations.`}
            </p>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 px-6 py-3 bg-ocean-600 text-white rounded-xl font-semibold hover:bg-ocean-700"
            >
              Browse Properties
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative w-full md:w-64 h-48 md:h-auto">
                    <Image
                      src={booking.propertyImage}
                      alt={booking.propertyName}
                      fill
                      className="object-cover"
                    />
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="capitalize">{booking.status}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Link
                          href={`/properties/${booking.propertySlug}`}
                          className="text-xl font-bold text-gray-900 hover:text-ocean-600"
                        >
                          {booking.propertyName}
                        </Link>
                        <p className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {booking.village}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">{booking.confirmationCode}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Check-in</p>
                        <p className="font-semibold text-gray-900">{formatDate(booking.checkIn)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Check-out</p>
                        <p className="font-semibold text-gray-900">{formatDate(booking.checkOut)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Guests</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {booking.guests}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <p className="text-lg font-bold text-gray-900">
                        ${booking.total.toLocaleString()}
                        <span className="text-sm font-normal text-gray-500"> total</span>
                      </p>
                      <div className="flex gap-2">
                        {booking.status === 'upcoming' && (
                          <>
                            <Link
                              href={`/trips/${booking.id}`}
                              className="px-4 py-2 bg-ocean-600 text-white rounded-lg font-medium hover:bg-ocean-700"
                            >
                              View Trip
                            </Link>
                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                              <MessageSquare className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {booking.status === 'completed' && (
                          <>
                            <button className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200">
                              <Star className="w-4 h-4" />
                              Leave Review
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                              <Download className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
