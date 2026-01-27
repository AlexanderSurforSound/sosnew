/**
 * Next.js Middleware
 * Applies security checks at the edge for all requests
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting store (edge-compatible)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Security configuration per route
const SECURITY_ROUTES = {
  api: ['/api/'],
  auth: ['/api/auth/', '/auth/'],
  forms: ['/api/contact', '/api/booking', '/api/newsletter'],
  public: ['/api/properties', '/api/villages', '/api/search'],
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Get client identifier
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';

  // Skip bot detection in development (allows curl testing)
  const isDev = process.env.NODE_ENV === 'development';

  // 1. Bot Detection (basic check at edge)
  if (!isDev && isSuspiciousBot(userAgent)) {
    // Allow known good bots
    if (!isAllowedBot(userAgent)) {
      return new NextResponse('Access Denied', { status: 403 });
    }
  }

  // 2. Rate Limiting (edge-compatible)
  const rateLimitKey = `${ip}:${getRouteType(pathname)}`;
  const rateLimit = getRateLimit(rateLimitKey, pathname);

  if (!rateLimit.allowed) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': rateLimit.retryAfter.toString(),
        'X-RateLimit-Remaining': '0',
      },
    });
  }

  // 3. Add security headers
  response.headers.set('X-Request-Id', generateRequestId());
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());

  // 4. Check for suspicious patterns in URL
  if (hasSuspiciousUrl(pathname)) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // 5. Protect sensitive routes
  if (isSensitiveRoute(pathname) && request.method !== 'GET') {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    // Check for same-origin requests
    if (origin && host && !origin.includes(host)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  return response;
}

/**
 * Check for suspicious bot patterns
 */
function isSuspiciousBot(userAgent: string): boolean {
  const suspiciousPatterns = [
    /curl/i,
    /wget/i,
    /python/i,
    /scrapy/i,
    /httpclient/i,
    /java\//i,
    /libwww/i,
    /headlesschrome/i,
    /phantomjs/i,
    /selenium/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(userAgent)) || userAgent.length < 10;
}

/**
 * Check for allowed bots (search engines)
 */
function isAllowedBot(userAgent: string): boolean {
  const allowedBots = [
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
    /baiduspider/i,
    /yandexbot/i,
    /facebot/i,
    /twitterbot/i,
    /linkedinbot/i,
  ];

  return allowedBots.some(pattern => pattern.test(userAgent));
}

/**
 * Get route type for rate limiting
 */
function getRouteType(pathname: string): string {
  for (const [type, patterns] of Object.entries(SECURITY_ROUTES)) {
    if (patterns.some(p => pathname.startsWith(p))) {
      return type;
    }
  }
  return 'default';
}

/**
 * Rate limiting with different limits per route type
 */
function getRateLimit(key: string, pathname: string): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const routeType = getRouteType(pathname);

  // Different limits for different route types
  const limits: Record<string, { max: number; window: number }> = {
    auth: { max: 10, window: 900000 },      // 10 per 15 min
    forms: { max: 20, window: 3600000 },    // 20 per hour
    api: { max: 100, window: 60000 },       // 100 per min
    public: { max: 200, window: 60000 },    // 200 per min
    default: { max: 60, window: 60000 },    // 60 per min
  };

  const { max, window } = limits[routeType] || limits.default;
  const record = rateLimitMap.get(key);

  // Clean up expired records periodically
  if (Math.random() < 0.01) {
    cleanupRateLimits(now);
  }

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + window });
    return { allowed: true, remaining: max - 1, retryAfter: 0 };
  }

  record.count++;

  if (record.count > max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  return { allowed: true, remaining: max - record.count, retryAfter: 0 };
}

/**
 * Cleanup expired rate limit records
 */
function cleanupRateLimits(now: number): void {
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

/**
 * Check for suspicious URL patterns
 */
function hasSuspiciousUrl(pathname: string): boolean {
  const suspiciousPatterns = [
    /\.\./, // Path traversal
    /[<>'"]/,  // XSS characters
    /\.(php|asp|aspx|jsp|cgi|pl)$/i, // Server-side extensions
    /wp-admin|wp-login|wp-content/i, // WordPress probes
    /\.git|\.env|\.htaccess/i, // Sensitive files
    /admin\.php|config\.php/i, // Common attack targets
    /eval\(|exec\(|system\(/i, // Code injection
    /union.*select|insert.*into|drop.*table/i, // SQL injection
  ];

  return suspiciousPatterns.some(pattern => pattern.test(pathname));
}

/**
 * Check if route is sensitive (requires extra protection)
 */
function isSensitiveRoute(pathname: string): boolean {
  const sensitiveRoutes = [
    '/api/booking',
    '/api/payment',
    '/api/auth',
    '/api/account',
    '/api/admin',
  ];

  return sensitiveRoutes.some(route => pathname.startsWith(route));
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match auth routes
    '/auth/:path*',
    // Match account routes
    '/account/:path*',
    // Match booking routes
    '/book/:path*',
    // Exclude static files and images
    '/((?!_next/static|_next/image|favicon.ico|icons|images).*)',
  ],
};
