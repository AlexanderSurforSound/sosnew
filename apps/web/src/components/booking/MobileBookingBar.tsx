'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronUp } from 'lucide-react';
import { PriceDisplay } from '@/components/pricing';

interface MobileBookingBarProps {
  propertyName: string;
  baseRate: number;
  specialRate?: number;
  onBookNow: () => void;
  onSelectDates: () => void;
  selectedDates?: { checkIn: Date; checkOut: Date } | null;
  isAvailable?: boolean;
}

/**
 * Mobile-first sticky booking bar (inspired by Wander.com)
 *
 * Features:
 * - One-tap booking CTA
 * - Sticky at bottom of screen on mobile
 * - Shows price and availability
 * - Expands to show date selection
 * - Hides when scrolling down, shows when scrolling up
 */
export function MobileBookingBar({
  propertyName,
  baseRate,
  specialRate,
  onBookNow,
  onSelectDates,
  selectedDates,
  isAvailable = true,
}: MobileBookingBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide bar when scrolling down, show when scrolling up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsVisible(false);
        setIsExpanded(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const formatDateRange = () => {
    if (!selectedDates) return 'Select dates';
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const checkIn = selectedDates.checkIn.toLocaleDateString('en-US', options);
    const checkOut = selectedDates.checkOut.toLocaleDateString('en-US', options);
    return `${checkIn} - ${checkOut}`;
  };

  const displayPrice = specialRate || baseRate;
  const hasDiscount = specialRate && specialRate < baseRate;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        >
          {/* Expanded date picker */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-white border-t border-gray-200 shadow-lg overflow-hidden"
              >
                <div className="p-4">
                  <button
                    onClick={onSelectDates}
                    className="w-full flex items-center justify-between p-4 border-2 border-primary rounded-xl hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div className="text-left">
                        <div className="text-sm text-gray-600">Check-in → Check-out</div>
                        <div className="font-semibold text-primary">{formatDateRange()}</div>
                      </div>
                    </div>
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main booking bar */}
          <div className="bg-white border-t border-gray-200 shadow-2xl safe-area-bottom">
            <div className="flex items-center justify-between p-4 gap-4">
              {/* Price section */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex-1 text-left"
              >
                <div className="flex items-baseline gap-2">
                  {hasDiscount && (
                    <span className="text-sm text-gray-600 line-through">
                      ${baseRate.toLocaleString()}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-primary">
                    ${displayPrice.toLocaleString()}
                  </span>
                  <span className="text-gray-600">/week</span>
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDateRange()}
                  <ChevronUp
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {/* Book Now button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onBookNow}
                disabled={!isAvailable}
                className={`
                  px-8 py-4 rounded-xl font-bold text-white shadow-lg
                  transition-all duration-200
                  ${isAvailable
                    ? 'bg-secondary hover:bg-secondary/90 active:bg-secondary/80'
                    : 'bg-gray-300 cursor-not-allowed'
                  }
                `}
              >
                {isAvailable ? 'Book Now' : 'Unavailable'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Desktop booking widget (always visible in sidebar)
 */
export function DesktopBookingWidget({
  propertyName,
  baseRate,
  specialRate,
  onBookNow,
  onSelectDates,
  selectedDates,
  isAvailable = true,
}: MobileBookingBarProps) {
  const displayPrice = specialRate || baseRate;
  const hasDiscount = specialRate && specialRate < baseRate;
  const discountPercent = hasDiscount
    ? Math.round(((baseRate - specialRate!) / baseRate) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-xl p-6 sticky top-24">
      {/* Price header */}
      <div className="mb-6">
        {hasDiscount && (
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-success text-white text-xs font-bold rounded">
              {discountPercent}% OFF
            </span>
            <span className="text-gray-600 line-through">
              ${baseRate.toLocaleString()}/week
            </span>
          </div>
        )}
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-primary">
            ${displayPrice.toLocaleString()}
          </span>
          <span className="text-gray-600 text-lg">/week</span>
        </div>
      </div>

      {/* Date selection */}
      <button
        onClick={onSelectDates}
        className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-primary/50 transition-colors mb-4 text-left"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Check-in</div>
            <div className="font-semibold text-primary">
              {selectedDates?.checkIn
                ? selectedDates.checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'Add date'
              }
            </div>
          </div>
          <div className="border-l border-gray-200 pl-4">
            <div className="text-xs text-gray-600 uppercase tracking-wide">Check-out</div>
            <div className="font-semibold text-primary">
              {selectedDates?.checkOut
                ? selectedDates.checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'Add date'
              }
            </div>
          </div>
        </div>
      </button>

      {/* Book Now button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onBookNow}
        disabled={!isAvailable}
        className={`
          w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg
          transition-all duration-200
          ${isAvailable
            ? 'bg-secondary hover:bg-secondary/90'
            : 'bg-gray-300 cursor-not-allowed'
          }
        `}
      >
        {isAvailable ? 'Book Now' : 'Check Availability'}
      </motion.button>

      {/* Trust badges */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Free cancellation
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secure booking
          </span>
        </div>
      </div>
    </div>
  );
}
