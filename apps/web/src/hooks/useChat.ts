'use client';

import { useState, useCallback, useEffect } from 'react';
import { api, ChatMessage, ChatResponse, ChatMessageRequest } from '@/lib/api';

interface UseChatOptions {
  propertyId?: string;
  reservationId?: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Generate or retrieve session ID for anonymous users
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedSessionId = sessionStorage.getItem('chat_session_id');
      if (!storedSessionId) {
        storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        sessionStorage.setItem('chat_session_id', storedSessionId);
      }
      setSessionId(storedSessionId);
    }
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !sessionId) return;

    setIsLoading(true);
    setError(null);

    // Optimistically add user message
    const userMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const request: ChatMessageRequest = {
        conversationId: conversationId || undefined,
        sessionId,
        message,
        context: {
          propertyId: options.propertyId,
          reservationId: options.reservationId,
          page: typeof window !== 'undefined' ? window.location.pathname : undefined,
        },
      };

      const response = await api.sendChatMessage(request);

      // Update conversation ID if this was the first message
      if (!conversationId && response.conversationId) {
        setConversationId(response.conversationId);
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response.message,
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError('Sorry, I had trouble responding. Please try again.');
      // Remove the optimistically added message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, sessionId, options.propertyId, options.reservationId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    conversationId,
    sendMessage,
    clearChat,
  };
}
