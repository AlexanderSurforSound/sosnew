/**
 * Security Middleware
 * Combines all security checks into a unified middleware system
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier, getRateLimitHeaders, RATE_LIMIT_CONFIGS } from './rate-limiter';
import { validateCSRFRequest } from './csrf';
import { detectBot, type BotDetectionContext } from './bot-detection';
import { containsDangerousContent, sanitizeInput } from './sanitize';
import { verifyRecaptcha } from './recaptcha';

export interface SecurityConfig {
  // Rate limiting
  rateLimit?: {
    enabled: boolean;
    type: keyof typeof RATE_LIMIT_CONFIGS;
  };

  // CSRF protection
  csrf?: {
    enabled: boolean;
  };

  // Bot detection
  botDetection?: {
    enabled: boolean;
    blockOnDetection?: boolean;
    challengeThreshold?: number;
  };

  // Input validation
  inputValidation?: {
    enabled: boolean;
    maxLength?: number;
  };

  // reCAPTCHA
  recaptcha?: {
    enabled: boolean;
    action: string;
    tokenField?: string;
  };
}

export interface SecurityResult {
  allowed: boolean;
  status?: number;
  message?: string;
  headers?: Record<string, string>;
  warnings?: string[];
}

/**
 * Main security middleware function
 */
export async function withSecurity(
  request: NextRequest,
  config: SecurityConfig
): Promise<SecurityResult> {
  const warnings: string[] = [];
  const headers: Record<string, string> = {};

  // Get client identifier
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || null;
  const userAgent = request.headers.get('user-agent');
  const clientId = getClientIdentifier(ip, userAgent);

  // 1. Rate Limiting
  if (config.rateLimit?.enabled) {
    const rateLimitConfig = RATE_LIMIT_CONFIGS[config.rateLimit.type];
    const rateLimitResult = checkRateLimit(clientId, rateLimitConfig);

    Object.assign(headers, getRateLimitHeaders(rateLimitResult));

    if (!rateLimitResult.allowed) {
      return {
        allowed: false,
        status: 429,
        message: 'Too many requests. Please try again later.',
        headers,
      };
    }
  }

  // 2. Bot Detection
  if (config.botDetection?.enabled) {
    const botContext: BotDetectionContext = {
      userAgent,
      ip,
      headers: request.headers,
    };

    const botResult = detectBot(botContext);

    if (botResult.isMaliciousBot && config.botDetection.blockOnDetection) {
      return {
        allowed: false,
        status: 403,
        message: 'Access denied.',
        headers,
      };
    }

    if (botResult.isBot && !botResult.isAllowedBot) {
      warnings.push(`Bot detected: ${botResult.signals.join(', ')}`);
    }

    headers['X-Bot-Score'] = botResult.confidence.toString();
  }

  // 3. CSRF Validation (for non-GET requests)
  if (config.csrf?.enabled && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const csrfResult = await validateCSRFRequest(request);

    if (!csrfResult.valid) {
      return {
        allowed: false,
        status: 403,
        message: csrfResult.error || 'Invalid request.',
        headers,
      };
    }
  }

  // 4. reCAPTCHA Verification
  if (config.recaptcha?.enabled) {
    const tokenField = config.recaptcha.tokenField || 'recaptchaToken';
    let token: string | null = null;

    // Try to get token from different sources
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        const body = await request.clone().json();
        token = body[tokenField];
      } catch {
        // Ignore parse errors
      }
    } else if (contentType.includes('form')) {
      try {
        const formData = await request.clone().formData();
        token = formData.get(tokenField) as string;
      } catch {
        // Ignore parse errors
      }
    }

    if (!token) {
      return {
        allowed: false,
        status: 400,
        message: 'Security verification required.',
        headers,
      };
    }

    const recaptchaResult = await verifyRecaptcha(token, config.recaptcha.action);

    if (!recaptchaResult.valid) {
      return {
        allowed: false,
        status: 403,
        message: recaptchaResult.error || 'Security verification failed.',
        headers,
      };
    }

    if (recaptchaResult.action === 'challenge') {
      warnings.push('Low reCAPTCHA score - additional verification recommended');
    }
  }

  // 5. Input Validation (basic dangerous content check)
  if (config.inputValidation?.enabled && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const contentType = request.headers.get('content-type') || '';
    let body: string | null = null;

    if (contentType.includes('application/json') || contentType.includes('form')) {
      try {
        body = await request.clone().text();
      } catch {
        // Ignore read errors
      }
    }

    if (body) {
      const dangerCheck = containsDangerousContent(body);
      if (dangerCheck.isDangerous) {
        return {
          allowed: false,
          status: 400,
          message: 'Invalid input detected.',
          headers,
        };
      }
    }
  }

  return {
    allowed: true,
    headers,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Create security response
 */
export function createSecurityResponse(result: SecurityResult): NextResponse | null {
  if (result.allowed) {
    return null;
  }

  const response = NextResponse.json(
    { error: result.message },
    { status: result.status || 403 }
  );

  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      response.headers.set(key, value);
    }
  }

  return response;
}

/**
 * Pre-configured security middleware for common use cases
 */
export const securityPresets = {
  // For general API endpoints
  api: {
    rateLimit: { enabled: true, type: 'api' as const },
    csrf: { enabled: true },
    botDetection: { enabled: true, blockOnDetection: false },
    inputValidation: { enabled: true },
  },

  // For authentication endpoints
  auth: {
    rateLimit: { enabled: true, type: 'auth' as const },
    csrf: { enabled: true },
    botDetection: { enabled: true, blockOnDetection: true },
    inputValidation: { enabled: true },
    recaptcha: { enabled: true, action: 'login' },
  },

  // For form submissions
  forms: {
    rateLimit: { enabled: true, type: 'forms' as const },
    csrf: { enabled: true },
    botDetection: { enabled: true, blockOnDetection: false },
    inputValidation: { enabled: true },
    recaptcha: { enabled: true, action: 'submit' },
  },

  // For booking/payment endpoints
  booking: {
    rateLimit: { enabled: true, type: 'booking' as const },
    csrf: { enabled: true },
    botDetection: { enabled: true, blockOnDetection: true },
    inputValidation: { enabled: true },
    recaptcha: { enabled: true, action: 'booking' },
  },

  // For search endpoints (lighter protection)
  search: {
    rateLimit: { enabled: true, type: 'search' as const },
    botDetection: { enabled: true, blockOnDetection: false },
  },
};
