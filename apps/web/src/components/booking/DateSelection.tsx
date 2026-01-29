'use client';

import { useState, useEffect } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { format, differenceInDays, addDays, isBefore } from 'date-fns';

const MIN_NIGHTS = 3;
import { usePropertyPricing } from '@/hooks/useAvailability';
import { useBookingStore } from '@/stores/bookingStore';
import type { PropertyDetail, Pricing } from '@/types';

interface DateSelectionProps {
  property: PropertyDetail;
  initialCheckIn?: string;
  initialCheckOut?: string;
  onComplete: (checkIn: string, checkOut: string, pricing: Pricing) => void;
}

export function DateSelection({
  property,
  initialCheckIn,
  initialCheckOut,
  onComplete,
}: DateSelectionProps) {
  const { setDates } = useBookingStore();
  const [checkIn, setCheckIn] = useState(initialCheckIn || '');
  const [checkOut, setCheckOut] = useState(initialCheckOut || '');

  const {
    pricing,
    availability,
    isLoading,
  } = usePropertyPricing(property.slug, checkIn, checkOut);

  const nights = checkIn && checkOut ? differenceInDays(new Date(checkOut), new Date(checkIn)) : 0;
  const isAvailable = availability?.dates.every((d) => d.isAvailable) ?? false;
  const meetsMinimumNights = nights >= MIN_NIGHTS;

  const handleCheckInChange = (date: string) => {
    setCheckIn(date);
    if (date) {
      const minCheckout = addDays(new Date(date), MIN_NIGHTS);
      // If checkout is before minimum, update it
      if (!checkOut || isBefore(new Date(checkOut), minCheckout)) {
        const checkoutStr = format(minCheckout, 'yyyy-MM-dd');
        setCheckOut(checkoutStr);
        setDates(date, checkoutStr);
      } else {
        setDates(date, checkOut);
      }
    } else {
      setDates(date, checkOut);
    }
  };

  const handleCheckOutChange = (date: string) => {
    if (checkIn) {
      const minCheckout = addDays(new Date(checkIn), MIN_NIGHTS);
      // Ensure checkout is at least MIN_NIGHTS after check-in
      if (isBefore(new Date(date), minCheckout)) {
        const checkoutStr = format(minCheckout, 'yyyy-MM-dd');
        setCheckOut(checkoutStr);
        setDates(checkIn, checkoutStr);
        return;
      }
    }
    setCheckOut(date);
    setDates(checkIn, date);
  };

  const handleContinue = () => {
    if (checkIn && checkOut && pricing && isAvailable) {
      onComplete(checkIn, checkOut, pricing);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Select Your Dates</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-in Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="input pl-10"
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">Check-in after 4:00 PM</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-out Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => handleCheckOutChange(e.target.value)}
              min={checkIn ? format(addDays(new Date(checkIn), MIN_NIGHTS), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
              className="input pl-10"
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">Check-out before 10:00 AM</p>
        </div>
      </div>

      {/* Minimum Nights Warning */}
      {checkIn && checkOut && nights > 0 && !meetsMinimumNights && (
        <div className="flex items-start gap-2 p-4 bg-amber-50 text-amber-800 rounded-lg mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Minimum stay is {MIN_NIGHTS} nights</p>
            <p className="text-sm">Please select a longer stay.</p>
          </div>
        </div>
      )}

      {/* Availability Warning */}
      {checkIn && checkOut && availability && !isAvailable && meetsMinimumNights && (
        <div className="flex items-start gap-2 p-4 bg-amber-50 text-amber-800 rounded-lg mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Some dates are not available</p>
            <p className="text-sm">Please choose different dates for your stay.</p>
          </div>
        </div>
      )}

      {/* Pricing Preview */}
      {pricing && nights > 0 && isAvailable && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-3">Price Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Rental ({pricing.weeks} week{pricing.weeks !== 1 ? 's' : ''})</span>
              <span>${pricing.accommodationTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Home Service Fee</span>
              <span>${pricing.homeServiceFee.toLocaleString()}</span>
            </div>
            {pricing.damageWaiver && (
              <div className="flex justify-between">
                <span>Stay Secure Deposit</span>
                <span>${pricing.damageWaiver.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Taxes</span>
              <span>${pricing.taxes.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>Total</span>
              <span>${pricing.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleContinue}
        disabled={!checkIn || !checkOut || !pricing || isLoading || !isAvailable || !meetsMinimumNights}
        className="btn-primary btn-lg w-full disabled:bg-gray-300"
      >
        {isLoading ? 'Checking availability...' : 'Continue to Guest Information'}
      </button>

      <p className="text-center text-xs text-gray-600 mt-2">
        {MIN_NIGHTS}-night minimum stay required
      </p>
    </div>
  );
}
