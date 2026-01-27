/**
 * Core Types for BeaconOS
 */

import { z } from 'zod';

// ============================================
// CONFIGURATION
// ============================================

export const BeaconConfigSchema = z.object({
  // Environment
  environment: z.enum(['development', 'staging', 'production']),

  // Database connections
  database: z.object({
    sqlServer: z.string(),
    redis: z.string().optional(),
  }),

  // Integration credentials
  integrations: z.object({
    track: z.object({
      apiUrl: z.string(),
      apiKey: z.string(),
      apiSecret: z.string(),
    }),
    sanity: z
      .object({
        projectId: z.string(),
        dataset: z.string(),
        token: z.string().optional(),
      })
      .optional(),
    stripe: z
      .object({
        secretKey: z.string(),
        webhookSecret: z.string(),
      })
      .optional(),
    twilio: z
      .object({
        accountSid: z.string(),
        authToken: z.string(),
        phoneNumber: z.string(),
      })
      .optional(),
    sendgrid: z
      .object({
        apiKey: z.string(),
        fromEmail: z.string(),
      })
      .optional(),
    openai: z
      .object({
        apiKey: z.string(),
        model: z.string().default('gpt-4-turbo'),
      })
      .optional(),
    anthropic: z
      .object({
        apiKey: z.string(),
        model: z.string().default('claude-sonnet-4-20250514'),
      })
      .optional(),
  }),

  // Feature flags
  features: z.object({
    dynamicPricing: z.boolean().default(true),
    aiConcierge: z.boolean().default(true),
    automatedMessaging: z.boolean().default(true),
    smartLocks: z.boolean().default(false),
    ownerPortal: z.boolean().default(true),
  }),

  // Pricing settings
  pricing: z
    .object({
      minOccupancy: z.number().default(0.4),
      maxOccupancy: z.number().default(0.95),
      basePriceMultiplier: z.number().default(1.0),
      lastMinuteThresholdDays: z.number().default(7),
      lastMinuteDiscountMax: z.number().default(0.25),
    })
    .optional(),
});

export type BeaconConfig = z.infer<typeof BeaconConfigSchema>;

// ============================================
// CONTEXT
// ============================================

export interface BeaconContext {
  config: BeaconConfig;
  requestId?: string;
  userId?: string;
  propertyId?: string;
  timestamp: Date;
}

// ============================================
// CORE ENTITIES
// ============================================

export interface Property {
  id: string;
  trackId: string;
  name: string;
  slug: string;
  houseNumber: string;
  bedrooms: number;
  bathrooms: number;
  sleeps: number;
  village: string;
  petFriendly: boolean;
  amenities: string[];
  baseRate: number;
  ownerId?: string;
}

export interface Guest {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  loyaltyPoints: number;
  totalStays: number;
}

export interface Reservation {
  id: string;
  confirmationNumber: string;
  propertyId: string;
  guestId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalAmount: number;
  status: ReservationStatus;
  createdAt: Date;
}

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled';

export interface Owner {
  id: string;
  email: string;
  name: string;
  properties: string[];
  payoutMethod: 'ach' | 'check';
  commissionRate: number;
}

// ============================================
// EVENTS
// ============================================

export type BeaconEventType =
  // Reservation events
  | 'reservation.created'
  | 'reservation.confirmed'
  | 'reservation.modified'
  | 'reservation.cancelled'
  | 'reservation.checkin'
  | 'reservation.checkout'
  // Guest events
  | 'guest.created'
  | 'guest.updated'
  | 'guest.loyalty_tier_changed'
  // Property events
  | 'property.availability_changed'
  | 'property.rate_changed'
  | 'property.status_changed'
  // Operations events
  | 'housekeeping.scheduled'
  | 'housekeeping.started'
  | 'housekeeping.completed'
  | 'maintenance.requested'
  | 'maintenance.scheduled'
  | 'maintenance.completed'
  | 'inspection.scheduled'
  | 'inspection.completed'
  // Messaging events
  | 'message.sent'
  | 'message.received'
  | 'message.ai_response'
  // Payment events
  | 'payment.initiated'
  | 'payment.completed'
  | 'payment.failed'
  | 'refund.initiated'
  | 'refund.completed';

export interface BeaconEvent<T = unknown> {
  id: string;
  type: BeaconEventType;
  payload: T;
  timestamp: Date;
  source: string;
  correlationId?: string;
}

// ============================================
// WORKFLOW
// ============================================

export interface WorkflowDefinition {
  id: string;
  name: string;
  trigger: BeaconEventType | BeaconEventType[];
  conditions?: WorkflowCondition[];
  actions: WorkflowAction[];
  enabled: boolean;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte';
  value: unknown;
}

export interface WorkflowAction {
  type: string;
  config: Record<string, unknown>;
  delay?: number; // milliseconds
}

// ============================================
// API RESPONSES
// ============================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    requestId: string;
    duration: number;
  };
}
