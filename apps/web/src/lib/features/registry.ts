/**
 * Feature Registry
 *
 * Central registry for all features. Features register themselves here
 * and can be queried by other parts of the app.
 */

import {
  FeatureDefinition,
  FeatureRegistryState,
  FeatureProvides,
  NavItem,
  PropertyPageSection,
  BookingStep,
  SearchFilter,
} from './types';
import { featureConfig, isFeatureEnabled } from './config';

// Global registry state
const registryState: FeatureRegistryState = {
  features: new Map(),
  enabledFeatures: new Set(),
  initialized: false,
};

/**
 * Register a feature with the system
 */
export function registerFeature(feature: FeatureDefinition): void {
  // Don't allow duplicate registrations
  if (registryState.features.has(feature.id)) {
    console.warn(`Feature "${feature.id}" is already registered. Skipping.`);
    return;
  }

  // Store the feature
  registryState.features.set(feature.id, feature);

  // Check if it should be enabled
  const configEnabled = isFeatureEnabled(feature.id);
  const shouldEnable = configEnabled ?? feature.defaultEnabled;

  if (shouldEnable) {
    enableFeature(feature.id);
  }

  console.log(
    `[Features] Registered: ${feature.id} (${shouldEnable ? 'enabled' : 'disabled'})`
  );
}

/**
 * Enable a feature
 */
export function enableFeature(featureId: string): boolean {
  const feature = registryState.features.get(featureId);
  if (!feature) {
    console.warn(`Cannot enable unknown feature: ${featureId}`);
    return false;
  }

  // Check dependencies
  if (feature.dependencies?.features) {
    for (const dep of feature.dependencies.features) {
      if (!registryState.enabledFeatures.has(dep)) {
        console.warn(
          `Cannot enable "${featureId}": missing dependency "${dep}"`
        );
        return false;
      }
    }
  }

  // Initialize feature if it has an init function
  try {
    feature.initialize?.();
    registryState.enabledFeatures.add(featureId);
    return true;
  } catch (error) {
    console.error(`Failed to initialize feature "${featureId}":`, error);
    return false;
  }
}

/**
 * Disable a feature
 */
export function disableFeature(featureId: string): boolean {
  const feature = registryState.features.get(featureId);
  if (!feature) return false;

  try {
    feature.cleanup?.();
    registryState.enabledFeatures.delete(featureId);
    return true;
  } catch (error) {
    console.error(`Failed to cleanup feature "${featureId}":`, error);
    return false;
  }
}

/**
 * Check if a feature is currently enabled
 */
export function isEnabled(featureId: string): boolean {
  return registryState.enabledFeatures.has(featureId);
}

/**
 * Get a registered feature
 */
export function getFeature(featureId: string): FeatureDefinition | undefined {
  return registryState.features.get(featureId);
}

/**
 * Get all registered features
 */
export function getAllFeatures(): FeatureDefinition[] {
  return Array.from(registryState.features.values());
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): FeatureDefinition[] {
  return Array.from(registryState.features.values()).filter((f) =>
    registryState.enabledFeatures.has(f.id)
  );
}

// ============================================
// AGGREGATION HELPERS
// These collect items from all enabled features
// ============================================

/**
 * Get all navigation items from enabled features
 */
export function getAllNavItems(position?: NavItem['position']): NavItem[] {
  const items: NavItem[] = [];

  for (const feature of getEnabledFeatures()) {
    const navItems = feature.provides.navItems || [];
    items.push(...navItems);
  }

  // Filter by position if specified
  const filtered = position ? items.filter((item) => item.position === position) : items;

  // Sort by order
  return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * Get all property page sections from enabled features
 */
export function getPropertyPageSections(
  position?: PropertyPageSection['position']
): PropertyPageSection[] {
  const sections: PropertyPageSection[] = [];

  for (const feature of getEnabledFeatures()) {
    const featureSections = feature.provides.propertyPageSections || [];
    sections.push(...featureSections);
  }

  const filtered = position
    ? sections.filter((s) => s.position === position)
    : sections;

  return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * Get all booking steps from enabled features
 */
export function getBookingSteps(): BookingStep[] {
  const steps: BookingStep[] = [];

  for (const feature of getEnabledFeatures()) {
    const featureSteps = feature.provides.bookingSteps || [];
    steps.push(...featureSteps);
  }

  return steps.sort((a, b) => a.order - b.order);
}

/**
 * Get all search filters from enabled features
 */
export function getSearchFilters(): SearchFilter[] {
  const filters: SearchFilter[] = [];

  for (const feature of getEnabledFeatures()) {
    const featureFilters = feature.provides.searchFilters || [];
    filters.push(...featureFilters);
  }

  return filters;
}

/**
 * Get all overlay components from enabled features
 */
export function getOverlayComponents(): React.ComponentType<any>[] {
  const overlays: React.ComponentType<any>[] = [];

  for (const feature of getEnabledFeatures()) {
    const featureOverlays = feature.provides.overlays || [];
    overlays.push(...featureOverlays);
  }

  return overlays;
}

/**
 * Get a specific component from any enabled feature
 */
export function getComponent<T = any>(
  componentName: string
): React.ComponentType<T> | undefined {
  for (const feature of getEnabledFeatures()) {
    const component = feature.provides.components?.[componentName];
    if (component) return component as React.ComponentType<T>;
  }
  return undefined;
}

/**
 * Get a specific hook from any enabled feature
 */
export function getHook<T extends (...args: any[]) => any>(
  hookName: string
): T | undefined {
  for (const feature of getEnabledFeatures()) {
    const hook = feature.provides.hooks?.[hookName];
    if (hook) return hook as T;
  }
  return undefined;
}

// Export registry state for debugging
export function getRegistryState(): Readonly<FeatureRegistryState> {
  return registryState;
}
