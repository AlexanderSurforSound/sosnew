/**
 * CSRF (Cross-Site Request Forgery) Protection
 * Token-based CSRF protection with double-submit cookie pattern
 */

import { cookies } from 'next/headers';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = '__csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_EXPIRY = 3600000; // 1 hour

interface CSRFToken {
  token: string;
  createdAt: number;
}

// In-memory token store (use Redis in production)
const tokenStore = new Map<string, CSRFToken>();

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const randomValues = new Uint8Array(CSRF_TOKEN_LENGTH);

  // Use crypto.getRandomValues in browser, or generate pseudo-random in Node
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
  } else {
    for (let i = 0; i < CSRF_TOKEN_LENGTH; i++) {
      randomValues[i] = Math.floor(Math.random() * 256);
    }
  }

  for (let i = 0; i < CSRF_TOKEN_LENGTH; i++) {
    token += chars[randomValues[i] % chars.length];
  }

  return token;
}

/**
 * Create a new CSRF token for a session
 */
export function createCSRFToken(sessionId: string): string {
  const token = generateToken();

  tokenStore.set(sessionId, {
    token,
    createdAt: Date.now(),
  });

  // Clean up expired tokens periodically
  cleanupExpiredTokens();

  return token;
}

/**
 * Validate a CSRF token
 */
export function validateCSRFToken(sessionId: string, providedToken: string): boolean {
  const storedData = tokenStore.get(sessionId);

  if (!storedData) {
    return false;
  }

  // Check if token is expired
  if (Date.now() - storedData.createdAt > TOKEN_EXPIRY) {
    tokenStore.delete(sessionId);
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(storedData.token, providedToken);
}

/**
 * Get or create CSRF token for current session
 */
export async function getOrCreateCSRFToken(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get('session_id')?.value;

  if (!sessionId) {
    sessionId = generateToken();
  }

  const existingToken = tokenStore.get(sessionId);
  if (existingToken && Date.now() - existingToken.createdAt < TOKEN_EXPIRY) {
    return existingToken.token;
  }

  return createCSRFToken(sessionId);
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [sessionId, data] of tokenStore.entries()) {
    if (now - data.createdAt > TOKEN_EXPIRY) {
      tokenStore.delete(sessionId);
    }
  }
}

/**
 * Middleware helper to validate CSRF for API routes
 */
export async function validateCSRFRequest(request: Request): Promise<{ valid: boolean; error?: string }> {
  // Skip for safe methods
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { valid: true };
  }

  const cookieHeader = request.headers.get('cookie');
  const csrfHeader = request.headers.get(CSRF_HEADER_NAME);

  if (!csrfHeader) {
    return { valid: false, error: 'CSRF token missing' };
  }

  // Extract session ID from cookies
  const sessionMatch = cookieHeader?.match(/session_id=([^;]+)/);
  const sessionId = sessionMatch?.[1];

  if (!sessionId) {
    return { valid: false, error: 'Session not found' };
  }

  if (!validateCSRFToken(sessionId, csrfHeader)) {
    return { valid: false, error: 'Invalid CSRF token' };
  }

  return { valid: true };
}

/**
 * React hook helper - returns token for client-side use
 */
export function useCSRFToken(): { tokenName: string; headerName: string } {
  return {
    tokenName: CSRF_COOKIE_NAME,
    headerName: CSRF_HEADER_NAME,
  };
}

/**
 * Get CSRF token from cookie (client-side)
 */
export function getCSRFTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp(`${CSRF_COOKIE_NAME}=([^;]+)`));
  return match?.[1] || null;
}
