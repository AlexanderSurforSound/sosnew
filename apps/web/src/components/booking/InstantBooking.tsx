/**
 * Instant Booking Widget - Client Component
 *
 * Real-time pricing with SWR for instant updates
 */

'use client';

import { useState, useMemo } from 'react';
import { usePricing } from '@/hooks/useBeacon';
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

  // Fetch real-time pricing using SWR
  const { pricing, isLoading, error } = usePricing(
    checkIn && checkOut && nights >= minNights
      ? { propertyId, checkIn, checkOut, guests, promoCode: promoCode || undefined }
      : null
  );

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
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-1" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        ) : pricing ? (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                ${Math.round(pricing.totalAmount / nights).toLocaleString()}
              </span>
              <span className="text-gray-500">/ night</span>
            </div>
            {pricing.discount && (
              <p className="text-green-600 text-sm font-medium">
                You save ${pricing.discount.savings.toLocaleString()}!
              </p>
            )}
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                ${baseRate?.toLocaleString() || '---'}
              </span>
              <span className="text-gray-500">/ night</span>
            </div>
            <p className="text-gray-500 text-sm">Select dates for total</p>
          </>
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
      {pricing && nights > 0 && (
        <div className="border-t pt-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">
              ${Math.round(pricing.baseRate)} x {nights} nights
            </span>
            <span>${pricing.subtotal.toLocaleString()}</span>
          </div>

          {pricing.fees.map((fee: any) => (
            <div key={fee.name} className="flex justify-between">
              <span className="text-gray-600">{fee.name}</span>
              <span>${fee.calculated.toLocaleString()}</span>
            </div>
          ))}

          <div className="flex justify-between">
            <span className="text-gray-600">Taxes</span>
            <span>${pricing.taxes.toLocaleString()}</span>
          </div>

          {pricing.discount && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({pricing.discount.code})</span>
              <span>-${pricing.discount.savings.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between font-semibold text-base pt-2 border-t">
            <span>Total</span>
            <span>${pricing.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mb-4">
          Unable to calculate pricing. Please try again.
        </p>
      )}

      {/* Minimum Nights Warning */}
      {nights > 0 && nights < minNights && (
        <p className="text-amber-600 text-sm mb-4">
          Minimum stay is {minNights} nights
        </p>
      )}

      {/* Book Button */}
      <button
        disabled={!pricing || nights < minNights}
        className="w-full bg-secondary hover:bg-secondary/90 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {isLoading ? 'Calculating...' : 'Reserve Now'}
      </button>

      <p className="text-center text-xs text-gray-500 mt-3">
        You won't be charged yet
      </p>
    </div>
  );
}
