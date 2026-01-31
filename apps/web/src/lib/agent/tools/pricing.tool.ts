/**
 * Pricing Quote Tool
 *
 * Enables Sandy to calculate and provide pricing quotes for stays.
 *
 * @module agent/tools/pricing
 */

import { BaseTool } from './base';
import type { ToolDefinition, ToolResult, PricingQuoteResult } from '../types';
import { getRealProperty } from '@/lib/realProperties';

/**
 * Input schema for pricing quote
 */
export interface GetPricingQuoteInput {
  /** Property ID or slug */
  propertyId: string;
  /** Check-in date (YYYY-MM-DD) */
  checkIn: string;
  /** Check-out date (YYYY-MM-DD) */
  checkOut: string;
  /** Number of guests */
  guests?: number;
  /** Number of pets */
  pets?: number;
}

/**
 * Pricing Quote Tool
 *
 * @example
 * ```typescript
 * const result = await tool.execute({
 *   propertyId: 'beach-house-123',
 *   checkIn: '2024-07-15',
 *   checkOut: '2024-07-22',
 *   guests: 6,
 *   pets: 1
 * });
 * ```
 */
export class PricingTool extends BaseTool<GetPricingQuoteInput, PricingQuoteResult> {
  readonly name = 'get_pricing_quote';

  readonly description = 'Get a pricing quote for a property stay including fees and taxes';

  readonly definition: ToolDefinition = {
    name: 'get_pricing_quote',
    description:
      'Get a pricing quote for a property stay including fees and taxes. Use this when a guest asks about pricing or total cost.',
    input_schema: {
      type: 'object' as const,
      properties: {
        propertyId: {
          type: 'string',
          description: 'The property ID or slug',
        },
        checkIn: {
          type: 'string',
          description: 'Check-in date in YYYY-MM-DD format',
        },
        checkOut: {
          type: 'string',
          description: 'Check-out date in YYYY-MM-DD format',
        },
        guests: {
          type: 'number',
          description: 'Number of guests',
        },
        pets: {
          type: 'number',
          description: 'Number of pets (if applicable)',
        },
      },
      required: ['propertyId', 'checkIn', 'checkOut'],
    },
  };

  /**
   * Execute pricing calculation
   */
  async execute(input: GetPricingQuoteInput): Promise<ToolResult<PricingQuoteResult>> {
    const property = getRealProperty(input.propertyId);

    if (!property) {
      return this.error(`Property not found: ${input.propertyId}`);
    }

    const checkIn = new Date(input.checkIn);
    const checkOut = new Date(input.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (nights < 1) {
      return this.error('Check-out date must be after check-in date');
    }

    // Calculate pricing (simplified - production would use actual rates)
    const nightlyRate = property.baseRate ? property.baseRate / 7 : 250;
    const accommodationTotal = Math.round(nightlyRate * nights);
    const cleaningFee = 250;
    const serviceFee = Math.round(accommodationTotal * 0.1);
    const petFee = (input.pets && input.pets > 0) ? 150 : 0;
    const subtotal = accommodationTotal + cleaningFee + serviceFee + petFee;
    const taxes = Math.round(subtotal * 0.12); // 12% tax rate
    const total = subtotal + taxes;

    const breakdownLines = [
      `Accommodation (${nights} nights): $${accommodationTotal.toLocaleString()}`,
      `Cleaning Fee: $${cleaningFee}`,
      `Service Fee: $${serviceFee}`,
    ];

    if (petFee > 0) {
      breakdownLines.push(`Pet Fee: $${petFee}`);
    }

    breakdownLines.push(`Taxes: $${taxes}`, `Total: $${total.toLocaleString()}`);

    const breakdown = breakdownLines.join('\n');
    const message = `The total for ${property.name} from ${input.checkIn} to ${input.checkOut} is $${total.toLocaleString()}.`;

    return this.success({
      propertyId: property.id,
      propertyName: property.name,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      nights,
      accommodationTotal,
      cleaningFee,
      serviceFee,
      petFee,
      taxes,
      total,
      breakdown,
    }, message);
  }
}
