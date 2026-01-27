/**
 * Feature Module System
 *
 * This system allows you to create self-contained features that can be
 * enabled/disabled via configuration without breaking the site.
 */

import { ReactNode, ComponentType } from 'react';

// Feature categories for organization
export type FeatureCategory =
  | 'core'        // Essential features (search, booking)
  | 'engagement'  // User engagement (chat, reviews, favorites)
  | 'ai'          // AI-powered features (Sandy, recommendations)
  | 'social'      // Social features (sharing, referrals)
  | 'analytics'   // Tracking and analytics
  | 'experimental'; // Beta features

// Feature status
export type FeatureStatus = 'stable' | 'beta' | 'experimental' | 'deprecated';

// What a feature can provide
export interface FeatureProvides {
  // React components this feature adds
  components?: Record<string, ComponentType<any>>;

  // Hooks this feature provides
  hooks?: Record<string, (...args: any[]) => any>;

  // API functions this feature adds
  api?: Record<string, (...args: any[]) => Promise<any>>;

  // Navigation items to add
  navItems?: NavItem[];

  // Floating/overlay components (chat widgets, etc.)
  overlays?: ComponentType<any>[];

  // Property page sections
  propertyPageSections?: PropertyPageSection[];

  // Booking flow steps
  bookingSteps?: BookingStep[];

  // Search filters
  searchFilters?: SearchFilter[];
}

// What a feature depends on
export interface FeatureDependencies {
  // Other features this depends on
  features?: string[];

  // Environment variables required
  envVars?: string[];

  // External services (sanity, stripe, etc.)
  services?: string[];
}

// Main feature definition
export interface FeatureDefinition {
  // Unique identifier
  id: string;

  // Display name
  name: string;

  // Description
  description: string;

  // Category
  category: FeatureCategory;

  // Status
  status: FeatureStatus;

  // Version
  version: string;

  // Is this feature enabled by default?
  defaultEnabled: boolean;

  // Dependencies
  dependencies?: FeatureDependencies;

  // What this feature provides
  provides: FeatureProvides;

  // Initialization function (runs when feature is loaded)
  initialize?: () => Promise<void> | void;

  // Cleanup function (runs when feature is disabled)
  cleanup?: () => void;
}

// Navigation item interface
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
  position: 'header' | 'footer' | 'mobile' | 'account';
  order?: number;
}

// Property page section
export interface PropertyPageSection {
  id: string;
  title: string;
  component: ComponentType<{ propertyId: string; property: any }>;
  position: 'main' | 'sidebar' | 'bottom';
  order?: number;
}

// Booking step
export interface BookingStep {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  component: ComponentType<any>;
  order: number;
  required?: boolean;
}

// Search filter
export interface SearchFilter {
  id: string;
  label: string;
  type: 'checkbox' | 'range' | 'select' | 'custom';
  component?: ComponentType<any>;
}

// Feature registry state
export interface FeatureRegistryState {
  features: Map<string, FeatureDefinition>;
  enabledFeatures: Set<string>;
  initialized: boolean;
}

// Feature config (from environment/config file)
export interface FeatureConfig {
  [featureId: string]: {
    enabled: boolean;
    config?: Record<string, any>;
  };
}
