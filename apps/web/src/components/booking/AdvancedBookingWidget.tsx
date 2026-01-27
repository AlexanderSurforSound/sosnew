'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, ChevronDown, ChevronLeft, ChevronRight, Star, Shield, Clock, AlertCircle } from 'lucide-react';

const MIN_NIGHTS = 3;

interface AdvancedBookingWidgetProps {
  propertyId: string;
  propertyName: string;
  baseRate: number;
  cleaningFee?: number;
  rating?: number;
  reviewCount?: number;
}

interface PricingBreakdown {
  nights: number;
  nightlyRate: number;
  accommodationTotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function AdvancedBookingWidget({
  propertyId,
  propertyName,
  baseRate,
  cleaningFee = 175,
  rating = 4.9,
  reviewCount = 127,
}: AdvancedBookingWidgetProps) {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState({ adults: 2, children: 0, pets: 0 });
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate pricing when dates change
  useEffect(() => {
    if (checkIn && checkOut) {
      setIsCalculating(true);
      // Simulate API call
      setTimeout(() => {
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const accommodationTotal = nights * baseRate;
        const serviceFee = Math.round(accommodationTotal * 0.12);
        const taxes = Math.round((accommodationTotal + cleaningFee + serviceFee) * 0.07);

        setPricing({
          nights,
          nightlyRate: baseRate,
          accommodationTotal,
          cleaningFee,
          serviceFee,
          taxes,
          total: accommodationTotal + cleaningFee + serviceFee + taxes,
        });
        setIsCalculating(false);
      }, 500);
    } else {
      setPricing(null);
    }
  }, [checkIn, checkOut, baseRate, cleaningFee]);

  const formatDate = (date: Date | null) => {
    if (!date) return 'Add date';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateInRange = (date: Date) => {
    if (!checkIn || !checkOut) return false;
    return date > checkIn && date < checkOut;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (!checkIn || (checkIn && checkOut) || date < checkIn) {
      setCheckIn(date);
      setCheckOut(null);
      setSelectingCheckOut(true);
    } else {
      // Ensure minimum nights
      const nights = Math.ceil((date.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      if (nights < MIN_NIGHTS) {
        // Set checkout to minimum nights away
        const minCheckout = new Date(checkIn);
        minCheckout.setDate(minCheckout.getDate() + MIN_NIGHTS);
        setCheckOut(minCheckout);
      } else {
        setCheckOut(date);
      }
      setSelectingCheckOut(false);
      setShowCalendar(false);
    }
  };

  const nights = checkIn && checkOut
    ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const meetsMinimumNights = !checkIn || !checkOut || nights >= MIN_NIGHTS;

  const renderCalendar = () => {
    const { firstDay, daysInMonth } = getDaysInMonth(calendarMonth);
    const cells = [];

    // Empty cells for days before first of month
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
      const disabled = isDateDisabled(date);
      const isCheckIn = checkIn && date.toDateString() === checkIn.toDateString();
      const isCheckOut = checkOut && date.toDateString() === checkOut.toDateString();
      const inRange = isDateInRange(date);

      cells.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={disabled}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
            disabled
              ? 'text-gray-300 cursor-not-allowed'
              : isCheckIn || isCheckOut
              ? 'bg-ocean-600 text-white'
              : inRange
              ? 'bg-ocean-100 text-ocean-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }

    return cells;
  };

  const totalGuests = guests.adults + guests.children;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-2xl font-bold text-gray-900">${baseRate}</span>
            <span className="text-gray-500"> / night</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{rating}</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500">{reviewCount} reviews</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Date Selection */}
        <div
          className="relative border border-gray-300 rounded-xl mb-4 cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => setShowCalendar(true)}
        >
          <div className="grid grid-cols-2 divide-x divide-gray-300">
            <div className="p-3">
              <label className="text-xs font-semibold text-gray-500 uppercase">Check-in</label>
              <p className={`font-medium ${checkIn ? 'text-gray-900' : 'text-gray-400'}`}>
                {formatDate(checkIn)}
              </p>
            </div>
            <div className="p-3">
              <label className="text-xs font-semibold text-gray-500 uppercase">Checkout</label>
              <p className={`font-medium ${checkOut ? 'text-gray-900' : 'text-gray-400'}`}>
                {formatDate(checkOut)}
              </p>
            </div>
          </div>
        </div>

        {/* Calendar Popup */}
        <AnimatePresence>
          {showCalendar && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 mx-4 mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.setMonth(calendarMonth.getMonth() - 1)))}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-semibold">
                  {months[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                </h3>
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.setMonth(calendarMonth.getMonth() + 1)))}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {days.map((day) => (
                  <div key={day} className="h-10 flex items-center justify-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

              <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setCheckIn(null);
                    setCheckOut(null);
                  }}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Clear dates
                </button>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guests Selection */}
        <div className="relative mb-6">
          <button
            onClick={() => setShowGuests(!showGuests)}
            className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
          >
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block text-left">Guests</label>
              <p className="font-medium text-gray-900 text-left">
                {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
                {guests.pets > 0 && `, ${guests.pets} pet${guests.pets !== 1 ? 's' : ''}`}
              </p>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showGuests ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showGuests && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-40 p-4"
              >
                {[
                  { label: 'Adults', key: 'adults' as const, min: 1 },
                  { label: 'Children', key: 'children' as const, min: 0 },
                  { label: 'Pets', key: 'pets' as const, min: 0 },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <span className="font-medium text-gray-900">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setGuests((g) => ({ ...g, [item.key]: Math.max(item.min, g[item.key] - 1) }))
                        }
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50"
                        disabled={guests[item.key] <= item.min}
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-medium">{guests[item.key]}</span>
                      <button
                        onClick={() => setGuests((g) => ({ ...g, [item.key]: g[item.key] + 1 }))}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Minimum Nights Warning */}
        {checkIn && checkOut && !meetsMinimumNights && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-800 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Minimum stay is {MIN_NIGHTS} nights. Please select a longer stay.
            </p>
          </div>
        )}

        {/* Pricing Breakdown */}
        <AnimatePresence>
          {pricing && meetsMinimumNights && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 underline decoration-dotted cursor-help">
                    ${pricing.nightlyRate} × {pricing.nights} nights
                  </span>
                  <span className="text-gray-900">${pricing.accommodationTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 underline decoration-dotted cursor-help">Cleaning fee</span>
                  <span className="text-gray-900">${pricing.cleaningFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 underline decoration-dotted cursor-help">Service fee</span>
                  <span className="text-gray-900">${pricing.serviceFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 underline decoration-dotted cursor-help">Taxes</span>
                  <span className="text-gray-900">${pricing.taxes}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200 font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">${pricing.total}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Book Button */}
        <button
          disabled={!checkIn || !checkOut || isCalculating || !meetsMinimumNights}
          className="w-full py-4 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-xl font-semibold text-lg hover:from-ocean-700 hover:to-ocean-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {isCalculating ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Calculating...
            </span>
          ) : pricing && meetsMinimumNights ? (
            `Reserve · $${pricing.total}`
          ) : (
            'Check availability'
          )}
        </button>

        <p className="text-center text-xs text-gray-500 mt-2">
          {MIN_NIGHTS}-night minimum stay required
        </p>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            Secure booking
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Free cancellation
          </span>
        </div>
      </div>
    </div>
  );
}
