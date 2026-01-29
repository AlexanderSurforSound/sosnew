'use client';

import { useState } from 'react';
import Image from 'next/image';
import { format, differenceInDays } from 'date-fns';
import { Bed, Bath, Users, MapPin, Info, ToggleLeft, ToggleRight } from 'lucide-react';
import type { PropertyDetail, Pricing } from '@/types';

interface BookingSummaryProps {
  property: PropertyDetail;
  checkIn: string | null;
  checkOut: string | null;
  guests: {
    adults: number;
    children: number;
    pets: number;
  };
  pricing: Pricing | null;
}

export function BookingSummary({
  property,
  checkIn,
  checkOut,
  guests,
  pricing,
}: BookingSummaryProps) {
  // Toggle between nightly and weekly rate display
  const [showNightly, setShowNightly] = useState(property.isFlexStay ?? false);

  const nights =
    checkIn && checkOut
      ? differenceInDays(new Date(checkOut), new Date(checkIn))
      : 0;

  const weeks = Math.ceil(nights / 7);
  const primaryImage = property.images.find((img) => img.isPrimary) || property.images[0];

  // Calculate per-night rate for display
  const perNightRate = pricing ? Math.round(pricing.accommodationTotal / nights) : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
      {/* Property Preview */}
      <div className="relative aspect-video">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={property.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        {/* Flex Stay Badge */}
        {property.isFlexStay && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-ocean-600 text-white text-xs font-medium rounded">
            Flex Stay
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{property.name}</h3>
        <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
          <MapPin className="w-4 h-4" />
          {property.village?.name || 'Hatteras Island'}, NC
        </p>

        {/* Property Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 pb-4 border-b">
          <span className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {property.sleeps}
          </span>
        </div>

        {/* Trip Details */}
        {checkIn && checkOut && (
          <div className="py-4 border-b">
            <h4 className="font-medium mb-3">Trip Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Check-in</p>
                <p className="font-medium">
                  {format(new Date(checkIn), 'EEE, MMM d, yyyy')}
                </p>
                <p className="text-gray-500 text-xs">After 4:00 PM</p>
              </div>
              <div>
                <p className="text-gray-500">Check-out</p>
                <p className="font-medium">
                  {format(new Date(checkOut), 'EEE, MMM d, yyyy')}
                </p>
                <p className="text-gray-500 text-xs">Before 10:00 AM</p>
              </div>
            </div>
            <div className="mt-3 text-sm">
              <span className="text-gray-500">Guests:</span>{' '}
              <span className="font-medium">
                {guests.adults + guests.children} guest{guests.adults + guests.children !== 1 ? 's' : ''}
                {guests.pets > 0 && `, ${guests.pets} pet${guests.pets !== 1 ? 's' : ''}`}
              </span>
            </div>
            <div className="mt-1 text-sm">
              <span className="text-gray-500">Duration:</span>{' '}
              <span className="font-medium">
                {nights} night{nights !== 1 ? 's' : ''}
                {!showNightly && ` (${weeks} week${weeks !== 1 ? 's' : ''})`}
              </span>
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        {pricing && nights > 0 && (
          <div className="py-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Price Details</h4>
              {/* Toggle for nightly/weekly view */}
              <button
                onClick={() => setShowNightly(!showNightly)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
              >
                {showNightly ? (
                  <ToggleRight className="w-4 h-4 text-ocean-600" />
                ) : (
                  <ToggleLeft className="w-4 h-4" />
                )}
                <span>{showNightly ? 'Per night' : 'Per week'}</span>
              </button>
            </div>

            <div className="space-y-2 text-sm">
              {/* Accommodation */}
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {showNightly ? (
                    <>
                      ${perNightRate.toLocaleString()} x {nights} night{nights !== 1 ? 's' : ''}
                    </>
                  ) : (
                    <>
                      Rental ({weeks} week{weeks !== 1 ? 's' : ''})
                    </>
                  )}
                </span>
                <span>${pricing.accommodationTotal.toLocaleString()}</span>
              </div>

              {/* Home Service Fee (Cleaning) */}
              <div className="flex justify-between">
                <span className="text-gray-600">Home Service Fee</span>
                <span>${pricing.homeServiceFee.toLocaleString()}</span>
              </div>

              {/* Pet Fee - only show if pets */}
              {pricing.petFee && pricing.petFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Pet Fee {!showNightly && `(${weeks} week${weeks !== 1 ? 's' : ''})`}
                  </span>
                  <span>${pricing.petFee.toLocaleString()}</span>
                </div>
              )}

              {/* Pool Heat - only show if selected */}
              {pricing.poolHeat && pricing.poolHeat > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Pool Heat {!showNightly && `(${weeks} week${weeks !== 1 ? 's' : ''})`}
                  </span>
                  <span>${pricing.poolHeat.toLocaleString()}</span>
                </div>
              )}

              {/* Damage Waiver / Stay Secure */}
              {pricing.damageWaiver && pricing.damageWaiver > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Stay Secure Deposit</span>
                  <span>${pricing.damageWaiver.toLocaleString()}</span>
                </div>
              )}

              {/* Travel Insurance - only show if selected */}
              {pricing.travelInsurance && pricing.travelInsurance > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Travel Insurance</span>
                  <span>${pricing.travelInsurance.toLocaleString()}</span>
                </div>
              )}

              {/* Convenience Fee - only show if applicable */}
              {pricing.convenienceFee && pricing.convenienceFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Convenience Fee</span>
                  <span>${pricing.convenienceFee.toLocaleString()}</span>
                </div>
              )}

              {/* Subtotal */}
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Subtotal</span>
                <span>${pricing.subtotal.toLocaleString()}</span>
              </div>

              {/* Taxes */}
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes</span>
                <span>${pricing.taxes.toLocaleString()}</span>
              </div>

              {/* Total */}
              <div className="flex justify-between font-semibold text-base pt-3 border-t mt-3">
                <span>Total (USD)</span>
                <span>${pricing.total.toLocaleString()}</span>
              </div>

              {/* Per-night breakdown when showing weekly */}
              {!showNightly && nights > 0 && (
                <div className="text-center text-xs text-gray-500 pt-2">
                  ${Math.round(pricing.total / nights).toLocaleString()} per night average
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pricing Note */}
        <div className="flex items-start gap-2 py-3 border-t text-xs text-gray-500">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            Final pricing is calculated by our reservation system and may vary based on
            selected options and promotions.
          </p>
        </div>

        {/* Support */}
        <div className="pt-4 border-t text-center">
          <p className="text-sm text-gray-500">
            Questions? Call us at{' '}
            <a href="tel:800-237-1138" className="text-primary-600 font-medium">
              800.237.1138
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
