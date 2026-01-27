'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Search, Loader2, Sparkles } from 'lucide-react';

interface VoiceSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export default function VoiceSearch({ onSearch, placeholder = 'Try: "4 bedroom oceanfront with pool"' }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Voice search is not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcriptText = result[0].transcript;

      setTranscript(transcriptText);

      if (result.isFinal) {
        setIsProcessing(true);
        setTimeout(() => {
          onSearch(transcriptText);
          setIsProcessing(false);
          setIsListening(false);
        }, 500);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);

      switch (event.error) {
        case 'no-speech':
          setError('No speech detected. Please try again.');
          break;
        case 'audio-capture':
          setError('No microphone found. Please check your settings.');
          break;
        case 'not-allowed':
          setError('Microphone access denied. Please allow access and try again.');
          break;
        default:
          setError('An error occurred. Please try again.');
      }
    };

    recognition.onend = () => {
      if (!isProcessing) {
        setIsListening(false);
      }
    };

    recognition.start();

    // Store reference to stop later
    (window as any).currentRecognition = recognition;
  }, [onSearch, isProcessing]);

  const stopListening = useCallback(() => {
    const recognition = (window as any).currentRecognition;
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  }, []);

  const suggestedPhrases = [
    'Find me a 4 bedroom oceanfront',
    'Pet friendly homes in Avon',
    'Beach house with a pool',
    'Properties under $300 per night',
  ];

  if (!isSupported) {
    return null;
  }

  return (
    <>
      {/* Voice Search Button */}
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-3 rounded-full transition-all ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title="Voice search"
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      {/* Voice Search Modal */}
      <AnimatePresence>
        {isListening && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={stopListening}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
            >
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mx-4">
                {/* Close button */}
                <button
                  onClick={stopListening}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>

                <div className="p-8 text-center">
                  {/* Listening Animation */}
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    {/* Pulsing rings */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-ocean-500/20"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-4 rounded-full bg-ocean-500/30"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    />
                    <motion.div
                      className="absolute inset-8 rounded-full bg-ocean-500/40"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                    />
                    {/* Center mic */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-ocean-600 rounded-full flex items-center justify-center">
                        {isProcessing ? (
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        ) : (
                          <Mic className="w-8 h-8 text-white" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Text */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {isProcessing ? 'Processing...' : 'Listening...'}
                  </h2>

                  {/* Transcript */}
                  <div className="min-h-[60px] mb-6">
                    {transcript ? (
                      <p className="text-lg text-gray-700">{transcript}</p>
                    ) : (
                      <p className="text-gray-400">{placeholder}</p>
                    )}
                  </div>

                  {/* Voice waveform visualization */}
                  <div className="flex items-center justify-center gap-1 h-12 mb-6">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-ocean-500 rounded-full"
                        animate={{
                          height: isListening ? [8, Math.random() * 40 + 8, 8] : 8,
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.05,
                        }}
                      />
                    ))}
                  </div>

                  {/* Suggested phrases */}
                  {!transcript && (
                    <div>
                      <p className="text-sm text-gray-500 mb-3 flex items-center justify-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        Try saying:
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {suggestedPhrases.map((phrase) => (
                          <span
                            key={phrase}
                            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full"
                          >
                            "{phrase}"
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-8 pb-6">
                  <button
                    onClick={stopListening}
                    className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500 text-white rounded-xl shadow-lg z-50"
          >
            <p className="flex items-center gap-2">
              <MicOff className="w-5 h-5" />
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Standalone voice search modal for use anywhere
export function VoiceSearchModal({
  isOpen,
  onClose,
  onSearch,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}) {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Start listening when modal opens
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.resultIndex];
        setTranscript(result[0].transcript);

        if (result.isFinal) {
          onSearch(result[0].transcript);
          onClose();
        }
      };

      recognition.start();
      (window as any).currentRecognition = recognition;

      return () => {
        recognition.stop();
      };
    }
  }, [isOpen, onSearch, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-24 h-24 bg-ocean-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mic className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-xl font-bold mb-2">
          {isListening ? 'Listening...' : 'Voice Search'}
        </h2>

        <p className="text-gray-600 min-h-[50px]">
          {transcript || 'Say what you\'re looking for'}
        </p>
      </div>
    </div>
  );
}
