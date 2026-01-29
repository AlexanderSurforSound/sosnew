'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Pricing } from '@/types';

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
  guests?: number,
  pets?: number
) {
  // Calculate pricing based on availability data
  const { data: availability, ...rest } = useAvailability(slug, checkIn, checkOut);

  const pricing = availability
    ? calculatePricing(availability.dates, checkIn!, checkOut!, pets)
    : null;

  return {
    ...rest,
    availability,
    pricing,
  };
}

/**
 * Calculate pricing based on availability data
 *
 * Note: This is a placeholder calculation. In production, pricing should come
 * from the Track PMS API which has the actual fee structure for each property.
 *
 * Fee structure from current site:
 * - Accommodation: Weekly rates from Track PMS
 * - Home Service Fee: Per property from Track PMS (cleaning)
 * - Pet Fee: Per week, per pet from Track PMS
 * - Pool Heat: Per week from Track PMS (if selected)
 * - Travel Insurance: Percentage of total (optional)
 * - Damage Waiver / Stay Secure: From Track PMS
 * - Convenience Fee: Credit card %, debit %, or $35/payment for mail
 * - Taxes: NC Occupancy Tax + Dare County Tax
 */
function calculatePricing(
  dates: Array<{ date: string; rate?: number; isAvailable: boolean }>,
  checkIn: string,
  checkOut: string,
  pets?: number
): Pricing | null {
  const availableDates = dates.filter((d) => d.isAvailable && d.rate);

  if (availableDates.length === 0) {
    return null;
  }

  const nights = availableDates.length;
  const weeks = Math.ceil(nights / 7);

  // Accommodation total from daily rates
  const accommodationTotal = availableDates.reduce((sum, d) => sum + (d.rate || 0), 0);
  const baseRate = Math.round(accommodationTotal / nights);

  // Home Service Fee (cleaning) - placeholder, should come from Track PMS
  // Typically ranges from $200-$500 depending on property size
  const homeServiceFee = 350;

  // Pet Fee - per week, per pet - placeholder
  // Current site charges $250/pet/week
  const petFee = pets && pets > 0 ? pets * weeks * 250 : 0;

  // Damage Waiver / Stay Secure Deposit - placeholder
  // Usually around $99-$199
  const damageWaiver = 99;

  // Pool Heat - not automatically included, set to 0
  const poolHeat = 0;

  // Travel Insurance - not automatically included, set to 0
  const travelInsurance = 0;

  // Convenience Fee - not calculated until payment method selected
  const convenienceFee = 0;

  // Subtotal before taxes
  const subtotal = accommodationTotal + homeServiceFee + petFee + damageWaiver + poolHeat;

  // Tax rate: NC Occupancy Tax (5.75%) + Dare County (3%) = ~8.75% on accommodation
  // Plus 6.75% on some fees
  const accommodationTaxRate = 0.0875;
  const feeTaxRate = 0.0675;

  const accommodationTax = Math.round(accommodationTotal * accommodationTaxRate);
  const feeTax = Math.round((homeServiceFee + petFee + damageWaiver) * feeTaxRate);
  const taxes = accommodationTax + feeTax;

  const total = subtotal + taxes;

  return {
    nights,
    weeks,
    baseRate,
    accommodationTotal,
    homeServiceFee,
    petFee: petFee > 0 ? petFee : undefined,
    poolHeat: poolHeat > 0 ? poolHeat : undefined,
    damageWaiver,
    travelInsurance: travelInsurance > 0 ? travelInsurance : undefined,
    convenienceFee: convenienceFee > 0 ? convenienceFee : undefined,
    subtotal,
    taxes,
    total,
    // Legacy fields for compatibility
    cleaningFee: homeServiceFee,
    serviceFee: 0, // No separate service fee - it's included in accommodation
  };
}
