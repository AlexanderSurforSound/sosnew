'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  Calendar,
  Users,
  MapPin,
  ChevronDown,
  Waves,
  PawPrint,
  Droplets,
  Sun,
  Home,
  X,
} from 'lucide-react';
import { format, addDays } from 'date-fns';

interface PropertySearchBarProps {
  variant?: 'hero' | 'compact' | 'inline';
  className?: string;
  initialValues?: {
    village?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
}

const villages = [
  { value: '', label: 'All Villages' },
  { value: 'rodanthe', label: 'Rodanthe' },
  { value: 'waves', label: 'Waves' },
  { value: 'salvo', label: 'Salvo' },
  { value: 'avon', label: 'Avon' },
  { value: 'buxton', label: 'Buxton' },
  { value: 'frisco', label: 'Frisco' },
  { value: 'hatteras-village', label: 'Hatteras Village' },
];

const quickFilters = [
  { id: 'oceanfront', label: 'Oceanfront', icon: Waves },
  { id: 'pet-friendly', label: 'Pet Friendly', icon: PawPrint },
  { id: 'private-pool', label: 'Pool', icon: Droplets },
  { id: 'hot-tub', label: 'Hot Tub', icon: Sun },
];

export function PropertySearchBar({
  variant = 'hero',
  className = '',
  initialValues,
}: PropertySearchBarProps) {
  const router = useRouter();
  const [village, setVillage] = useState(initialValues?.village || '');
  const [checkIn, setCheckIn] = useState(initialValues?.checkIn || '');
  const [checkOut, setCheckOut] = useState(initialValues?.checkOut || '');
  const [guests, setGuests] = useState(initialValues?.guests || 0);
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<string[]>([]);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (village) params.set('village', village);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests > 0) params.set('guests', guests.toString());

    // Add quick filters as amenities
    if (selectedQuickFilters.length > 0) {
      // Map quick filter IDs to amenity slugs
      const amenityMap: Record<string, string> = {
        'oceanfront': 'oceanfront',
        'pet-friendly': 'petFriendly',
        'private-pool': 'private-pool',
        'hot-tub': 'hot-tub',
      };

      const amenities = selectedQuickFilters
        .map(f => amenityMap[f] || f)
        .filter(Boolean);

      if (amenities.includes('petFriendly')) {
        params.set('petFriendly', 'true');
        // Remove from amenities list
        const idx = amenities.indexOf('petFriendly');
        if (idx > -1) amenities.splice(idx, 1);
      }

      if (amenities.length > 0) {
        params.set('amenities', amenities.join(','));
      }
    }

    router.push(`/properties?${params.toString()}`);
  };

  const toggleQuickFilter = (filterId: string) => {
    setSelectedQuickFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const minCheckOut = checkIn
    ? format(addDays(new Date(checkIn), 3), 'yyyy-MM-dd')
    : format(addDays(new Date(), 3), 'yyyy-MM-dd');

  if (variant === 'hero') {
    return (
      <div className={`${className}`}>
        {/* Main Search Bar */}
        <div className="bg-white rounded-2xl shadow-2xl p-2 md:p-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3">
            {/* Village Select */}
            <div className="md:col-span-3 relative">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <MapPin className="w-5 h-5 text-ocean-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-0.5">Village</label>
                  <select
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full bg-transparent text-gray-900 font-medium text-sm focus:outline-none cursor-pointer appearance-none"
                  >
                    {villages.map(v => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Check-in Date */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <Calendar className="w-5 h-5 text-ocean-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-0.5">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full bg-transparent text-gray-900 font-medium text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Check-out Date */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <Calendar className="w-5 h-5 text-ocean-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-0.5">Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={minCheckOut}
                    className="w-full bg-transparent text-gray-900 font-medium text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Guests */}
            <div className="md:col-span-2 relative">
              <button
                type="button"
                onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
              >
                <Users className="w-5 h-5 text-ocean-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-medium text-gray-500 mb-0.5">Guests</span>
                  <span className="block text-gray-900 font-medium text-sm">
                    {guests > 0 ? `${guests} guest${guests !== 1 ? 's' : ''}` : 'Any'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showGuestDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border p-4 z-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Number of guests</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setGuests(Math.max(0, guests - 1))}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{guests || 'Any'}</span>
                      <button
                        type="button"
                        onClick={() => setGuests(guests + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGuestDropdown(false)}
                    className="mt-3 w-full py-2 bg-ocean-600 text-white rounded-lg font-medium text-sm hover:bg-ocean-700"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className="md:col-span-3">
              <button
                onClick={handleSearch}
                className="w-full h-full min-h-[60px] bg-gradient-to-r from-ocean-600 to-cyan-600 hover:from-ocean-700 hover:to-cyan-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {quickFilters.map((filter) => {
            const Icon = filter.icon;
            const isSelected = selectedQuickFilters.includes(filter.id);
            return (
              <button
                key={filter.id}
                onClick={() => toggleQuickFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-white text-ocean-700 shadow-md'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
                {isSelected && (
                  <X className="w-3 h-3 ml-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Compact variant for other pages
  return (
    <div className={`bg-white rounded-xl shadow-lg p-2 ${className}`}>
      <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
        {/* Village */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg flex-1 min-w-[150px]">
          <MapPin className="w-4 h-4 text-gray-400" />
          <select
            value={village}
            onChange={(e) => setVillage(e.target.value)}
            className="bg-transparent text-sm focus:outline-none flex-1"
          >
            {villages.map(v => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="bg-transparent text-sm focus:outline-none w-[120px]"
            placeholder="Check-in"
          />
          <span className="text-gray-300">-</span>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={minCheckOut}
            className="bg-transparent text-sm focus:outline-none w-[120px]"
            placeholder="Check-out"
          />
        </div>

        {/* Search */}
        <button
          onClick={handleSearch}
          className="px-6 py-2.5 bg-ocean-600 hover:bg-ocean-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>
    </div>
  );
}
