/**
 * Conversation Management
 *
 * Handles conversation storage, retrieval, and lifecycle.
 *
 * @module agent/core/conversation
 *
 * @example
 * ```typescript
 * import { getOrCreateConversation, addMessage } from './conversation';
 *
 * // Get or create conversation
 * const { conversation, conversationId, isNew } = getOrCreateConversation(existingId);
 *
 * // Add messages
 * addMessage(conversationId, { role: 'user', content: 'Hello' });
 * ```
 */

import type { Anthropic } from '@anthropic-ai/sdk';

/**
 * Conversation data structure
 */
export interface Conversation {
  /** Unique conversation ID */
  id: string;
  /** Message history for Claude */
  messages: Anthropic.Messages.MessageParam[];
  /** Creation timestamp */
  createdAt: Date;
  /** Last activity timestamp */
  lastActivityAt: Date;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * In-memory conversation storage
 *
 * @remarks
 * In production, use Redis or a database for persistence
 */
const conversations = new Map<string, Conversation>();

/**
 * Conversation TTL (1 hour)
 */
const CONVERSATION_TTL = 60 * 60 * 1000;

/**
 * Maximum messages to keep per conversation
 */
const MAX_MESSAGES = 30;

/**
 * Clean up old conversations periodically
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const expiryTime = new Date(Date.now() - CONVERSATION_TTL);

    for (const [id, conv] of conversations.entries()) {
      if (conv.lastActivityAt < expiryTime) {
        conversations.delete(id);
      }
    }
  }, 60 * 60 * 1000); // Every hour
}

/**
 * Generate a unique conversation ID
 */
export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Get or create a conversation
 *
 * @param conversationId - Optional existing conversation ID
 * @returns Conversation data and whether it's new
 */
export function getOrCreateConversation(conversationId?: string): {
  conversation: Conversation;
  conversationId: string;
  isNew: boolean;
} {
  // Try to get existing conversation
  if (conversationId) {
    const existing = conversations.get(conversationId);
    if (existing) {
      existing.lastActivityAt = new Date();
      return { conversation: existing, conversationId, isNew: false };
    }
  }

  // Create new conversation
  const newId = generateConversationId();
  const conversation: Conversation = {
    id: newId,
    messages: [],
    createdAt: new Date(),
    lastActivityAt: new Date(),
  };

  conversations.set(newId, conversation);

  return { conversation, conversationId: newId, isNew: true };
}

/**
 * Get a conversation by ID
 *
 * @param conversationId - Conversation ID
 * @returns Conversation or undefined
 */
export function getConversation(conversationId: string): Conversation | undefined {
  return conversations.get(conversationId);
}

/**
 * Add a message to a conversation
 *
 * @param conversationId - Conversation ID
 * @param message - Message to add
 */
export function addMessage(
  conversationId: string,
  message: Anthropic.Messages.MessageParam
): void {
  const conversation = conversations.get(conversationId);
  if (!conversation) {
    throw new Error(`Conversation not found: ${conversationId}`);
  }

  conversation.messages.push(message);
  conversation.lastActivityAt = new Date();

  // Trim old messages if needed
  if (conversation.messages.length > MAX_MESSAGES) {
    conversation.messages = conversation.messages.slice(-MAX_MESSAGES);
  }
}

/**
 * Get messages for a conversation
 *
 * @param conversationId - Conversation ID
 * @returns Array of messages
 */
export function getMessages(
  conversationId: string
): Anthropic.Messages.MessageParam[] {
  const conversation = conversations.get(conversationId);
  return conversation?.messages ?? [];
}

/**
 * Clear a conversation's messages
 *
 * @param conversationId - Conversation ID
 */
export function clearMessages(conversationId: string): void {
  const conversation = conversations.get(conversationId);
  if (conversation) {
    conversation.messages = [];
    conversation.lastActivityAt = new Date();
  }
}

/**
 * Delete a conversation
 *
 * @param conversationId - Conversation ID
 * @returns true if deleted, false if not found
 */
export function deleteConversation(conversationId: string): boolean {
  return conversations.delete(conversationId);
}

/**
 * Set conversation metadata
 *
 * @param conversationId - Conversation ID
 * @param metadata - Metadata to set/merge
 */
export function setConversationMetadata(
  conversationId: string,
  metadata: Record<string, unknown>
): void {
  const conversation = conversations.get(conversationId);
  if (conversation) {
    conversation.metadata = { ...conversation.metadata, ...metadata };
  }
}

/**
 * Get conversation count (for monitoring)
 */
export function getConversationCount(): number {
  return conversations.size;
}
