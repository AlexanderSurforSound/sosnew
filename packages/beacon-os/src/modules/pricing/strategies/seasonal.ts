/**
 * Seasonal Pricing Strategy for BeaconOS
 *
 * Adjusts prices based on Outer Banks seasonal patterns
 */

import { PricingStrategy, PricingRequest, PriceAdjustment, PricingContext, SeasonDefinition } from '../types';
import { format } from 'date-fns';

export class SeasonalPricingStrategy implements PricingStrategy {
  name = 'seasonal';
  priority = 10; // Run first

  async calculate(
    request: PricingRequest,
    baseRate: number,
    context: PricingContext
  ): Promise<PriceAdjustment[]> {
    const adjustments: PriceAdjustment[] = [];
    const season = this.getCurrentSeason(request.checkIn, context.seasons);

    if (season && season.multiplier !== 1.0) {
      const adjustmentAmount = Math.round(baseRate * (season.multiplier - 1));
      const percentage = Math.round((season.multiplier - 1) * 100);

      adjustments.push({
        type: 'seasonal',
        name: season.name,
        percentage,
        applied: adjustmentAmount,
      });
    }

    return adjustments;
  }

  private getCurrentSeason(date: Date, seasons: SeasonDefinition[]): SeasonDefinition | null {
    const mmdd = format(date, 'MM-dd');

    for (const season of seasons) {
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
}
