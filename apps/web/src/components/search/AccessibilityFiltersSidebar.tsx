'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AccessibilityFilters from './AccessibilityFilters';

export default function AccessibilityFiltersSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse accessibility features from URL
  const initialFeatures = searchParams.get('accessibility')?.split(',').filter(Boolean) || [];
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(initialFeatures);

  const handleFeaturesChange = (features: string[]) => {
    setSelectedFeatures(features);

    // Update URL with selected accessibility features
    const params = new URLSearchParams(searchParams.toString());
    if (features.length > 0) {
      params.set('accessibility', features.join(','));
    } else {
      params.delete('accessibility');
    }

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <AccessibilityFilters
      selectedFeatures={selectedFeatures}
      onFeaturesChange={handleFeaturesChange}
    />
  );
}
