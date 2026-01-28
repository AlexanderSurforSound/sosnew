'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  Bed,
  Bath,
  Users,
  DollarSign,
  PawPrint,
  Waves,
  Home,
  Sparkles,
  Filter,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import type { PropertyQueryParams } from '@/types';

interface AdvancedFiltersProps {
  currentFilters: PropertyQueryParams;
  onClose?: () => void;
  variant?: 'sidebar' | 'modal' | 'inline';
}

const VILLAGES = [
  { name: 'Rodanthe', slug: 'rodanthe-village', description: 'Northern gateway, famous from Nights in Rodanthe' },
  { name: 'Waves', slug: 'waves-village', description: 'Surf-friendly, laid-back atmosphere' },
  { name: 'Salvo', slug: 'salvo-village', description: 'Quiet and family-friendly' },
  { name: 'Avon', slug: 'avon-village', description: 'Central location with shops & dining' },
  { name: 'Buxton', slug: 'buxton-village', description: 'Near Cape Hatteras Lighthouse' },
  { name: 'Frisco', slug: 'frisco-village', description: 'Secluded beaches, great fishing' },
  { name: 'Hatteras Village', slug: 'hatteras-village', description: 'Southern tip, ferry to Ocracoke' },
];

const AMENITIES = [
  { name: 'Private Pool', slug: 'private-pool', icon: '🏊', popular: true },
  { name: 'Hot Tub', slug: 'hot-tub', icon: '🛁', popular: true },
  { name: 'Oceanfront', slug: 'oceanfront', icon: '🌊', popular: true },
  { name: 'Ocean View', slug: 'ocean-view', icon: '👀', popular: true },
  { name: 'Soundfront', slug: 'soundfront', icon: '🌅', popular: false },
  { name: 'Sound View', slug: 'sound-view', icon: '🌄', popular: false },
  { name: 'Game Room', slug: 'game-room', icon: '🎮', popular: true },
  { name: 'Theater Room', slug: 'theater-room', icon: '🎬', popular: false },
  { name: 'Elevator', slug: 'elevator', icon: '🛗', popular: false },
  { name: 'Handicap Accessible', slug: 'handicap-accessible', icon: '♿', popular: false },
  { name: 'EV Charger', slug: 'ev-charger', icon: '🔌', popular: false },
  { name: 'Outdoor Shower', slug: 'outdoor-shower', icon: '🚿', popular: false },
  { name: 'Grill', slug: 'grill', icon: '🍖', popular: false },
  { name: 'Fire Pit', slug: 'fire-pit', icon: '🔥', popular: false },
  { name: 'Kayaks', slug: 'kayaks', icon: '🛶', popular: false },
  { name: 'Bikes', slug: 'bikes', icon: '🚲', popular: false },
  { name: 'Community Pool', slug: 'community-pool', icon: '🏊‍♂️', popular: false },
  { name: 'Tennis Court', slug: 'tennis-court', icon: '🎾', popular: false },
];

const LOCATION_TYPES = [
  { name: 'Oceanfront', slug: 'oceanfront', description: 'Direct beach access' },
  { name: 'Semi-Oceanfront', slug: 'semi-oceanfront', description: 'One row back from beach' },
  { name: 'Ocean View', slug: 'ocean-view', description: 'Can see the ocean' },
  { name: 'Soundfront', slug: 'soundfront', description: 'On the sound/bay side' },
  { name: 'Sound View', slug: 'sound-view', description: 'Can see the sound' },
  { name: 'Between Beaches', slug: 'between-beaches', description: 'Walk to both' },
];

const PRICE_RANGES = [
  { label: 'Under $200', min: 0, max: 200 },
  { label: '$200 - $300', min: 200, max: 300 },
  { label: '$300 - $500', min: 300, max: 500 },
  { label: '$500 - $750', min: 500, max: 750 },
  { label: '$750 - $1000', min: 750, max: 1000 },
  { label: 'Over $1000', min: 1000, max: 99999 },
];

