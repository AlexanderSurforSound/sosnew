import { PropertyDetailSkeleton } from '@/components/skeletons';

export default function PropertyDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container-page py-8">
        <PropertyDetailSkeleton />
      </div>
    </div>
  );
}
