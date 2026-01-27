/**
 * Pricing Engine for BeaconOS
 *
 * AI-powered dynamic pricing that optimizes revenue while maintaining occupancy
 */

import { BeaconConfig, BeaconEvent } from '../../core/types';
import { EventBus } from '../../utils/events';
import { IntegrationHub } from '../integrations/hub';
import {
  PricingRequest,
  PricingResponse,
  NightlyRate,
  PriceAdjustment,
  Fee,
  PricingRule,
  SeasonDefinition,
  PricingContext,
  PricingStrategy,
} from './types';
import { DynamicPricingStrategy } from './strategies/dynamic';
import { SeasonalPricingStrategy } from './strategies/seasonal';
import { OccupancyPricingStrategy } from './strategies/occupancy';
import { addDays, differenceInDays, format, isWeekend, eachDayOfInterval } from 'date-fns';

export class PricingEngine {
  private config: BeaconConfig;
  private eventBus: EventBus;
  private integrations: IntegrationHub;
  private strategies: PricingStrategy[] = [];
  private rules: PricingRule[] = [];
  private seasons: SeasonDefinition[] = [];
  private initialized = false;

  // Default fees (can be overridden per property)
  private defaultFees: Fee[] = [
    { name: 'Cleaning Fee', type: 'flat', amount: 250, calculated: 250 },
    { name: 'Service Fee', type: 'percentage', amount: 0.08, calculated: 0 },
    { name: 'Damage Protection', type: 'flat', amount: 59, calculated: 59 },
  ];

  // Tax rate (NC state + local)
  private taxRate = 0.12; // 12%

  constructor(config: BeaconConfig, eventBus: EventBus, integrations: IntegrationHub) {
    this.config = config;
    this.eventBus = eventBus;
    this.integrations = integrations;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[PricingEngine] Initializing pricing engine...');

    // Register default pricing strategies
    this.strategies = [
      new SeasonalPricingStrategy(),
      new OccupancyPricingStrategy(),
      new DynamicPricingStrategy(),
    ].sort((a, b) => a.priority - b.priority);

    // Load default seasons for OBX
    this.seasons = this.getDefaultSeasons();

    // Load pricing rules from database (TODO: implement)
    this.rules = await this.loadPricingRules();

    // Subscribe to relevant events
    this.eventBus.on('reservation.created', (event) => this.onReservationCreated(event));
    this.eventBus.on('reservation.cancelled', (event) => this.onReservationCancelled(event));

    this.initialized = true;
    console.log('[PricingEngine] Pricing engine initialized');
  }

  async shutdown(): Promise<void> {
    console.log('[PricingEngine] Shutting down pricing engine...');
    this.initialized = false;
  }

