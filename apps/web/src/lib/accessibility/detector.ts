/**
 * Accessibility Settings Detector
 * Detects user's device accessibility preferences and applies them automatically
 */

export interface AccessibilityPreferences {
  // Motion preferences
  prefersReducedMotion: boolean;

  // Color preferences
  prefersColorScheme: 'light' | 'dark' | 'no-preference';
  prefersHighContrast: boolean;
  forcedColors: boolean;

  // Text preferences
  prefersReducedTransparency: boolean;

  // Screen reader indicators
  likelyScreenReader: boolean;

  // Device capabilities
  touchScreen: boolean;
  pointerType: 'fine' | 'coarse' | 'none';
  hoverCapability: boolean;

  // Font size preferences
  preferredFontSize: 'small' | 'medium' | 'large' | 'xlarge';

  // Custom settings from user
  customSettings?: {
    fontSize?: number;
    lineHeight?: number;
    letterSpacing?: number;
    fontFamily?: string;
    highContrast?: boolean;
    reducedMotion?: boolean;
    screenReaderOptimized?: boolean;
  };
}

/**
 * Default preferences
 */
const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  prefersReducedMotion: false,
  prefersColorScheme: 'no-preference',
  prefersHighContrast: false,
  forcedColors: false,
  prefersReducedTransparency: false,
  likelyScreenReader: false,
  touchScreen: false,
  pointerType: 'fine',
  hoverCapability: true,
  preferredFontSize: 'medium',
};

/**
 * Detect all accessibility preferences from the browser/device
 */
export function detectAccessibilityPreferences(): AccessibilityPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  const preferences: AccessibilityPreferences = { ...DEFAULT_PREFERENCES };

  // Reduced Motion
  preferences.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Color Scheme
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    preferences.prefersColorScheme = 'dark';
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    preferences.prefersColorScheme = 'light';
  }

  // High Contrast (Windows High Contrast Mode)
  preferences.prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches ||
    window.matchMedia('(-ms-high-contrast: active)').matches;

  // Forced Colors (Windows High Contrast)
  preferences.forcedColors = window.matchMedia('(forced-colors: active)').matches;

  // Reduced Transparency
  preferences.prefersReducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;

  // Touch Screen
  preferences.touchScreen = 'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches;

  // Pointer Type
  if (window.matchMedia('(pointer: fine)').matches) {
    preferences.pointerType = 'fine';
  } else if (window.matchMedia('(pointer: coarse)').matches) {
    preferences.pointerType = 'coarse';
  } else {
    preferences.pointerType = 'none';
  }

  // Hover Capability
  preferences.hoverCapability = window.matchMedia('(hover: hover)').matches;

  // Detect likely screen reader usage (heuristics)
  preferences.likelyScreenReader = detectScreenReader();

  // Detect preferred font size from browser settings
  preferences.preferredFontSize = detectPreferredFontSize();

  // Load custom settings from localStorage
  preferences.customSettings = loadCustomSettings();

  return preferences;
}

/**
 * Detect if user is likely using a screen reader
 */
function detectScreenReader(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for common screen reader indicators
  const indicators = [
    // NVDA
    () => !!(window as any).nvdaController,
    // JAWS
    () => !!(window as any).JAWS,
    // VoiceOver (limited detection)
    () => !!navigator.userAgent.match(/VoiceOver/i),
    // Check for aria-live polite announcement behavior
    () => {
      const nav = navigator as any;
      return nav.userAgent && (
        nav.userAgent.includes('NVDA') ||
        nav.userAgent.includes('JAWS') ||
        nav.userAgent.includes('VoiceOver')
      );
    },
  ];

  return indicators.some(check => {
    try {
      return check();
    } catch {
      return false;
    }
  });
}

/**
 * Detect user's preferred font size from browser zoom/settings
 */
function detectPreferredFontSize(): 'small' | 'medium' | 'large' | 'xlarge' {
  if (typeof window === 'undefined') return 'medium';

  // Check browser zoom level
  const ratio = window.devicePixelRatio || 1;
  const zoom = Math.round((window.outerWidth / window.innerWidth) * 100) / 100;

  // Check root font size
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

  // Determine preferred size based on settings
  if (rootFontSize >= 20 || zoom > 1.5 || ratio > 2) {
    return 'xlarge';
  } else if (rootFontSize >= 18 || zoom > 1.25 || ratio > 1.5) {
    return 'large';
  } else if (rootFontSize <= 14) {
    return 'small';
  }

  return 'medium';
}

/**
 * Load custom accessibility settings from localStorage
 */
function loadCustomSettings(): AccessibilityPreferences['customSettings'] {
  if (typeof window === 'undefined') return undefined;

  try {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore localStorage errors
  }

  return undefined;
}

/**
 * Save custom accessibility settings to localStorage
 */
export function saveCustomSettings(settings: AccessibilityPreferences['customSettings']): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Clear custom accessibility settings
 */
export function clearCustomSettings(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('accessibility-settings');
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Listen for changes in accessibility preferences
 */
export function listenForPreferenceChanges(
  callback: (preferences: AccessibilityPreferences) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQueries = [
    window.matchMedia('(prefers-reduced-motion: reduce)'),
    window.matchMedia('(prefers-color-scheme: dark)'),
    window.matchMedia('(prefers-contrast: more)'),
    window.matchMedia('(forced-colors: active)'),
    window.matchMedia('(prefers-reduced-transparency: reduce)'),
  ];

  const handleChange = () => {
    callback(detectAccessibilityPreferences());
  };

  // Add listeners
  mediaQueries.forEach(mq => {
    mq.addEventListener('change', handleChange);
  });

  // Return cleanup function
  return () => {
    mediaQueries.forEach(mq => {
      mq.removeEventListener('change', handleChange);
    });
  };
}
