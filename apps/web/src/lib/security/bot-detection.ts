/**
 * Bot Detection System
 * Multiple layers of bot detection including honeypots, timing analysis, and behavior patterns
 */

// Known bot user agent patterns
const BOT_USER_AGENT_PATTERNS = [
  /bot/i,
  /crawl/i,
  /spider/i,
  /scrape/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /python-urllib/i,
  /java\//i,
  /libwww/i,
  /httpunit/i,
  /nutch/i,
  /phpcrawl/i,
  /msnbot/i,
  /jyxobot/i,
  /fast-webcrawler/i,
  /fast enterprise crawler/i,
  /convera/i,
  /biglotron/i,
  /grub\.org/i,
  /usinenouvellecrawler/i,
  /antibot/i,
  /netresearchserver/i,
  /speedy/i,
  /fluffy/i,
  /bibnum\.bnf/i,
  /findlink/i,
  /msrbot/i,
  /panscient/i,
  /yacybot/i,
  /aihitbot/i,
  /ips-agent/i,
  /seznambot/i,
  /daumoa/i,
  /ahrefsbot/i,
  /semrushbot/i,
  /dotbot/i,
  /rogerbot/i,
  /mj12bot/i,
  /blexbot/i,
  /petalbot/i,
  /seokicks/i,
  /headlesschrome/i,
  /phantomjs/i,
  /selenium/i,
  /puppeteer/i,
  /playwright/i,
];

// Allowed bots (search engines)
const ALLOWED_BOTS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,        // Yahoo
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebot/i,
  /twitterbot/i,
  /linkedinbot/i,
  /pinterestbot/i,
];

// Suspicious header patterns
const SUSPICIOUS_HEADERS = [
  'x-forwarded-for',    // Multiple proxies can be suspicious
  'via',                // Proxy indicator
  'forwarded',
];

export interface BotDetectionResult {
  isBot: boolean;
  isMaliciousBot: boolean;
  isAllowedBot: boolean;
  confidence: number;    // 0-100
  signals: string[];
  recommendation: 'allow' | 'challenge' | 'block';
}

export interface BotDetectionContext {
  userAgent: string | null;
  ip: string | null;
  headers: Headers;
  timing?: {
    formLoadTime?: number;    // When form was loaded
    submissionTime?: number;  // When form was submitted
  };
  honeypot?: {
    fieldValue?: string;      // Should be empty
    fieldName: string;
  };
  mouseMovements?: number;    // Number of mouse movements detected
  keystrokes?: number;        // Number of keystrokes detected
}

/**
 * Main bot detection function
 */
export function detectBot(context: BotDetectionContext): BotDetectionResult {
  const signals: string[] = [];
  let botScore = 0;

  // 1. User Agent Analysis
  const uaResult = analyzeUserAgent(context.userAgent);
  if (uaResult.isBot) {
    signals.push(`User-Agent: ${uaResult.reason}`);
    botScore += uaResult.score;
  }
  if (uaResult.isAllowed) {
    return {
      isBot: true,
      isMaliciousBot: false,
      isAllowedBot: true,
      confidence: 95,
      signals: ['Recognized search engine bot'],
      recommendation: 'allow',
    };
  }

  // 2. Missing/Suspicious User Agent
  if (!context.userAgent || context.userAgent.length < 10) {
    signals.push('Missing or very short User-Agent');
    botScore += 30;
  }

  // 3. Honeypot Check
  if (context.honeypot?.fieldValue && context.honeypot.fieldValue.length > 0) {
    signals.push('Honeypot field filled');
    botScore += 50;
  }

  // 4. Timing Analysis
  if (context.timing) {
    const timingResult = analyzeTimings(context.timing);
    if (timingResult.suspicious) {
      signals.push(timingResult.reason);
      botScore += timingResult.score;
    }
  }

  // 5. Behavior Analysis
  if (context.mouseMovements !== undefined && context.mouseMovements < 3) {
    signals.push('No mouse movement detected');
    botScore += 20;
  }

  if (context.keystrokes !== undefined && context.keystrokes < 5) {
    signals.push('Minimal keystroke activity');
    botScore += 15;
  }

  // 6. Header Analysis
  const headerResult = analyzeHeaders(context.headers);
  if (headerResult.suspicious) {
    signals.push(...headerResult.reasons);
    botScore += headerResult.score;
  }

  // Calculate confidence
  const confidence = Math.min(100, botScore);
  const isBot = botScore >= 40;
  const isMaliciousBot = botScore >= 60;

  // Determine recommendation
  let recommendation: 'allow' | 'challenge' | 'block';
  if (botScore >= 70) {
    recommendation = 'block';
  } else if (botScore >= 40) {
    recommendation = 'challenge';
  } else {
    recommendation = 'allow';
  }

  return {
    isBot,
    isMaliciousBot,
    isAllowedBot: false,
    confidence,
    signals,
    recommendation,
  };
}

