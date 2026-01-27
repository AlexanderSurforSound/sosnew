'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

interface SortDropdownProps {
  current?: string;
}

const sortOptions = [
  { value: '', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'bedrooms_desc', label: 'Bedrooms: Most' },
  { value: 'bedrooms_asc', label: 'Bedrooms: Least' },
  { value: 'name', label: 'Name: A to Z' },
];

export function SortDropdown({ current }: SortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('sortBy', value);
    } else {
      params.delete('sortBy');
    }
    router.push(`/properties?${params.toString()}`);
  };

  const currentLabel =
    sortOptions.find((opt) => opt.value === current)?.label || 'Recommended';

  return (
    <div className="relative">
      <select
        value={current || ''}
        onChange={(e) => handleChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  );
}
