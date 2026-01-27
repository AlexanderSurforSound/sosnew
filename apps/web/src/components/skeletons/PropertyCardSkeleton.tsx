'use client';

import { cn } from '@/lib/utils';

interface PropertyCardSkeletonProps {
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
}

/**
 * Skeleton loader for PropertyCard
 * Prevents CLS (Cumulative Layout Shift) by reserving space
 */
export function PropertyCardSkeleton({ variant = 'default', className }: PropertyCardSkeletonProps) {
  if (variant === 'featured') {
    return (
      <div className={cn('relative overflow-hidden rounded-2xl bg-slate-200 aspect-[16/10] animate-pulse', className)}>
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-slate-300 rounded" />
            <div className="h-8 w-3/4 bg-slate-300 rounded" />
            <div className="flex gap-4">
              <div className="h-4 w-12 bg-slate-300 rounded" />
              <div className="h-4 w-12 bg-slate-300 rounded" />
              <div className="h-4 w-12 bg-slate-300 rounded" />
            </div>
            <div className="h-10 w-32 bg-slate-300 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-2xl overflow-hidden border border-gray-100', className)}>
      {/* Image skeleton */}
      <div className="relative aspect-[4/3] bg-slate-200 animate-pulse">
        {/* Badge placeholders */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="h-6 w-16 bg-slate-300 rounded-full" />
        </div>
        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <div className="w-9 h-9 bg-slate-300 rounded-full" />
          <div className="w-9 h-9 bg-slate-300 rounded-full" />
        </div>
        {/* Image dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          <div className="w-6 h-1 bg-slate-300 rounded-full" />
          <div className="w-1.5 h-1 bg-slate-300 rounded-full" />
          <div className="w-1.5 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-5 space-y-3">
        {/* Location */}
        <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
        {/* Title */}
        <div className="h-6 w-3/4 bg-slate-200 rounded animate-pulse" />
        {/* Headline */}
        <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
        {/* Stats */}
        <div className="flex gap-5 py-2">
          <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
        </div>
        {/* Price */}
        <div className="pt-4 border-t border-gray-100 flex justify-between">
          <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
          <div className="h-5 w-12 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of skeleton cards for loading state
 */
export function PropertyGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for search results page
 */
export function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Results header skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
      </div>
      {/* Grid */}
      <PropertyGridSkeleton count={12} />
    </div>
  );
}
