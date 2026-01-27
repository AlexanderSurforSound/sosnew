'use client';

import { useState, useCallback } from 'react';
import type { Property } from '@/lib/api';

export function useQuickView() {
  const [isOpen, setIsOpen] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);

  const openQuickView = useCallback((property: Property) => {
    setProperty(property);
    setIsOpen(true);
  }, []);

  const closeQuickView = useCallback(() => {
    setIsOpen(false);
    // Keep property in state briefly for exit animation
    setTimeout(() => setProperty(null), 300);
  }, []);

  return {
    isOpen,
    property,
    openQuickView,
    closeQuickView,
  };
}
