/**
 * Accessibility Module - Main Export
 * Provides comprehensive accessibility detection and application
 */

export {
  detectAccessibilityPreferences,
  listenForPreferenceChanges,
  saveCustomSettings,
  clearCustomSettings,
  type AccessibilityPreferences,
} from './detector';

export {
  applyAccessibilityPreferences,
  resetAccessibilityStyles,
  generateAccessibilityCSS,
} from './applier';
