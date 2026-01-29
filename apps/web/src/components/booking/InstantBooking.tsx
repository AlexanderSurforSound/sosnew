/**
 * Instant Booking Widget - Client Component
 *
 * Booking widget for vacation rentals
 */

'use client';

import { useState, useMemo } from 'react';
import { format, addDays, differenceInDays } from 'date-fns';

interface InstantBookingProps {
  propertyId: string;
  propertyName: string;
  baseRate?: number;
  minNights?: number;
}

export function InstantBooking({
  propertyId,
  propertyName,
  baseRate,
  minNights = 2,
}: InstantBookingProps) {
  // Default to next week for 3 nights
  const [checkIn, setCheckIn] = useState<string>(
    format(addDays(new Date(), 7), 'yyyy-MM-dd')
  );
  const [checkOut, setCheckOut] = useState<string>(
    format(addDays(new Date(), 10), 'yyyy-MM-dd')
  );
  const [guests, setGuests] = useState(2);
  const [promoCode, setPromoCode] = useState('');
  const [showPromo, setShowPromo] = useState(false);

  // Calculate nights
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return differenceInDays(new Date(checkOut), new Date(checkIn));
  }, [checkIn, checkOut]);

  // Simple estimated pricing (actual pricing comes from Track PMS during booking)
  const estimatedTotal = useMemo(() => {
    if (!baseRate || nights <= 0) return null;
    const subtotal = baseRate * nights;
    const cleaningFee = 150; // Typical cleaning fee
    const taxes = subtotal * 0.12; // Approximate tax rate
    return {
      subtotal,
      cleaningFee,
      taxes: Math.round(taxes),
      total: Math.round(subtotal + cleaningFee + taxes),
    };
  }, [baseRate, nights]);

  const handleCheckInChange = (date: string) => {
    setCheckIn(date);
    // Auto-adjust checkout if needed
    const newCheckIn = new Date(date);
    const currentCheckOut = new Date(checkOut);
    if (currentCheckOut <= newCheckIn) {
      setCheckOut(format(addDays(newCheckIn, minNights), 'yyyy-MM-dd'));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border p-6 sticky top-24">
      {/* Price Header */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">
            ${baseRate?.toLocaleString() || '---'}
          </span>
          <span className="text-gray-600">/ night</span>
        </div>
        {nights > 0 && nights >= minNights && estimatedTotal ? (
          <p className="text-gray-600 text-sm">Est. total: ${estimatedTotal.total.toLocaleString()}</p>
        ) : (
          <p className="text-gray-600 text-sm">Select dates for total</p>
        )}
      </div>

      {/* Date Selection */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            CHECK-IN
          </label>
          <input
            type="date"
            value={checkIn}
            min={format(new Date(), 'yyyy-MM-dd')}
            onChange={(e) => handleCheckInChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            CHECK-OUT
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkIn ? format(addDays(new Date(checkIn), minNights), 'yyyy-MM-dd') : ''}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Guests */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          GUESTS
        </label>
        <select
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value))}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'guest' : 'guests'}
            </option>
          ))}
        </select>
      </div>

      {/* Promo Code */}
      {showPromo ? (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            PROMO CODE
          </label>
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      ) : (
        <button
          onClick={() => setShowPromo(true)}
          className="text-sm text-primary hover:underline mb-4"
        >
          Have a promo code?
        </button>
      )}

      {/* Price Breakdown */}
      {estimatedTotal && nights > 0 && nights >= minNights && (
        <div className="border-t pt-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">
              ${baseRate} x {nights} nights
            </span>
            <span>${estimatedTotal.subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Cleaning fee</span>
            <span>${estimatedTotal.cleaningFee.toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Taxes (est.)</span>
            <span>${estimatedTotal.taxes.toLocaleString()}</span>
          </div>

          <div className="flex justify-between font-semibold text-base pt-2 border-t">
            <span>Est. Total</span>
            <span>${estimatedTotal.total.toLocaleString()}</span>
          </div>

          <p className="text-xs text-gray-600 italic">
            Final pricing confirmed at checkout
          </p>
        </div>
      )}

      {/* Minimum Nights Warning */}
      {nights > 0 && nights < minNights && (
        <p className="text-amber-600 text-sm mb-4">
          Minimum stay is {minNights} nights
        </p>
      )}

      {/* Book Button */}
      <button
        disabled={nights < minNights}
        className="w-full bg-secondary hover:bg-secondary/90 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        Reserve Now
      </button>

      <p className="text-center text-xs text-gray-600 mt-3">
        You won't be charged yet
      </p>
    </div>
  );
}
