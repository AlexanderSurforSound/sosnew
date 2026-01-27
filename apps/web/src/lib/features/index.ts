/**
 * Feature System Exports
 *
 * Main entry point for the feature system.
 */

// Types
export * from './types';

// Configuration
export { featureConfig, isFeatureEnabled, getFeatureConfig, getEnabledFeatures, getDisabledFeatures } from './config';

// Registry
export {
  registerFeature,
  enableFeature,
  disableFeature,
  isEnabled,
  getFeature,
  getAllFeatures,
  getEnabledFeatures as getEnabledFeatureDefinitions,
  getAllNavItems,
  getPropertyPageSections,
  getBookingSteps,
  getSearchFilters,
  getOverlayComponents,
  getComponent,
  getHook,
  getRegistryState,
} from './registry';

// React integration
export {
  FeatureProvider,
  useFeatures,
  useFeature,
  FeatureGate,
  FeatureOverlays,
  withFeature,
} from './context';