  async healthCheck(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Calculate pricing for a stay
   */
  async calculatePricing(request: PricingRequest): Promise<PricingResponse> {
    const { propertyId, checkIn, checkOut, guests, promoCode } = request;

    // Get property details from Track
    const property = await this.integrations.track.getProperty(propertyId);
    if (!property) {
      throw new Error(`Property not found: ${propertyId}`);
    }

    const nights = differenceInDays(checkOut, checkIn);
    if (nights <= 0) {
      throw new Error('Check-out must be after check-in');
    }

    // Get availability and base rates from Track
    const availability = await this.integrations.track.getAvailability(
      propertyId,
      format(checkIn, 'yyyy-MM-dd'),
      format(checkOut, 'yyyy-MM-dd')
    );

    // Build pricing context
    const context: PricingContext = {
      property: {
        id: propertyId,
        baseRate: property.baseRate || 300,
        bedrooms: property.bedrooms,
        village: property.village?.slug || 'hatteras',
      },
      occupancy: [], // TODO: Get from analytics
      seasons: this.seasons,
      rules: this.rules,
    };

    // Calculate nightly rates
    const nightlyRates = await this.calculateNightlyRates(request, context, availability);

    // Calculate subtotal
    const subtotal = nightlyRates.reduce((sum, nr) => sum + nr.rate, 0);

    // Calculate fees
    const fees = this.calculateFees(subtotal, nights, guests || property.sleeps);

    // Calculate taxes
    const taxableAmount = subtotal + fees.reduce((sum, f) => sum + f.calculated, 0);
    const taxes = Math.round(taxableAmount * this.taxRate * 100) / 100;

    // Apply promo code discount
    let discount;
    if (promoCode) {
      discount = await this.applyPromoCode(promoCode, subtotal);
    }

    // Calculate total
    const totalAmount =
      taxableAmount + taxes - (discount?.savings || 0);

    // Collect all adjustments
    const adjustments: PriceAdjustment[] = [];
    nightlyRates.forEach((nr) => {
      nr.adjustments.forEach((adj) => {
        const existing = adjustments.find((a) => a.type === adj.type);
        if (existing) {
          existing.applied += adj.applied;
        } else {
          adjustments.push({ ...adj });
        }
      });
    });

    return {
      propertyId,
      checkIn,
      checkOut,
      nights,
      baseRate: context.property.baseRate,
      nightlyRates,
      adjustments,
      subtotal,
      taxes,
      fees,
      totalAmount,
      discount,
      currency: 'USD',
      calculatedAt: new Date(),
      expiresAt: addDays(new Date(), 1), // Price valid for 24 hours
    };
  }

  /**
   * Calculate individual nightly rates
   */
  private async calculateNightlyRates(
    request: PricingRequest,
    context: PricingContext,
    availability: any[]
  ): Promise<NightlyRate[]> {
    const dates = eachDayOfInterval({
      start: request.checkIn,
      end: addDays(request.checkOut, -1),
    });

    const nightlyRates: NightlyRate[] = [];

    for (const date of dates) {
      const availDay = availability.find(
        (a) => a.date === format(date, 'yyyy-MM-dd')
      );

      // Start with base rate from Track or property default
      const baseRate = availDay?.rate || context.property.baseRate;

      // Apply all pricing strategies
      const adjustments: PriceAdjustment[] = [];
      let rate = baseRate;

      for (const strategy of this.strategies) {
        const strategyAdjustments = await strategy.calculate(
          { ...request, checkIn: date, checkOut: addDays(date, 1) },
          rate,
          context
        );

        for (const adj of strategyAdjustments) {
          adjustments.push(adj);
          rate += adj.applied;
        }
      }

      // Apply weekend premium
      if (isWeekend(date)) {
        const weekendPremium = Math.round(baseRate * 0.1);
        adjustments.push({
          type: 'weekend',
          name: 'Weekend Rate',
          percentage: 10,
          applied: weekendPremium,
        });
        rate += weekendPremium;
      }

      nightlyRates.push({
        date,
        rate: Math.round(rate * 100) / 100,
        baseRate,
        adjustments,
        available: availDay?.available ?? true,
        minimumStay: availDay?.minimumStay,
      });
    }

    return nightlyRates;
  }

  /**
   * Calculate fees
   */
  private calculateFees(subtotal: number, nights: number, guests: number): Fee[] {
    return this.defaultFees.map((fee) => {
      let calculated = 0;

      switch (fee.type) {
        case 'flat':
          calculated = fee.amount;
          break;
        case 'percentage':
          calculated = Math.round(subtotal * fee.amount * 100) / 100;
          break;
        case 'per_night':
          calculated = fee.amount * nights;
          break;
        case 'per_person':
          calculated = fee.amount * guests;
          break;
      }

      return { ...fee, calculated };
    });
  }

  /**
   * Apply promo code
   */
  private async applyPromoCode(
    code: string,
    subtotal: number
  ): Promise<{ code: string; type: 'percentage' | 'fixed'; amount: number; savings: number } | undefined> {
    // TODO: Validate promo code against database
    // For now, support some test codes

    const promoCodes: Record<string, { type: 'percentage' | 'fixed'; amount: number }> = {
      WELCOME10: { type: 'percentage', amount: 0.1 },
      SAVE50: { type: 'fixed', amount: 50 },
      OBX2024: { type: 'percentage', amount: 0.15 },
    };

    const promo = promoCodes[code.toUpperCase()];
    if (!promo) {
      return undefined;
    }

    const savings =
      promo.type === 'percentage'
        ? Math.round(subtotal * promo.amount * 100) / 100
        : promo.amount;

    return {
      code: code.toUpperCase(),
      type: promo.type,
      amount: promo.amount,
      savings,
    };
  }

  /**
   * Get recommended price for a property/date
   */
  async getRecommendedPrice(propertyId: string, date: Date): Promise<{
    recommended: number;
    min: number;
    max: number;
    confidence: number;
    factors: string[];
  }> {
    const property = await this.integrations.track.getProperty(propertyId);
    const baseRate = property?.baseRate || 300;

    // TODO: Use ML model for price recommendations
    // For now, use simple heuristics

    const factors: string[] = [];
    let multiplier = 1.0;

    // Check season
    const season = this.getCurrentSeason(date);
    if (season) {
      multiplier *= season.multiplier;
      factors.push(`${season.name} season (${Math.round((season.multiplier - 1) * 100)}%)`);
    }

    // Weekend adjustment
    if (isWeekend(date)) {
      multiplier *= 1.1;
      factors.push('Weekend premium (+10%)');
    }

    // Days until date
    const daysOut = differenceInDays(date, new Date());
    if (daysOut <= 7) {
      multiplier *= 0.85;
      factors.push('Last minute discount (-15%)');
    } else if (daysOut >= 90) {
      multiplier *= 0.95;
      factors.push('Early bird rate (-5%)');
    }

    const recommended = Math.round(baseRate * multiplier);

    return {
      recommended,
      min: Math.round(recommended * 0.8),
      max: Math.round(recommended * 1.3),
      confidence: 0.75,
      factors,
    };
  }

  /**
   * Recalculate pricing for dates around a new booking
   */
  async recalculateSurroundingDates(propertyId: string): Promise<void> {
    console.log(`[PricingEngine] Recalculating prices for property ${propertyId}`);
    // TODO: Implement dynamic repricing based on new booking
    // This would update prices in Track PMS
  }

  /**
   * Get current season for a date
   */
  private getCurrentSeason(date: Date): SeasonDefinition | null {
    const mmdd = format(date, 'MM-dd');

    for (const season of this.seasons) {
      if (this.isDateInSeason(mmdd, season.startDate, season.endDate)) {
        return season;
      }
    }

    return null;
  }

  private isDateInSeason(mmdd: string, start: string, end: string): boolean {
    // Handle wrap-around seasons (e.g., winter: 12-01 to 02-28)
    if (start > end) {
      return mmdd >= start || mmdd <= end;
    }
    return mmdd >= start && mmdd <= end;
  }

  /**
   * Get default seasons for OBX
   */
  private getDefaultSeasons(): SeasonDefinition[] {
    return [
      {
        id: 'peak',
        name: 'Peak Summer',
        startDate: '06-15',
        endDate: '08-15',
        multiplier: 1.5,
        minimumStay: 7,
      },
      {
        id: 'summer',
        name: 'Summer',
        startDate: '05-15',
        endDate: '09-15',
        multiplier: 1.3,
        minimumStay: 5,
      },
      {
        id: 'spring',
        name: 'Spring',
        startDate: '03-15',
        endDate: '05-14',
        multiplier: 1.1,
        minimumStay: 3,
      },
      {
        id: 'fall',
        name: 'Fall',
        startDate: '09-16',
        endDate: '11-15',
        multiplier: 1.1,
        minimumStay: 3,
      },
      {
        id: 'winter',
        name: 'Off Season',
        startDate: '11-16',
        endDate: '03-14',
        multiplier: 0.85,
        minimumStay: 2,
      },
    ];
  }

  /**
   * Load pricing rules from database
   */
  private async loadPricingRules(): Promise<PricingRule[]> {
    // TODO: Load from database
    return [];
  }

  /**
   * Event handlers
   */
  private async onReservationCreated(event: BeaconEvent): Promise<void> {
    const { propertyId } = event.payload as { propertyId: string };
    await this.recalculateSurroundingDates(propertyId);
  }

  private async onReservationCancelled(event: BeaconEvent): Promise<void> {
    const { propertyId } = event.payload as { propertyId: string };
    await this.recalculateSurroundingDates(propertyId);
  }
}
