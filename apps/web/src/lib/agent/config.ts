/**
 * Sandy AI Agent Configuration
 *
 * This file contains all configuration options for the agent system.
 * Toggle features, adjust rate limits, and configure providers here.
 *
 * @module agent/config
 */

/**
 * Tool configuration - enable/disable individual tools
 *
 * Each tool can be independently toggled. Disabled tools won't be
 * available to the AI agent and won't appear in tool definitions.
 */
export interface ToolsConfig {
  /** Property search functionality */
  properties: boolean;
  /** Availability checking for specific dates */
  availability: boolean;
  /** Pricing quote generation */
  pricing: boolean;
  /** Booking intent creation */
  booking: boolean;
  /** Village information lookup */
  village: boolean;
  /** Weather forecasts */
  weather: boolean;
}

/**
 * Voice configuration - TTS and STT settings
 */
export interface VoiceConfig {
  /** Master toggle for all voice features */
  enabled: boolean;
  /**
   * Text-to-speech provider selection
   * - 'elevenlabs': Premium natural voice (requires API key)
   * - 'browser': Free browser-native TTS
   * - 'auto': Try ElevenLabs first, fallback to browser
   */
  ttsProvider: 'elevenlabs' | 'browser' | 'auto';
  /**
   * Speech-to-text provider
   * Currently only 'browser' (Web Speech API) is supported
   */
  sttProvider: 'browser';
  /** Auto-submit after silence (milliseconds) */
  silenceTimeout: number;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  /** Maximum messages per minute per session */
  messagesPerMinute: number;
  /** Maximum booking intents per minute per session */
  bookingIntentsPerMinute: number;
  /** Booking intent expiry time (milliseconds) */
  bookingIntentTTL: number;
}

/**
 * UI configuration
 */
export interface UIConfig {
  /** Maximum properties to show inline in chat */
  maxInlineProperties: number;
  /** Maximum characters for property card descriptions */
  maxDescriptionLength: number;
  /** Show tool usage indicators in chat */
  showToolIndicators: boolean;
}

/**
 * Complete agent configuration
 */
export interface AgentConfig {
  tools: ToolsConfig;
  voice: VoiceConfig;
  rateLimit: RateLimitConfig;
  ui: UIConfig;
}

/**
 * Default agent configuration
 *
 * @example
 * // Override specific settings
 * const customConfig = {
 *   ...AGENT_CONFIG,
 *   tools: { ...AGENT_CONFIG.tools, weather: false }
 * };
 */
export const AGENT_CONFIG: AgentConfig = {
  // ═══════════════════════════════════════════════════════════════
  // TOOLS - Enable/disable individual agent capabilities
  // ═══════════════════════════════════════════════════════════════
  tools: {
    properties: true,      // Search and browse properties
    availability: true,    // Check date availability
    pricing: true,         // Get pricing quotes
    booking: true,         // Create booking intents
    village: true,         // Village information
    weather: true,         // Weather forecasts
  },

  // ═══════════════════════════════════════════════════════════════
  // VOICE - Speech recognition and synthesis settings
  // ═══════════════════════════════════════════════════════════════
  voice: {
    enabled: true,
    ttsProvider: 'auto',   // 'elevenlabs' | 'browser' | 'auto'
    sttProvider: 'browser',
    silenceTimeout: 2000,  // Auto-submit after 2s of silence
  },

  // ═══════════════════════════════════════════════════════════════
  // RATE LIMITS - Protect against abuse
  // ═══════════════════════════════════════════════════════════════
  rateLimit: {
    messagesPerMinute: 30,
    bookingIntentsPerMinute: 5,
    bookingIntentTTL: 15 * 60 * 1000, // 15 minutes
  },

  // ═══════════════════════════════════════════════════════════════
  // UI - Chat widget display settings
  // ═══════════════════════════════════════════════════════════════
  ui: {
    maxInlineProperties: 3,
    maxDescriptionLength: 150,
    showToolIndicators: false, // Show "Searching properties..." etc.
  },
};

/**
 * Environment-based configuration overrides
 *
 * Allows runtime configuration via environment variables
 */
export function getConfig(): AgentConfig {
  const config = { ...AGENT_CONFIG };

  // Voice provider override
  if (process.env.AGENT_TTS_PROVIDER) {
    config.voice.ttsProvider = process.env.AGENT_TTS_PROVIDER as 'elevenlabs' | 'browser' | 'auto';
  }

  // Disable voice if explicitly set
  if (process.env.AGENT_VOICE_ENABLED === 'false') {
    config.voice.enabled = false;
  }

  // Rate limit overrides
  if (process.env.AGENT_RATE_LIMIT_MESSAGES) {
    config.rateLimit.messagesPerMinute = parseInt(process.env.AGENT_RATE_LIMIT_MESSAGES, 10);
  }

  return config;
}
