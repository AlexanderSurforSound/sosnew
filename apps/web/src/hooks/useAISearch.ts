'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types for AI Search
export interface SemanticSearchRequest {
  query: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  filters?: {
    villages?: string[];
    minBedrooms?: number;
    maxBedrooms?: number;
    amenities?: string[];
    petFriendly?: boolean;
    priceRange?: { min?: number; max?: number };
  };
  limit?: number;
}

export interface SemanticSearchResult {
  propertyId: string;
  property: any; // Property type from your types
  relevanceScore: number;
  explanation: string;
  matchedCriteria: string[];
}

export interface SemanticSearchResponse {
  results: SemanticSearchResult[];
  query: string;
  interpretedIntent: string;
  suggestedFilters: Record<string, any>;
  totalMatches: number;
  searchTime: number;
}

export interface ItineraryRequest {
  reservationId?: string;
  propertyId?: string;
  village?: string;
  tripDuration: number;
  interests: string[];
  travelParty?: {
    adults: number;
    children: number;
    pets: boolean;
  };
  preferences?: {
    pace: 'relaxed' | 'moderate' | 'active';
    budget: 'budget' | 'moderate' | 'luxury';
    includeRestaurants: boolean;
    includeActivities: boolean;
  };
}

export interface ItineraryDay {
  day: number;
  date: string;
  theme: string;
  activities: ItineraryActivity[];
  meals: ItineraryMeal[];
  tips: string[];
}

export interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  category: string;
  cost?: string;
  bookingRequired: boolean;
  weatherDependent: boolean;
}

export interface ItineraryMeal {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  suggestion: string;
  restaurant?: string;
  cuisine?: string;
  priceRange?: string;
  notes?: string;
}

export interface ItineraryResponse {
  itinerary: ItineraryDay[];
  overview: string;
  packingTips: string[];
  localInsights: string[];
  emergencyContacts: { name: string; phone: string }[];
}

export interface QuickTip {
  category: string;
  tip: string;
  icon: string;
}

export interface RecommendationsRequest {
  type: 'dining' | 'activities' | 'attractions' | 'shopping' | 'all';
  village?: string;
  propertyId?: string;
  mood?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  partySize?: number;
  budget?: 'budget' | 'moderate' | 'luxury';
}

export interface Recommendation {
  id: string;
  name: string;
  type: string;
  description: string;
  distance?: string;
  rating?: number;
  priceRange?: string;
  highlights: string[];
  imageUrl?: string;
  address?: string;
  phone?: string;
  website?: string;
  hours?: string;
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  personalizedNote: string;
}

// Hook for semantic AI search
export function useAISearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce the query
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  const searchMutation = useMutation({
    mutationFn: async (request: SemanticSearchRequest) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/ai/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(api.getToken() ? { Authorization: `Bearer ${api.getToken()}` } : {}),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      return response.json() as Promise<SemanticSearchResponse>;
    },
  });

  const search = useCallback((request: Omit<SemanticSearchRequest, 'query'>) => {
    if (debouncedQuery.trim()) {
      return searchMutation.mutateAsync({ ...request, query: debouncedQuery });
    }
    return Promise.resolve(null);
  }, [debouncedQuery, searchMutation]);

  return {
    query,
    setQuery,
    search,
    results: searchMutation.data,
    isSearching: searchMutation.isPending,
    error: searchMutation.error,
    reset: () => {
      setQuery('');
      setDebouncedQuery('');
      searchMutation.reset();
    },
  };
}

// Hook for AI-powered itinerary generation
export function useAIItinerary() {
  const generateMutation = useMutation({
    mutationFn: async (request: ItineraryRequest) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/ai/itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(api.getToken() ? { Authorization: `Bearer ${api.getToken()}` } : {}),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to generate itinerary');
      }

      return response.json() as Promise<ItineraryResponse>;
    },
  });

  return {
    generate: generateMutation.mutateAsync,
    itinerary: generateMutation.data,
    isGenerating: generateMutation.isPending,
    error: generateMutation.error,
    reset: generateMutation.reset,
  };
}

// Hook for AI recommendations
export function useAIRecommendations() {
  const recommendMutation = useMutation({
    mutationFn: async (request: RecommendationsRequest) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/ai/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(api.getToken() ? { Authorization: `Bearer ${api.getToken()}` } : {}),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      return response.json() as Promise<RecommendationsResponse>;
    },
  });

  return {
    getRecommendations: recommendMutation.mutateAsync,
    recommendations: recommendMutation.data,
    isLoading: recommendMutation.isPending,
    error: recommendMutation.error,
    reset: recommendMutation.reset,
  };
}

// Hook for quick tips about a village
export function useQuickTips(village?: string) {
  return useQuery({
    queryKey: ['quickTips', village],
    queryFn: async () => {
      if (!village) return null;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/ai/quick-tips/${encodeURIComponent(village)}`, {
        headers: {
          ...(api.getToken() ? { Authorization: `Bearer ${api.getToken()}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get tips');
      }

      return response.json() as Promise<QuickTip[]>;
    },
    enabled: !!village,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
}

// Hook for trip insights
export function useTripInsights(reservationId?: string) {
  return useQuery({
    queryKey: ['tripInsights', reservationId],
    queryFn: async () => {
      if (!reservationId) return null;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/ai/insights/${reservationId}`, {
        headers: {
          ...(api.getToken() ? { Authorization: `Bearer ${api.getToken()}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get trip insights');
      }

      return response.json();
    },
    enabled: !!reservationId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

// Hook for quick Q&A with Sandy
export function useAskSandy() {
  const askMutation = useMutation({
    mutationFn: async (request: { question: string; context?: Record<string, any> }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(api.getToken() ? { Authorization: `Bearer ${api.getToken()}` } : {}),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      return response.json() as Promise<{ answer: string; suggestedFollowUps?: string[] }>;
    },
  });

  return {
    ask: askMutation.mutateAsync,
    answer: askMutation.data,
    isAsking: askMutation.isPending,
    error: askMutation.error,
    reset: askMutation.reset,
  };
}

// Combined hook for all AI features
export function useAI() {
  const search = useAISearch();
  const itinerary = useAIItinerary();
  const recommendations = useAIRecommendations();
  const sandy = useAskSandy();

  return {
    search,
    itinerary,
    recommendations,
    sandy,
  };
}
