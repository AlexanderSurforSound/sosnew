/**
 * Accessibility Settings Applier
 * Applies detected accessibility preferences to the page dynamically
 */

import type { AccessibilityPreferences } from './detector';

/**
 * CSS custom properties for accessibility
 */
const CSS_VARIABLES = {
  fontSize: '--a11y-font-size',
  lineHeight: '--a11y-line-height',
  letterSpacing: '--a11y-letter-spacing',
  focusOutlineWidth: '--a11y-focus-outline',
  motionDuration: '--a11y-motion-duration',
  contrastMultiplier: '--a11y-contrast',
  linkUnderline: '--a11y-link-underline',
};

/**
 * Apply accessibility preferences to the document
 */
export function applyAccessibilityPreferences(preferences: AccessibilityPreferences): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;

  // Apply reduced motion
  if (preferences.prefersReducedMotion) {
    root.classList.add('reduce-motion');
    root.style.setProperty(CSS_VARIABLES.motionDuration, '0.01ms');
  } else {
    root.classList.remove('reduce-motion');
    root.style.removeProperty(CSS_VARIABLES.motionDuration);
  }

  // Apply color scheme
  if (preferences.prefersColorScheme === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else if (preferences.prefersColorScheme === 'light') {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }

  // Apply high contrast mode
  if (preferences.prefersHighContrast || preferences.forcedColors) {
    root.classList.add('high-contrast');
    root.style.setProperty(CSS_VARIABLES.contrastMultiplier, '1.5');
    root.style.setProperty(CSS_VARIABLES.linkUnderline, 'underline');
    root.style.setProperty(CSS_VARIABLES.focusOutlineWidth, '3px');
  } else {
    root.classList.remove('high-contrast');
    root.style.removeProperty(CSS_VARIABLES.contrastMultiplier);
    root.style.removeProperty(CSS_VARIABLES.linkUnderline);
  }

  // Apply reduced transparency
  if (preferences.prefersReducedTransparency) {
    root.classList.add('reduce-transparency');
  } else {
    root.classList.remove('reduce-transparency');
  }

  // Apply touch-friendly styles
  if (preferences.touchScreen || preferences.pointerType === 'coarse') {
    root.classList.add('touch-device');
    body.style.setProperty('--min-tap-target', '44px');
  } else {
    root.classList.remove('touch-device');
    body.style.removeProperty('--min-tap-target');
  }

  // Apply screen reader optimizations
  if (preferences.likelyScreenReader) {
    root.classList.add('screen-reader-user');
    // Hide purely decorative content for screen readers
    document.querySelectorAll('[aria-hidden="true"]').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
  } else {
    root.classList.remove('screen-reader-user');
  }

  // Apply font size preferences
  applyFontSizePreference(preferences.preferredFontSize);

  // Apply custom settings if present
  if (preferences.customSettings) {
    applyCustomSettings(preferences.customSettings);
  }
}

/**
 * Apply font size preference
 */
function applyFontSizePreference(size: AccessibilityPreferences['preferredFontSize']): void {
  const root = document.documentElement;

  const sizes = {
    small: '14px',
    medium: '16px',
    large: '18px',
    xlarge: '20px',
  };

  root.style.setProperty(CSS_VARIABLES.fontSize, sizes[size]);

  // Also update body classes for CSS hooks
  root.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
  root.classList.add(`font-${size}`);
}

/**
 * Apply custom accessibility settings
 */
function applyCustomSettings(settings: NonNullable<AccessibilityPreferences['customSettings']>): void {
  const root = document.documentElement;

  if (settings.fontSize) {
    root.style.setProperty(CSS_VARIABLES.fontSize, `${settings.fontSize}px`);
  }

  if (settings.lineHeight) {
    root.style.setProperty(CSS_VARIABLES.lineHeight, settings.lineHeight.toString());
  }

  if (settings.letterSpacing) {
    root.style.setProperty(CSS_VARIABLES.letterSpacing, `${settings.letterSpacing}em`);
  }

  if (settings.fontFamily) {
    root.style.setProperty('--a11y-font-family', settings.fontFamily);
  }

  if (settings.highContrast) {
    root.classList.add('high-contrast');
  }

  if (settings.reducedMotion) {
    root.classList.add('reduce-motion');
    root.style.setProperty(CSS_VARIABLES.motionDuration, '0.01ms');
  }

  if (settings.screenReaderOptimized) {
    root.classList.add('sr-optimized');
  }
}

