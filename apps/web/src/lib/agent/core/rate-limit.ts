/**
 * Rate Limiting
 *
 * Protects the agent API from abuse with per-session rate limits.
 *
 * @module agent/core/rate-limit
 *
 * @example
 * ```typescript
 * import { checkRateLimit, RateLimitType } from './rate-limit';
 *
 * // Check if action is allowed
 * if (!checkRateLimit(sessionId, RateLimitType.MESSAGE)) {
 *   return { error: 'Too many messages' };
 * }
 * ```
 */

import { getConfig } from '../config';

/**
 * Rate limit types
 */
export enum RateLimitType {
  /** General chat messages */
  MESSAGE = 'message',
  /** Booking intent creation */
  BOOKING_INTENT = 'booking_intent',
}

/**
 * Rate limit entry for a session
 */
interface RateLimitEntry {
  /** Timestamps of messages */
  messages: number[];
  /** Timestamps of booking intents */
  bookingIntents: number[];
}

/**
 * In-memory rate limit storage
 *
 * @remarks
 * In production, use Redis or similar for distributed rate limiting
 */
const rateLimits = new Map<string, RateLimitEntry>();

/**
 * Clean up old rate limit entries periodically
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

    for (const [sessionId, entry] of rateLimits.entries()) {
      // Remove entries where all timestamps are old
      const hasRecentActivity =
        entry.messages.some(t => t > tenMinutesAgo) ||
        entry.bookingIntents.some(t => t > tenMinutesAgo);

      if (!hasRecentActivity) {
        rateLimits.delete(sessionId);
      }
    }
  }, 10 * 60 * 1000); // Every 10 minutes
}

/**
 * Check and update rate limit for a session
 *
 * @param sessionId - Session identifier
 * @param type - Type of action being rate limited
 * @returns true if action is allowed, false if rate limited
 */
export function checkRateLimit(sessionId: string, type: RateLimitType): boolean {
  const config = getConfig();
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;

  // Get or create entry
  let entry = rateLimits.get(sessionId);
  if (!entry) {
    entry = { messages: [], bookingIntents: [] };
    rateLimits.set(sessionId, entry);
  }

  // Clean old timestamps
  entry.messages = entry.messages.filter(t => t > oneMinuteAgo);
  entry.bookingIntents = entry.bookingIntents.filter(t => t > oneMinuteAgo);

  // Check limit based on type
  switch (type) {
    case RateLimitType.MESSAGE:
      if (entry.messages.length >= config.rateLimit.messagesPerMinute) {
        return false;
      }
      entry.messages.push(now);
      break;

    case RateLimitType.BOOKING_INTENT:
      if (entry.bookingIntents.length >= config.rateLimit.bookingIntentsPerMinute) {
        return false;
      }
      entry.bookingIntents.push(now);
      break;
  }

  return true;
}

/**
 * Get current rate limit status for a session
 *
 * @param sessionId - Session identifier
 * @returns Current counts and limits
 */
export function getRateLimitStatus(sessionId: string): {
  messages: { current: number; limit: number };
  bookingIntents: { current: number; limit: number };
} {
  const config = getConfig();
  const entry = rateLimits.get(sessionId);
  const oneMinuteAgo = Date.now() - 60 * 1000;

  const currentMessages = entry?.messages.filter(t => t > oneMinuteAgo).length ?? 0;
  const currentIntents = entry?.bookingIntents.filter(t => t > oneMinuteAgo).length ?? 0;

  return {
    messages: {
      current: currentMessages,
      limit: config.rateLimit.messagesPerMinute,
    },
    bookingIntents: {
      current: currentIntents,
      limit: config.rateLimit.bookingIntentsPerMinute,
    },
  };
}

/**
 * Reset rate limits for a session (admin use)
 *
 * @param sessionId - Session identifier
 */
export function resetRateLimit(sessionId: string): void {
  rateLimits.delete(sessionId);
}

/**
 * Get rate limit error message
 */
export function getRateLimitMessage(type: RateLimitType): string {
  switch (type) {
    case RateLimitType.MESSAGE:
      return 'Too many messages. Please wait a moment before sending another.';
    case RateLimitType.BOOKING_INTENT:
      return 'Too many booking attempts. Please wait before trying again.';
    default:
      return 'Rate limit exceeded. Please wait and try again.';
  }
}
