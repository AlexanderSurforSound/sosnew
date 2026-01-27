'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ChevronRight, Sparkles, Loader2, Plane, Users, ClipboardList, FileCheck } from 'lucide-react';
import { api, TripSummary } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function TripsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrips() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getUpcomingTrips();
        setTrips(data);
      } catch (err) {
        setError('Failed to load your trips');
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      fetchTrips();
    }
  }, [user, authLoading]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page py-16">
        <div className="max-w-md mx-auto text-center">
          <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your trips</h1>
          <p className="text-gray-600 mb-6">
            Access your upcoming reservations, check-in information, and trip planning tools.
          </p>
          <Link href="/login" className="btn-primary btn-lg">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Trips</h1>
        <p className="text-gray-600">Manage your upcoming Hatteras Island adventures</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      {trips.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No upcoming trips</h2>
          <p className="text-gray-600 mb-6">
            Ready to plan your next beach getaway? Browse our vacation rentals and start dreaming.
          </p>
          <Link href="/properties" className="btn-primary btn-lg">
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip, index) => (
            <TripCard key={trip.reservationId} trip={trip} index={index} />
          ))}
        </div>
      )}

      {/* Trip Planning Tools Promo */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Trip Planning Tools</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Itinerary Builder Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <ClipboardList className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Itinerary Builder</h3>
            <p className="text-sm text-gray-600 mb-4">
              Plan your perfect vacation day-by-day. Add activities, restaurants, and attractions.
            </p>
            <p className="text-xs text-gray-500">
              Available when viewing a specific trip
            </p>
          </div>

          {/* Group Trip Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Group Coordination</h3>
            <p className="text-sm text-gray-600 mb-4">
              Invite friends and family to collaborate on trip planning, vote on properties, and chat.
            </p>
            <p className="text-xs text-gray-500">
              Available when viewing a specific trip
            </p>
          </div>

          {/* Digital Check-in Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Digital Check-in</h3>
            <p className="text-sm text-gray-600 mb-4">
              Complete your check-in online before you arrive. Get door codes and property info.
            </p>
            <p className="text-xs text-gray-500">
              Available 24 hours before check-in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TripCard({ trip, index }: { trip: TripSummary; index: number }) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        href={`/trips/${trip.reservationId}`}
        className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      >
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0">
            {trip.propertyImage ? (
              <Image
                src={trip.propertyImage}
                alt={trip.propertyName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <MapPin className="w-12 h-12 text-white/50" />
              </div>
            )}

            {/* Current Trip Badge */}
            {trip.isCurrentTrip && (
              <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                Currently On Trip
              </div>
            )}

            {/* Countdown Badge */}
            {!trip.isCurrentTrip && trip.daysUntil > 0 && (
              <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {trip.daysUntil} days to go
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{trip.propertyName}</h3>
                <p className="text-gray-500 flex items-center gap-1 mb-4">
                  <MapPin className="w-4 h-4" />
                  {trip.village || 'Hatteras Island'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(trip.checkIn)} - {formatDate(trip.checkOut)}</span>
              </div>
              <div className={cn(
                'px-2 py-0.5 rounded text-xs font-medium',
                trip.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              )}>
                {trip.status}
              </div>
            </div>

            {trip.isCurrentTrip && (
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  You're on vacation! View your trip dashboard for check-in info, local activities, and more.
                </p>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