/**
 * Reset all accessibility styles to defaults
 */
export function resetAccessibilityStyles(): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Remove all a11y classes
  root.classList.remove(
    'reduce-motion',
    'dark',
    'high-contrast',
    'reduce-transparency',
    'touch-device',
    'screen-reader-user',
    'font-small',
    'font-medium',
    'font-large',
    'font-xlarge',
    'sr-optimized'
  );

  // Remove all CSS variables
  Object.values(CSS_VARIABLES).forEach(variable => {
    root.style.removeProperty(variable);
  });

  root.removeAttribute('data-theme');
  document.body.style.removeProperty('--min-tap-target');
}

/**
 * Generate CSS for accessibility preferences
 */
export function generateAccessibilityCSS(): string {
  return `
    /* Accessibility CSS Variables */
    :root {
      ${CSS_VARIABLES.fontSize}: 16px;
      ${CSS_VARIABLES.lineHeight}: 1.5;
      ${CSS_VARIABLES.letterSpacing}: normal;
      ${CSS_VARIABLES.focusOutlineWidth}: 2px;
      ${CSS_VARIABLES.motionDuration}: 300ms;
      ${CSS_VARIABLES.contrastMultiplier}: 1;
      ${CSS_VARIABLES.linkUnderline}: none;
    }

    /* Reduced Motion */
    .reduce-motion,
    .reduce-motion *,
    .reduce-motion *::before,
    .reduce-motion *::after {
      animation-duration: var(${CSS_VARIABLES.motionDuration}) !important;
      animation-iteration-count: 1 !important;
      transition-duration: var(${CSS_VARIABLES.motionDuration}) !important;
      scroll-behavior: auto !important;
    }

    /* High Contrast */
    .high-contrast {
      --tw-contrast: var(${CSS_VARIABLES.contrastMultiplier});
      filter: contrast(var(--tw-contrast));
    }

    .high-contrast a {
      text-decoration: var(${CSS_VARIABLES.linkUnderline}) !important;
    }

    .high-contrast *:focus {
      outline-width: var(${CSS_VARIABLES.focusOutlineWidth}) !important;
      outline-style: solid !important;
      outline-offset: 2px !important;
    }

    /* Reduced Transparency */
    .reduce-transparency * {
      opacity: 1 !important;
      background-color: var(--bg-solid, inherit) !important;
    }

    /* Touch Device */
    .touch-device button,
    .touch-device a,
    .touch-device [role="button"],
    .touch-device input,
    .touch-device select,
    .touch-device textarea {
      min-height: var(--min-tap-target, 44px);
      min-width: var(--min-tap-target, 44px);
    }

    /* Font Sizes */
    .font-small { font-size: 14px; }
    .font-medium { font-size: 16px; }
    .font-large { font-size: 18px; }
    .font-xlarge { font-size: 20px; }

    /* Screen Reader Optimizations */
    .screen-reader-user [aria-hidden="true"]:not(.sr-keep) {
      display: none !important;
    }

    .sr-optimized .decorative,
    .sr-optimized .visual-only {
      display: none !important;
    }

    /* Focus Visible Enhancement */
    :focus-visible {
      outline: var(${CSS_VARIABLES.focusOutlineWidth}) solid currentColor;
      outline-offset: 2px;
    }

    /* Skip Link */
    .skip-link {
      position: absolute;
      top: -100%;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      padding: 1rem 2rem;
      background: var(--color-primary, #0891b2);
      color: white;
      text-decoration: none;
      border-radius: 0 0 0.5rem 0.5rem;
      transition: top 0.2s;
    }

    .skip-link:focus {
      top: 0;
    }

    /* Custom Properties Application */
    body {
      font-size: var(${CSS_VARIABLES.fontSize});
      line-height: var(${CSS_VARIABLES.lineHeight});
      letter-spacing: var(${CSS_VARIABLES.letterSpacing});
    }
  `;
}
