import { HeroSkeleton, PropertyGridSkeleton, Skeleton, StatsSkeleton } from '@/components/skeletons';

export default function HomeLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <HeroSkeleton />

      {/* Stats bar */}
      <div className="bg-gray-900 py-4">
        <div className="container-page">
          <div className="flex justify-center gap-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-6 w-16 bg-gray-700" />
                <Skeleton className="h-4 w-24 bg-gray-700" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured section */}
      <section className="py-16">
        <div className="container-page">
          <div className="mb-10">
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-10 w-64 mb-3" />
            <Skeleton className="h-5 w-96" />
          </div>
          <PropertyGridSkeleton count={6} />
        </div>
      </section>

      {/* Villages section */}
      <section className="py-16 bg-gray-50">
        <div className="container-page">
          <div className="text-center mb-10">
            <Skeleton className="h-4 w-40 mx-auto mb-3" />
            <Skeleton className="h-10 w-80 mx-auto mb-3" />
            <Skeleton className="h-5 w-[500px] mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" rounded="2xl" />
            ))}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16">
        <div className="container-page">
          <div className="text-center mb-10">
            <Skeleton className="h-4 w-48 mx-auto mb-3" />
            <Skeleton className="h-10 w-56 mx-auto mb-3" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center p-6 rounded-2xl border border-gray-100">
                <Skeleton className="w-16 h-16 mx-auto mb-6" rounded="2xl" />
                <Skeleton className="h-6 w-40 mx-auto mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="py-16 bg-ocean-900">
        <div className="container-page">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-48 mx-auto mb-3 bg-ocean-800" />
            <Skeleton className="h-5 w-80 mx-auto bg-ocean-800" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="w-16 h-16 mx-auto mb-4 bg-ocean-800" rounded="2xl" />
                <Skeleton className="h-12 w-24 mx-auto mb-2 bg-ocean-800" />
                <Skeleton className="h-5 w-32 mx-auto bg-ocean-800" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
