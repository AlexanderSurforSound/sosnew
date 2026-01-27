'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Paperclip,
  Image,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  Smile,
  X,
  ChevronDown,
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'system';
}

interface Conversation {
  id: string;
  propertyId: string;
  propertyName: string;
  hostName: string;
  hostAvatar?: string;
  lastMessage?: Message;
  unreadCount: number;
}

interface GuestMessagingProps {
  conversation?: Conversation;
  onClose?: () => void;
}

const quickReplies = [
  'Hi, I have a question about the property.',
  'What time is check-in?',
  'Is early check-in available?',
  'Are there any special instructions?',
  'Thank you!',
];

export default function GuestMessaging({ conversation, onClose }: GuestMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'host',
      senderName: 'Property Manager',
      content: 'Welcome! I\'m here to help with anything you need for your stay at ' + (conversation?.propertyName || 'our property') + '. Feel free to message me anytime!',
      timestamp: new Date(Date.now() - 86400000),
      status: 'read',
      type: 'text',
    },
    {
      id: 'system-1',
      senderId: 'system',
      senderName: 'System',
      content: 'Booking confirmed for July 15-20, 2024',
      timestamp: new Date(Date.now() - 82800000),
      status: 'read',
      type: 'system',
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'guest',
      senderName: 'You',
      content: content.trim(),
      timestamp: new Date(),
      status: 'sending',
      type: 'text',
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');
    setShowQuickReplies(false);

    // Simulate message being sent
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, status: 'sent' } : m))
      );
    }, 500);

    // Simulate delivery
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, status: 'delivered' } : m))
      );
    }, 1000);

    // Simulate host typing
    setTimeout(() => {
      setIsTyping(true);
    }, 2000);

    // Simulate host response
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        'Thanks for reaching out! Let me look into that for you.',
        'Great question! Check-in is at 4 PM, but early check-in may be available - let me check.',
        'I\'ll get back to you shortly with more details.',
      ];
      const response: Message = {
        id: (Date.now() + 1).toString(),
        senderId: 'host',
        senderName: 'Property Manager',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        status: 'read',
        type: 'text',
      };
      setMessages((prev) => [...prev, response]);
    }, 4000);
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-full flex items-center justify-center text-white font-bold">
              PM
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Property Manager</h3>
            <p className="text-sm text-green-600">Online • Usually responds in 1 hour</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => {
          const isGuest = message.senderId === 'guest';
          const isSystem = message.type === 'system';

          if (isSystem) {
            return (
              <div key={message.id} className="flex justify-center">
                <span className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full">
                  {message.content}
                </span>
              </div>
            );
          }

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isGuest ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] ${
                  isGuest
                    ? 'bg-ocean-600 text-white rounded-2xl rounded-br-md'
                    : 'bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-sm'
                } px-4 py-3`}
              >
                <p className="break-words">{message.content}</p>
                <div
                  className={`flex items-center gap-1 mt-1 ${
                    isGuest ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span
                    className={`text-xs ${
                      isGuest ? 'text-ocean-200' : 'text-gray-400'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </span>
                  {isGuest && getStatusIcon(message.status)}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="bg-white rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <AnimatePresence>
        {showQuickReplies && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 bg-gray-50 overflow-hidden"
          >
            <div className="p-3 flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-ocean-300 hover:bg-ocean-50 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Image className="w-5 h-5 text-gray-500" />
          </button>
          <button
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            className={`p-2 rounded-lg transition-colors ${
              showQuickReplies ? 'bg-ocean-100 text-ocean-600' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <ChevronDown className={`w-5 h-5 transition-transform ${showQuickReplies ? 'rotate-180' : ''}`} />
          </button>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(newMessage)}
              placeholder="Type a message..."
              className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors">
              <Smile className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <button
            onClick={() => sendMessage(newMessage)}
            disabled={!newMessage.trim()}
            className="p-3 bg-ocean-600 text-white rounded-full hover:bg-ocean-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Floating chat button
export function MessagingButton({ unreadCount = 0, onClick }: { unreadCount?: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative p-4 bg-ocean-600 text-white rounded-full shadow-lg hover:bg-ocean-700 transition-colors"
    >
      <MessageSquare className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
