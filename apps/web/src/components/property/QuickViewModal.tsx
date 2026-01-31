'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, Check } from 'lucide-react';
import { FavoriteButton } from '@/components/favorites';
import { useCompare } from '@/contexts/CompareContext';
import type { Property } from '@/lib/api';

interface QuickViewModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ property, isOpen, onClose }: QuickViewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();

  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const inCompare = property ? isInCompare(property.id) : false;

  const handleCompareClick = () => {
    if (!property) return;
    if (inCompare) {
      removeFromCompare(property.id);
    } else if (canAddMore) {
      addToCompare(property);
    }
  };

  // Reset image index when property changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [property?.id]);

    // Close on escape key + focus trap
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const el = modalRef.current;
      if (!el) return;
      const focusables = el.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          (last as HTMLElement)?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          (first as HTMLElement)?.focus();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleKeyDown);
      previouslyFocused.current = document.activeElement as HTMLElement;
      setTimeout(() => modalRef.current?.focus(), 0);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, onClose]);;

  if (!property) return null;

  const images = property.images || [];
  const amenities = property.amenities?.slice(0, 8) || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal Container - Centers the modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="qv-title"
              tabIndex={-1}
              ref={modalRef}
            >
              {/* Image Gallery */}
              <div className="relative w-full md:w-1/2 h-56 sm:h-72 md:h-auto md:min-h-[400px] flex-shrink-0">
                {images.length > 0 ? (
                  <>
                    <Image
                      src={images[currentImageIndex]?.url || images[0]?.url}
                      alt={property.name}
                      fill
                      className="object-cover"
                    />

                    {/* Image navigation */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors" aria-label="Previous image">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors" aria-label="Next image">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        {/* Image indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.slice(0, 5).map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                          {images.length > 5 && (
                            <span className="text-white text-xs ml-1">+{images.length - 5}</span>
                          )}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Favorite button */}
                <div className="absolute top-4 right-4">
                  <FavoriteButton property={property as any} />
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {property.featured && (
                    <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded">
                      Featured
                    </span>
                  )}
                  {property.petFriendly && (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                      Pet Friendly
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col min-h-0 md:max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h2 id="qv-title" className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{property.name}</h2>
                      <p className="text-sm sm:text-base text-gray-600 mt-1">
                        {property.village?.name || 'Hatteras Island'}
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                      aria-label="Close"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-4 text-sm sm:text-base">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>{property.bedrooms} Beds</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                      <span>{property.bathrooms} Baths</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Sleeps {property.sleeps}</span>
                    </div>
                  </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
                  {/* Description */}
                  {property.headline && (
                    <p className="text-gray-600 mb-6">{property.headline}</p>
                  )}

                  {/* Amenities */}
                  {amenities.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Top Amenities</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>{typeof amenity === 'string' ? amenity : amenity.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      {property.baseRate && (
                        <>
                          <span className="text-xl sm:text-2xl font-bold text-gray-900">
                            ${property.baseRate.toLocaleString()}
                          </span>
                          <span className="text-gray-500"> / week</span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCompareClick}
                        disabled={!inCompare && !canAddMore}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                          inCompare
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        {inCompare ? <Check className="w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
                        {inCompare ? 'Added' : 'Compare'}
                      </button>
                      <Link
                        href={`/properties/${property.slug}`}
                        className="px-6 py-3 bg-ocean-600 text-white rounded-lg font-medium hover:bg-ocean-700 transition-colors text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
