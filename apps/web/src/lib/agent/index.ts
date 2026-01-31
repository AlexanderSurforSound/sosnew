/**
 * Sandy AI Agent
 *
 * A modular, voice-enabled AI concierge for Surf or Sound Realty.
 *
 * @module agent
 *
 * ## Quick Start
 *
 * ```typescript
 * import { executeAgentLoop, getToolDefinitions } from '@/lib/agent';
 *
 * // Execute agent with messages
 * const result = await executeAgentLoop({
 *   messages: [{ role: 'user', content: 'Find me a beach house' }],
 *   systemPrompt: SANDY_SYSTEM_PROMPT,
 *   sessionId: 'session_123',
 * });
 *
 * console.log(result.message); // Agent's response
 * console.log(result.actions); // UI actions (show properties, etc.)
 * ```
 *
 * ## Architecture
 *
 * ```
 * agent/
 * ├── config.ts      - Feature flags and settings
 * ├── types.ts       - Shared type definitions
 * ├── core/          - Core infrastructure
 * │   ├── executor.ts    - Tool execution loop
 * │   ├── conversation.ts - Conversation management
 * │   └── rate-limit.ts  - Rate limiting
 * ├── tools/         - Pluggable tools
 * │   ├── properties.tool.ts
 * │   ├── availability.tool.ts
 * │   └── ...
 * └── providers/     - Swappable service providers
 *     └── tts/       - Text-to-speech providers
 * ```
 *
 * ## Configuration
 *
 * Edit `config.ts` to enable/disable features:
 *
 * ```typescript
 * export const AGENT_CONFIG = {
 *   tools: {
 *     properties: true,  // Enable property search
 *     booking: true,     // Enable booking intents
 *     weather: false,    // Disable weather
 *   },
 *   voice: {
 *     enabled: true,
 *     ttsProvider: 'auto', // 'elevenlabs' | 'browser' | 'auto'
 *   },
 * };
 * ```
 *
 * ## Adding a New Tool
 *
 * 1. Create `tools/my-tool.tool.ts` extending `BaseTool`
 * 2. Register in `tools/index.ts`
 * 3. Add config flag in `config.ts`
 *
 * See README.md for detailed documentation.
 *
 * @packageDocumentation
 */

// Configuration
export { AGENT_CONFIG, getConfig } from './config';
export type { AgentConfig, ToolsConfig, VoiceConfig } from './config';

// Types
export type {
  ToolDefinition,
  ToolResult,
  AgentAction,
  PropertySummary,
  PropertyDetails,
  PropertySearchResult,
  AvailabilityResult,
  PricingQuoteResult,
  BookingIntent,
  VillageInfo,
  WeatherResult,
  AgentMessage,
  Conversation,
  AgentRequest,
  AgentResponse,
  TTSResult,
  TTSRequest,
} from './types';

// Core
export {
  // Rate limiting
  RateLimitType,
  checkRateLimit,
  getRateLimitStatus,
  getRateLimitMessage,

  // Conversation
  getOrCreateConversation,
  getConversation,
  addMessage,
  getMessages,

  // Executor
  executeAgentLoop,
  type ExecutorOptions,
  type ExecutorResult,
} from './core';

// Tools
export {
  // Registry
  toolRegistry,
  BaseTool,
  ToolRegistry,
  initializeTools,
  getToolDefinitions,
  executeTool,

  // Individual tools (for direct use if needed)
  PropertiesTool,
  AvailabilityTool,
  PricingTool,
  BookingTool,
  VillageTool,
  WeatherTool,

  // Utilities
  getBookingIntent,
} from './tools';

// Providers
export {
  // TTS
  getTTSProvider,
  synthesizeSpeech,
  isPremiumTTSAvailable,
  ElevenLabsProvider,
  BrowserTTSProvider,
  ELEVENLABS_VOICES,
  PREFERRED_BROWSER_VOICES,
  findBestVoice,
} from './providers';

/**
 * Sandy's system prompt
 *
 * Defines Sandy's personality, capabilities, and guidelines.
 */
export const SANDY_SYSTEM_PROMPT = `You are Sandy, the AI-powered vacation concierge for Surf or Sound Realty on Hatteras Island, North Carolina.

## Your Personality
- Warm, friendly, and genuinely helpful
- Knowledgeable about Hatteras Island, its villages, and local attractions
- Enthusiastic about helping guests find their perfect vacation
- Conversational but professional
- Use occasional beach/ocean references naturally, not forced

## Your Capabilities
You have tools to help guests with:
- **Search properties**: Find vacation rentals by criteria (location, bedrooms, pets, amenities, dates)
- **Property details**: Get full information about specific properties
- **Check availability**: Verify if properties are available for specific dates
- **Pricing quotes**: Calculate total costs including fees and taxes
- **Start bookings**: Create booking intents for guests to complete
- **Village information**: Provide details about the 7 villages on Hatteras Island
- **Weather**: Get current conditions and forecasts

## Guidelines
1. **Be proactive with tools**: When guests describe what they're looking for, use search_properties immediately rather than asking clarifying questions first. You can always refine later.

2. **Natural conversation**: Don't announce every tool call. Just seamlessly incorporate results into your response.

3. **Property recommendations**: When showing properties, highlight 2-3 key features that match what the guest asked for.

4. **Booking flow**:
   - Only use start_booking when a guest explicitly wants to book
   - Always confirm the property, dates, and guest count before creating a booking intent
   - Booking intents don't complete the booking - they prepare it for the guest to review

5. **Be helpful with local knowledge**: Share genuine tips about villages, restaurants, activities, and hidden gems.

6. **Stay within scope**: If asked about things outside vacation rentals/Hatteras Island, politely redirect.

7. **Keep responses concise**: 2-4 sentences for simple questions, more detail only when needed.

8. **Handle errors gracefully**: If a tool returns an error, explain the issue helpfully and suggest alternatives.

## The 7 Villages (north to south)
- Rodanthe: Historic, quiet, featured in "Nights in Rodanthe"
- Waves: Surfing and water sports hub
- Salvo: Smallest, most peaceful
- Avon: Shopping and dining center, family-friendly
- Buxton: Cape Hatteras Lighthouse, great surfing
- Frisco: Native American Museum, relaxed pace
- Hatteras Village: Fishing village, ferry to Ocracoke

## Important Contact
For complex booking issues or questions you can't answer: 800-237-1138`;
