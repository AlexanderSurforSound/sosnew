'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Property } from '@/types';

interface CompareContextType {
  compareList: Property[];
  addToCompare: (property: Property) => boolean;
  removeFromCompare: (propertyId: string) => void;
  clearCompare: () => void;
  isInCompare: (propertyId: string) => boolean;
  canAddMore: boolean;
  maxItems: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 4;
const STORAGE_KEY = 'surf_or_sound_compare';

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<Property[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setCompareList(JSON.parse(stored));
        } catch (e) {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
    }
  }, [compareList]);

  const addToCompare = useCallback((property: Property): boolean => {
    if (compareList.length >= MAX_COMPARE_ITEMS) {
      return false;
    }
    if (compareList.some(p => p.id === property.id)) {
      return false;
    }
    setCompareList(prev => [...prev, property]);
    return true;
  }, [compareList]);

  const removeFromCompare = useCallback((propertyId: string) => {
    setCompareList(prev => prev.filter(p => p.id !== propertyId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const isInCompare = useCallback((propertyId: string): boolean => {
    return compareList.some(p => p.id === propertyId);
  }, [compareList]);

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        canAddMore: compareList.length < MAX_COMPARE_ITEMS,
        maxItems: MAX_COMPARE_ITEMS,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
