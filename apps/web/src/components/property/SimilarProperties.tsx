'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';
import type { Property } from '@/types';
import { FavoriteButton } from '@/components/favorites';

interface SimilarPropertiesProps {
  propertyId: string;
  propertyName: string;
  village?: string;
  bedrooms?: number;
  amenities?: string[];
}

interface SimilarProperty extends Property {
  matchReason?: string;
  matchScore?: number;
}

export function SimilarProperties({
  propertyId,
  propertyName,
  village,
  bedrooms,
  amenities,
}: SimilarPropertiesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { data: similarProperties, isLoading } = useQuery({
    queryKey: ['similarProperties', propertyId],
    queryFn: async () => {
      // Try AI-powered recommendations first
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/ai/recommendations`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'similar_properties',
              propertyId,
              limit: 8,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          return data.recommendations as SimilarProperty[];
        }
      } catch {
        // Fall through to basic recommendations
      }

      // Fallback to basic similar properties
      const params = new URLSearchParams();
      if (village) params.set('village', village);
      if (bedrooms) {
        params.set('minBedrooms', Math.max(1, bedrooms - 1).toString());
        params.set('maxBedrooms', (bedrooms + 1).toString());
      }
      params.set('pageSize', '8');
      params.set('exclude', propertyId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/properties?${params}`
      );

      if (!response.ok) throw new Error('Failed to fetch similar properties');

      const data = await response.json();
      return (data.items || []) as SimilarProperty[];
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-semibold">Similar Properties</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-80 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-6 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!similarProperties?.length) {
    return null;
  }

  return (
    <div className="py-12 border-t">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-semibold">You May Also Like</h2>
        </div>

        {/* Scroll Arrows - Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Property Carousel */}
      <div className="relative -mx-4 px-4">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {similarProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="w-80 flex-shrink-0 snap-start"
            >
              <SimilarPropertyCard property={property} />
            </motion.div>
          ))}

          {/* View All Card */}
          <div className="w-80 flex-shrink-0 snap-start">
            <Link
              href={`/properties?village=${village || ''}`}
              className="block h-full bg-gradient-to-br from-ocean-50 to-ocean-100 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:from-ocean-100 hover:to-ocean-200 transition-colors min-h-[300px]"
            >
              <div className="w-16 h-16 bg-ocean-600 rounded-full flex items-center justify-center mb-4">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
              <p className="font-semibold text-gray-900 mb-2">View More Properties</p>
              <p className="text-sm text-gray-600">
                Browse all available rentals{village ? ` in ${village}` : ''}
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimilarPropertyCard({ property }: { property: SimilarProperty }) {
  const primaryImage = property.images?.find((img) => img.isPrimary) || property.images?.[0];

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100"
    >
      {/* Image */}
      <div className="relative aspect-[4/3]">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || property.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="320px"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}

        {/* Favorite Button */}
        <div className="absolute top-3 right-3">
          <FavoriteButton
            property={{
              id: property.id,
              slug: property.slug,
              name: property.name,
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              sleeps: property.sleeps,
              village: property.village?.name,
              primaryImage: primaryImage?.url,
              pricePerNight: property.baseRate,
            } as any}
            variant="icon"
          />
        </div>

        {/* AI Match Badge */}
        {property.matchReason && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-black/70 text-white text-xs px-2 py-1 rounded line-clamp-1">
              <Sparkles className="w-3 h-3 inline mr-1" />
              {property.matchReason}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-ocean-600 transition-colors line-clamp-1 mb-1">
          {property.name}
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          {property.village?.name || 'Hatteras Island'} • {property.bedrooms} BR •{' '}
          Sleeps {property.sleeps}
        </p>

        {/* Price */}
        {property.baseRate && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <span className="text-lg font-semibold text-gray-900">
                ${property.baseRate.toLocaleString()}
              </span>
              <span className="text-gray-500 text-sm"> / night</span>
            </div>
            <span className="text-ocean-600 text-sm font-medium group-hover:underline">
              View →
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
