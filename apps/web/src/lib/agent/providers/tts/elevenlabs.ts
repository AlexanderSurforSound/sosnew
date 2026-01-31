/**
 * ElevenLabs TTS Provider
 *
 * Premium text-to-speech using ElevenLabs API.
 * Provides natural, human-like voice synthesis.
 *
 * @module agent/providers/tts/elevenlabs
 *
 * @requires ELEVENLABS_API_KEY environment variable
 *
 * @example
 * ```typescript
 * const provider = new ElevenLabsProvider();
 * if (provider.isAvailable()) {
 *   const result = await provider.synthesize("Hello!");
 *   // result.audio contains MP3 audio data
 * }
 * ```
 */

import type { TTSProvider, TTSResult, TTSOptions } from './base';

/**
 * ElevenLabs API configuration
 */
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

/**
 * Available ElevenLabs voices (subset of popular options)
 */
export const ELEVENLABS_VOICES = {
  // Friendly, conversational voices
  sarah: 'EXAVITQu4vr4xnSDxMaL',      // Sarah - warm, friendly female
  rachel: '21m00Tcm4TlvDq8ikWAM',     // Rachel - calm, professional female
  domi: 'AZnzlk1XvdvUeBnXmlld',       // Domi - confident female
  bella: 'EXAVITQu4vr4xnSDxMaL',      // Bella - soft, friendly female

  // Male voices
  adam: 'pNInz6obpgDQGcFmaJgB',       // Adam - deep, authoritative male
  antoni: 'ErXwobaYiN019PkySvjV',     // Antoni - well-rounded male
  josh: 'TxGEqnHWrfWFTfGW9XjX',       // Josh - young, energetic male

  // Character voices
  elli: 'MF3mGyEYCl7XYWbV9V6O',       // Elli - young female
  callum: 'N2lVS1w4EtoT3dr4eOWO',     // Callum - middle-aged male
};

/**
 * Default voice for Sandy (warm, friendly female)
 */
const DEFAULT_VOICE = ELEVENLABS_VOICES.sarah;

/**
 * ElevenLabs TTS Provider
 */
export class ElevenLabsProvider implements TTSProvider {
  readonly name = 'elevenlabs';

  private apiKey: string | undefined;
  private defaultVoice: string;

  constructor(options?: { apiKey?: string; defaultVoice?: string }) {
    this.apiKey = options?.apiKey || process.env.ELEVENLABS_API_KEY;
    this.defaultVoice = options?.defaultVoice || process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE;
  }

  /**
   * Check if ElevenLabs is available
   */
  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  /**
   * Synthesize text to speech
   */
  async synthesize(text: string, options?: TTSOptions): Promise<TTSResult> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const voiceId = options?.voice || this.defaultVoice;

    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_turbo_v2', // Fast model for real-time
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
    }

    const audio = await response.arrayBuffer();

    return {
      audio,
      contentType: 'audio/mpeg',
    };
  }

  /**
   * Get available voice IDs
   */
  static getVoices(): Record<string, string> {
    return { ...ELEVENLABS_VOICES };
  }
}
