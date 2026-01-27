'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  detectAccessibilityPreferences,
  listenForPreferenceChanges,
  saveCustomSettings,
  clearCustomSettings,
  type AccessibilityPreferences,
} from '@/lib/accessibility/detector';
import {
  applyAccessibilityPreferences,
  resetAccessibilityStyles,
} from '@/lib/accessibility/applier';

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  isLoaded: boolean;

  // Actions
  updateCustomSettings: (settings: Partial<AccessibilityPreferences['customSettings']>) => void;
  resetToDefaults: () => void;
  toggleReducedMotion: () => void;
  toggleHighContrast: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large' | 'xlarge') => void;
  setColorScheme: (scheme: 'light' | 'dark' | 'system') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
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
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Detect and apply preferences on mount
  useEffect(() => {
    const detected = detectAccessibilityPreferences();
    setPreferences(detected);
    applyAccessibilityPreferences(detected);
    setIsLoaded(true);

    // Listen for system preference changes
    const cleanup = listenForPreferenceChanges((newPrefs) => {
      setPreferences(newPrefs);
      applyAccessibilityPreferences(newPrefs);
    });

    return cleanup;
  }, []);

  // Update custom settings
  const updateCustomSettings = useCallback(
    (settings: Partial<AccessibilityPreferences['customSettings']>) => {
      setPreferences((prev) => {
        const newCustomSettings = {
          ...prev.customSettings,
          ...settings,
        };

        const newPrefs = {
          ...prev,
          customSettings: newCustomSettings,
        };

        saveCustomSettings(newCustomSettings);
        applyAccessibilityPreferences(newPrefs);

        return newPrefs;
      });
    },
    []
  );

  // Reset to system defaults
  const resetToDefaults = useCallback(() => {
    clearCustomSettings();
    resetAccessibilityStyles();

    const detected = detectAccessibilityPreferences();
    setPreferences(detected);
    applyAccessibilityPreferences(detected);
  }, []);

  // Toggle reduced motion
  const toggleReducedMotion = useCallback(() => {
    setPreferences((prev) => {
      const newValue = !prev.prefersReducedMotion;
      const newPrefs = {
        ...prev,
        prefersReducedMotion: newValue,
        customSettings: {
          ...prev.customSettings,
          reducedMotion: newValue,
        },
      };

      saveCustomSettings(newPrefs.customSettings);
      applyAccessibilityPreferences(newPrefs);

      return newPrefs;
    });
  }, []);

  // Toggle high contrast
  const toggleHighContrast = useCallback(() => {
    setPreferences((prev) => {
      const newValue = !prev.prefersHighContrast;
      const newPrefs = {
        ...prev,
        prefersHighContrast: newValue,
        customSettings: {
          ...prev.customSettings,
          highContrast: newValue,
        },
      };

      saveCustomSettings(newPrefs.customSettings);
      applyAccessibilityPreferences(newPrefs);

      return newPrefs;
    });
  }, []);

  // Set font size
  const setFontSize = useCallback(
    (size: 'small' | 'medium' | 'large' | 'xlarge') => {
      const sizeMap = {
        small: 14,
        medium: 16,
        large: 18,
        xlarge: 20,
      };

      setPreferences((prev) => {
        const newPrefs = {
          ...prev,
          preferredFontSize: size,
          customSettings: {
            ...prev.customSettings,
            fontSize: sizeMap[size],
          },
        };

        saveCustomSettings(newPrefs.customSettings);
        applyAccessibilityPreferences(newPrefs);

        return newPrefs;
      });
    },
    []
  );

  // Set color scheme
  const setColorScheme = useCallback((scheme: 'light' | 'dark' | 'system') => {
    setPreferences((prev) => {
      let colorScheme: AccessibilityPreferences['prefersColorScheme'];

      if (scheme === 'system') {
        // Detect system preference
        if (typeof window !== 'undefined') {
          colorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        } else {
          colorScheme = 'no-preference';
        }
      } else {
        colorScheme = scheme;
      }

      const newPrefs = {
        ...prev,
        prefersColorScheme: colorScheme,
      };

      applyAccessibilityPreferences(newPrefs);

      return newPrefs;
    });
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        preferences,
        isLoaded,
        updateCustomSettings,
        resetToDefaults,
        toggleReducedMotion,
        toggleHighContrast,
        setFontSize,
        setColorScheme,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Export individual hooks for specific features
export function useReducedMotion() {
  const { preferences } = useAccessibility();
  return preferences.prefersReducedMotion;
}

export function useColorScheme() {
  const { preferences, setColorScheme } = useAccessibility();
  return {
    colorScheme: preferences.prefersColorScheme,
    setColorScheme,
  };
}

export function useHighContrast() {
  const { preferences, toggleHighContrast } = useAccessibility();
  return {
    isHighContrast: preferences.prefersHighContrast,
    toggleHighContrast,
  };
}

export function useFontSize() {
  const { preferences, setFontSize } = useAccessibility();
  return {
    fontSize: preferences.preferredFontSize,
    setFontSize,
  };
}

export function useScreenReader() {
  const { preferences } = useAccessibility();
  return preferences.likelyScreenReader;
}

export function useTouchDevice() {
  const { preferences } = useAccessibility();
  return {
    isTouchDevice: preferences.touchScreen,
    pointerType: preferences.pointerType,
    hasHover: preferences.hoverCapability,
  };
}
