'use client';

/**
 * Chat Button Component
 *
 * A button that opens the chat widget. Can be placed anywhere in the app.
 */

import { MessageCircle } from 'lucide-react';
import { useFeature } from '@/lib/features/context';

interface ChatButtonProps {
  className?: string;
  variant?: 'icon' | 'button' | 'text';
  label?: string;
}

export function ChatButton({
  className = '',
  variant = 'button',
  label = 'Chat with Sandy',
}: ChatButtonProps) {
  const { enabled } = useFeature('chat-widget');

  // Don't render if feature is disabled
  if (!enabled) {
    return null;
  }

  const handleClick = () => {
    // Dispatch event to open chat widget
    window.dispatchEvent(new CustomEvent('open-chat-widget'));
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
        aria-label={label}
      >
        <MessageCircle className="w-5 h-5" />
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleClick}
        className={`text-ocean-600 hover:text-ocean-700 hover:underline ${className}`}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      {label}
    </button>
  );
}

export default ChatButton;
