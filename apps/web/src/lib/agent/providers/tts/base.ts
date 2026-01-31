/**
 * Text-to-Speech Provider Interface
 *
 * Base interface for TTS providers. Implement this to add
 * new TTS services (ElevenLabs, Google, Azure, etc.)
 *
 * @module agent/providers/tts/base
 *
 * @example
 * ```typescript
 * class MyTTSProvider implements TTSProvider {
 *   readonly name = 'my-provider';
 *
 *   async synthesize(text: string): Promise<TTSResult> {
 *     // Your implementation
 *   }
 *
 *   isAvailable(): boolean {
 *     return !!process.env.MY_API_KEY;
 *   }
 * }
 * ```
 */

/**
 * Result of TTS synthesis
 */
export interface TTSResult {
  /** Audio data */
  audio: ArrayBuffer;
  /** MIME type */
  contentType: string;
}

/**
 * TTS Provider interface
 */
export interface TTSProvider {
  /** Provider name (for logging/debugging) */
  readonly name: string;

  /**
   * Synthesize text to speech
   * @param text - Text to convert
   * @param options - Provider-specific options
   */
  synthesize(text: string, options?: TTSOptions): Promise<TTSResult>;

  /**
   * Check if provider is available
   * (e.g., API key configured)
   */
  isAvailable(): boolean;
}

/**
 * Common TTS options
 */
export interface TTSOptions {
  /** Voice ID (provider-specific) */
  voice?: string;
  /** Speech rate (0.5-2.0) */
  rate?: number;
  /** Pitch adjustment (-20 to 20 semitones) */
  pitch?: number;
  /** Volume (0-1) */
  volume?: number;
}

/**
 * TTS Provider registry
 */
export class TTSProviderRegistry {
  private providers = new Map<string, TTSProvider>();
  private defaultProvider: string | null = null;

  /**
   * Register a provider
   */
  register(provider: TTSProvider, isDefault = false): void {
    this.providers.set(provider.name, provider);
    if (isDefault || !this.defaultProvider) {
      this.defaultProvider = provider.name;
    }
  }

  /**
   * Get a provider by name
   */
  get(name: string): TTSProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Get the default provider
   */
  getDefault(): TTSProvider | undefined {
    if (!this.defaultProvider) return undefined;
    return this.providers.get(this.defaultProvider);
  }

  /**
   * Get first available provider
   */
  getAvailable(): TTSProvider | undefined {
    // Try default first
    const defaultProvider = this.getDefault();
    if (defaultProvider?.isAvailable()) {
      return defaultProvider;
    }

    // Try others
    for (const provider of this.providers.values()) {
      if (provider.isAvailable()) {
        return provider;
      }
    }

    return undefined;
  }

  /**
   * Set the default provider
   */
  setDefault(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider "${name}" not registered`);
    }
    this.defaultProvider = name;
  }

  /**
   * List all registered providers
   */
  list(): string[] {
    return Array.from(this.providers.keys());
  }
}

/**
 * Global TTS provider registry
 */
export const ttsProviderRegistry = new TTSProviderRegistry();
