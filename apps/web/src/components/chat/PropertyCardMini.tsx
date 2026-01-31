'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bed, Bath, Users, PawPrint, MapPin } from 'lucide-react';
import type { PropertyResult } from '@/hooks/useAgentChat';

interface PropertyCardMiniProps {
  property: PropertyResult;
}

export function PropertyCardMini({ property }: PropertyCardMiniProps) {
  return (
    <Link
      href={`/properties/${property.slug}`}
      className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="flex">
        {/* Image */}
        <div className="relative w-24 h-24 flex-shrink-0">
          {property.primaryImage ? (
            <Image
              src={property.primaryImage}
              alt={property.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-xs">No image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-2 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 truncate">{property.name}</h4>

          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{property.village}</span>
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Bed className="w-3 h-3" />
              {property.bedrooms}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-3 h-3" />
              {property.bathrooms}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {property.sleeps}
            </span>
            {property.petFriendly && (
              <span className="flex items-center gap-1 text-green-600">
                <PawPrint className="w-3 h-3" />
              </span>
            )}
          </div>

          {property.baseRate && (
            <p className="text-sm font-semibold text-cyan-600 mt-1">
              ${property.baseRate.toLocaleString()}/wk
            </p>
          )}
        </div>
      </div>

      {/* Amenity highlights */}
      {property.amenityHighlights.length > 0 && (
        <div className="px-2 pb-2">
          <div className="flex flex-wrap gap-1">
            {property.amenityHighlights.slice(0, 3).map((amenity, i) => (
              <span
                key={i}
                className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}
    </Link>
  );
}
