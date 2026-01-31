# Sandy AI Agent System

A modular, voice-enabled AI concierge for Surf or Sound Realty vacation rentals.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           User Interface                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │  ChatWidgetV2   │  │  VoiceOverlay   │  │  PropertyCardMini /     │  │
│  │  (Main Widget)  │  │  (Voice Mode)   │  │  BookingConfirmation    │  │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────────────┘  │
└───────────┼─────────────────────┼───────────────────────────────────────┘
            │                     │
            ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            React Hooks                                   │
│  ┌─────────────────┐  ┌─────────────────┐                               │
│  │  useAgentChat   │  │    useVoice     │                               │
│  │  (Conversation) │  │  (STT + TTS)    │                               │
│  └────────┬────────┘  └────────┬────────┘                               │
└───────────┼─────────────────────┼───────────────────────────────────────┘
            │                     │
            ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API Routes                                     │
│  ┌─────────────────┐  ┌─────────────────┐                               │
│  │ /api/chat/agent │  │ /api/voice/tts  │                               │
│  │ (Agent Loop)    │  │ (Text-to-Speech)│                               │
│  └────────┬────────┘  └─────────────────┘                               │
└───────────┼─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Agent Core                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │   Tool Registry │  │  Tool Executor  │  │    Rate Limiter         │  │
│  │   (tools/)      │  │  (executor.ts)  │  │    (rate-limit.ts)      │  │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────────────┘  │
└───────────┼─────────────────────┼───────────────────────────────────────┘
            │                     │
            ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Tool Modules (Pluggable)                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │  properties  │ │ availability │ │   booking    │ │   weather    │   │
│  │    tool      │ │    tool      │ │    tool      │ │    tool      │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│  ┌──────────────┐ ┌──────────────┐                                      │
│  │   village    │ │   pricing    │                                      │
│  │    tool      │ │    tool      │                                      │
│  └──────────────┘ └──────────────┘                                      │
└─────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Voice Providers (Swappable)                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                     │
│  │  ElevenLabs  │ │  Browser TTS │ │   (Custom)   │                     │
│  │   Provider   │ │   Provider   │ │   Provider   │                     │
│  └──────────────┘ └──────────────┘ └──────────────┘                     │
└─────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/lib/agent/
├── README.md                 # This file
├── index.ts                  # Main exports & configuration
├── config.ts                 # Feature flags & settings
├── types.ts                  # Shared type definitions
│
├── core/                     # Core agent infrastructure
│   ├── executor.ts           # Tool execution engine
│   ├── rate-limit.ts         # Rate limiting utilities
│   └── conversation.ts       # Conversation management
│
├── tools/                    # Pluggable tool modules
│   ├── index.ts              # Tool registry
│   ├── base.ts               # Base tool interface
│   ├── properties.tool.ts    # Property search tool
│   ├── availability.tool.ts  # Availability check tool
│   ├── pricing.tool.ts       # Pricing quote tool
│   ├── booking.tool.ts       # Booking intent tool
│   ├── village.tool.ts       # Village info tool
│   └── weather.tool.ts       # Weather tool
│
└── providers/                # Swappable service providers
    ├── index.ts              # Provider registry
    ├── tts/                  # Text-to-speech providers
    │   ├── base.ts           # TTS provider interface
    │   ├── elevenlabs.ts     # ElevenLabs implementation
    │   └── browser.ts        # Browser TTS fallback
    └── stt/                  # Speech-to-text providers
        ├── base.ts           # STT provider interface
        └── browser.ts        # Web Speech API implementation
```

## Quick Start

### Enable/Disable Features

Edit `config.ts` to toggle features:

```typescript
export const AGENT_CONFIG = {
  tools: {
    properties: true,      // Property search
    availability: true,    // Availability checking
    pricing: true,         // Pricing quotes
    booking: true,         // Booking intents
    village: true,         // Village information
    weather: true,         // Weather forecasts
  },
  voice: {
    enabled: true,         // Voice features
    ttsProvider: 'auto',   // 'elevenlabs' | 'browser' | 'auto'
    sttProvider: 'browser' // 'browser' (Web Speech API)
  },
  rateLimit: {
    messagesPerMinute: 30,
    bookingIntentsPerMinute: 5,
  }
};
```

### Adding a New Tool

1. Create a new file in `tools/`:

```typescript
// tools/my-feature.tool.ts
import { BaseTool, ToolDefinition, ToolResult } from './base';

