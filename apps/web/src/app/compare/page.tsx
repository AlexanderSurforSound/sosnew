'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  GitCompare,
  X,
  Bed,
  Bath,
  Users,
  MapPin,
  Check,
  Minus,
  DollarSign,
  Home,
  Waves,
  PawPrint,
  Sparkles,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';
import type { Property } from '@/types';
import { cn } from '@/lib/utils';

export default function ComparePage() {
  const router = useRouter();
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  // Redirect if less than 2 properties
  useEffect(() => {
    if (compareList.length < 2) {
      // Give user time to see empty state before redirect
      const timer = setTimeout(() => {
        if (compareList.length < 2) {
          router.push('/properties');
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [compareList.length, router]);

  if (compareList.length < 2) {
    return (
      <div className="container-page py-16">
        <div className="max-w-md mx-auto text-center">
          <GitCompare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Add properties to compare</h1>
          <p className="text-gray-600 mb-6">
            Select at least 2 properties from our listings to compare them side by side.
          </p>
          <Link href="/properties" className="btn-primary btn-lg">
            Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  // Collect all unique amenities across properties
  const allAmenities = new Set<string>();
  compareList.forEach(p => {
    p.amenities?.forEach(a => allAmenities.add(a.name));
  });
  const amenityList = Array.from(allAmenities).sort();

  // Find best values for highlighting
  const maxBedrooms = Math.max(...compareList.map(p => p.bedrooms));
  const maxSleeps = Math.max(...compareList.map(p => p.sleeps));
  const minPrice = Math.min(...compareList.filter(p => p.baseRate).map(p => p.baseRate!));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="container-page py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitCompare className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Compare Properties</h1>
                <p className="text-sm text-gray-500">
                  {compareList.length} properties selected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={clearCompare}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
              <Link
                href="/properties"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add more
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="container-page py-8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            {/* Property Headers */}
            <thead>
              <tr>
                <th className="w-48 p-4 text-left text-sm font-medium text-gray-500 bg-gray-100 rounded-tl-xl">
                  Property Details
                </th>
                {compareList.map((property, index) => (
                  <th
                    key={property.id}
                    className={cn(
                      'p-4 bg-white border-l',
                      index === compareList.length - 1 && 'rounded-tr-xl'
                    )}
                  >
                    <PropertyHeader
                      property={property}
                      onRemove={() => removeFromCompare(property.id)}
                    />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Basic Info Section */}
              <SectionHeader title="Basic Information" colSpan={compareList.length + 1} />

              <CompareRow label="Location" icon={<MapPin className="w-4 h-4" />}>
                {compareList.map(p => (
                  <td key={p.id} className="p-4 border-l bg-white text-center">
                    <span className="text-gray-900">{p.village?.name || 'Hatteras Island'}</span>
                  </td>
                ))}
              </CompareRow>

              <CompareRow label="Property Type" icon={<Home className="w-4 h-4" />}>
                {compareList.map(p => (
                  <td key={p.id} className="p-4 border-l bg-white text-center">
                    <span className="text-gray-900 capitalize">{p.propertyType || 'House'}</span>
                  </td>
                ))}
              </CompareRow>

              <CompareRow label="Bedrooms" icon={<Bed className="w-4 h-4" />}>
                {compareList.map(p => (
                  <td key={p.id} className="p-4 border-l bg-white text-center">
                    <span className={cn(
                      'font-semibold',
                      p.bedrooms === maxBedrooms ? 'text-green-600' : 'text-gray-900'
                    )}>
                      {p.bedrooms}
                    </span>
                    {p.bedrooms === maxBedrooms && (
                      <span className="ml-1 text-xs text-green-600">Best</span>
                    )}
                  </td>
                ))}
              </CompareRow>

              <CompareRow label="Bathrooms" icon={<Bath className="w-4 h-4" />}>
                {compareList.map(p => (
                  <td key={p.id} className="p-4 border-l bg-white text-center">
                    <span className="text-gray-900">{p.bathrooms}</span>
                  </td>
                ))}
              </CompareRow>

              <CompareRow label="Sleeps" icon={<Users className="w-4 h-4" />}>
                {compareList.map(p => (
                  <td key={p.id} className="p-4 border-l bg-white text-center">
                    <span className={cn(
                      'font-semibold',
                      p.sleeps === maxSleeps ? 'text-green-600' : 'text-gray-900'
                    )}>
                      {p.sleeps}
                    </span>
                    {p.sleeps === maxSleeps && (
                      <span className="ml-1 text-xs text-green-600">Best</span>
                    )}
                  </td>
                ))}
              </CompareRow>

              {/* Pricing Section */}
              <SectionHeader title="Pricing" colSpan={compareList.length + 1} />

              <CompareRow label="Starting From" icon={<DollarSign className="w-4 h-4" />}>
                {compareList.map(p => (
                  <td key={p.id} className="p-4 border-l bg-white text-center">
                    {p.baseRate ? (
                      <div>
                        <span className={cn(
                          'text-lg font-bold',
                          p.baseRate === minPrice ? 'text-green-600' : 'text-gray-900'
                        )}>
                          ${p.baseRate.toLocaleString()}
                        </span>
                        <span className="text-gray-500 text-sm">/night</span>
                        {p.baseRate === minPrice && (
                          <div className="text-xs text-green-600 mt-1">Best Value</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">Contact for pricing</span>
                    )}
                  </td>
                ))}
              </CompareRow>

              {/* Features Section */}
              <SectionHeader title="Key Features" colSpan={compareList.length + 1} />

              <CompareRow label="Pet Friendly" icon={<PawPrint className="w-4 h-4" />}>
                {compareList.map(p => (
                  <td key={p.id} className="p-4 border-l bg-white text-center">
                    {p.petFriendly ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <Check className="w-5 h-5" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400">
                        <Minus className="w-5 h-5" />
                        No
                      </span>
                    )}
                  </td>
                ))}
              </CompareRow>

              <CompareRow label="Featured" icon={<Sparkles className="w-4 h-4" />}>
                {compareList.map(p => (
                  <td key={p.id} className="p-4 border-l bg-white text-center">
                    {p.featured ? (
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <Sparkles className="w-5 h-5" />
                        Featured
                      </span>
                    ) : (
                      <span className="text-gray-400">
                        <Minus className="w-5 h-5 mx-auto" />
                      </span>
                    )}
                  </td>
                ))}
              </CompareRow>

              {/* Amenities Section */}
              <SectionHeader title="Amenities" colSpan={compareList.length + 1} />

              {amenityList.slice(0, 15).map(amenity => (
                <CompareRow key={amenity} label={amenity}>
                  {compareList.map(p => {
                    const hasAmenity = p.amenities?.some(a => a.name === amenity);
                    return (
                      <td key={p.id} className="p-4 border-l bg-white text-center">
                        {hasAmenity ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <Minus className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </CompareRow>
              ))}

              {/* Action Row */}
              <tr>
                <td className="p-4 bg-gray-100 rounded-bl-xl"></td>
                {compareList.map((property, index) => (
                  <td
                    key={property.id}
                    className={cn(
                      'p-4 border-l bg-white',
                      index === compareList.length - 1 && 'rounded-br-xl'
                    )}
                  >
                    <Link
                      href={`/properties/${property.slug}`}
                      className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      View Property
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PropertyHeader({ property, onRemove }: { property: Property; onRemove: () => void }) {
  const primaryImage = property.images?.find(i => i.isPrimary) || property.images?.[0];

  return (
    <div className="relative">
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="w-full h-32 rounded-lg overflow-hidden mb-3">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={property.name}
            width={200}
            height={128}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>

      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
        {property.name}
      </h3>
      <p className="text-xs text-gray-500">
        {property.village?.name || 'Hatteras Island'}
      </p>
    </div>
  );
}

function SectionHeader({ title, colSpan }: { title: string; colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="bg-blue-50 px-4 py-2">
        <span className="font-semibold text-blue-900 text-sm">{title}</span>
      </td>
    </tr>
  );
}

function CompareRow({
  label,
  icon,
  children
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <tr className="border-t">
      <td className="p-4 bg-gray-50 text-sm font-medium text-gray-700">
        <div className="flex items-center gap-2">
          {icon && <span className="text-gray-400">{icon}</span>}
          {label}
        </div>
      </td>
      {children}
    </tr>
  );
}
