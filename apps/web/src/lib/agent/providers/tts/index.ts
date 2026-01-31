/**
 * TTS Provider Registry
 *
 * Manages text-to-speech providers with automatic fallback.
 *
 * @module agent/providers/tts
 *
 * @example
 * ```typescript
 * import { getTTSProvider, synthesizeSpeech } from './providers/tts';
 *
 * // Get available provider (tries ElevenLabs first, then browser)
 * const provider = getTTSProvider();
 *
 * // Or synthesize directly with automatic provider selection
 * const result = await synthesizeSpeech("Hello, welcome to Sandy!");
 * ```
 */

import { ttsProviderRegistry, type TTSProvider, type TTSResult, type TTSOptions } from './base';
import { ElevenLabsProvider, ELEVENLABS_VOICES } from './elevenlabs';
import { BrowserTTSProvider, PREFERRED_BROWSER_VOICES, findBestVoice } from './browser';
import { getConfig } from '../../config';

// Re-export types and utilities
export type { TTSProvider, TTSResult, TTSOptions } from './base';
export { ttsProviderRegistry } from './base';
export { ElevenLabsProvider, ELEVENLABS_VOICES } from './elevenlabs';
export { BrowserTTSProvider, PREFERRED_BROWSER_VOICES, findBestVoice } from './browser';

/**
 * Initialize TTS providers based on configuration
 */
export function initializeTTSProviders(): void {
  const config = getConfig();

  // Register ElevenLabs (premium)
  const elevenlabs = new ElevenLabsProvider();
  ttsProviderRegistry.register(elevenlabs);

  // Register browser TTS (fallback)
  const browser = new BrowserTTSProvider();
  ttsProviderRegistry.register(browser);

  // Set default based on config
  switch (config.voice.ttsProvider) {
    case 'elevenlabs':
      if (elevenlabs.isAvailable()) {
        ttsProviderRegistry.setDefault('elevenlabs');
      }
      break;
    case 'browser':
      ttsProviderRegistry.setDefault('browser');
      break;
    case 'auto':
    default:
      // Auto: prefer ElevenLabs if available
      if (elevenlabs.isAvailable()) {
        ttsProviderRegistry.setDefault('elevenlabs');
      } else {
        ttsProviderRegistry.setDefault('browser');
      }
      break;
  }
}

/**
 * Get the current TTS provider
 *
 * @param name - Optional specific provider name
 * @returns TTS provider or undefined
 */
export function getTTSProvider(name?: string): TTSProvider | undefined {
  // Ensure initialized
  if (ttsProviderRegistry.list().length === 0) {
    initializeTTSProviders();
  }

  if (name) {
    return ttsProviderRegistry.get(name);
  }

  return ttsProviderRegistry.getAvailable();
}

/**
 * Synthesize speech using the best available provider
 *
 * @param text - Text to synthesize
 * @param options - TTS options
 * @returns Audio result or throws if no provider available
 */
export async function synthesizeSpeech(
  text: string,
  options?: TTSOptions
): Promise<TTSResult> {
  const provider = getTTSProvider();

  if (!provider) {
    throw new Error('No TTS provider available');
  }

  // Browser provider can't synthesize server-side
  if (provider.name === 'browser') {
    throw new Error('Browser TTS requires client-side execution');
  }

  return provider.synthesize(text, options);
}

/**
 * Check if premium TTS is available
 */
export function isPremiumTTSAvailable(): boolean {
  const elevenlabs = getTTSProvider('elevenlabs');
  return elevenlabs?.isAvailable() ?? false;
}

// Auto-initialize on import
initializeTTSProviders();
