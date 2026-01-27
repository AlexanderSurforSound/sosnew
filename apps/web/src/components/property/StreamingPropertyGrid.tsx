import { Suspense } from 'react';
import { PropertyGrid } from './PropertyGrid';
import { PropertyGridSkeleton } from '@/components/skeletons/PropertyCardSkeleton';
import type { Property } from '@/types';

interface StreamingPropertyGridProps {
  propertiesPromise: Promise<Property[]>;
  skeletonCount?: number;
}

/**
 * Streaming Property Grid
 * Uses React Suspense for progressive loading like Wander.com
 *
 * Benefits:
 * - Search UI renders immediately
 * - Properties stream in as they load
 * - Better LCP (Largest Contentful Paint)
 * - Improved perceived performance
 */
export function StreamingPropertyGrid({
  propertiesPromise,
  skeletonCount = 8
}: StreamingPropertyGridProps) {
  return (
    <Suspense fallback={<PropertyGridSkeleton count={skeletonCount} />}>
      <AsyncPropertyGrid propertiesPromise={propertiesPromise} />
    </Suspense>
  );
}

/**
 * Async component that awaits the properties promise
 * This enables streaming - the page shell loads first, then properties stream in
 */
async function AsyncPropertyGrid({
  propertiesPromise
}: {
  propertiesPromise: Promise<Property[]>
}) {
  const properties = await propertiesPromise;
  return <PropertyGrid properties={properties} />;
}

/**
 * Loading state with message (like Wander's "Loading properties...")
 */
export function PropertyLoadingState({ message = 'Loading properties...' }: { message?: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3 text-primary">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-lg font-medium">{message}</span>
        </div>
      </div>
      <PropertyGridSkeleton count={8} />
    </div>
  );
}

/**
 * Infinite scroll wrapper for property listings
 */
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface InfinitePropertyGridProps {
  initialProperties: Property[];
  loadMore: (page: number) => Promise<Property[]>;
  hasMore: boolean;
}

export function InfinitePropertyGrid({
  initialProperties,
  loadMore,
  hasMore: initialHasMore,
}: InfinitePropertyGridProps) {
  const [properties, setProperties] = useState(initialProperties);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const newProperties = await loadMore(nextPage);

      if (newProperties.length === 0) {
        setHasMore(false);
      } else {
        setProperties(prev => [...prev, ...newProperties]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Failed to load more properties:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, loadMore]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          handleLoadMore();
        }
      },
      { rootMargin: '200px' } // Start loading before user reaches the end
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, handleLoadMore]);

  return (
    <div>
      <PropertyGrid properties={properties} />

      {/* Intersection observer target */}
      <div ref={loadMoreRef} className="h-4" />

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-3 text-primary">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Loading more properties...</span>
          </div>
        </div>
      )}

      {/* End of results */}
      {!hasMore && properties.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          You've seen all {properties.length} properties
        </div>
      )}
    </div>
  );
}
