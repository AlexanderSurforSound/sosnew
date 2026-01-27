/**
 * Input Sanitization Utilities
 * Protects against XSS, SQL Injection, and other injection attacks
 */

// HTML entities to escape
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

// Dangerous patterns to detect
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,           // Event handlers like onclick=
  /data:/gi,               // Data URIs
  /vbscript:/gi,
  /expression\s*\(/gi,     // CSS expressions
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<link/gi,
  /<style/gi,
  /<meta/gi,
  /<!--/g,                 // HTML comments
  /-->/g,
];

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(select|insert|update|delete|drop|create|alter|truncate|exec|execute|union|declare|cast)\b)/gi,
  /['"]\s*(or|and)\s*['"]?\s*(=|[0-9])/gi,
  /--/g,                   // SQL comments
  /;/g,                    // Statement terminators (be careful with this one)
  /\/\*/g,                 // Block comments
  /\*\//g,
];

export interface SanitizeOptions {
  allowHtml?: boolean;
  allowedTags?: string[];
  maxLength?: number;
  trimWhitespace?: boolean;
  toLowerCase?: boolean;
  removeNewlines?: boolean;
}

/**
 * Escape HTML entities in a string
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';

  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Remove HTML tags from a string
 */
export function stripHtml(str: string): string {
  if (typeof str !== 'string') return '';

  return str
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string, options: SanitizeOptions = {}): string {
  if (typeof input !== 'string') return '';

  let result = input;

  // Trim whitespace
  if (options.trimWhitespace !== false) {
    result = result.trim();
  }

  // Remove newlines if requested
  if (options.removeNewlines) {
    result = result.replace(/[\r\n]+/g, ' ');
  }

  // Strip or escape HTML
  if (!options.allowHtml) {
    result = escapeHtml(result);
  } else if (options.allowedTags) {
    result = stripDangerousTags(result, options.allowedTags);
  }

  // Enforce max length
  if (options.maxLength && result.length > options.maxLength) {
    result = result.substring(0, options.maxLength);
  }

  // Convert to lowercase if requested
  if (options.toLowerCase) {
    result = result.toLowerCase();
  }

  return result;
}

/**
 * Strip dangerous tags while preserving allowed ones
 */
function stripDangerousTags(str: string, allowedTags: string[]): string {
  const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;

  return str.replace(tagPattern, (match, tagName) => {
    const tag = tagName.toLowerCase();
    if (allowedTags.includes(tag)) {
      // Strip dangerous attributes from allowed tags
      return match.replace(/\s+(on\w+|style|class)=['"][^'"]*['"]/gi, '');
    }
    return '';
  });
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';

  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._+-]/g, '')
    .substring(0, 254); // Max email length
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return '';

  return phone.replace(/[^0-9+\-().\s]/g, '').substring(0, 20);
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return '';

  // Only allow http and https protocols
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return '';
  }

  // Remove any JavaScript or data URIs that might be embedded
  if (/javascript:|data:|vbscript:/i.test(trimmed)) {
    return '';
  }

  return trimmed;
}

/**
 * Sanitize for use in SQL queries (use parameterized queries instead when possible)
 */
export function sanitizeForSql(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/'/g, "''")           // Escape single quotes
    .replace(/\\/g, '\\\\')        // Escape backslashes
    .replace(/\x00/g, '\\0')       // Escape null bytes
    .replace(/\n/g, '\\n')         // Escape newlines
    .replace(/\r/g, '\\r')         // Escape carriage returns
    .replace(/\x1a/g, '\\Z');      // Escape Ctrl+Z
}

/**
 * Check if input contains potentially dangerous content
 */
export function containsDangerousContent(input: string): {
  isDangerous: boolean;
  threats: string[];
} {
  if (typeof input !== 'string') {
    return { isDangerous: false, threats: [] };
  }

  const threats: string[] = [];

  // Check for XSS patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(input)) {
      threats.push(`XSS pattern detected: ${pattern.source}`);
    }
  }

  // Check for SQL injection patterns (only for high-sensitivity checks)
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      threats.push(`Possible SQL injection: ${pattern.source}`);
    }
  }

  return {
    isDangerous: threats.length > 0,
    threats,
  };
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: SanitizeOptions = {}
): T {
  const result = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeInput(value, options);
    } else if (Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeInput(item, options) : item
      );
    } else if (value && typeof value === 'object') {
      (result as Record<string, unknown>)[key] = sanitizeObject(
        value as Record<string, unknown>,
        options
      );
    } else {
      (result as Record<string, unknown>)[key] = value;
    }
  }

  return result;
}

/**
 * Validate and sanitize JSON
 */
export function sanitizeJson(jsonString: string): unknown | null {
  try {
    const parsed = JSON.parse(jsonString);

    if (typeof parsed === 'object' && parsed !== null) {
      return sanitizeObject(parsed as Record<string, unknown>);
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') return '';

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // Replace unsafe chars
    .replace(/\.{2,}/g, '.')            // Remove multiple dots
    .replace(/^\.+|\.+$/g, '')          // Remove leading/trailing dots
    .substring(0, 255);                  // Max filename length
}

/**
 * Create a safe slug from string
 */
export function createSlug(str: string): string {
  if (typeof str !== 'string') return '';

  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}
