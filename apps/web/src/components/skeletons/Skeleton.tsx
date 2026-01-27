'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const roundedClasses = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export function Skeleton({ className = '', rounded = 'md' }: SkeletonProps) {
  return (
    <motion.div
      className={`bg-gray-200 ${roundedClasses[rounded]} ${className}`}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// Property Card Skeleton
export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Image */}
      <Skeleton className="aspect-[4/3] w-full" rounded="none" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-6 w-3/4" />

        {/* Location */}
        <Skeleton className="h-4 w-1/2" />

        {/* Features */}
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-20" rounded="lg" />
        </div>
      </div>
    </div>
  );
}

// Property Grid Skeleton
export function PropertyGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Property Detail Skeleton
export function PropertyDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Gallery */}
      <div className="grid grid-cols-4 gap-2 h-[500px]">
        <div className="col-span-2 row-span-2">
          <Skeleton className="w-full h-full" rounded="xl" />
        </div>
        <Skeleton className="w-full h-full" rounded="xl" />
        <Skeleton className="w-full h-full" rounded="xl" />
        <Skeleton className="w-full h-full" rounded="xl" />
        <Skeleton className="w-full h-full" rounded="xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title section */}
          <div className="space-y-3">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>

          {/* Host info */}
          <div className="flex items-center gap-4 py-6 border-y border-gray-200">
            <Skeleton className="w-14 h-14" rounded="full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10" rounded="lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>

            {/* Date selector */}
            <Skeleton className="h-20 w-full" rounded="xl" />

            {/* Guest selector */}
            <Skeleton className="h-14 w-full" rounded="xl" />

            {/* Button */}
            <Skeleton className="h-14 w-full" rounded="xl" />

            {/* Trust badges */}
            <div className="flex justify-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Review Card Skeleton
export function ReviewCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12" rounded="full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-5 w-16" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

// Reviews List Skeleton
export function ReviewsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ReviewCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Search Results Skeleton
export function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 flex-shrink-0" rounded="full" />
        ))}
      </div>

      {/* Results count */}
      <Skeleton className="h-6 w-48" />

      {/* Grid */}
      <PropertyGridSkeleton count={12} />
    </div>
  );
}

// Hero Section Skeleton
export function HeroSkeleton() {
  return (
    <div className="relative h-[600px] bg-gray-200">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-3xl px-4">
          <Skeleton className="h-16 w-full max-w-xl mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
          <Skeleton className="h-14 w-full max-w-2xl mx-auto" rounded="full" />
        </div>
      </div>
    </div>
  );
}

// Map Skeleton
export function MapSkeleton() {
  return (
    <div className="relative h-[600px] bg-gray-200 rounded-2xl overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Skeleton className="w-16 h-16 mx-auto" rounded="full" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
    </div>
  );
}

// Weather Widget Skeleton
export function WeatherSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="w-12 h-12" rounded="lg" />
      </div>
      <div className="flex items-end gap-2">
        <Skeleton className="h-14 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-4 w-8 mx-auto" />
            <Skeleton className="w-8 h-8 mx-auto" rounded="lg" />
            <Skeleton className="h-4 w-6 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Avatar Skeleton
export function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return <Skeleton className={sizes[size]} rounded="full" />;
}

// Button Skeleton
export function ButtonSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-8 w-20',
    md: 'h-10 w-28',
    lg: 'h-12 w-36',
  };

  return <Skeleton className={sizes[size]} rounded="lg" />;
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center gap-4 py-3 border-b-2 border-gray-200">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-5 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </div>
  );
}

// Card List Skeleton
export function CardListSkeleton({ count = 4, horizontal = false }: { count?: number; horizontal?: boolean }) {
  return (
    <div className={horizontal ? 'flex gap-4 overflow-x-auto pb-4' : 'space-y-4'}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-white rounded-xl p-4 border border-gray-200 ${
            horizontal ? 'flex-shrink-0 w-72' : ''
          }`}
        >
          <div className="flex items-start gap-4">
            <Skeleton className="w-16 h-16 flex-shrink-0" rounded="lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Stats Skeleton
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 text-center space-y-2">
          <Skeleton className="h-10 w-16 mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      ))}
    </div>
  );
}

// Form Skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full" rounded="lg" />
        </div>
      ))}
      <Skeleton className="h-12 w-full" rounded="lg" />
    </div>
  );
}

// Profile Skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Avatar and name */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-24 h-24" rounded="full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-1">
            <Skeleton className="h-8 w-12 mx-auto" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Pulse indicator for loading states
export function PulseIndicator({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span className="relative flex">
      <span
        className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-ocean-400 opacity-75 ${sizes[size]}`}
      />
      <span className={`relative inline-flex rounded-full bg-ocean-500 ${sizes[size]}`} />
    </span>
  );
}
