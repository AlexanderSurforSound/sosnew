/**
 * Occupancy-Based Pricing Strategy for BeaconOS
 *
 * Adjusts prices based on current occupancy levels and demand
 */

import { PricingStrategy, PricingRequest, PriceAdjustment, PricingContext } from '../types';

export class OccupancyPricingStrategy implements PricingStrategy {
  name = 'occupancy';
  priority = 20; // Run after seasonal

  // Demand factors based on occupancy rate
  private demandFactors = {
    very_high: { threshold: 0.9, multiplier: 1.5 },
    high: { threshold: 0.75, multiplier: 1.25 },
    moderate: { threshold: 0.5, multiplier: 1.0 },
    low: { threshold: 0.25, multiplier: 0.85 },
    very_low: { threshold: 0, multiplier: 0.7 },
  };

  async calculate(
    request: PricingRequest,
    baseRate: number,
    context: PricingContext
  ): Promise<PriceAdjustment[]> {
    const adjustments: PriceAdjustment[] = [];

    // Get occupancy data for the check-in date
    const occupancyData = context.occupancy.find(
      (o) => o.date.getTime() === request.checkIn.getTime()
    );

    if (!occupancyData) {
      return adjustments;
    }

    const demandLevel = this.getDemandLevel(occupancyData.occupancyRate);
    const factor = this.demandFactors[demandLevel];

    if (factor.multiplier !== 1.0) {
      const adjustment = Math.round(baseRate * (factor.multiplier - 1));
      const percentage = Math.round((factor.multiplier - 1) * 100);

      adjustments.push({
        type: 'occupancy',
        name: `${this.formatDemandLevel(demandLevel)} Demand`,
        percentage,
        applied: adjustment,
      });
    }

    // Length of stay discount
    if (request.checkOut) {
      const nights = Math.ceil(
        (request.checkOut.getTime() - request.checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (nights >= 7) {
        // Weekly discount
        const discount = Math.round(baseRate * 0.1);
        adjustments.push({
          type: 'length_of_stay',
          name: 'Weekly Stay Discount',
          percentage: -10,
          applied: -discount,
        });
      } else if (nights >= 14) {
        // Bi-weekly discount
        const discount = Math.round(baseRate * 0.15);
        adjustments.push({
          type: 'length_of_stay',
          name: 'Extended Stay Discount',
          percentage: -15,
          applied: -discount,
        });
      } else if (nights >= 28) {
        // Monthly discount
        const discount = Math.round(baseRate * 0.2);
        adjustments.push({
          type: 'length_of_stay',
          name: 'Monthly Stay Discount',
          percentage: -20,
          applied: -discount,
        });
      }
    }

    return adjustments;
  }

  private getDemandLevel(occupancyRate: number): keyof typeof this.demandFactors {
    if (occupancyRate >= 0.9) return 'very_high';
    if (occupancyRate >= 0.75) return 'high';
    if (occupancyRate >= 0.5) return 'moderate';
    if (occupancyRate >= 0.25) return 'low';
    return 'very_low';
  }

  private formatDemandLevel(level: string): string {
    return level
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
