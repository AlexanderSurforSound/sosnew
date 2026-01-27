'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { X } from 'lucide-react';
import type { PropertyQueryParams } from '@/types';

interface SearchFiltersProps {
  currentFilters: PropertyQueryParams;
}

export function SearchFilters({ currentFilters }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to page 1 when filters change
    router.push(`/properties?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/properties');
  };

  const hasFilters =
    currentFilters.village ||
    currentFilters.minBedrooms ||
    currentFilters.maxBedrooms ||
    currentFilters.petFriendly ||
    currentFilters.amenities?.length;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-lg">Filters</h2>
        {hasFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Villages */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Village</h3>
        <div className="space-y-2">
          {villages.map((village) => (
            <label key={village.slug} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="village"
                checked={currentFilters.village === village.slug}
                onChange={() =>
                  updateFilter(
                    'village',
                    currentFilters.village === village.slug ? null : village.slug
                  )
                }
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="text-gray-700">{village.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Bedrooms */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Bedrooms</h3>
        <div className="flex gap-2">
          <select
            value={currentFilters.minBedrooms || ''}
            onChange={(e) => updateFilter('minBedrooms', e.target.value || null)}
            className="input flex-1"
          >
            <option value="">Min</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
          <select
            value={currentFilters.maxBedrooms || ''}
            onChange={(e) => updateFilter('maxBedrooms', e.target.value || null)}
            className="input flex-1"
          >
            <option value="">Max</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pet Friendly */}
      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={currentFilters.petFriendly || false}
            onChange={(e) => updateFilter('petFriendly', e.target.checked ? 'true' : null)}
            className="rounded text-primary-600 focus:ring-primary-500"
          />
          <span className="text-gray-700">Pet Friendly</span>
        </label>
      </div>

      {/* Amenities */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Amenities</h3>
        <div className="space-y-2">
          {amenities.map((amenity) => (
            <label key={amenity.slug} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentFilters.amenities?.includes(amenity.slug) || false}
                onChange={(e) => {
                  const current = currentFilters.amenities || [];
                  const updated = e.target.checked
                    ? [...current, amenity.slug]
                    : current.filter((a) => a !== amenity.slug);
                  updateFilter('amenities', updated.length ? updated.join(',') : null);
                }}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-gray-700">{amenity.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

const villages = [
  { name: 'Rodanthe', slug: 'rodanthe' },
  { name: 'Waves', slug: 'waves' },
  { name: 'Salvo', slug: 'salvo' },
  { name: 'Avon', slug: 'avon' },
  { name: 'Buxton', slug: 'buxton' },
  { name: 'Frisco', slug: 'frisco' },
  { name: 'Hatteras Village', slug: 'hatteras-village' },
];

const amenities = [
  { name: 'Private Pool', slug: 'private-pool' },
  { name: 'Hot Tub', slug: 'hot-tub' },
  { name: 'Oceanfront', slug: 'oceanfront' },
  { name: 'Ocean View', slug: 'ocean-view' },
  { name: 'Soundfront', slug: 'soundfront' },
  { name: 'Game Room', slug: 'game-room' },
  { name: 'Elevator', slug: 'elevator' },
  { name: 'Handicap Accessible', slug: 'handicap-accessible' },
];
