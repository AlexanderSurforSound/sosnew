'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Bed, Bath, Users, GitCompare, Check, Eye, MapPin, Star } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCompare } from '@/contexts/CompareContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import type { Property } from '@/types';

/**
 * Format village name - only show "Village" suffix for Hatteras Village
 */
function formatVillageName(name: string | undefined): string {
  if (!name) return 'Hatteras Island';
  if (name.toLowerCase() === 'hatteras village') {
    return 'Hatteras Village';
  }
  // Remove "Village" suffix from other village names
  return name.replace(/\s+village$/i, '').trim();
}

interface PropertyCardProps {
  property: Property;
  showPrice?: boolean;
  onQuickView?: () => void;
  variant?: 'default' | 'featured' | 'compact';
}

export function PropertyCard({ property, showPrice = true, onQuickView, variant = 'default' }: PropertyCardProps) {
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const inCompare = isInCompare(property.id);
  const propertyIsFavorite = isFavorite(property.id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsTogglingFavorite(true);
    try {
      const favoriteProperty = {
        id: property.id,
        slug: property.slug,
        name: property.name,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        sleeps: property.sleeps,
        village: property.village?.name,
        primaryImage: property.images?.[0]?.url,
        pricePerNight: property.baseRate,
      };
      await toggleFavorite(favoriteProperty as any);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inCompare) {
      removeFromCompare(property.id);
    } else if (canAddMore) {
      addToCompare(property);
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.();
  };

  const images = property.images || [];
  const displayImages = images.slice(0, 4);
  const currentImage = displayImages[currentImageIndex] || images[0];

  // Handle image pagination on hover
  const handleImageHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (displayImages.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const segmentWidth = rect.width / displayImages.length;
    const newIndex = Math.floor(x / segmentWidth);
    setCurrentImageIndex(Math.min(newIndex, displayImages.length - 1));
  };

  if (variant === 'featured') {
    return (
      <Link
        href={`/properties/${property.slug}`}
        className="group relative block overflow-hidden rounded-2xl bg-slate-900 aspect-[16/10]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          {currentImage ? (
            <Image
              src={currentImage.url}
              alt={currentImage.alt || property.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          {/* Top badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {property.featured && (
              <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                Featured
              </span>
            )}
            {property.petFriendly && (
              <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                Pet Friendly
              </span>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={handleFavoriteClick}
            disabled={isTogglingFavorite}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all border border-white/20"
          >
            <Heart
              className={`w-5 h-5 transition-all ${
                propertyIsFavorite ? 'fill-red-500 text-red-500' : 'text-white'
              }`}
            />
          </button>

          {/* Property info */}
          <div>
            <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
              <MapPin className="w-4 h-4" />
              <span>{formatVillageName(property.village?.name)}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">
              {property.name}
            </h3>
            <div className="flex items-center gap-4 text-white/80 text-sm mb-4">
              <span className="flex items-center gap-1.5">
                <Bed className="w-4 h-4" />
                {property.bedrooms}
              </span>
              <span className="flex items-center gap-1.5">
                <Bath className="w-4 h-4" />
                {property.bathrooms}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {property.sleeps}
              </span>
            </div>
            {showPrice && property.baseRate && (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light text-white">
                  ${property.baseRate.toLocaleString()}
                </span>
                <span className="text-white/60">/ week</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-ocean-200 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setCurrentImageIndex(0); }}
    >
      {/* Image Container */}
      <div
        className="relative aspect-[4/3] overflow-hidden bg-slate-100"
        onMouseMove={handleImageHover}
      >
        {currentImage ? (
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
          >
            <Image
              src={currentImage.url}
              alt={currentImage.alt || property.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        )}

        {/* Image pagination dots */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {displayImages.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? 'w-6 bg-white'
                    : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <motion.button
            initial={false}
            animate={{ scale: inCompare ? 1.1 : 1 }}
            onClick={handleCompareClick}
            disabled={!inCompare && !canAddMore}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-200 ${
              inCompare
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white/90 hover:bg-white text-gray-700 disabled:opacity-50 shadow-md'
            }`}
            aria-label={inCompare ? 'Remove from compare' : 'Add to compare'}
          >
            {inCompare ? <Check className="w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleFavoriteClick}
            disabled={isTogglingFavorite}
            className={`p-2.5 rounded-full backdrop-blur-md bg-white/90 hover:bg-white transition-all duration-200 shadow-md ${
              propertyIsFavorite ? 'text-red-500' : 'text-gray-700'
            }`}
            aria-label={propertyIsFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-4 h-4 transition-all ${propertyIsFavorite ? 'fill-current' : ''}`}
            />
          </motion.button>
        </div>

        {/* Quick View */}
        {onQuickView && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            onClick={handleQuickViewClick}
            className="absolute bottom-3 right-3 flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg text-sm font-medium text-gray-900"
          >
            <Eye className="w-4 h-4" />
            Quick View
          </motion.button>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {property.featured && (
            <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full shadow-md">
              Featured
            </span>
          )}
          {property.petFriendly && !isHovered && (
            <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full shadow-md">
              Pet Friendly
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>{formatVillageName(property.village?.name)}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-cyan-700 transition-colors line-clamp-1">
          {property.name}
        </h3>

        {/* Headline */}
        {property.headline && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-1">{property.headline}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-5 text-gray-600 mb-4">
          <span className="flex items-center gap-1.5 text-sm">
            <Bed className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{property.bedrooms}</span>
            <span className="text-gray-400">beds</span>
          </span>
          <span className="flex items-center gap-1.5 text-sm">
            <Bath className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{property.bathrooms}</span>
            <span className="text-gray-400">baths</span>
          </span>
          <span className="flex items-center gap-1.5 text-sm">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{property.sleeps}</span>
            <span className="text-gray-400">guests</span>
          </span>
        </div>

        {/* Divider & Price */}
        {showPrice && property.baseRate && (
          <div className="pt-4 border-t border-gray-100 flex items-baseline justify-between">
            <div className="group-hover:scale-105 transition-transform origin-left">
              <span className="text-2xl font-semibold text-gray-900 group-hover:text-ocean-600 transition-colors">
                ${property.baseRate.toLocaleString()}
              </span>
              <span className="text-gray-500 ml-1">/ week</span>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-medium text-gray-700">4.9</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
