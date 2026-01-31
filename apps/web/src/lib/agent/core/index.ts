/**
 * Agent Core
 *
 * Core infrastructure for the Sandy AI Agent.
 *
 * @module agent/core
 */

// Rate limiting
export {
  RateLimitType,
  checkRateLimit,
  getRateLimitStatus,
  resetRateLimit,
  getRateLimitMessage,
} from './rate-limit';

// Conversation management
export {
  type Conversation,
  generateConversationId,
  getOrCreateConversation,
  getConversation,
  addMessage,
  getMessages,
  clearMessages,
  deleteConversation,
  setConversationMetadata,
  getConversationCount,
} from './conversation';

// Tool executor
export {
  type ExecutorOptions,
  type ExecutorResult,
  executeAgentLoop,
} from './executor';
