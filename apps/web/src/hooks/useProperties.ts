'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PropertyQueryParams } from '@/types';

export function useProperties(params: PropertyQueryParams = {}) {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => api.getProperties(params),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useProperty(slug: string) {
  return useQuery({
    queryKey: ['property', slug],
    queryFn: () => api.getProperty(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFeaturedProperties() {
  return useQuery({
    queryKey: ['properties', 'featured'],
    queryFn: () => api.getFeaturedProperties(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePropertySearch(query: string, limit = 20) {
  return useQuery({
    queryKey: ['properties', 'search', query],
    queryFn: () => api.searchProperties(query, limit),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}
