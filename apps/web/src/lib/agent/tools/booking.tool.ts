/**
 * Booking Intent Tool
 *
 * Creates booking intents that prepare (but don't complete) bookings.
 * Guests must confirm and complete booking through the booking page.
 *
 * @module agent/tools/booking
 */

import { BaseTool } from './base';
import type { ToolDefinition, ToolResult, BookingIntent } from '../types';
import { getRealProperty } from '@/lib/realProperties';
import { AGENT_CONFIG } from '../config';

/**
 * Input schema for booking intent
 */
export interface StartBookingInput {
  /** Property ID or slug */
  propertyId: string;
  /** Check-in date (YYYY-MM-DD) */
  checkIn: string;
  /** Check-out date (YYYY-MM-DD) */
  checkOut: string;
  /** Number of guests */
  guests: number;
  /** Number of pets */
  pets?: number;
}

/**
 * Booking intent storage
 * Note: Use Redis or database in production
 */
const bookingIntents = new Map<string, BookingIntent & { createdAt: Date }>();

/**
 * Clean up expired intents periodically
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = new Date();
    for (const [id, intent] of bookingIntents.entries()) {
      if (new Date(intent.expiresAt) < now) {
        bookingIntents.delete(id);
      }
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}

/**
 * Get a booking intent by ID
 * @param intentId - The intent ID to retrieve
 */
export function getBookingIntent(intentId: string): BookingIntent | undefined {
  const intent = bookingIntents.get(intentId);
  if (!intent) return undefined;

  // Check if expired
  if (new Date(intent.expiresAt) < new Date()) {
    bookingIntents.delete(intentId);
    return undefined;
  }

  return intent;
}

/**
 * Booking Intent Tool
 *
 * @example
 * ```typescript
 * const result = await tool.execute({
 *   propertyId: 'beach-house-123',
 *   checkIn: '2024-07-15',
 *   checkOut: '2024-07-22',
 *   guests: 6
 * });
 * // Result includes bookingUrl for guest to complete booking
 * ```
 */
export class BookingTool extends BaseTool<StartBookingInput, BookingIntent> {
  readonly name = 'start_booking';

  readonly description = 'Create a booking intent for guest confirmation';

  readonly definition: ToolDefinition = {
    name: 'start_booking',
    description:
      'Create a booking intent for a property. This does NOT complete the booking - it prepares the booking for the guest to review and confirm. Use this when a guest explicitly says they want to book.',
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
          description: 'Number of pets (defaults to 0)',
        },
      },
      required: ['propertyId', 'checkIn', 'checkOut', 'guests'],
    },
  };

  /**
   * Execute booking intent creation
   */
  async execute(input: StartBookingInput): Promise<ToolResult<BookingIntent>> {
    const property = getRealProperty(input.propertyId);

    if (!property) {
      return this.error(`Property not found: ${input.propertyId}`);
    }

    // Calculate estimated total
    const checkIn = new Date(input.checkIn);
    const checkOut = new Date(input.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (nights < 1) {
      return this.error('Check-out date must be after check-in date');
    }

    const nightlyRate = property.baseRate ? property.baseRate / 7 : 250;
    const accommodationTotal = Math.round(nightlyRate * nights);
    const cleaningFee = 250;
    const serviceFee = Math.round(accommodationTotal * 0.1);
    const petFee = (input.pets && input.pets > 0) ? 150 : 0;
    const subtotal = accommodationTotal + cleaningFee + serviceFee + petFee;
    const taxes = Math.round(subtotal * 0.12);
    const estimatedTotal = subtotal + taxes;

    // Create booking intent
    const intentId = `intent_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const expiresAt = new Date(Date.now() + AGENT_CONFIG.rateLimit.bookingIntentTTL);

    const bookingUrl = `/book/${property.slug}?checkIn=${input.checkIn}&checkOut=${input.checkOut}&guests=${input.guests}&pets=${input.pets || 0}&intentId=${intentId}`;

    const intent: BookingIntent = {
      intentId,
      propertyId: property.id,
      propertyName: property.name,
      propertySlug: property.slug,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests: input.guests,
      pets: input.pets || 0,
      estimatedTotal,
      expiresAt: expiresAt.toISOString(),
      bookingUrl,
      message: `I've prepared your booking for ${property.name} from ${input.checkIn} to ${input.checkOut} for ${input.guests} guest${input.guests > 1 ? 's' : ''}. The estimated total is $${estimatedTotal.toLocaleString()}. Click "Continue to Booking" to complete your reservation.`,
    };

    // Store intent
    bookingIntents.set(intentId, { ...intent, createdAt: new Date() });

    return this.success(intent, intent.message);
  }
}
