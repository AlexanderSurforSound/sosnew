'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { format, differenceInDays, addDays, isBefore } from 'date-fns';

const MIN_NIGHTS = 3;
import { usePropertyPricing } from '@/hooks/useAvailability';
import { useBookingStore } from '@/stores/bookingStore';
import type { PropertyDetail } from '@/types';

interface BookingWidgetProps {
  property: PropertyDetail;
}

export function BookingWidget({ property }: BookingWidgetProps) {
  const router = useRouter();
  const { setProperty, setDates, setPricing, setGuests, guests } = useBookingStore();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    pricing,
    availability,
    isLoading: isPricingLoading,
  } = usePropertyPricing(property.slug, checkIn, checkOut, guests.adults + guests.children);

  const nights = checkIn && checkOut ? differenceInDays(new Date(checkOut), new Date(checkIn)) : 0;

  const handleCheckInChange = (date: string) => {
    setCheckIn(date);
    if (date) {
      const minCheckout = addDays(new Date(date), MIN_NIGHTS);
      // If checkout is before minimum, update it
      if (!checkOut || isBefore(new Date(checkOut), minCheckout)) {
        setCheckOut(format(minCheckout, 'yyyy-MM-dd'));
      }
    }
  };

  const handleCheckOutChange = (date: string) => {
    if (checkIn) {
      const minCheckout = addDays(new Date(checkIn), MIN_NIGHTS);
      // Ensure checkout is at least MIN_NIGHTS after check-in
      if (isBefore(new Date(date), minCheckout)) {
        setCheckOut(format(minCheckout, 'yyyy-MM-dd'));
        return;
      }
    }
    setCheckOut(date);
  };

  const meetsMinimumNights = nights >= MIN_NIGHTS;

  const handleBookNow = () => {
    if (!checkIn || !checkOut || !pricing) return;

    setIsSubmitting(true);
    setProperty(property);
    setDates(checkIn, checkOut);
    setPricing(pricing);

    router.push(`/book/${property.slug}`);
  };

  const isAvailable = availability?.dates.every((d) => d.isAvailable) ?? false;

  return (
    <div className="bg-white rounded-xl shadow-lg border p-6">
      {/* Price */}
      {property.baseRate && (
        <div className="mb-6">
          <span className="text-2xl font-bold text-gray-900">
            ${property.baseRate.toLocaleString()}
          </span>
          <span className="text-gray-600"> / night</span>
        </div>
      )}

      {/* Date Selection */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-in
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="input pl-10 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-out
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => handleCheckOutChange(e.target.value)}
              min={checkIn ? format(addDays(new Date(checkIn), MIN_NIGHTS), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
              className="input pl-10 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Guest Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Guests
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
            className="input pl-10 pr-10 text-left w-full text-sm"
          >
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            {guests.adults + guests.children} guests
            {guests.pets > 0 && `, ${guests.pets} pet${guests.pets > 1 ? 's' : ''}`}
            {showGuestDropdown ? (
              <ChevronUp className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            )}
          </button>

          {showGuestDropdown && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-lg shadow-lg border p-4 z-50">
              {/* Adults */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="font-medium">Adults</span>
                  <p className="text-sm text-gray-500">Age 13+</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGuests({ adults: Math.max(1, guests.adults - 1) })}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{guests.adults}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setGuests({ adults: Math.min(property.sleeps - guests.children, guests.adults + 1) })
                    }
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <span className="font-medium">Children</span>
                  <p className="text-sm text-gray-500">Ages 2-12</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGuests({ children: Math.max(0, guests.children - 1) })}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{guests.children}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setGuests({ children: Math.min(property.sleeps - guests.adults, guests.children + 1) })
                    }
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Pets */}
              {property.petFriendly && (
                <div className="flex items-center justify-between py-2 border-t">
                  <div>
                    <span className="font-medium">Pets</span>
                    <p className="text-sm text-gray-500">Bring your furry friend</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setGuests({ pets: Math.max(0, guests.pets - 1) })}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{guests.pets}</span>
                    <button
                      type="button"
                      onClick={() => setGuests({ pets: Math.min(2, guests.pets + 1) })}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowGuestDropdown(false)}
                className="mt-4 w-full btn-primary btn-sm"
              >
                Done
              </button>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          This property sleeps up to {property.sleeps} guests
        </p>
      </div>

      {/* Pricing Breakdown */}
      {pricing && nights > 0 && (
        <div className="border-t pt-4 mb-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                ${pricing.baseRate.toLocaleString()} x {nights} nights
              </span>
              <span>${pricing.accommodationTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cleaning fee</span>
              <span>${pricing.cleaningFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service fee</span>
              <span>${pricing.serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxes</span>
              <span>${pricing.taxes.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>Total</span>
              <span>${pricing.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Minimum Nights Warning */}
      {checkIn && checkOut && nights > 0 && !meetsMinimumNights && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-800 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            Minimum stay is {MIN_NIGHTS} nights. Please select a longer stay.
          </p>
        </div>
      )}

      {/* Availability Warning */}
      {checkIn && checkOut && availability && !isAvailable && meetsMinimumNights && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-800 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            Some of the selected dates are not available. Please choose different dates.
          </p>
        </div>
      )}

      {/* Book Button */}
      <button
        onClick={handleBookNow}
        disabled={!checkIn || !checkOut || !pricing || isPricingLoading || !isAvailable || !meetsMinimumNights}
        className="btn-primary btn-lg w-full disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isPricingLoading ? 'Checking availability...' : 'Book Now'}
      </button>

      {/* Minimum nights notice */}
      <p className="text-center text-xs text-gray-500 mt-2">
        {MIN_NIGHTS}-night minimum stay required
      </p>

      {/* Contact */}
      <p className="text-center text-sm text-gray-500 mt-4">
        Questions?{' '}
        <a href="tel:800-237-1138" className="text-primary-600 hover:underline">
          Call us at 800.237.1138
        </a>
      </p>
    </div>
  );
}
