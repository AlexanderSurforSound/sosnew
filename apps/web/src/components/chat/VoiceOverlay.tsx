'use client';

import { motion } from 'framer-motion';
import { Mic, X, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceOverlayProps {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  onClose: () => void;
  onSend: () => void;
}

export function VoiceOverlay({
  isListening,
  transcript,
  interimTranscript,
  onClose,
  onSend,
}: VoiceOverlayProps) {
  const displayText = transcript + interimTranscript;
  const hasSomething = displayText.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-cyan-600 to-blue-700 flex flex-col items-center justify-center p-8"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Sandy branding */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="text-white">
          <h2 className="text-xl font-semibold">Sandy</h2>
          <p className="text-sm text-white/70">Listening...</p>
        </div>
      </div>

      {/* Microphone animation */}
      <div className="relative mb-8">
        {/* Pulse rings */}
        {isListening && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-white/20"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-white/20"
              animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
          </>
        )}

        {/* Main mic button */}
        <motion.div
          className={cn(
            'w-24 h-24 rounded-full flex items-center justify-center',
            isListening ? 'bg-white' : 'bg-white/90'
          )}
          animate={isListening ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <Mic className={cn(
            'w-10 h-10',
            isListening ? 'text-red-500' : 'text-cyan-600'
          )} />
        </motion.div>
      </div>

      {/* Transcript display */}
      <div className="w-full max-w-md min-h-[100px] bg-white/10 rounded-2xl p-6 mb-6">
        {displayText ? (
          <p className="text-white text-lg text-center">
            {transcript}
            <span className="text-white/50">{interimTranscript}</span>
          </p>
        ) : (
          <p className="text-white/50 text-lg text-center">
            {isListening ? 'Start speaking...' : 'Tap the mic to start'}
          </p>
        )}
      </div>

      {/* Instructions */}
      <p className="text-white/70 text-sm mb-6">
        {isListening
          ? "I'll send your message when you pause speaking"
          : 'Tap the microphone to start talking'}
      </p>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={onClose}
          className="px-6 py-3 text-white/80 hover:text-white transition-colors"
        >
          Cancel
        </button>

        {hasSomething && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={onSend}
            className="flex items-center gap-2 px-6 py-3 bg-white text-cyan-600 rounded-full font-medium hover:bg-white/90 transition-colors"
          >
            <Send className="w-5 h-5" />
            Send
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
