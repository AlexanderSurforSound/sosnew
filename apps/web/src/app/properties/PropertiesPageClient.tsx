'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Sparkles, X, MapPin, Bed, PawPrint, Grid, Map as MapIcon } from 'lucide-react';
import { PropertyGrid } from '@/components/property/PropertyGrid';
import { AdvancedFilters, MobileFiltersModal } from '@/components/search/AdvancedFilters';
import { AISearchBar } from '@/components/search/AISearchBar';
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
  aiSearchQuery?: string;
}

export function PropertiesPageClient({
  properties,
  total,
  totalPages,
  currentPage,
  currentFilters,
  searchParams,
  aiSearchQuery,
}: PropertiesPageClientProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showAIInsight, setShowAIInsight] = useState(!!aiSearchQuery);

  // Active filter count for mobile indicator
  const activeFilterCount = [
    currentFilters.village,
    currentFilters.minBedrooms,
    currentFilters.maxBedrooms,
    currentFilters.petFriendly,
    currentFilters.amenities?.length,
  ].filter(Boolean).length;

  // Active filter pills
  const activeFilters: { key: string; label: string; value: string }[] = [];
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
      {/* AI Search Header - seamless with header */}
      <div className="bg-[#0f172a] text-white relative overflow-hidden">
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />

        <div className="container-page py-12 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-white to-cyan-200 bg-clip-text text-transparent">
              Find Your Perfect Beach Home
            </h1>
            <p className="text-white/60 text-lg">Search 600+ vacation rentals on Hatteras Island</p>
          </div>
          <AISearchBar variant="hero" className="max-w-3xl mx-auto" />
        </div>
      </div>

      {/* AI Search Insight Banner */}
      <AnimatePresence>
        {showAIInsight && aiSearchQuery && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200"
          >
            <div className="container-page py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">AI Search Results</p>
                    <p className="text-sm text-gray-600">
                      Showing results for: "<span className="font-medium">{aiSearchQuery}</span>"
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIInsight(false)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  {aiSearchQuery && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI
                    </span>
                  )}
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
        <Sparkles className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        We couldn't find any properties matching your criteria. Try adjusting your filters or search with different terms.
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
