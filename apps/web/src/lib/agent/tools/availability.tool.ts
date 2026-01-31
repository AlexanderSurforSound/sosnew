/**
 * Availability Check Tool
 *
 * Enables Sandy to check if a property is available for specific dates.
 *
 * @module agent/tools/availability
 */

import { BaseTool } from './base';
import type { ToolDefinition, ToolResult, AvailabilityResult } from '../types';
import { getRealProperty } from '@/lib/realProperties';

/**
 * Input schema for availability check
 */
export interface CheckAvailabilityInput {
  /** Property ID or slug */
  propertyId: string;
  /** Check-in date (YYYY-MM-DD) */
  checkIn: string;
  /** Check-out date (YYYY-MM-DD) */
  checkOut: string;
}

/**
 * Availability Check Tool
 *
 * @example
 * ```typescript
 * const result = await tool.execute({
 *   propertyId: 'beach-house-123',
 *   checkIn: '2024-07-15',
 *   checkOut: '2024-07-22'
 * });
 * ```
 */
export class AvailabilityTool extends BaseTool<CheckAvailabilityInput, AvailabilityResult> {
  readonly name = 'check_availability';

  readonly description = 'Check if a property is available for specific dates';

  readonly definition: ToolDefinition = {
    name: 'check_availability',
    description:
      'Check if a property is available for specific dates. Use this when a guest asks about availability or wants to know if dates are open.',
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
      },
      required: ['propertyId', 'checkIn', 'checkOut'],
    },
  };

  /**
   * Validate date inputs
   */
  validate(input: unknown): { valid: boolean; error?: string } {
    const { checkIn, checkOut } = input as CheckAvailabilityInput;

    if (!checkIn || !checkOut) {
      return { valid: false, error: 'Check-in and check-out dates are required' };
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime())) {
      return { valid: false, error: 'Invalid check-in date format. Use YYYY-MM-DD.' };
    }

    if (isNaN(checkOutDate.getTime())) {
      return { valid: false, error: 'Invalid check-out date format. Use YYYY-MM-DD.' };
    }

    if (checkOutDate <= checkInDate) {
      return { valid: false, error: 'Check-out date must be after check-in date' };
    }

    return { valid: true };
  }

  /**
   * Execute availability check
   */
  async execute(input: CheckAvailabilityInput): Promise<ToolResult<AvailabilityResult>> {
    const property = getRealProperty(input.propertyId);

    if (!property) {
      return this.error(`Property not found: ${input.propertyId}`);
    }

    const checkIn = new Date(input.checkIn);
    const checkOut = new Date(input.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // In production, this would call the actual availability API
    // For now, simulate availability (80% chance available)
    const isAvailable = Math.random() > 0.2;
    const minimumStay = property.isFlexStay ? 3 : 7;

    let message = '';
    if (isAvailable) {
      if (nights < minimumStay) {
        message = `${property.name} requires a minimum stay of ${minimumStay} nights. Your requested stay is only ${nights} nights.`;
      } else {
        message = `${property.name} is available from ${input.checkIn} to ${input.checkOut} (${nights} nights).`;
      }
    } else {
      message = `Unfortunately, ${property.name} is not available for ${input.checkIn} to ${input.checkOut}. Would you like to try different dates or look at similar properties?`;
    }

    return this.success({
      propertyId: property.id,
      propertyName: property.name,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      isAvailable: isAvailable && nights >= minimumStay,
      nights,
      minimumStay,
      message,
    }, message);
  }
}
