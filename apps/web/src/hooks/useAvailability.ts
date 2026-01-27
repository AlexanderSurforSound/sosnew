'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useAvailability(slug: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['availability', slug, startDate, endDate],
    queryFn: () => api.getPropertyAvailability(slug, startDate!, endDate!),
    enabled: !!slug && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePropertyPricing(
  slug: string,
  checkIn?: string,
  checkOut?: string,
  guests?: number
) {
  // Calculate pricing based on availability data
  const { data: availability, ...rest } = useAvailability(slug, checkIn, checkOut);

  const pricing = availability
    ? calculatePricing(availability.dates, checkIn!, checkOut!)
    : null;

  return {
    ...rest,
    availability,
    pricing,
  };
}

function calculatePricing(
  dates: Array<{ date: string; rate?: number; isAvailable: boolean }>,
  checkIn: string,
  checkOut: string
) {
  const availableDates = dates.filter((d) => d.isAvailable && d.rate);

  if (availableDates.length === 0) {
    return null;
  }

  const nights = availableDates.length;
  const accommodationTotal = availableDates.reduce((sum, d) => sum + (d.rate || 0), 0);
  const baseRate = Math.round(accommodationTotal / nights);
  const cleaningFee = 250; // Fixed cleaning fee
  const serviceFee = Math.round(accommodationTotal * 0.1); // 10% service fee
  const taxRate = 0.12; // 12% tax
  const subtotal = accommodationTotal + cleaningFee + serviceFee;
  const taxes = Math.round(subtotal * taxRate);
  const total = subtotal + taxes;
  const deposit = Math.round(total * 0.5); // 50% deposit

  return {
    nights,
    baseRate,
    accommodationTotal,
    cleaningFee,
    serviceFee,
    taxes,
    total,
    deposit,
  };
}
