'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, MessageCircle, X, ChevronRight } from 'lucide-react';
import { useAskSandy } from '@/hooks/useAISearch';
import Image from 'next/image';

interface PropertyAskSandyProps {
  propertyId: string;
  propertyName: string;
  village?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  'What is the check-in/check-out time?',
  'How far is the beach?',
  'Are linens provided?',
  'What restaurants are nearby?',
  'Is there a grocery store close by?',
  'What activities are available for kids?',
];

export function PropertyAskSandy({ propertyId, propertyName, village }: PropertyAskSandyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { ask, isAsking } = useAskSandy();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (questionText: string) => {
    if (!questionText.trim() || isAsking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: questionText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');

    try {
      const response = await ask({
        question: questionText,
        context: {
          propertyId,
          propertyName,
          village,
        },
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I couldn't answer that question right now. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <>
      {/* Toggle Button - Floating */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="font-medium">Questions?</span>
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/30 z-40 md:bg-transparent md:pointer-events-none"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[400px] md:max-h-[600px] h-[80vh] md:h-auto bg-white md:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Property Questions</h3>
                    <p className="text-sm text-gray-500">We're here to help</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-amber-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Questions about {propertyName}?
                    </h4>
                    <p className="text-sm text-gray-500 mb-6">
                      I can help with check-in times, nearby attractions, amenity details, and more!
                    </p>

                    {/* Suggested Questions */}
                    <div className="space-y-2">
                      {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSubmit(q)}
                          className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors flex items-center justify-between group"
                        >
                          <span>{q}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-ocean-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-1">
                            <MessageCircle className="w-3 h-3 text-amber-500" />
                            <span className="text-xs font-medium text-amber-600">Surf or Sound</span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </motion.div>
                  ))
                )}

                {/* Typing Indicator */}
                {isAsking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(question);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask about this property..."
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:bg-white border border-transparent focus:border-ocean-500 transition-all"
                    disabled={isAsking}
                  />
                  <button
                    type="submit"
                    disabled={!question.trim() || isAsking}
                    className="p-3 bg-ocean-600 text-white rounded-xl hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAsking ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Inline version for embedding in the page
export function PropertyAskSandyInline({ propertyId, propertyName, village }: PropertyAskSandyProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const { ask, isAsking } = useAskSandy();

  const handleSubmit = async (questionText: string) => {
    if (!questionText.trim() || isAsking) return;

    setQuestion('');

    try {
      const response = await ask({
        question: questionText,
        context: {
          propertyId,
          propertyName,
          village,
        },
      });

      setAnswer(response.answer);
    } catch {
      setAnswer("I'm sorry, I couldn't answer that question right now.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold">Questions About This Property?</h3>
      </div>

      {/* Quick Questions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
          <button
            key={q}
            onClick={() => handleSubmit(q)}
            className="px-3 py-1.5 bg-white hover:bg-gray-50 rounded-full text-sm text-gray-700 border border-gray-200 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(question);
        }}
        className="flex items-center gap-2 mb-4"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Or ask your own question..."
          className="flex-1 px-4 py-3 bg-white rounded-lg border border-gray-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 focus:outline-none"
          disabled={isAsking}
        />
        <button
          type="submit"
          disabled={!question.trim() || isAsking}
          className="p-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAsking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>

      {/* Answer */}
      <AnimatePresence mode="wait">
        {isAsking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Looking up the answer...</span>
            </div>
          </motion.div>
        )}

        {!isAsking && answer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-600">Surf or Sound</span>
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
