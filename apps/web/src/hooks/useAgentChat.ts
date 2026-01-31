'use client';

import { useState, useCallback, useEffect } from 'react';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  actions?: AgentAction[];
  toolsUsed?: string[];
}

export interface AgentAction {
  type: 'show_properties' | 'show_booking_confirmation' | 'navigate';
  data: unknown;
}

export interface PropertyResult {
  id: string;
  slug: string;
  name: string;
  village: string;
  bedrooms: number;
  bathrooms: number;
  sleeps: number;
  petFriendly: boolean;
  baseRate?: number;
  primaryImage?: string;
  amenityHighlights: string[];
}

export interface BookingIntent {
  intentId: string;
  propertyId: string;
  propertyName: string;
  propertySlug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  pets: number;
  estimatedTotal: number;
  expiresAt: string;
  bookingUrl: string;
  message: string;
}

interface UseAgentChatOptions {
  propertyId?: string;
}

interface UseAgentChatReturn {
  messages: AgentMessage[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  currentProperties: PropertyResult[];
  currentBookingIntent: BookingIntent | null;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  dismissProperties: () => void;
  dismissBookingIntent: () => void;
}

export function useAgentChat(options: UseAgentChatOptions = {}): UseAgentChatReturn {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentProperties, setCurrentProperties] = useState<PropertyResult[]>([]);
  const [currentBookingIntent, setCurrentBookingIntent] = useState<BookingIntent | null>(null);

  // Generate or retrieve session ID for anonymous users
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedSessionId = sessionStorage.getItem('agent_session_id');
      if (!storedSessionId) {
        storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        sessionStorage.setItem('agent_session_id', storedSessionId);
      }
      setSessionId(storedSessionId);
    }
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !sessionId) return;

    setIsLoading(true);
    setError(null);

    // Optimistically add user message
    const userMessage: AgentMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationId || undefined,
          sessionId,
          message,
          context: {
            propertyId: options.propertyId,
            page: typeof window !== 'undefined' ? window.location.pathname : undefined,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();

      // Update conversation ID if this was the first message
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
      }

      // Process actions from the response
      if (data.actions) {
        for (const action of data.actions) {
          if (action.type === 'show_properties') {
            setCurrentProperties(action.data as PropertyResult[]);
          } else if (action.type === 'show_booking_confirmation') {
            setCurrentBookingIntent(action.data as BookingIntent);
          }
        }
      }

      // Add assistant response
      const assistantMessage: AgentMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.message,
        createdAt: new Date().toISOString(),
        actions: data.actions,
        toolsUsed: data.toolsUsed,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sorry, I had trouble responding. Please try again.');
      // Remove the optimistically added message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, sessionId, options.propertyId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setCurrentProperties([]);
    setCurrentBookingIntent(null);
  }, []);

  const dismissProperties = useCallback(() => {
    setCurrentProperties([]);
  }, []);

  const dismissBookingIntent = useCallback(() => {
    setCurrentBookingIntent(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    conversationId,
    currentProperties,
    currentBookingIntent,
    sendMessage,
    clearChat,
    dismissProperties,
    dismissBookingIntent,
  };
}
