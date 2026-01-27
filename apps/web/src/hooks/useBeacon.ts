/**
 * React Hooks for BeaconOS Integration
 *
 * Client-side hooks for interacting with BeaconOS APIs
 */

'use client';

import { useState, useCallback, useTransition } from 'react';
import useSWR, { SWRConfiguration } from 'swr';

// SWR fetcher with error handling
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'An error occurred');
  }
  return res.json();
};

// ============================================
// PRICING HOOKS
// ============================================

interface PricingRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  promoCode?: string;
}

interface PricingResponse {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  baseRate: number;
  subtotal: number;
  taxes: number;
  fees: Array<{ name: string; amount: number; calculated: number }>;
  totalAmount: number;
  discount?: {
    code: string;
    savings: number;
  };
}

export function usePricing(
  request: PricingRequest | null,
  options?: SWRConfiguration
) {
  const params = request
    ? new URLSearchParams({
        propertyId: request.propertyId,
        checkIn: request.checkIn,
        checkOut: request.checkOut,
        ...(request.guests && { guests: String(request.guests) }),
        ...(request.promoCode && { promoCode: request.promoCode }),
      })
    : null;

  const { data, error, isLoading, mutate } = useSWR<PricingResponse>(
    params ? `/api/beacon/pricing?${params.toString()}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 seconds
      ...options,
    }
  );

  return {
    pricing: data,
    isLoading,
    error,
    refetch: mutate,
  };
}

export function usePriceRecommendation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getRecommendation = useCallback(
    async (propertyId: string, date: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/beacon/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId, date }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to get recommendation');
        }

        return await res.json();
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { getRecommendation, isLoading, error };
}

// ============================================
// CONCIERGE HOOKS
// ============================================

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface ConciergeResponse {
  success: boolean;
  response: string;
  confidence: number;
  escalate: boolean;
  suggestedActions?: string[];
  timestamp: string;
}

export function useConcierge() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (
      message: string,
      context?: {
        guestId?: string;
        propertyId?: string;
        reservationId?: string;
      }
    ) => {
      setIsLoading(true);
      setError(null);

      // Add user message immediately
      const userMessage: ConversationMessage = {
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const res = await fetch('/api/beacon/concierge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            ...context,
            conversationHistory: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to send message');
        }

        const data: ConciergeResponse = await res.json();

        // Add assistant response
        const assistantMessage: ConversationMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(data.timestamp),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        return data;
      } catch (err: any) {
        setError(err);
        // Remove the user message on error
        setMessages((prev) => prev.slice(0, -1));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading,
    error,
  };
}

export function useRecommendations(
  location?: string,
  type?: 'restaurant' | 'activity' | 'attraction'
) {
  const params = new URLSearchParams({
    ...(location && { location }),
    ...(type && { type }),
  });

  const { data, error, isLoading } = useSWR(
    `/api/beacon/concierge/recommendations?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600000, // 1 hour
    }
  );

  return {
    recommendations: data?.recommendations || [],
    isLoading,
    error,
  };
}

// ============================================
// AVAILABILITY HOOKS
// ============================================

interface AvailabilityDay {
  date: string;
  available: boolean;
  rate?: number;
  minimumStay?: number;
}

export function useAvailabilityCalendar(
  propertyId: string | null,
  startDate: string,
  endDate: string
) {
  const params =
    propertyId && startDate && endDate
      ? new URLSearchParams({ propertyId, startDate, endDate })
      : null;

  const { data, error, isLoading, mutate } = useSWR<AvailabilityDay[]>(
    params ? `/api/graphql?query=availability&${params.toString()}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    availability: data || [],
    isLoading,
    error,
    refetch: mutate,
  };
}
