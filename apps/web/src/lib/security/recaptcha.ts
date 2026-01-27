/**
 * reCAPTCHA v3 Integration
 * Invisible bot protection that scores users without interaction
 */

// reCAPTCHA v3 threshold scores
export const RECAPTCHA_THRESHOLDS = {
  ALLOW: 0.7,      // Score >= 0.7 - Allow without challenge
  CHALLENGE: 0.3,  // Score >= 0.3 - Show challenge
  BLOCK: 0.0,      // Score < 0.3 - Block or require additional verification
};

export interface RecaptchaVerifyResult {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: string[];
}

export interface RecaptchaValidationResult {
  valid: boolean;
  score: number;
  action: 'allow' | 'challenge' | 'block';
  error?: string;
}

/**
 * Verify reCAPTCHA token with Google's API
 */
export async function verifyRecaptcha(
  token: string,
  expectedAction: string
): Promise<RecaptchaValidationResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.warn('reCAPTCHA secret key not configured');
    // In development, allow by default
    if (process.env.NODE_ENV === 'development') {
      return { valid: true, score: 1.0, action: 'allow' };
    }
    return { valid: false, score: 0, action: 'block', error: 'reCAPTCHA not configured' };
  }

  if (!token) {
    return { valid: false, score: 0, action: 'block', error: 'No reCAPTCHA token provided' };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    if (!response.ok) {
      throw new Error(`reCAPTCHA API error: ${response.status}`);
    }

    const result: RecaptchaVerifyResult = await response.json();

    // Check for API errors
    if (!result.success) {
      return {
        valid: false,
        score: 0,
        action: 'block',
        error: result['error-codes']?.join(', ') || 'Verification failed',
      };
    }

    // Verify action matches
    if (result.action !== expectedAction) {
      return {
        valid: false,
        score: result.score,
        action: 'block',
        error: `Action mismatch: expected ${expectedAction}, got ${result.action}`,
      };
    }

    // Determine action based on score
    let action: 'allow' | 'challenge' | 'block';
    if (result.score >= RECAPTCHA_THRESHOLDS.ALLOW) {
      action = 'allow';
    } else if (result.score >= RECAPTCHA_THRESHOLDS.CHALLENGE) {
      action = 'challenge';
    } else {
      action = 'block';
    }

    return {
      valid: result.score >= RECAPTCHA_THRESHOLDS.CHALLENGE,
      score: result.score,
      action,
    };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return {
      valid: false,
      score: 0,
      action: 'block',
      error: 'Verification request failed',
    };
  }
}

/**
 * Get reCAPTCHA site key for client-side use
 */
export function getRecaptchaSiteKey(): string | null {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || null;
}

/**
 * Client-side script to load reCAPTCHA
 */
export function getRecaptchaScript(): string {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) return '';

  return `
    <script src="https://www.google.com/recaptcha/api.js?render=${siteKey}"></script>
  `;
}

/**
 * Client-side function to execute reCAPTCHA
 */
export function getRecaptchaExecuteScript(action: string): string {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) return 'Promise.resolve(null)';

  return `
    grecaptcha.ready(function() {
      return grecaptcha.execute('${siteKey}', { action: '${action}' });
    })
  `;
}

/**
 * React component helper for reCAPTCHA
 */
export function useRecaptcha() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const executeRecaptcha = async (action: string): Promise<string | null> => {
    if (!siteKey || typeof window === 'undefined') {
      return null;
    }

    try {
      // Wait for grecaptcha to be ready
      await new Promise<void>((resolve) => {
        if ((window as any).grecaptcha?.ready) {
          (window as any).grecaptcha.ready(resolve);
        } else {
          // If not loaded yet, wait a bit
          setTimeout(resolve, 1000);
        }
      });

      const token = await (window as any).grecaptcha.execute(siteKey, { action });
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution error:', error);
      return null;
    }
  };

  return {
    siteKey,
    executeRecaptcha,
    isReady: typeof window !== 'undefined' && !!(window as any).grecaptcha,
  };
}
