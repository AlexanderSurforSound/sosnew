/**
 * BeaconOS - Advanced Vacation Rental Operating System
 *
 * A comprehensive platform for managing vacation rental operations
 * with AI-powered automation, dynamic pricing, and guest experience.
 *
 * Named "Beacon" for the lighthouses of the Outer Banks that guide
 * travelers safely to shore - just as this OS guides your operations.
 *
 * Core Modules:
 * - Pricing Engine: Dynamic pricing with AI optimization
 * - Messaging Hub: Automated guest communication
 * - Operations: Housekeeping, maintenance, inspections
 * - Analytics: Business intelligence and forecasting
 * - Integrations: Track PMS, payments, third-party services
 */

export { BeaconOS, createOS } from './core/os';
export type { BeaconConfig, BeaconContext } from './core/types';

// Module exports
export * from './modules/pricing';
export * from './modules/messaging';
export * from './modules/operations';
export * from './modules/analytics';
export * from './modules/integrations';

// Workflow exports
export * from './workflows';

// Utility exports
export * from './utils/events';
export * from './utils/queue';
