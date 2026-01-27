/**
 * Feature Registry
 *
 * This file imports and registers all features.
 * Import this file once in your app (e.g., in providers.tsx)
 * to register all features.
 *
 * To add a new feature:
 * 1. Create a folder in /features/[feature-name]/
 * 2. Create an index.ts that exports the feature definition
 * 3. Import it here
 * 4. Add config in /lib/features/config.ts
 */

// Core features
// import './search';       // Property search
// import './booking';      // Booking flow
// import './favorites';    // Save favorites
// import './compare';      // Property comparison

// Engagement features
import './chat';           // Sandy AI chat widget
// import './reviews';      // Property reviews
// import './notifications'; // Push notifications

// AI features
// import './sandy-ai';     // AI concierge
// import './recommendations'; // AI recommendations

// Social features
// import './sharing';      // Social sharing
// import './referrals';    // Referral program

// Weather & Local
// import './weather';      // Weather widgets
// import './local-guide';  // Local attractions

// Export feature utilities for use in components
export { FeatureProvider, FeatureGate, useFeature, useFeatures } from '@/lib/features/context';
export { isFeatureEnabled, getFeatureConfig } from '@/lib/features/config';
export { registerFeature, isEnabled, getEnabledFeatures } from '@/lib/features/registry';

console.log('[Features] All features registered');
