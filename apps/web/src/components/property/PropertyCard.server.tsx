/**
 * Property Card - Server Component
 *
 * This is a React Server Component that renders on the server.
 * Zero JavaScript sent to client = instant loading like Wander.
 */

import Image from 'next/image';
import Link from 'next/link';

/**
 * Format village name - only show "Village" suffix for Hatteras Village
 */
function formatVillageName(name: string): string {
  if (name.toLowerCase() === 'hatteras village') {
    return 'Hatteras Village';
  }
  // Remove "Village" suffix from other village names
  return name.replace(/\s+village$/i, '').trim();
}

interface PropertyCardProps {
  property: {
    id: string;
    slug: string;
    name: string;
    headline?: string;
    bedrooms: number;
    bathrooms: number;
    sleeps: number;
    village: { name: string; slug: string };
    petFriendly: boolean;
    images: Array<{ url: string; alt?: string }>;
    baseRate?: number;
  };
  priority?: boolean;
}

export function PropertyCard({ property, priority = false }: PropertyCardProps) {
  const mainImage = property.images[0];

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
      prefetch={true}
    >
      {/* Image Container - Aspect Ratio 4:3 */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {mainImage?.url ? (
          <Image
            src={mainImage.url}
            alt={mainImage.alt || property.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No image</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {property.petFriendly && (
            <span className="bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full">
              🐕 Pet Friendly
            </span>
          )}
        </div>

        {/* Price Badge */}
        {property.baseRate && (
          <div className="absolute bottom-3 right-3">
            <span className="bg-white/95 backdrop-blur-sm font-semibold text-sm px-3 py-1.5 rounded-lg shadow-sm">
              ${property.baseRate.toLocaleString()}
              <span className="text-gray-500 font-normal">/night</span>
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Village - Only show "Village" for Hatteras Village */}
        <p className="text-sm text-primary font-medium mb-1">
          {formatVillageName(property.village.name)}
        </p>

        {/* Name */}
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">
          {property.name}
        </h3>

        {/* Headline */}
        {property.headline && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {property.headline}
          </p>
        )}

        {/* Specs */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {property.bedrooms} BR
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {property.bathrooms} BA
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Sleeps {property.sleeps}
          </span>
        </div>
      </div>
    </Link>
  );
}
