import { PropertyGridSkeleton, Skeleton } from '@/components/skeletons';

export default function PropertiesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-white border-b">
        <div className="container-page py-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-5 w-96" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="container-page py-4">
          <div className="flex items-center gap-3 overflow-x-auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-28 flex-shrink-0" rounded="full" />
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container-page py-8">
        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-36" rounded="lg" />
        </div>

        {/* Grid */}
        <PropertyGridSkeleton count={12} />

        {/* Pagination */}
        <div className="mt-12 flex justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-10 h-10" rounded="lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
