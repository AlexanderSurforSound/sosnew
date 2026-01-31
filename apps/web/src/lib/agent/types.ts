/**
 * Sandy AI Agent Type Definitions
 *
 * Shared types used across the agent system. Import from here
 * to ensure type consistency across tools, providers, and UI.
 *
 * @module agent/types
 */

import type { Anthropic } from '@anthropic-ai/sdk';

// ═══════════════════════════════════════════════════════════════════════════
// TOOL TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Claude tool definition format
 * @see https://docs.anthropic.com/claude/docs/tool-use
 */
export type ToolDefinition = Anthropic.Messages.Tool;

/**
 * Result of a tool execution
 * @template T - The data type returned on success
 */
export interface ToolResult<T = unknown> {
  /** Whether the tool executed successfully */
  success: boolean;
  /** Result data (only present on success) */
  data?: T;
  /** Error message (only present on failure) */
  error?: string;
  /** Optional message for Claude to include in response */
  message?: string;
}

/**
 * UI action that the agent wants the client to perform
 */
export interface AgentAction {
  /** Type of action */
  type: 'show_properties' | 'show_booking_confirmation' | 'navigate' | 'show_message';
  /** Action-specific data */
  data: unknown;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROPERTY TYPES (Tool Results)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compact property data for search results
 */
export interface PropertySummary {
  id: string;
  slug: string;
  name: string;
  village: string;
  bedrooms: number;
  bathrooms: number;
  sleeps: number;
  petFriendly: boolean;
  baseRate?: number;
  primaryImage?: string;
  amenityHighlights: string[];
}

/**
 * Full property details
 */
export interface PropertyDetails extends PropertySummary {
  headline?: string;
  description?: string;
  amenities: string[];
  images: string[];
  highlights?: string[];
}

/**
 * Property search result
 */
export interface PropertySearchResult {
  properties: PropertySummary[];
  total: number;
  message: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// AVAILABILITY TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Availability check result
 */
export interface AvailabilityResult {
  propertyId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  isAvailable: boolean;
  nights: number;
  minimumStay?: number;
  message: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// PRICING TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pricing quote result
 */
export interface PricingQuoteResult {
  propertyId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  accommodationTotal: number;
  cleaningFee: number;
  serviceFee: number;
  petFee?: number;
  taxes: number;
  total: number;
  breakdown: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOKING TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Booking intent - represents a prepared (not completed) booking
 */
export interface BookingIntent {
  intentId: string;
  propertyId: string;
  propertyName: string;
  propertySlug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  pets: number;
  estimatedTotal: number;
  expiresAt: string;
  bookingUrl: string;
  message: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// VILLAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Village information
 */
export interface VillageInfo {
  name: string;
  slug: string;
  description: string;
  highlights: string[];
  attractions: string[];
  propertyCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// WEATHER TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Current weather conditions
 */
export interface CurrentWeather {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

/**
 * Weather forecast for a single day
 */
export interface WeatherForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  precipChance: number;
}

/**
 * Complete weather result
 */
export interface WeatherResult {
  current: CurrentWeather;
  forecast: WeatherForecast[];
}

// ═══════════════════════════════════════════════════════════════════════════
// CONVERSATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * A message in the conversation
 */
export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  actions?: AgentAction[];
  toolsUsed?: string[];
}

/**
 * Conversation state
 */
export interface Conversation {
  id: string;
  messages: Anthropic.Messages.MessageParam[];
  createdAt: Date;
  lastActivityAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// API REQUEST/RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Request to the agent API
 */
export interface AgentRequest {
  /** User's message */
  message: string;
  /** Conversation ID for continuing a conversation */
  conversationId?: string;
  /** Session ID for rate limiting */
  sessionId?: string;
  /** Additional context */
  context?: {
    /** Current property being viewed */
    propertyId?: string;
    /** Current page path */
    page?: string;
  };
}

/**
 * Response from the agent API
 */
export interface AgentResponse {
  /** Conversation ID (for continuing) */
  conversationId: string;
  /** Agent's text response */
  message: string;
  /** UI actions to perform */
  actions?: AgentAction[];
  /** Tools that were used */
  toolsUsed?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// VOICE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * TTS synthesis result
 */
export interface TTSResult {
  /** Audio data buffer */
  audio: ArrayBuffer;
  /** MIME type of the audio */
  contentType: string;
}

/**
 * TTS request
 */
export interface TTSRequest {
  /** Text to synthesize */
  text: string;
  /** Optional voice ID override */
  voice?: string;
}