export function AdvancedFilters({ currentFilters, onClose, variant = 'sidebar' }: AdvancedFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [localFilters, setLocalFilters] = useState(currentFilters);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const updateLocalFilter = useCallback((key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (localFilters.village) params.set('village', localFilters.village);
    if (localFilters.checkIn) params.set('checkIn', localFilters.checkIn);
    if (localFilters.checkOut) params.set('checkOut', localFilters.checkOut);
    if (localFilters.guests) params.set('guests', localFilters.guests.toString());
    if (localFilters.minBedrooms) params.set('minBedrooms', localFilters.minBedrooms.toString());
    if (localFilters.maxBedrooms) params.set('maxBedrooms', localFilters.maxBedrooms.toString());
    if (localFilters.amenities?.length) params.set('amenities', localFilters.amenities.join(','));
    if (localFilters.petFriendly) params.set('petFriendly', 'true');
    if ((localFilters as any).minPrice) params.set('minPrice', (localFilters as any).minPrice.toString());
    if ((localFilters as any).maxPrice) params.set('maxPrice', (localFilters as any).maxPrice.toString());
    if ((localFilters as any).locationType) params.set('locationType', (localFilters as any).locationType);

    router.push(`/properties?${params.toString()}`);
    onClose?.();
  };

  const clearAllFilters = () => {
    setLocalFilters({});
    router.push('/properties');
    onClose?.();
  };

  const activeFilterCount = [
    localFilters.village,
    localFilters.minBedrooms,
    localFilters.maxBedrooms,
    localFilters.petFriendly,
    localFilters.amenities?.length,
    (localFilters as any).minPrice,
    (localFilters as any).locationType,
  ].filter(Boolean).length;

  const toggleAmenity = (slug: string) => {
    const current = localFilters.amenities || [];
    const updated = current.includes(slug)
      ? current.filter((a) => a !== slug)
      : [...current, slug];
    updateLocalFilter('amenities', updated.length ? updated : undefined);
  };

  const FilterSection = ({
    title,
    id,
    children,
    icon,
  }: {
    title: string;
    id: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {expandedSections.includes(id) ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      <AnimatePresence>
        {expandedSections.includes(id) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-lg">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-ocean-100 text-ocean-700 text-sm font-medium rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {variant === 'modal' && (
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Villages */}
        <FilterSection title="Village" id="village" icon={<MapPin className="w-4 h-4 text-gray-500" />}>
          <div className="grid grid-cols-1 gap-2">
            {VILLAGES.map((village) => (
              <button
                key={village.slug}
                onClick={() =>
                  updateLocalFilter('village', localFilters.village === village.slug ? undefined : village.slug)
                }
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${
                  localFilters.village === village.slug
                    ? 'border-ocean-500 bg-ocean-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    localFilters.village === village.slug ? 'border-ocean-500 bg-ocean-500' : 'border-gray-300'
                  }`}
                >
                  {localFilters.village === village.slug && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{village.name}</p>
                  <p className="text-sm text-gray-500">{village.description}</p>
                </div>
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Bedrooms & Bathrooms */}
        <FilterSection title="Bedrooms & Guests" id="bedrooms" icon={<Bed className="w-4 h-4 text-gray-500" />}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Bedrooms</label>
              <div className="flex gap-2">
                <select
                  value={localFilters.minBedrooms || ''}
                  onChange={(e) => updateLocalFilter('minBedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 focus:outline-none"
                >
                  <option value="">Min</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>{n}+</option>
                  ))}
                </select>
                <span className="flex items-center text-gray-400">-</span>
                <select
                  value={localFilters.maxBedrooms || ''}
                  onChange={(e) => updateLocalFilter('maxBedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 focus:outline-none"
                >
                  <option value="">Max</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Guests</label>
              <select
                value={localFilters.guests || ''}
                onChange={(e) => updateLocalFilter('guests', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 focus:outline-none"
              >
                <option value="">Any</option>
                {[2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 25, 30].map((n) => (
                  <option key={n} value={n}>{n}+ guests</option>
                ))}
              </select>
            </div>
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price Range" id="price" icon={<DollarSign className="w-4 h-4 text-gray-500" />}>
          <div className="space-y-2">
            {PRICE_RANGES.map((range) => (
              <button
                key={range.label}
                onClick={() => {
                  const isSelected =
                    (localFilters as any).minPrice === range.min && (localFilters as any).maxPrice === range.max;
                  if (isSelected) {
                    updateLocalFilter('minPrice', undefined);
                    updateLocalFilter('maxPrice', undefined);
                  } else {
                    updateLocalFilter('minPrice', range.min);
                    updateLocalFilter('maxPrice', range.max);
                  }
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  (localFilters as any).minPrice === range.min && (localFilters as any).maxPrice === range.max
                    ? 'border-ocean-500 bg-ocean-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-gray-700">{range.label}</span>
                <span className="text-sm text-gray-500">per night</span>
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Location Type */}
        <FilterSection title="Location Type" id="location" icon={<Waves className="w-4 h-4 text-gray-500" />}>
          <div className="space-y-2">
            {LOCATION_TYPES.map((loc) => (
              <button
                key={loc.slug}
                onClick={() =>
                  updateLocalFilter(
                    'locationType',
                    (localFilters as any).locationType === loc.slug ? undefined : loc.slug
                  )
                }
                className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${
                  (localFilters as any).locationType === loc.slug
                    ? 'border-ocean-500 bg-ocean-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    (localFilters as any).locationType === loc.slug ? 'border-ocean-500 bg-ocean-500' : 'border-gray-300'
                  }`}
                >
                  {(localFilters as any).locationType === loc.slug && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{loc.name}</p>
                  <p className="text-sm text-gray-500">{loc.description}</p>
                </div>
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Pet Friendly */}
        <FilterSection title="Pet Policy" id="pets" icon={<PawPrint className="w-4 h-4 text-gray-500" />}>
          <button
            onClick={() => updateLocalFilter('petFriendly', !localFilters.petFriendly)}
            className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
              localFilters.petFriendly ? 'border-ocean-500 bg-ocean-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🐕</span>
              <div className="text-left">
                <p className="font-medium text-gray-900">Pet Friendly</p>
                <p className="text-sm text-gray-500">Homes that welcome pets</p>
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded flex items-center justify-center ${
                localFilters.petFriendly ? 'bg-ocean-500' : 'border-2 border-gray-300'
              }`}
            >
              {localFilters.petFriendly && <Check className="w-4 h-4 text-white" />}
            </div>
          </button>
        </FilterSection>

        {/* Amenities */}
        <FilterSection title="Amenities" id="amenities" icon={<Sparkles className="w-4 h-4 text-gray-500" />}>
          <div className="space-y-4">
            {/* Popular Amenities */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Popular</p>
              <div className="grid grid-cols-2 gap-2">
                {AMENITIES.filter((a) => a.popular).map((amenity) => (
                  <button
                    key={amenity.slug}
                    onClick={() => toggleAmenity(amenity.slug)}
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${
                      localFilters.amenities?.includes(amenity.slug)
                        ? 'border-ocean-500 bg-ocean-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span>{amenity.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Show More Toggle */}
            <button
              onClick={() => setShowAllAmenities(!showAllAmenities)}
              className="text-sm text-ocean-600 hover:text-ocean-700 font-medium"
            >
              {showAllAmenities ? 'Show less' : `Show ${AMENITIES.filter((a) => !a.popular).length} more amenities`}
            </button>

            {/* All Amenities */}
            <AnimatePresence>
              {showAllAmenities && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {AMENITIES.filter((a) => !a.popular).map((amenity) => (
                      <button
                        key={amenity.slug}
                        onClick={() => toggleAmenity(amenity.slug)}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${
                          localFilters.amenities?.includes(amenity.slug)
                            ? 'border-ocean-500 bg-ocean-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span>{amenity.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FilterSection>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-3">
          <button
            onClick={clearAllFilters}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={applyFilters}
            className="flex-1 py-3 px-4 bg-ocean-600 text-white rounded-xl font-medium hover:bg-ocean-700 transition-colors flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl max-h-[90vh] flex flex-col"
        >
          {content}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {content}
    </div>
  );
}

// Mobile Filters Modal
export function MobileFiltersModal({
  isOpen,
  onClose,
  currentFilters,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: PropertyQueryParams;
}) {
  return (
    <AnimatePresence>
      {isOpen && <AdvancedFilters currentFilters={currentFilters} onClose={onClose} variant="modal" />}
    </AnimatePresence>
  );
}