export interface MyFeatureInput {
  param1: string;
  param2?: number;
}

export interface MyFeatureResult {
  data: string;
  // ...
}

export class MyFeatureTool extends BaseTool<MyFeatureInput, MyFeatureResult> {
  readonly name = 'my_feature';

  readonly definition: ToolDefinition = {
    name: 'my_feature',
    description: 'Description for Claude to understand when to use this tool',
    input_schema: {
      type: 'object',
      properties: {
        param1: { type: 'string', description: '...' },
        param2: { type: 'number', description: '...' },
      },
      required: ['param1'],
    },
  };

  async execute(input: MyFeatureInput): Promise<ToolResult<MyFeatureResult>> {
    // Your implementation
    return {
      success: true,
      data: { data: 'result' },
    };
  }
}
```

2. Register in `tools/index.ts`:

```typescript
import { MyFeatureTool } from './my-feature.tool';

// Add to registry
if (config.tools.myFeature) {
  registry.register(new MyFeatureTool());
}
```

### Adding a New TTS Provider

1. Create provider in `providers/tts/`:

```typescript
// providers/tts/my-provider.ts
import { TTSProvider, TTSResult } from './base';

export class MyTTSProvider implements TTSProvider {
  readonly name = 'my-provider';

  async synthesize(text: string): Promise<TTSResult> {
    // Your implementation
    return {
      audio: audioBuffer,
      contentType: 'audio/mpeg',
    };
  }

  isAvailable(): boolean {
    return !!process.env.MY_PROVIDER_API_KEY;
  }
}
```

2. Register in `providers/index.ts`

## Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional - Voice
ELEVENLABS_API_KEY=...           # For premium TTS
ELEVENLABS_VOICE_ID=...          # Custom voice (default: Sarah)
```

## API Reference

### POST /api/chat/agent

Send a message to the Sandy AI agent.

**Request:**
```json
{
  "message": "Find me a pet-friendly house in Avon",
  "conversationId": "conv_123",  // Optional, for continuing conversation
  "sessionId": "session_abc",    // Optional, for rate limiting
  "context": {
    "propertyId": "prop_456",    // Optional, current property context
    "page": "/properties"        // Optional, current page
  }
}
```

**Response:**
```json
{
  "conversationId": "conv_123",
  "message": "I found 12 pet-friendly properties in Avon! Here are my top picks...",
  "actions": [
    {
      "type": "show_properties",
      "data": [{ "id": "...", "name": "...", ... }]
    }
  ],
  "toolsUsed": ["search_properties"]
}
```

### POST /api/voice/tts

Convert text to speech audio.

**Request:**
```json
{
  "text": "Hello, welcome to Surf or Sound!",
  "voice": "EXAVITQu4vr4xnSDxMaL"  // Optional voice ID
}
```

**Response:** Audio stream (audio/mpeg)

## Security

- **Rate Limiting**: 30 messages/minute, 5 booking intents/minute per session
- **Booking Safety**: Booking intents require user confirmation (redirect to /book page)
- **Intent Expiry**: Booking intents expire after 15 minutes
- **No Direct Bookings**: Agent cannot complete bookings, only create intents

## Troubleshooting

### Voice not working
1. Check browser supports Web Speech API (Chrome, Edge, Safari)
2. Ensure microphone permissions granted
3. Check HTTPS (required for speech recognition)

### TTS sounds robotic
- Set `ELEVENLABS_API_KEY` for natural-sounding voice
- Without it, falls back to browser TTS

### Agent not finding properties
- Check `NEXT_PUBLIC_USE_MOCK_DATA` environment variable
- Verify Track API credentials if using real data
