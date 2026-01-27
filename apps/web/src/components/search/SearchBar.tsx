'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Users, ChevronDown } from 'lucide-react';
import { format, addDays, isBefore } from 'date-fns';

const MIN_NIGHTS = 3;

interface SearchBarProps {
  initialValues?: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
  variant?: 'hero' | 'compact';
}

export function SearchBar({ initialValues, variant = 'hero' }: SearchBarProps) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(initialValues?.checkIn || '');
  const [checkOut, setCheckOut] = useState(initialValues?.checkOut || '');
  const [guests, setGuests] = useState(initialValues?.guests || 2);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests.toString());

    router.push(`/properties?${params.toString()}`);
  };

  const handleCheckInChange = (date: string) => {
    setCheckIn(date);
    if (date) {
      const minCheckout = addDays(new Date(date), MIN_NIGHTS);
      // If checkout is before minimum or not set, update it
      if (!checkOut || isBefore(new Date(checkOut), minCheckout)) {
        setCheckOut(format(minCheckout, 'yyyy-MM-dd'));
      }
    }
  };

  const handleCheckOutChange = (date: string) => {
    if (checkIn) {
      const minCheckout = addDays(new Date(checkIn), MIN_NIGHTS);
      // Ensure checkout is at least MIN_NIGHTS after check-in
      if (isBefore(new Date(date), minCheckout)) {
        setCheckOut(format(minCheckout, 'yyyy-MM-dd'));
        return;
      }
    }
    setCheckOut(date);
  };

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <input
            type="date"
            value={checkIn}
            onChange={(e) => handleCheckInChange(e.target.value)}
            className="input h-9 text-sm"
            placeholder="Check-in"
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => handleCheckOutChange(e.target.value)}
            min={checkIn ? format(addDays(new Date(checkIn), MIN_NIGHTS), 'yyyy-MM-dd') : undefined}
            className="input h-9 text-sm"
            placeholder="Check-out"
          />
        </div>
        <button type="submit" className="btn-primary btn-sm">
          <Search className="w-4 h-4" />
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSearch}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Check-in */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-in
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="input pl-10"
              required
            />
          </div>
        </div>

        {/* Check-out */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-out ({MIN_NIGHTS}+ nights)
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => handleCheckOutChange(e.target.value)}
              min={checkIn ? format(addDays(new Date(checkIn), MIN_NIGHTS), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
              className="input pl-10"
              required
            />
          </div>
        </div>

        {/* Guests */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Guests
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowGuestDropdown(!showGuestDropdown)}
              className="input pl-10 pr-10 text-left w-full"
            >
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              {guests} {guests === 1 ? 'guest' : 'guests'}
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </button>

            {showGuestDropdown && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-lg shadow-lg border p-4 z-50">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Guests</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{guests}</span>
                    <button
                      type="button"
                      onClick={() => setGuests(Math.min(20, guests + 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuestDropdown(false)}
                  className="mt-4 w-full btn-primary btn-sm"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <button type="submit" className="btn-primary btn-md w-full gap-2">
            <Search className="w-5 h-5" />
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
