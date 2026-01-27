import Image from 'next/image';
import { format, differenceInDays } from 'date-fns';
import { Bed, Bath, Users, MapPin } from 'lucide-react';
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
  const nights =
    checkIn && checkOut
      ? differenceInDays(new Date(checkOut), new Date(checkIn))
      : 0;

  const primaryImage = property.images.find((img) => img.isPrimary) || property.images[0];

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
          </div>
        )}

        {/* Price Breakdown */}
        {pricing && nights > 0 && (
          <div className="py-4">
            <h4 className="font-medium mb-3">Price Details</h4>
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
              <div className="flex justify-between font-semibold text-base pt-3 border-t mt-3">
                <span>Total (USD)</span>
                <span>${pricing.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

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