/**
 * Analyze User-Agent string
 */
function analyzeUserAgent(userAgent: string | null): {
  isBot: boolean;
  isAllowed: boolean;
  score: number;
  reason: string;
} {
  if (!userAgent) {
    return { isBot: true, isAllowed: false, score: 30, reason: 'No User-Agent' };
  }

  // Check for allowed bots first
  for (const pattern of ALLOWED_BOTS) {
    if (pattern.test(userAgent)) {
      return { isBot: true, isAllowed: true, score: 0, reason: 'Allowed bot' };
    }
  }

  // Check for known bot patterns
  for (const pattern of BOT_USER_AGENT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return { isBot: true, isAllowed: false, score: 40, reason: `Matches pattern: ${pattern}` };
    }
  }

  return { isBot: false, isAllowed: false, score: 0, reason: '' };
}

/**
 * Analyze submission timing
 */
function analyzeTimings(timing: { formLoadTime?: number; submissionTime?: number }): {
  suspicious: boolean;
  score: number;
  reason: string;
} {
  if (!timing.formLoadTime || !timing.submissionTime) {
    return { suspicious: true, score: 15, reason: 'Missing timing data' };
  }

  const timeDiff = timing.submissionTime - timing.formLoadTime;

  // Too fast (less than 2 seconds) - likely a bot
  if (timeDiff < 2000) {
    return { suspicious: true, score: 40, reason: 'Form submitted too quickly (<2s)' };
  }

  // Very fast (less than 5 seconds) - suspicious
  if (timeDiff < 5000) {
    return { suspicious: true, score: 20, reason: 'Form submitted very quickly (<5s)' };
  }

  return { suspicious: false, score: 0, reason: '' };
}

/**
 * Analyze request headers
 */
function analyzeHeaders(headers: Headers): {
  suspicious: boolean;
  score: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let score = 0;

  // Check Accept header
  const accept = headers.get('accept');
  if (!accept || accept === '*/*') {
    reasons.push('Generic or missing Accept header');
    score += 10;
  }

  // Check Accept-Language
  const acceptLanguage = headers.get('accept-language');
  if (!acceptLanguage) {
    reasons.push('Missing Accept-Language header');
    score += 10;
  }

  // Check for suspicious proxy headers
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor && forwardedFor.split(',').length > 3) {
    reasons.push('Multiple proxy hops detected');
    score += 15;
  }

  // Check Accept-Encoding
  const acceptEncoding = headers.get('accept-encoding');
  if (!acceptEncoding) {
    reasons.push('Missing Accept-Encoding header');
    score += 5;
  }

  return {
    suspicious: score > 0,
    score,
    reasons,
  };
}

/**
 * Generate a honeypot field configuration
 */
export function generateHoneypotConfig(): {
  fieldName: string;
  fieldId: string;
  containerClass: string;
} {
  // Use realistic-looking field names to trick bots
  const fieldNames = [
    'website_url',
    'fax_number',
    'company_address',
    'secondary_email',
    'middle_name',
    'phone_extension',
    'referral_source',
  ];

  const randomName = fieldNames[Math.floor(Math.random() * fieldNames.length)];
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  return {
    fieldName: `${randomName}_${randomSuffix}`,
    fieldId: `hp_${randomSuffix}`,
    containerClass: 'sr-only absolute -left-[9999px] opacity-0 pointer-events-none',
  };
}

/**
 * Validate honeypot field
 */
export function validateHoneypot(value: string | undefined | null): boolean {
  // Honeypot should be empty - if filled, it's likely a bot
  return !value || value.length === 0;
}

/**
 * Create browser fingerprint data collector
 */
export function getBrowserFingerprintScript(): string {
  return `
    (function() {
      var fp = {
        mouseMovements: 0,
        keystrokes: 0,
        formLoadTime: Date.now(),
        screen: screen.width + 'x' + screen.height,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        cookiesEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack
      };

      document.addEventListener('mousemove', function() {
        fp.mouseMovements++;
      }, { passive: true });

      document.addEventListener('keydown', function() {
        fp.keystrokes++;
      }, { passive: true });

      window.__botDetection = fp;
    })();
  `;
}

/**
 * Get behavior metrics for submission
 */
export function getSubmissionMetrics(): string {
  return `
    (function() {
      var fp = window.__botDetection || {};
      fp.submissionTime = Date.now();
      return JSON.stringify(fp);
    })();
  `;
}
