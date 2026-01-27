'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import {
  CheckCircle,
  Calendar,
  MapPin,
  Users,
  Home,
  Mail,
  Phone,
  Clock,
  Key,
  Download,
  Share2,
  Sparkles,
  ArrowRight,
  Gift,
  Shield,
} from 'lucide-react';
import { api } from '@/lib/api';
import { format, differenceInDays } from 'date-fns';

interface ReservationDetails {
  id: string;
  confirmationCode: string;
  property: {
    name: string;
    slug: string;
    village: string;
    address: string;
    image: string;
  };
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    pets: number;
  };
  totals: {
    accommodation: number;
    cleaning: number;
    serviceFee: number;
    taxes: number;
    addons: number;
    insurance: number;
    total: number;
  };
  payment: {
    amountPaid: number;
    balanceDue: number;
    balanceDueDate: string | null;
  };
  pointsEarned: number;
}

export default function BookingConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const reservationId = params.reservationId as string;
  const justBooked = searchParams.get('booked') === 'true';

  const [reservation, setReservation] = useState<ReservationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(justBooked);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  useEffect(() => {
    async function fetchReservation() {
      try {
        // Mock data for demo
        setReservation({
          id: reservationId,
          confirmationCode: 'SOS-' + reservationId.slice(0, 8).toUpperCase(),
          property: {
            name: 'Oceanfront Paradise',
            slug: 'oceanfront-paradise',
            village: 'Rodanthe',
            address: '23456 NC Highway 12, Rodanthe, NC 27968',
            image: '/images/properties/oceanfront-paradise.jpg',
          },
          checkIn: '2025-03-15',
          checkOut: '2025-03-22',
          guests: { adults: 4, children: 2, pets: 1 },
          totals: {
            accommodation: 2450,
            cleaning: 175,
            serviceFee: 294,
            taxes: 204,
            addons: 185,
            insurance: 157,
            total: 3465,
          },
          payment: {
            amountPaid: 1733,
            balanceDue: 1732,
            balanceDueDate: '2025-02-15',
          },
          pointsEarned: 34650,
        });
      } catch (error) {
        console.error('Failed to fetch reservation:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReservation();
  }, [reservationId]);

  if (isLoading || !reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600" />
      </div>
    );
  }

  const nights = differenceInDays(new Date(reservation.checkOut), new Date(reservation.checkIn));
  const totalGuests = reservation.guests.adults + reservation.guests.children;

  return (
    <div className="min-h-screen bg-gray-50">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#f59e0b', '#fbbf24']}
        />
      )}

      {/* Success Header */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white py-16">
        <div className="container-page text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-500" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold mb-2"
          >
            Booking Confirmed!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-ocean-100 text-lg"
          >
            Your beach vacation is booked. We can't wait to host you!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full"
          >
            <span className="text-sm">Confirmation Code:</span>
            <span className="font-mono font-bold text-lg">{reservation.confirmationCode}</span>
          </motion.div>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="md:flex">
                <div className="relative md:w-1/3 aspect-[4/3] md:aspect-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-ocean-500/20 to-transparent z-10" />
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {reservation.property.name}
                  </h2>
                  <p className="text-gray-500 flex items-center gap-1 mb-4">
                    <MapPin className="w-4 h-4" />
                    {reservation.property.village}, NC
                  </p>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Check-in</p>
                      <p className="font-semibold">
                        {format(new Date(reservation.checkIn), 'EEE, MMM d')}
                      </p>
                      <p className="text-gray-500 text-xs">After 4:00 PM</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Check-out</p>
                      <p className="font-semibold">
                        {format(new Date(reservation.checkOut), 'EEE, MMM d')}
                      </p>
                      <p className="text-gray-500 text-xs">Before 10:00 AM</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="font-semibold">{nights} nights</p>
                      <p className="text-gray-500 text-xs">
                        {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
                        {reservation.guests.pets > 0 && `, ${reservation.guests.pets} pet`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* What's Next */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold mb-4">What's Next?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-ocean-50 rounded-lg">
                  <div className="w-10 h-10 bg-ocean-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-ocean-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Confirmation Email Sent</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Check your inbox for your booking confirmation with all the details.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">7 Days Before Check-in</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      You'll receive check-in instructions with your door code and property details.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Key className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Day of Check-in</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Your unique door code will be activated at 4:00 PM. Just walk in!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Points Earned */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-sm p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">You earned Surf Points!</h3>
                    <p className="text-purple-100">
                      {reservation.pointsEarned.toLocaleString()} points added to your account
                    </p>
                  </div>
                </div>
                <Link
                  href="/account/rewards"
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
                >
                  View Rewards
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="font-semibold mb-4">Payment Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Accommodation</span>
                  <span>${reservation.totals.accommodation.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cleaning fee</span>
                  <span>${reservation.totals.cleaning.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service fee</span>
                  <span>${reservation.totals.serviceFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes</span>
                  <span>${reservation.totals.taxes.toLocaleString()}</span>
                </div>
                {reservation.totals.addons > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Gift className="w-4 h-4" /> Add-ons
                    </span>
                    <span>${reservation.totals.addons.toLocaleString()}</span>
                  </div>
                )}
                {reservation.totals.insurance > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Shield className="w-4 h-4" /> Travel protection
                    </span>
                    <span>${reservation.totals.insurance.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t font-semibold">
                  <span>Total</span>
                  <span>${reservation.totals.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Amount Paid</span>
                  <span className="font-semibold text-green-700">
                    ${reservation.payment.amountPaid.toLocaleString()}
                  </span>
                </div>
                {reservation.payment.balanceDue > 0 && (
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">
                      Balance due {reservation.payment.balanceDueDate
                        ? format(new Date(reservation.payment.balanceDueDate), 'MMM d, yyyy')
                        : 'at check-in'}
                    </span>
                    <span className="font-semibold">
                      ${reservation.payment.balanceDue.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href={`/trips/${reservationId}`}
                  className="flex items-center justify-between p-3 bg-ocean-50 hover:bg-ocean-100 rounded-lg transition-colors"
                >
                  <span className="font-medium text-ocean-700">View Trip Dashboard</span>
                  <ArrowRight className="w-5 h-5 text-ocean-600" />
                </Link>
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="text-gray-700">Download Receipt</span>
                  <Download className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="text-gray-700">Share Trip</span>
                  <Share2 className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="bg-gray-50 rounded-xl p-6 text-center"
            >
              <p className="text-gray-500 text-sm mb-2">Questions about your booking?</p>
              <a
                href="tel:800-237-1138"
                className="flex items-center justify-center gap-2 text-ocean-600 font-medium"
              >
                <Phone className="w-4 h-4" />
                800.237.1138
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
