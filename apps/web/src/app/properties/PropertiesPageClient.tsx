'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, MapPin, Bed, PawPrint, Grid, Map as MapIcon, Home, Search } from 'lucide-react';
import { PropertyGrid } from '@/components/property/PropertyGrid';
import { AdvancedFilters, MobileFiltersModal } from '@/components/search/AdvancedFilters';
import { PropertySearchBar } from '@/components/search/PropertySearchBar';
import { SortDropdown } from '@/components/search/SortDropdown';
import { Pagination } from '@/components/ui/Pagination';
import type { Property, PropertyQueryParams } from '@/types';

// Dynamically import PropertyMap to avoid SSR issues with Leaflet
const PropertyMap = dynamic(
  () => import('@/components/map/PropertyMap').then(mod => mod.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-gray-500 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-ocean-600 rounded-full animate-spin" />
          <span>Loading map...</span>
        </div>
      </div>
    )
  }
);

interface PropertiesPageClientProps {
  properties: Property[];
  total: number;
  totalPages: number;
  currentPage: number;
  currentFilters: PropertyQueryParams;
  searchParams: Record<string, string | undefined>;
}

export function PropertiesPageClient({
  properties,
  total,
  totalPages,
  currentPage,
  currentFilters,
  searchParams,
}: PropertiesPageClientProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Active filter count for mobile indicator
  const activeFilterCount = [
    currentFilters.q,
    currentFilters.village,
    currentFilters.minBedrooms,
    currentFilters.maxBedrooms,
    currentFilters.petFriendly,
    currentFilters.amenities?.length,
  ].filter(Boolean).length;

  // Active filter pills
  const activeFilters: { key: string; label: string; value: string }[] = [];
  if (currentFilters.q) {
    activeFilters.push({ key: 'q', label: 'Search', value: `"${currentFilters.q}"` });
  }
  if (currentFilters.village) {
    activeFilters.push({ key: 'village', label: 'Village', value: currentFilters.village });
  }
  if (currentFilters.minBedrooms) {
    activeFilters.push({ key: 'minBedrooms', label: 'Min Beds', value: `${currentFilters.minBedrooms}+` });
  }
  if (currentFilters.petFriendly) {
    activeFilters.push({ key: 'petFriendly', label: 'Pet Friendly', value: 'Yes' });
  }
  if (currentFilters.amenities?.length) {
    currentFilters.amenities.slice(0, 3).forEach((a) => {
      activeFilters.push({ key: `amenity-${a}`, label: 'Amenity', value: a.replace(/-/g, ' ') });
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="search-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#search-pattern)" />
          </svg>
        </div>

        <div className="container-page py-10 md:py-14 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
              Find Your Perfect Beach Home
            </h1>
            <p className="text-white/70 text-lg">
              {total} vacation rentals across Hatteras Island's seven villages
            </p>
          </div>
          <PropertySearchBar
            variant="hero"
            className="max-w-5xl mx-auto"
            initialValues={{
              q: currentFilters.q,
              village: currentFilters.village,
              checkIn: currentFilters.checkIn,
              checkOut: currentFilters.checkOut,
              guests: currentFilters.guests,
            }}
          />
        </div>
      </div>

      {/* Mobile Filter Bar */}
      <div className="lg:hidden sticky top-16 z-40 bg-white border-b shadow-sm">
        <div className="container-page py-3 flex items-center gap-3">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-ocean-600 text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-2">
              {activeFilters.map((filter) => (
                <span
                  key={filter.key}
                  className="flex-shrink-0 px-3 py-1.5 bg-ocean-50 text-ocean-700 text-sm rounded-full capitalize"
                >
                  {filter.value}
                </span>
              ))}
            </div>
          </div>

          <SortDropdown current={currentFilters.sortBy} />
        </div>
      </div>

      <div className="container-page py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              <AdvancedFilters currentFilters={currentFilters} />
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">Vacation Rentals</h2>
                </div>
                <p className="text-gray-600">
                  {total} {total === 1 ? 'property' : 'properties'} found
                </p>
              </div>

              <div className="hidden lg:flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center bg-slate-800 rounded-lg p-1 shadow-md">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                      viewMode === 'map'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <MapIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Map</span>
                  </button>
                </div>

                <SortDropdown current={currentFilters.sortBy} />
              </div>
            </div>

            {/* Active Filters Pills - Desktop */}
            {activeFilters.length > 0 && (
              <div className="hidden lg:flex flex-wrap gap-2 mb-6">
                {activeFilters.map((filter) => (
                  <span
                    key={filter.key}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ocean-50 text-ocean-700 text-sm rounded-full capitalize"
                  >
                    {filter.key === 'q' && <Search className="w-3 h-3" />}
                    {filter.key.includes('village') && <MapPin className="w-3 h-3" />}
                    {filter.key.includes('Bed') && <Bed className="w-3 h-3" />}
                    {filter.key.includes('Pet') && <PawPrint className="w-3 h-3" />}
                    {filter.value}
                  </span>
                ))}
              </div>
            )}

            {/* Property Grid */}
            {viewMode === 'grid' ? (
              <>
                {properties.length > 0 ? (
                  <PropertyGrid properties={properties} />
                ) : (
                  <NoResults />
                )}
              </>
            ) : (
              <MapView properties={properties} />
            )}

            {/* Pagination */}
            {totalPages > 1 && viewMode === 'grid' && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath="/properties"
                  searchParams={searchParams}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <MobileFiltersModal
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        currentFilters={currentFilters}
      />
    </div>
  );
}

function NoResults() {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Home className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        We couldn't find any properties matching your criteria. Try adjusting your filters or search with different dates.
      </p>
      <a
        href="/properties"
        className="inline-flex items-center gap-2 px-6 py-3 bg-ocean-600 text-white rounded-lg font-medium hover:bg-ocean-700 transition-colors"
      >
        Clear all filters
      </a>
    </div>
  );
}

function MapView({ properties }: { properties: Property[] }) {
  return <PropertyMap properties={properties} className="h-[600px]" />;
}
