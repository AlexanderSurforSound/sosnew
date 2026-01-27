/**
 * Pricing Types for BeaconOS
 */

export interface PricingRequest {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  guests?: number;
  promoCode?: string;
}

export interface PricingResponse {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;

  // Base pricing
  baseRate: number;
  nightlyRates: NightlyRate[];

  // Adjustments
  adjustments: PriceAdjustment[];

  // Totals
  subtotal: number;
  taxes: number;
  fees: Fee[];
  totalAmount: number;

  // Discount info
  discount?: {
    code?: string;
    type: 'percentage' | 'fixed';
    amount: number;
    savings: number;
  };

  // Metadata
  currency: string;
  calculatedAt: Date;
  expiresAt: Date;
}

export interface NightlyRate {
  date: Date;
  rate: number;
  baseRate: number;
  adjustments: PriceAdjustment[];
  available: boolean;
  minimumStay?: number;
}

export interface PriceAdjustment {
  type: AdjustmentType;
  name: string;
  percentage?: number;
  amount?: number;
  applied: number;
}

export type AdjustmentType =
  | 'seasonal'
  | 'weekend'
  | 'holiday'
  | 'last_minute'
  | 'early_bird'
  | 'length_of_stay'
  | 'occupancy'
  | 'demand'
  | 'custom';

export interface Fee {
  name: string;
  type: 'flat' | 'percentage' | 'per_night' | 'per_person';
  amount: number;
  calculated: number;
}

export interface PricingRule {
  id: string;
  name: string;
  type: AdjustmentType;
  enabled: boolean;
  priority: number;

  // Conditions
  conditions: {
    propertyIds?: string[];
    villages?: string[];
    dateRange?: { start: Date; end: Date };
    daysOfWeek?: number[];
    minimumNights?: number;
    maximumNights?: number;
    daysBeforeArrival?: { min?: number; max?: number };
    occupancyThreshold?: { min?: number; max?: number };
  };

  // Adjustment
  adjustment: {
    type: 'percentage' | 'fixed';
    value: number;
    operation: 'add' | 'subtract' | 'multiply';
  };
}

export interface SeasonDefinition {
  id: string;
  name: string;
  startDate: string; // MM-DD format
  endDate: string; // MM-DD format
  multiplier: number;
  minimumStay?: number;
}

export interface OccupancyData {
  propertyId: string;
  date: Date;
  booked: boolean;
  occupancyRate: number; // 0-1 for surrounding area
  competitorRates?: number[];
}

export interface PricingStrategy {
  name: string;
  priority: number;
  calculate(
    request: PricingRequest,
    baseRate: number,
    context: PricingContext
  ): Promise<PriceAdjustment[]>;
}

export interface PricingContext {
  property: {
    id: string;
    baseRate: number;
    bedrooms: number;
    village: string;
  };
  occupancy: OccupancyData[];
  seasons: SeasonDefinition[];
  rules: PricingRule[];
  historicalData?: {
    averageRate: number;
    bookingLeadTime: number;
    conversionRate: number;
  };
}
