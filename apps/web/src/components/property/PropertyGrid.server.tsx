/**
 * Property Grid - Streaming Server Component
 *
 * Fetches and streams properties from Track PMS via GraphQL.
 * Uses React Server Components for zero client JS overhead.
 */

import { Suspense } from 'react';
import { PropertyCard } from './PropertyCard.server';
import { PropertyCardSkeleton } from '../skeletons/PropertyCardSkeleton';

interface PropertyGridProps {
  village?: string;
  limit?: number;
  featured?: boolean;
}

// Fetch properties on server
async function getProperties(options: PropertyGridProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const query = `
    query GetProperties($page: Int, $pageSize: Int, $village: String) {
      properties(page: $page, pageSize: $pageSize, village: $village) {
        properties {
          id
          trackId
          slug
          name
          headline
          bedrooms
          bathrooms
          sleeps
          village { name slug }
          petFriendly
          baseRate
          images { url alt }
        }
        totalCount
      }
    }
  `;

  try {
    const res = await fetch(`${baseUrl}/api/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: {
          page: 1,
          pageSize: options.limit || 12,
          village: options.village,
        },
      }),
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!res.ok) throw new Error('Failed to fetch properties');

    const { data } = await res.json();
    return data?.properties?.properties || [];
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

// Streamed property list
async function PropertyList({ village, limit, featured }: PropertyGridProps) {
  const properties = await getProperties({ village, limit, featured });

  if (properties.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-gray-500">No properties found</p>
      </div>
    );
  }

  return (
    <>
      {properties.map((property: any, index: number) => (
        <PropertyCard
          key={property.id}
          property={property}
          priority={index < 3} // Prioritize first 3 images
        />
      ))}
    </>
  );
}

// Loading skeleton grid
function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </>
  );
}

// Main component with Suspense boundary
export function PropertyGrid(props: PropertyGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Suspense fallback={<PropertyGridSkeleton count={props.limit || 6} />}>
        <PropertyList {...props} />
      </Suspense>
    </div>
  );
}
