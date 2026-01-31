'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Sparkles,
  Trash2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAgentChat } from '@/hooks/useAgentChat';
import { useVoice } from '@/hooks/useVoice';
import { cn } from '@/lib/utils';
import { PropertyCardMini } from './PropertyCardMini';
import { BookingConfirmation } from './BookingConfirmation';
import { VoiceOverlay } from './VoiceOverlay';

interface ChatWidgetV2Props {
  propertyId?: string;
  initialMessage?: string;
}

const WELCOME_MESSAGE = `Hi! I'm Sandy, your Hatteras Island vacation concierge. I can help you find the perfect beach house, check availability, get pricing, and even start your booking. What are you looking for?`;

const SUGGESTED_PROMPTS = [
  "Find pet-friendly homes in Avon",
  "Show me oceanfront properties with pools",
  "What's Buxton like?",
  "I need a 4-bedroom for next week",
];

export function ChatWidgetV2({ propertyId, initialMessage }: ChatWidgetV2Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isLoading,
    error,
    currentProperties,
    currentBookingIntent,
    sendMessage,
    clearChat,
    dismissProperties,
    dismissBookingIntent,
  } = useAgentChat({ propertyId });

  const {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    isSupported: voiceSupported,
    voiceEnabled,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleVoice,
    clearTranscript,
  } = useVoice({
    autoSubmitOnSilence: true,
    silenceTimeout: 2000,
  });

  // Send initial message if provided
  useEffect(() => {
    if (isOpen && initialMessage && !hasInteracted && messages.length === 0) {
      setHasInteracted(true);
      sendMessage(initialMessage);
    }
  }, [isOpen, initialMessage, hasInteracted, messages.length, sendMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentProperties, currentBookingIntent]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !showVoiceOverlay) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, showVoiceOverlay]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript && !isListening) {
      // Voice input completed, send the message
      sendMessage(transcript);
      clearTranscript();
      setShowVoiceOverlay(false);
    }
  }, [transcript, isListening, sendMessage, clearTranscript]);

  // Speak assistant responses if voice is enabled
  useEffect(() => {
    if (voiceEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !isLoading) {
        speak(lastMessage.content);
      }
    }
  }, [messages, voiceEnabled, isLoading, speak]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      setShowVoiceOverlay(false);
    } else {
      setShowVoiceOverlay(true);
      startListening();
    }
  };

  const handleVoiceOverlayClose = () => {
    stopListening();
    clearTranscript();
    setShowVoiceOverlay(false);
  };

  return (
    <>
      {/* Floating Chat Button - Premium & Prominent */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600 text-white px-5 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all group"
            style={{
              boxShadow: '0 10px 40px -10px rgba(6, 182, 212, 0.5), 0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Breathing glow effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0, 0.15, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            <div className="text-left">
              <span className="font-semibold text-base block leading-tight">Ask Sandy</span>
              <span className="text-xs text-cyan-100 opacity-90">Your AI concierge</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Voice Overlay */}
      <AnimatePresence>
        {showVoiceOverlay && (
          <VoiceOverlay
            isListening={isListening}
            transcript={transcript}
            interimTranscript={interimTranscript}
            onClose={handleVoiceOverlayClose}
            onSend={() => {
              if (transcript) {
                sendMessage(transcript);
                clearTranscript();
              }
              setShowVoiceOverlay(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && !showVoiceOverlay && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-h-[650px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Sandy</h3>
                  <p className="text-xs text-cyan-100">Your vacation concierge</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {voiceSupported && (
                  <button
                    onClick={toggleVoice}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      voiceEnabled ? 'bg-white/20' : 'hover:bg-white/10'
                    )}
                    title={voiceEnabled ? 'Disable voice responses' : 'Enable voice responses'}
                  >
                    {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                )}
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Clear chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[450px]">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%]">
                      <p className="text-sm text-gray-700">{WELCOME_MESSAGE}</p>
                    </div>
                  </div>

                  {/* Suggested Prompts */}
                  <div className="pl-11 space-y-2">
                    <p className="text-xs text-gray-500 font-medium">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_PROMPTS.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestedPrompt(prompt)}
                          className="text-xs bg-cyan-50 text-cyan-700 px-3 py-1.5 rounded-full hover:bg-cyan-100 transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Conversation Messages - with entrance animation */}
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="space-y-3"
                >
                  <div
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    )}
                  >
                    {message.role === 'assistant' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                        className="w-8 h-8 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                      >
                        <Sparkles className="w-4 h-4 text-cyan-600" />
                      </motion.div>
                    )}
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-3 max-w-[85%]',
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-tr-none shadow-md'
                          : 'bg-gray-100 text-gray-700 rounded-tl-none'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Property Results */}
              {currentProperties.length > 0 && (
                <div className="space-y-2 pl-11">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 font-medium">Properties found:</p>
                    <button
                      onClick={dismissProperties}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="space-y-2">
                    {currentProperties.slice(0, 3).map((property) => (
                      <PropertyCardMini key={property.id} property={property} />
                    ))}
                  </div>
                  {currentProperties.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{currentProperties.length - 3} more properties
                    </p>
                  )}
                </div>
              )}

              {/* Booking Confirmation */}
              {currentBookingIntent && (
                <div className="pl-11">
                  <BookingConfirmation
                    intent={currentBookingIntent}
                    onDismiss={dismissBookingIntent}
                  />
                </div>
              )}

              {/* Loading indicator - 3-dot typing animation */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <motion.span
                        className="w-2 h-2 bg-cyan-500 rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.span
                        className="w-2 h-2 bg-cyan-500 rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                      />
                      <motion.span
                        className="w-2 h-2 bg-cyan-500 rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Speaking indicator */}
              {isSpeaking && (
                <div className="flex items-center gap-2 text-xs text-cyan-600 pl-11">
                  <Volume2 className="w-3 h-3 animate-pulse" />
                  <span>Speaking...</span>
                  <button onClick={stopSpeaking} className="underline">Stop</button>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
              <div className="flex gap-2">
                {voiceSupported && (
                  <button
                    type="button"
                    onClick={handleMicClick}
                    className={cn(
                      'p-2 rounded-full transition-colors',
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    )}
                    title={isListening ? 'Stop listening' : 'Voice input'}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Sandy anything..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-gray-900"
                  disabled={isLoading || isListening}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className={cn(
                    'p-2 rounded-full transition-colors',
                    inputValue.trim() && !isLoading
                      ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  )}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
