/**
 * Security Module - Main Export
 * Comprehensive security utilities for the Surf or Sound platform
 */

// Rate Limiting
export {
  checkRateLimit,
  getClientIdentifier,
  getRateLimitHeaders,
  getRateLimitStatus,
  resetRateLimit,
  RATE_LIMIT_CONFIGS,
  type RateLimitResult,
} from './rate-limiter';

// CSRF Protection
export {
  createCSRFToken,
  validateCSRFToken,
  getOrCreateCSRFToken,
  validateCSRFRequest,
  useCSRFToken,
  getCSRFTokenFromCookie,
} from './csrf';

// Bot Detection
export {
  detectBot,
  generateHoneypotConfig,
  validateHoneypot,
  getBrowserFingerprintScript,
  getSubmissionMetrics,
  type BotDetectionResult,
  type BotDetectionContext,
} from './bot-detection';

// Input Sanitization
export {
  escapeHtml,
  stripHtml,
  sanitizeInput,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  sanitizeForSql,
  sanitizeObject,
  sanitizeJson,
  sanitizeFilename,
  createSlug,
  containsDangerousContent,
  type SanitizeOptions,
} from './sanitize';

// reCAPTCHA
export {
  verifyRecaptcha,
  getRecaptchaSiteKey,
  getRecaptchaScript,
  getRecaptchaExecuteScript,
  useRecaptcha,
  RECAPTCHA_THRESHOLDS,
  type RecaptchaValidationResult,
} from './recaptcha';

// Security Middleware Helper
export { withSecurity, type SecurityConfig, type SecurityResult } from './middleware';
