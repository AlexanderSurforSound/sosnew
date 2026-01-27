/**
 * Rate Limiter Implementation
 * In-memory rate limiting with sliding window algorithm
 * For production, use Redis-based rate limiting
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
  firstRequest: number;
}

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  blockDuration?: number; // How long to block after exceeding limit (ms)
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup old entries periodically
const CLEANUP_INTERVAL = 60000; // 1 minute
let cleanupTimer: NodeJS.Timer | null = null;

function startCleanup() {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

// Default configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // General API requests
  api: {
    windowMs: 60000,      // 1 minute
    maxRequests: 100,     // 100 requests per minute
  },
  // Authentication endpoints (stricter)
  auth: {
    windowMs: 900000,     // 15 minutes
    maxRequests: 5,       // 5 attempts per 15 minutes
    blockDuration: 900000, // Block for 15 minutes after exceeding
  },
  // Contact/submission forms
  forms: {
    windowMs: 3600000,    // 1 hour
    maxRequests: 10,      // 10 submissions per hour
    blockDuration: 3600000,
  },
  // Search requests
  search: {
    windowMs: 60000,      // 1 minute
    maxRequests: 30,      // 30 searches per minute
  },
  // Booking requests (prevent abuse)
  booking: {
    windowMs: 3600000,    // 1 hour
    maxRequests: 20,      // 20 booking attempts per hour
    blockDuration: 1800000, // Block for 30 minutes
  },
} as const;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;       // Milliseconds until reset
  retryAfter?: number;   // Seconds until retry allowed (if blocked)
}

/**
 * Check if a request is rate limited
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  startCleanup();

  const now = Date.now();
  const key = identifier;
  const record = rateLimitStore.get(key);

  // No existing record, create new one
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
      firstRequest: now,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  // Check if currently blocked
  if (config.blockDuration && record.count >= config.maxRequests) {
    const blockEndTime = record.firstRequest + config.windowMs + config.blockDuration;
    if (now < blockEndTime) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: blockEndTime - now,
        retryAfter: Math.ceil((blockEndTime - now) / 1000),
      };
    }
    // Block period ended, reset
    rateLimitStore.delete(key);
    return checkRateLimit(identifier, config);
  }

  // Increment count
  record.count++;

  if (record.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetTime - now,
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetIn: record.resetTime - now,
  };
}

/**
 * Generate a unique identifier from request
 */
export function getClientIdentifier(
  ip: string | null,
  userAgent: string | null,
  userId?: string
): string {
  // Prefer user ID if authenticated
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP + User Agent hash
  const identifier = `${ip || 'unknown'}:${userAgent || 'unknown'}`;
  return `anon:${simpleHash(identifier)}`;
}

/**
 * Simple hash function for identifiers
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetIn / 1000).toString(),
  };

  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Reset rate limit for a specific identifier (for testing/admin)
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetIn: config.windowMs,
    };
  }

  return {
    allowed: record.count < config.maxRequests,
    remaining: Math.max(0, config.maxRequests - record.count),
    resetIn: record.resetTime - now,
  };
}
