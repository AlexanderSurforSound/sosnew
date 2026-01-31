/**
 * Browser TTS Provider
 *
 * Free text-to-speech using the Web Speech API.
 * Works in all modern browsers without any API keys.
 *
 * @module agent/providers/tts/browser
 *
 * @remarks
 * This provider runs entirely in the browser and doesn't need
 * server-side processing. It's used as a fallback when premium
 * TTS providers are not available.
 *
 * Voice quality varies by browser and operating system:
 * - Chrome/Edge: Google voices (good quality)
 * - Safari: Siri voices (excellent quality)
 * - Firefox: System voices (varies)
 *
 * @example
 * ```typescript
 * // This provider is meant for client-side use only
 * // For server-side API route, return a signal to use browser TTS
 * if (!premiumProvider.isAvailable()) {
 *   return { useBrowserFallback: true };
 * }
 * ```
 */

import type { TTSProvider, TTSResult, TTSOptions } from './base';

/**
 * Browser TTS Provider
 *
 * Note: This is a stub for server-side code. The actual browser
 * TTS implementation is in the useVoice hook (client-side).
 */
export class BrowserTTSProvider implements TTSProvider {
  readonly name = 'browser';

  /**
   * Browser TTS is always "available" as a fallback
   */
  isAvailable(): boolean {
    return true;
  }

  /**
   * Server-side synthesize throws - browser TTS is client-only
   *
   * The API route should return a signal for the client to use
   * browser TTS instead of trying to generate audio server-side.
   */
  async synthesize(_text: string, _options?: TTSOptions): Promise<TTSResult> {
    throw new Error(
      'Browser TTS cannot be used server-side. ' +
      'Return { useBrowserFallback: true } from the API route instead.'
    );
  }
}

/**
 * Preferred browser voices by quality
 *
 * Use this list to select the best available voice on the client.
 */
export const PREFERRED_BROWSER_VOICES = [
  // macOS/iOS Siri voices (excellent)
  'Samantha',
  'Karen',
  'Moira',

  // Chrome/Android Google voices (good)
  'Google US English',
  'Google UK English Female',

  // Windows voices (decent)
  'Microsoft Zira',
  'Microsoft David',

  // Generic English fallbacks
  'English (United States)',
  'en-US',
];

/**
 * Find the best available voice for browser TTS
 *
 * @param voices - Available SpeechSynthesisVoice array
 * @returns Best matching voice or undefined
 */
export function findBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  // Try preferred voices first
  for (const preferred of PREFERRED_BROWSER_VOICES) {
    const voice = voices.find(v =>
      v.name.includes(preferred) || v.lang.includes(preferred)
    );
    if (voice) return voice;
  }

  // Fallback to any English voice
  const englishVoice = voices.find(v =>
    v.lang.startsWith('en') && v.localService
  );
  if (englishVoice) return englishVoice;

  // Last resort: first available voice
  return voices[0];
}
