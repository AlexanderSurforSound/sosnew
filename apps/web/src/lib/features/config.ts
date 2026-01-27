/**
 * Feature Configuration
 *
 * Enable/disable features here. Each feature can be toggled without
 * affecting other parts of the site.
 *
 * Set to `true` to enable, `false` to disable.
 */

import { FeatureConfig } from './types';

export const featureConfig: FeatureConfig = {
  // ============================================
  // CORE FEATURES (usually always enabled)
  // ============================================

  'property-search': {
    enabled: true,
    config: {
      showAISearch: true,
      showMapView: true,
      defaultView: 'grid', // 'grid' | 'map'
    },
  },

  'property-booking': {
    enabled: true,
    config: {
      showAddons: true,
      showInsurance: true,
      allowSplitPayment: true,
    },
  },

  'property-favorites': {
    enabled: true,
    config: {
      persistToLocalStorage: true,
      syncToAccount: true,
    },
  },

  'property-compare': {
    enabled: true,
    config: {
      maxProperties: 4,
    },
  },

  // ============================================
  // ENGAGEMENT FEATURES
  // ============================================

  'chat-widget': {
    enabled: true,
    config: {
      position: 'bottom-right',
      showOnMobile: true,
      aiPowered: true,
    },
  },

  'reviews': {
    enabled: true,
    config: {
      allowGuestReviews: true,
      requireVerifiedStay: false, // Set true when backend is ready
    },
  },

  'notifications': {
    enabled: true,
    config: {
      showBell: true,
      enablePush: false, // Enable when push is configured
    },
  },

  // ============================================
  // AI FEATURES
  // ============================================

  'sandy-ai': {
    enabled: true,
    config: {
      showOnPropertyPage: true,
      showDreamMatcher: true,
      showVoiceSearch: true,
    },
  },

  'ai-recommendations': {
    enabled: true,
    config: {
      showSimilarProperties: true,
      showPersonalized: true,
    },
  },

  // ============================================
  // SOCIAL FEATURES
  // ============================================

  'social-sharing': {
    enabled: true,
    config: {
      platforms: ['facebook', 'twitter', 'pinterest', 'email', 'copy'],
    },
  },

  'referral-program': {
    enabled: false, // Enable when referral system is ready
    config: {
      rewardAmount: 50,
    },
  },

  // ============================================
  // GAMIFICATION
  // ============================================

  'loyalty-program': {
    enabled: true,
    config: {
      showPointsOnBooking: true,
      showTierBadges: true,
    },
  },

  'achievements': {
    enabled: false, // Enable when achievement system is ready
    config: {
      showNotifications: true,
    },
  },

  // ============================================
  // WEATHER & LOCAL
  // ============================================

  'weather-widget': {
    enabled: true,
    config: {
      showOnPropertyPage: true,
      showSurfReport: true,
    },
  },

  'local-guide': {
    enabled: true,
    config: {
      showDining: true,
      showActivities: true,
      showEvents: true,
    },
  },

  // ============================================
  // ACCESSIBILITY
  // ============================================

  'accessibility-controls': {
    enabled: true,
    config: {
      showPanel: true,
      showSkipLinks: true,
      showKeyboardShortcuts: true,
    },
  },

  // ============================================
  // EXPERIMENTAL FEATURES
  // ============================================

  'virtual-tours': {
    enabled: true,
    config: {
      provider: 'matterport',
    },
  },

  'ar-beach-finder': {
    enabled: false, // Enable when AR is implemented
  },

  'voice-assistant': {
    enabled: false, // Enable when voice is implemented
  },

  // ============================================
  // ANALYTICS & TRACKING
  // ============================================

  'analytics': {
    enabled: false, // Enable when analytics is configured
    config: {
      provider: 'azure-insights',
    },
  },

  'recently-viewed': {
    enabled: true,
    config: {
      maxItems: 10,
      persistDays: 30,
    },
  },
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(featureId: string): boolean {
  const feature = featureConfig[featureId];
  return feature?.enabled ?? false;
}

/**
 * Get feature configuration
 */
export function getFeatureConfig<T = Record<string, any>>(featureId: string): T | undefined {
  const feature = featureConfig[featureId];
  return feature?.config as T | undefined;
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(featureConfig)
    .filter(([_, config]) => config.enabled)
    .map(([id]) => id);
}

/**
 * Get features by category (from registered features)
 */
export function getDisabledFeatures(): string[] {
  return Object.entries(featureConfig)
    .filter(([_, config]) => !config.enabled)
    .map(([id]) => id);
}
