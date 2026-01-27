'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavorites } from '@/contexts/FavoritesContext';
import type { Property } from '@/lib/api';

interface FavoriteButtonProps {
  property: Property;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  className?: string;
}

export default function FavoriteButton({
  property,
  size = 'md',
  variant = 'icon',
  className = '',
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFav = isFavorite(property.id);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAnimating(true);
    setError(null);

    try {
      await toggleFavorite(property);
    } catch (err) {
      setError('Failed to update favorites');
      setTimeout(() => setError(null), 3000);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
          isFav
            ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        } ${className}`}
      >
        <motion.svg
          animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
          className={iconSizes[size]}
          fill={isFav ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </motion.svg>
        <span className="font-medium">{isFav ? 'Saved' : 'Save'}</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all ${
          isFav
            ? 'bg-white/90 text-red-500 hover:bg-white'
            : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
        } shadow-md hover:shadow-lg ${className}`}
        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      >
        <motion.svg
          animate={isAnimating ? { scale: [1, 1.4, 1] } : {}}
          transition={{ duration: 0.3 }}
          className={iconSizes[size]}
          fill={isFav ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </motion.svg>

        {/* Heart burst animation */}
        <AnimatePresence>
          {isAnimating && isFav && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, scale: 0 }}
                  animate={{
                    opacity: 0,
                    scale: 1.5,
                    x: Math.cos((i * Math.PI) / 3) * 20,
                    y: Math.sin((i * Math.PI) / 3) * 20,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute w-2 h-2 bg-red-400 rounded-full"
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </button>

      {/* Error tooltip */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded-lg whitespace-nowrap"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
