'use client';

import { useState, useEffect, useRef, FormEvent, ReactNode } from 'react';
import { generateHoneypotConfig, validateHoneypot } from '@/lib/security/bot-detection';
import { sanitizeInput } from '@/lib/security/sanitize';

interface SecureFormProps {
  children: ReactNode;
  onSubmit: (data: FormData, metrics: SubmissionMetrics) => Promise<void> | void;
  action?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  className?: string;
  recaptchaAction?: string;
  minSubmitTime?: number; // Minimum time before submission allowed (ms)
}

interface SubmissionMetrics {
  mouseMovements: number;
  keystrokes: number;
  timeOnPage: number;
  honeypotValid: boolean;
  timestamp: number;
}

export default function SecureForm({
  children,
  onSubmit,
  action,
  method = 'POST',
  className,
  recaptchaAction,
  minSubmitTime = 3000,
}: SecureFormProps) {
  const [honeypot, setHoneypot] = useState<ReturnType<typeof generateHoneypotConfig> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Metrics tracking
  const metricsRef = useRef({
    mouseMovements: 0,
    keystrokes: 0,
    formLoadTime: Date.now(),
  });

  // Generate honeypot on mount (client-side only)
  useEffect(() => {
    setHoneypot(generateHoneypotConfig());

    // Track mouse movements
    const handleMouseMove = () => {
      metricsRef.current.mouseMovements++;
    };

    // Track keystrokes
    const handleKeyDown = () => {
      metricsRef.current.keystrokes++;
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('keydown', handleKeyDown, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Check honeypot
    const honeypotValue = honeypot ? formData.get(honeypot.fieldName) as string : '';
    const honeypotValid = validateHoneypot(honeypotValue);

    if (!honeypotValid) {
      // Silently reject bot submissions
      console.warn('Bot detected via honeypot');
      setIsSubmitting(true);
      // Fake delay to not reveal detection
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitting(false);
      return;
    }

    // Remove honeypot field from submission
    if (honeypot) {
      formData.delete(honeypot.fieldName);
    }

    // Check minimum time
    const timeOnPage = Date.now() - metricsRef.current.formLoadTime;
    if (timeOnPage < minSubmitTime) {
      // Too fast - likely a bot
      console.warn('Submission too fast');
      setError('Please take your time filling out the form.');
      return;
    }

    // Check for minimal interaction
    if (metricsRef.current.mouseMovements < 3 && metricsRef.current.keystrokes < 5) {
      console.warn('Minimal user interaction detected');
      // Don't block, but log for monitoring
    }

    // Prepare metrics
    const metrics: SubmissionMetrics = {
      mouseMovements: metricsRef.current.mouseMovements,
      keystrokes: metricsRef.current.keystrokes,
      timeOnPage,
      honeypotValid,
      timestamp: Date.now(),
    };

    // Execute reCAPTCHA if configured
    if (recaptchaAction && typeof window !== 'undefined' && (window as any).grecaptcha) {
      try {
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        if (siteKey) {
          const token = await (window as any).grecaptcha.execute(siteKey, { action: recaptchaAction });
          formData.append('recaptchaToken', token);
        }
      } catch (err) {
        console.error('reCAPTCHA error:', err);
      }
    }

    // Add security metadata
    formData.append('_securityMetrics', JSON.stringify({
      timeOnPage,
      interactions: metricsRef.current.mouseMovements + metricsRef.current.keystrokes,
    }));

    setIsSubmitting(true);

    try {
      await onSubmit(formData, metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      action={action}
      method={method}
      onSubmit={handleSubmit}
      className={className}
      noValidate
    >
      {/* Honeypot field - hidden from users, visible to bots */}
      {honeypot && (
        <div
          className={honeypot.containerClass}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '-9999px',
            opacity: 0,
            pointerEvents: 'none',
          }}
        >
          <label htmlFor={honeypot.fieldId}>
            Leave this field empty
          </label>
          <input
            type="text"
            id={honeypot.fieldId}
            name={honeypot.fieldName}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
      )}

      {/* Form content */}
      {children}

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Hidden timestamp for server-side validation */}
      <input
        type="hidden"
        name="_formLoadTime"
        value={metricsRef.current.formLoadTime}
      />
    </form>
  );
}

/**
 * Secure input wrapper with sanitization
 */
export function SecureInput({
  name,
  type = 'text',
  maxLength = 1000,
  sanitize = true,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  sanitize?: boolean;
}) {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    if (sanitize) {
      newValue = sanitizeInput(newValue, {
        maxLength,
        allowHtml: false,
      });
    }

    setValue(newValue);
    props.onChange?.(e);
  };

  return (
    <input
      {...props}
      type={type}
      name={name}
      value={value}
      onChange={handleChange}
      maxLength={maxLength}
    />
  );
}

/**
 * Secure textarea wrapper with sanitization
 */
export function SecureTextarea({
  name,
  maxLength = 5000,
  sanitize = true,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  sanitize?: boolean;
}) {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value;

    if (sanitize) {
      newValue = sanitizeInput(newValue, {
        maxLength,
        allowHtml: false,
      });
    }

    setValue(newValue);
    props.onChange?.(e);
  };

  return (
    <textarea
      {...props}
      name={name}
      value={value}
      onChange={handleChange}
      maxLength={maxLength}
    />
  );
}
