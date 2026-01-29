import { PropertyGrid } from '@/components/property/PropertyGrid';
import { AdvancedFilters, MobileFiltersModal } from '@/components/search/AdvancedFilters';
import { SortDropdown } from '@/components/search/SortDropdown';
import { Pagination } from '@/components/ui/Pagination';
import * as Track from '@/graphql/services/track';
import { PropertiesPageClient } from './PropertiesPageClient';

interface SearchParams {
  village?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  minBedrooms?: string;
  maxBedrooms?: string;
  amenities?: string;
  petFriendly?: string;
  page?: string;
  sortBy?: string;
  aiSearch?: string;
  q?: string;
  minPrice?: string;
  maxPrice?: string;
  locationType?: string;
}

export const metadata = {
  title: 'Vacation Rentals',
  description:
    'Browse vacation rentals on Hatteras Island. Find oceanfront homes, pet-friendly properties, and luxury beach houses.',
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = {
    village: searchParams.village,
    checkIn: searchParams.checkIn,
    checkOut: searchParams.checkOut,
    guests: searchParams.guests ? parseInt(searchParams.guests) : undefined,
    minBedrooms: searchParams.minBedrooms
      ? parseInt(searchParams.minBedrooms)
      : undefined,
    maxBedrooms: searchParams.maxBedrooms
      ? parseInt(searchParams.maxBedrooms)
      : undefined,
    amenities: searchParams.amenities?.split(',').filter(Boolean),
    petFriendly: searchParams.petFriendly === 'true',
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    pageSize: 24,
    sortBy: searchParams.sortBy as
      | 'price_asc'
      | 'price_desc'
      | 'bedrooms_asc'
      | 'bedrooms_desc'
      | 'name'
      | undefined,
  };

  let properties: any[] = [];
  let total = 0;
  let totalPages = 0;

  try {
    // Fetch from Track API directly (same as home page)
    const page = params.page || 1;
    const pageSize = params.pageSize || 24;
    const { units, total: totalUnits } = await Track.getUnits(page, pageSize);
    const nodes = await Track.getNodes();
    const nodesMap = new Map(nodes.map((n) => [n.id, n]));

    // Map units to properties with images
    for (const unit of units) {
      const images = await Track.getUnitImages(unit.id, 5);
      const property = Track.mapTrackUnitToProperty(unit, nodesMap.get(unit.nodeId), images);
      properties.push(property);
    }

    total = totalUnits;
    totalPages = Math.ceil(totalUnits / pageSize);
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    // Return empty results on error
  }

  return (
    <PropertiesPageClient
      properties={properties}
      total={total}
      totalPages={totalPages}
      currentPage={params.page}
      currentFilters={params}
      searchParams={searchParams as Record<string, string | undefined>}
    />
  );
}

function PropertyGridSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
          <div className="aspect-[4/3] bg-gray-200" />
          <div className="p-4">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-full mb-3" />
            <div className="flex gap-4 mb-3">
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
            <div className="pt-3 border-t">
              <div className="h-6 bg-gray-200 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
