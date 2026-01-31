/**
 * Voice Providers
 *
 * Central export for all voice-related providers (TTS and STT).
 *
 * @module agent/providers
 *
 * @example
 * ```typescript
 * import { getTTSProvider, isPremiumTTSAvailable } from './providers';
 *
 * // Check if premium voice is available
 * if (isPremiumTTSAvailable()) {
 *   const audio = await synthesizeSpeech("Welcome to Sandy!");
 * }
 * ```
 */

// TTS Providers
export {
  // Registry and provider interface
  ttsProviderRegistry,
  type TTSProvider,
  type TTSResult,
  type TTSOptions,

  // Concrete providers
  ElevenLabsProvider,
  ELEVENLABS_VOICES,
  BrowserTTSProvider,
  PREFERRED_BROWSER_VOICES,
  findBestVoice,

  // Utilities
  getTTSProvider,
  synthesizeSpeech,
  isPremiumTTSAvailable,
  initializeTTSProviders,
} from './tts';

// STT Providers (Speech-to-Text)
// Currently only browser-based Web Speech API is supported.
// STT runs entirely client-side in the useVoice hook.
//
// Future providers could include:
// - Whisper (OpenAI)
// - Google Speech-to-Text
// - Azure Speech Services
// - Deepgram
