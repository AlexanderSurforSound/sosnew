/**
 * Sandy AI Agent API Route
 *
 * Handles chat messages and executes the agent loop with tools.
 *
 * @route POST /api/chat/agent
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/chat/agent', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     message: 'Find me a pet-friendly house in Avon',
 *     sessionId: 'session_123',
 *   }),
 * });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  executeAgentLoop,
  getOrCreateConversation,
  addMessage,
  checkRateLimit,
  RateLimitType,
  getRateLimitMessage,
  SANDY_SYSTEM_PROMPT,
} from '@/lib/agent';
import type { AgentRequest, AgentResponse } from '@/lib/agent';

export async function POST(request: NextRequest) {
  try {
    const body: AgentRequest = await request.json();
    const { conversationId, sessionId, message, context } = body;

    // Validate message
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Generate session ID if not provided
    const effectiveSessionId = sessionId || `anon_${Date.now()}`;

    // Check rate limit
    if (!checkRateLimit(effectiveSessionId, RateLimitType.MESSAGE)) {
      return NextResponse.json(
        { error: getRateLimitMessage(RateLimitType.MESSAGE) },
        { status: 429 }
      );
    }

    // Get or create conversation
    const { conversation, conversationId: convId } = getOrCreateConversation(conversationId);

    // Build context-aware system prompt
    let systemPrompt = SANDY_SYSTEM_PROMPT;
    if (context?.propertyId) {
      systemPrompt += `\n\nCurrent context: The guest is viewing property ID "${context.propertyId}".`;
    }
    if (context?.page) {
      systemPrompt += `\n\nThe guest is currently on the page: ${context.page}`;
    }

    // Add user message
    addMessage(convId, { role: 'user', content: message });

    // Execute agent loop
    const result = await executeAgentLoop({
      messages: conversation.messages,
      systemPrompt,
      sessionId: effectiveSessionId,
    });

    // Update conversation with new messages
    // (executor returns updated messages array)
    conversation.messages = result.messages;

    // Build response
    const response: AgentResponse = {
      conversationId: convId,
      message: result.message,
    };

    if (result.actions.length > 0) {
      response.actions = result.actions;
    }

    if (result.toolsUsed.length > 0) {
      response.toolsUsed = result.toolsUsed;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Agent error:', error);
    return NextResponse.json(
      { error: 'Failed to process your message. Please try again.' },
      { status: 500 }
    );
  }
}
