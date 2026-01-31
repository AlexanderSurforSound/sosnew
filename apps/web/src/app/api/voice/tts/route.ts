/**
 * Text-to-Speech API Route
 *
 * Converts text to speech using the configured TTS provider.
 * Falls back to browser TTS signal if no premium provider available.
 *
 * @route POST /api/voice/tts
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/voice/tts', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ text: 'Hello!' }),
 * });
 *
 * if (response.ok) {
 *   const blob = await response.blob();
 *   const audio = new Audio(URL.createObjectURL(blob));
 *   audio.play();
 * } else {
 *   const { useBrowserFallback } = await response.json();
 *   if (useBrowserFallback) {
 *     // Use browser's speechSynthesis API
 *   }
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTTSProvider, isPremiumTTSAvailable } from '@/lib/agent';
import type { TTSRequest } from '@/lib/agent';

/**
 * Maximum text length allowed
 */
const MAX_TEXT_LENGTH = 5000;

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json();
    const { text, voice } = body;

    // Validate text
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text too long (max ${MAX_TEXT_LENGTH} characters)` },
        { status: 400 }
      );
    }

    // Check if premium TTS is available
    if (!isPremiumTTSAvailable()) {
      return NextResponse.json(
        {
          error: 'Premium TTS not configured',
          useBrowserFallback: true,
          message: 'Use browser speechSynthesis API instead',
        },
        { status: 404 }
      );
    }

    // Get the TTS provider (should be ElevenLabs if available)
    const provider = getTTSProvider();

    if (!provider || provider.name === 'browser') {
      return NextResponse.json(
        {
          error: 'TTS service not available',
          useBrowserFallback: true,
        },
        { status: 404 }
      );
    }

    // Synthesize speech
    const result = await provider.synthesize(text.trim(), { voice });

    // Return audio stream
    return new NextResponse(result.audio, {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Content-Length': result.audio.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('TTS error:', error);

    return NextResponse.json(
      {
        error: 'TTS generation failed',
        useBrowserFallback: true,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
