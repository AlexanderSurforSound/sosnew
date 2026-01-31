/**
 * Tool Executor
 *
 * Handles the execution loop for Claude tool calls.
 * Manages the back-and-forth between Claude and tools until
 * a final response is generated.
 *
 * @module agent/core/executor
 *
 * @example
 * ```typescript
 * import { executeAgentLoop } from './executor';
 *
 * const result = await executeAgentLoop({
 *   messages: conversationMessages,
 *   systemPrompt: SANDY_SYSTEM_PROMPT,
 *   sessionId: 'session_123',
 * });
 * ```
 */

import Anthropic from '@anthropic-ai/sdk';
import { getToolDefinitions, executeTool, getBookingIntent } from '../tools';
import { checkRateLimit, RateLimitType, getRateLimitMessage } from './rate-limit';
import type { AgentAction, PropertySearchResult, BookingIntent } from '../types';

/**
 * Anthropic client instance
 */
const anthropic = new Anthropic();

/**
 * Maximum tool execution iterations
 */
const MAX_ITERATIONS = 5;

/**
 * Claude model to use
 */
const MODEL = 'claude-sonnet-4-20250514';

/**
 * Executor options
 */
export interface ExecutorOptions {
  /** Conversation messages */
  messages: Anthropic.Messages.MessageParam[];
  /** System prompt */
  systemPrompt: string;
  /** Session ID for rate limiting */
  sessionId: string;
  /** Maximum tokens for response */
  maxTokens?: number;
}

/**
 * Executor result
 */
export interface ExecutorResult {
  /** Final text response */
  message: string;
  /** Updated messages array */
  messages: Anthropic.Messages.MessageParam[];
  /** UI actions to perform */
  actions: AgentAction[];
  /** Tools that were used */
  toolsUsed: string[];
  /** Any errors that occurred */
  errors: string[];
}

/**
 * Execute the agent loop
 *
 * Sends messages to Claude with tools, executes any tool calls,
 * and continues until Claude provides a final text response.
 *
 * @param options - Executor options
 * @returns Executor result with response and actions
 */
export async function executeAgentLoop(
  options: ExecutorOptions
): Promise<ExecutorResult> {
  const { systemPrompt, sessionId, maxTokens = 1024 } = options;
  let { messages } = options;

  const toolsUsed: string[] = [];
  const actions: AgentAction[] = [];
  const errors: string[] = [];

  let iterations = 0;
  let response: Anthropic.Messages.Message;

  // Get tool definitions
  const tools = getToolDefinitions();

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    // Call Claude
    response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      tools,
      messages,
    });

    // Check for tool use
    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.Messages.ToolUseBlock => block.type === 'tool_use'
    );

    // No tool calls - we have the final response
    if (toolUseBlocks.length === 0) {
      break;
    }

    // Execute each tool
    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

    for (const toolUse of toolUseBlocks) {
      toolsUsed.push(toolUse.name);

      // Special rate limit check for booking intents
      if (toolUse.name === 'start_booking') {
        if (!checkRateLimit(sessionId, RateLimitType.BOOKING_INTENT)) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify({
              success: false,
              error: getRateLimitMessage(RateLimitType.BOOKING_INTENT),
            }),
          });
          continue;
        }
      }

      // Execute the tool
      const result = await executeTool(toolUse.name, toolUse.input);

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(result),
      });

      // Create UI actions based on tool results
      if (result.success) {
        const action = createActionFromToolResult(toolUse.name, result.data);
        if (action) {
          actions.push(action);
        }
      } else if (result.error) {
        errors.push(result.error);
      }
    }

    // Add assistant message with tool uses
    messages = [
      ...messages,
      { role: 'assistant', content: response.content },
      { role: 'user', content: toolResults },
    ];
  }

  // Extract final text response
  const textBlocks = response!.content.filter(
    (block): block is Anthropic.Messages.TextBlock => block.type === 'text'
  );

  const finalMessage =
    textBlocks.map(b => b.text).join('\n') ||
    "I apologize, but I had trouble generating a response. Please try again!";

  // Add final assistant message (text only)
  messages = [...messages, { role: 'assistant', content: finalMessage }];

  return {
    message: finalMessage,
    messages,
    actions,
    toolsUsed: [...new Set(toolsUsed)], // Deduplicate
    errors,
  };
}

/**
 * Create a UI action from a tool result
 *
 * @param toolName - Name of the tool
 * @param data - Tool result data
 * @returns Action or undefined
 */
function createActionFromToolResult(
  toolName: string,
  data: unknown
): AgentAction | undefined {
  switch (toolName) {
    case 'search_properties': {
      const result = data as PropertySearchResult;
      if (result.properties?.length > 0) {
        return {
          type: 'show_properties',
          data: result.properties,
        };
      }
      break;
    }

    case 'start_booking': {
      const result = data as BookingIntent;
      if (result.intentId) {
        return {
          type: 'show_booking_confirmation',
          data: result,
        };
      }
      break;
    }
  }

  return undefined;
}
