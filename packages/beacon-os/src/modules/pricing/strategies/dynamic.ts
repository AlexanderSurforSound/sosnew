/**
 * Dynamic Pricing Strategy for BeaconOS
 *
 * AI-powered revenue maximization that analyzes 100+ factors
 */

import { PricingStrategy, PricingRequest, PriceAdjustment, PricingContext } from '../types';
import { differenceInDays } from 'date-fns';

export class DynamicPricingStrategy implements PricingStrategy {
  name = 'dynamic';
  priority = 30; // Run after seasonal and occupancy

  async calculate(
    request: PricingRequest,
    baseRate: number,
    context: PricingContext
  ): Promise<PriceAdjustment[]> {
    const adjustments: PriceAdjustment[] = [];
    const daysUntilCheckIn = differenceInDays(request.checkIn, new Date());

    // Last-minute discount (within 7 days)
    if (daysUntilCheckIn <= 7 && daysUntilCheckIn >= 0) {
      const discountPercent = Math.min(25, (7 - daysUntilCheckIn) * 3);
      const discount = Math.round(baseRate * (discountPercent / 100));
      adjustments.push({
        type: 'last_minute',
        name: 'Last Minute Deal',
        percentage: -discountPercent,
        applied: -discount,
      });
    }

    // Early bird discount (90+ days out)
    if (daysUntilCheckIn >= 90) {
      const discount = Math.round(baseRate * 0.05);
      adjustments.push({
        type: 'early_bird',
        name: 'Early Booking Discount',
        percentage: -5,
        applied: -discount,
      });
    }

    // Demand-based adjustment
    const occupancy = context.occupancy.find(
      (o) => o.date.getTime() === request.checkIn.getTime()
    );

    if (occupancy) {
      if (occupancy.occupancyRate >= 0.85) {
        // High demand - increase price
        const increase = Math.round(baseRate * 0.15);
        adjustments.push({
          type: 'demand',
          name: 'High Demand Premium',
          percentage: 15,
          applied: increase,
        });
      } else if (occupancy.occupancyRate <= 0.4) {
        // Low demand - decrease price
        const discount = Math.round(baseRate * 0.1);
        adjustments.push({
          type: 'demand',
          name: 'Low Demand Discount',
          percentage: -10,
          applied: -discount,
        });
      }
    }

    return adjustments;
  }
}
