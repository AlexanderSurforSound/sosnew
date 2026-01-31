/**
 * Tool Registry
 *
 * Central registration point for all agent tools.
 * Tools are registered based on configuration settings.
 *
 * @module agent/tools
 *
 * @example
 * ```typescript
 * import { toolRegistry, getToolDefinitions } from './tools';
 *
 * // Get all tool definitions for Claude
 * const tools = getToolDefinitions();
 *
 * // Execute a tool
 * const result = await toolRegistry.execute('search_properties', { village: 'Avon' });
 * ```
 */

import { ToolRegistry, toolRegistry } from './base';
import { getConfig } from '../config';

// Import all tools
import { PropertiesTool } from './properties.tool';
import { AvailabilityTool } from './availability.tool';
import { PricingTool } from './pricing.tool';
import { BookingTool, getBookingIntent } from './booking.tool';
import { VillageTool } from './village.tool';
import { WeatherTool } from './weather.tool';

// Re-export base classes and utilities
export { BaseTool, ToolRegistry, toolRegistry } from './base';
export { getBookingIntent } from './booking.tool';

// Re-export tool classes for direct instantiation if needed
export { PropertiesTool } from './properties.tool';
export { AvailabilityTool } from './availability.tool';
export { PricingTool } from './pricing.tool';
export { BookingTool } from './booking.tool';
export { VillageTool } from './village.tool';
export { WeatherTool } from './weather.tool';

/**
 * Initialize the tool registry based on configuration
 *
 * @param registry - Optional custom registry (uses global by default)
 * @returns The initialized registry
 */
export function initializeTools(registry: ToolRegistry = toolRegistry): ToolRegistry {
  const config = getConfig();

  // Clear existing tools
  for (const name of registry.getNames()) {
    registry.unregister(name);
  }

  // Register enabled tools
  if (config.tools.properties) {
    registry.register(new PropertiesTool());
  }

  if (config.tools.availability) {
    registry.register(new AvailabilityTool());
  }

  if (config.tools.pricing) {
    registry.register(new PricingTool());
  }

  if (config.tools.booking) {
    registry.register(new BookingTool());
  }

  if (config.tools.village) {
    registry.register(new VillageTool());
  }

  if (config.tools.weather) {
    registry.register(new WeatherTool());
  }

  return registry;
}

/**
 * Get tool definitions for Claude
 *
 * @returns Array of tool definitions
 */
export function getToolDefinitions() {
  // Ensure tools are initialized
  if (toolRegistry.getAll().length === 0) {
    initializeTools();
  }
  return toolRegistry.getDefinitions();
}

/**
 * Execute a tool by name
 *
 * @param name - Tool name
 * @param input - Tool input
 * @returns Tool result
 */
export async function executeTool(name: string, input: unknown) {
  // Ensure tools are initialized
  if (toolRegistry.getAll().length === 0) {
    initializeTools();
  }
  return toolRegistry.execute(name, input);
}

// Auto-initialize on import
initializeTools();
