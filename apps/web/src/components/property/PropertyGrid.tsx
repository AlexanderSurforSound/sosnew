'use client';

import { useState } from 'react';
import { PropertyCard } from './PropertyCard';
import QuickViewModal from './QuickViewModal';
import type { Property } from '@/types';

interface PropertyGridProps {
  properties: Property[];
}

export function PropertyGrid({ properties }: PropertyGridProps) {
  const [quickViewProperty, setQuickViewProperty] = useState<Property | null>(null);

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
        <p className="text-gray-600">
          Try adjusting your filters or search dates to find available properties.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onQuickView={() => setQuickViewProperty(property)}
          />
        ))}
      </div>

      <QuickViewModal
        property={quickViewProperty as any}
        isOpen={!!quickViewProperty}
        onClose={() => setQuickViewProperty(null)}
      />
    </>
  );
}
