'use client';

/**
 * Chat Widget Component (Feature Module Version)
 *
 * This wraps the original ChatWidget with feature flag checking.
 * If the feature is disabled, nothing renders.
 */

import { useFeature } from '@/lib/features/context';

// Import the original component
import { ChatWidget as OriginalChatWidget } from '@/components/chat/ChatWidget';

export function ChatWidget() {
  const { enabled, config } = useFeature('chat-widget');

  // Don't render if feature is disabled
  if (!enabled) {
    return null;
  }

  // Pass config to the original component if needed
  return <OriginalChatWidget />;
}

export default ChatWidget;
