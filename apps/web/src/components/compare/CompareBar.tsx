
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { X, GitCompare, ChevronRight } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';
import React, { useEffect, useState } from 'react';

export function CompareBar() {
  const { compareList, removeFromCompare, clearCompare, maxItems } = useCompare();
  const [liveMessage, setLiveMessage] = useState('');

  useEffect(() => {
    setLiveMessage(`Compare list updated: ${compareList.length} item${compareList.length === 1 ? '' : 's'}`);
  }, [compareList.length]);

  if (compareList.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-lg" role="region" aria-label="Compare bar"
      >
        <div className="sr-only" role="status" aria-live="polite">{liveMessage}</div>
        <div className="container-page py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Compare Items */}
            <div className="flex items-center gap-3 flex-1 overflow-x-auto">
              <div className="flex items-center gap-2 text-gray-700 flex-shrink-0">
                <GitCompare className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-sm">Compare</span>
                <span className="text-gray-400">({compareList.length}/{maxItems})</span>
              </div>

              <div className="flex gap-2">
                {compareList.map((property) => {
                  const primaryImage = property.images?.find(i => i.isPrimary) || property.images?.[0];
                  return (
                    <motion.div
                      key={property.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="relative group"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 border-2 border-white shadow-sm">
                        {primaryImage ? (
                          <Image
                            src={primaryImage.url}
                            alt={property.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No img
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCompare(property.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600" aria-label={"Remove " + property.name + " from compare"}
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {property.name}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Empty Slots */}
                {Array.from({ length: maxItems - compareList.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
                  >
                    <span className="text-gray-300 text-xs">+</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={clearCompare}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
              <Link
                href="/compare"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  compareList.length >= 2
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
                }`}
              >
                Compare {compareList.length >= 2 ? `(${compareList.length})` : ''}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {compareList.length < 2 && (
            <p className="text-xs text-gray-500 mt-2">
              Add at least 2 properties to compare
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
