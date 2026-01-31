'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PropertyCard } from './PropertyCard';
import QuickViewModal from './QuickViewModal';
import type { Property } from '@/types';

interface PropertyGridProps {
  properties: Property[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function PropertyGrid({ properties }: PropertyGridProps) {
  const [quickViewProperty, setQuickViewProperty] = useState<Property | null>(null);

  if (properties.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
        <p className="text-gray-600">
          Try adjusting your filters or search dates to find available properties.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6"
      >
        {properties.map((property, index) => (
          <motion.div key={property.id} variants={itemVariants}>
            <PropertyCard
              property={property}
              onQuickView={() => setQuickViewProperty(property)}
            />
          </motion.div>
        ))}
      </motion.div>

      <QuickViewModal
        property={quickViewProperty as any}
        isOpen={!!quickViewProperty}
        onClose={() => setQuickViewProperty(null)}
      />
    </>
  );
}
