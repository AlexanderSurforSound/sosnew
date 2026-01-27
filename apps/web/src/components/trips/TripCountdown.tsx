'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Sun,
  Waves,
  Umbrella,
  MapPin,
  Clock,
  Palmtree,
  Plane,
  Sparkles,
} from 'lucide-react';

interface TripCountdownProps {
  tripName?: string;
  propertyName: string;
  location: string;
  checkInDate: Date;
  checkOutDate: Date;
  compact?: boolean;
}

interface TimeUnit {
  value: number;
  label: string;
}

export default function TripCountdown({
  tripName,
  propertyName,
  location,
  checkInDate,
  checkOutDate,
  compact = false,
}: TripCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);

      // Check if currently on trip
      if (now >= checkIn && now <= checkOut) {
        setIsLive(true);
        const diff = checkOut.getTime() - now.getTime();
        return {
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        };
      }

      setIsLive(false);
      const diff = checkIn.getTime() - now.getTime();

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [checkInDate, checkOutDate]);

  const nightsCount = Math.ceil(
    (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const motivationalMessages = [
    { days: 30, message: 'Start planning your beach activities!' },
    { days: 14, message: 'Two weeks to paradise!' },
    { days: 7, message: 'One week until your toes are in the sand!' },
    { days: 3, message: 'Almost time to unwind!' },
    { days: 1, message: 'Tomorrow you\'ll be at the beach!' },
    { days: 0, message: 'Today\'s the day! Safe travels!' },
  ];

  const getMessage = () => {
    if (isLive) return 'You\'re on vacation! Enjoy every moment!';
    const msg = motivationalMessages.find((m) => timeLeft.days >= m.days);
    return msg?.message || 'Your beach getaway awaits!';
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-4 ${
          isLive
            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
            : 'bg-gradient-to-r from-ocean-500 to-ocean-600'
        } text-white`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              {isLive ? (
                <Palmtree className="w-5 h-5" />
              ) : (
                <Plane className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-sm text-white/80">
                {isLive ? 'Currently at' : 'Countdown to'}
              </p>
              <p className="font-semibold">{propertyName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{timeLeft.days}</p>
            <p className="text-sm text-white/80">
              {isLive ? 'days left' : 'days to go'}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className={`rounded-2xl overflow-hidden ${
        isLive
          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
          : 'bg-gradient-to-br from-ocean-500 via-ocean-600 to-blue-700'
      }`}
    >
      {/* Header */}
      <div className="p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            {tripName && (
              <p className="text-white/80 text-sm mb-1">{tripName}</p>
            )}
            <h2 className="text-xl font-bold">{propertyName}</h2>
            <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
              <MapPin className="w-4 h-4" />
              {location}
            </div>
          </div>
          {isLive && (
            <div className="px-4 py-2 bg-white/20 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Live Now!</span>
            </div>
          )}
        </div>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { value: timeLeft.days, label: 'Days' },
            { value: timeLeft.hours, label: 'Hours' },
            { value: timeLeft.minutes, label: 'Min' },
            { value: timeLeft.seconds, label: 'Sec' },
          ].map((unit, index) => (
            <motion.div
              key={unit.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/20 backdrop-blur rounded-xl p-4 text-center"
            >
              <motion.p
                key={unit.value}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl sm:text-4xl font-bold"
              >
                {String(unit.value).padStart(2, '0')}
              </motion.p>
              <p className="text-sm text-white/80">{unit.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Message */}
        <div className="bg-white/10 rounded-xl p-4 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-amber-300 flex-shrink-0" />
          <p className="text-white/90">{getMessage()}</p>
        </div>
      </div>

      {/* Trip Details */}
      <div className="bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">Trip Details</span>
          </div>
          <span className="px-3 py-1 bg-ocean-100 text-ocean-700 text-sm font-medium rounded-full">
            {nightsCount} {nightsCount === 1 ? 'night' : 'nights'}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Sun className="w-4 h-4" />
              Check-in
            </div>
            <p className="font-semibold text-gray-900">
              {new Date(checkInDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-sm text-gray-500">After 4:00 PM</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Waves className="w-4 h-4" />
              Check-out
            </div>
            <p className="font-semibold text-gray-900">
              {new Date(checkOutDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-sm text-gray-500">Before 10:00 AM</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
            <MapPin className="w-4 h-4" />
            Get Directions
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
            <Calendar className="w-4 h-4" />
            Add to Calendar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
            <Clock className="w-4 h-4" />
            Check-in Info
          </button>
        </div>
      </div>

      {/* Fun beach animation at bottom */}
      <div className="h-2 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200" />
    </div>
  );
}

// Mini countdown for dashboard/cards
export function MiniCountdown({ checkInDate }: { checkInDate: Date }) {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const now = new Date();
    const checkIn = new Date(checkInDate);
    const diff = checkIn.getTime() - now.getTime();
    setDaysLeft(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
  }, [checkInDate]);

  if (daysLeft === 0) {
    return (
      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
        Today!
      </span>
    );
  }

  return (
    <span className="px-2 py-1 bg-ocean-100 text-ocean-700 text-xs font-medium rounded-full">
      {daysLeft} {daysLeft === 1 ? 'day' : 'days'} away
    </span>
  );
}

// Animated countdown circle
export function CountdownCircle({
  daysLeft,
  totalDays,
}: {
  daysLeft: number;
  totalDays: number;
}) {
  const progress = ((totalDays - daysLeft) / totalDays) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-28 h-28">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="none"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          style={{
            strokeDasharray: circumference,
          }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{daysLeft}</span>
        <span className="text-xs text-gray-500">days</span>
      </div>
    </div>
  );
}
