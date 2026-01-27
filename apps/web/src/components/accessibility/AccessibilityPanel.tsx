'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Accessibility,
  X,
  Sun,
  Moon,
  Monitor,
  Type,
  Contrast,
  Zap,
  Eye,
  RotateCcw,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccessibilityPanel({ isOpen, onClose }: AccessibilityPanelProps) {
  const {
    preferences,
    toggleReducedMotion,
    toggleHighContrast,
    setFontSize,
    setColorScheme,
    resetToDefaults,
  } = useAccessibility();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Accessibility className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Accessibility</h2>
                  <p className="text-sm text-gray-500">Customize your experience</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Color Scheme */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  Color Scheme
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: Monitor },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setColorScheme(id as 'light' | 'dark' | 'system')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        (id === 'system' && preferences.prefersColorScheme === 'no-preference') ||
                        preferences.prefersColorScheme === id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Font Size */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Text Size
                </h3>
                <div className="space-y-2">
                  {[
                    { id: 'small', label: 'Small', sample: 'Aa', size: '14px' },
                    { id: 'medium', label: 'Medium', sample: 'Aa', size: '16px' },
                    { id: 'large', label: 'Large', sample: 'Aa', size: '18px' },
                    { id: 'xlarge', label: 'Extra Large', sample: 'Aa', size: '20px' },
                  ].map(({ id, label, sample, size }) => (
                    <button
                      key={id}
                      onClick={() => setFontSize(id as 'small' | 'medium' | 'large' | 'xlarge')}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        preferences.preferredFontSize === id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-serif"
                          style={{ fontSize: size }}
                        >
                          {sample}
                        </span>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{label}</p>
                          <p className="text-sm text-gray-500">{size}</p>
                        </div>
                      </div>
                      {preferences.preferredFontSize === id && (
                        <Check className="w-5 h-5 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Visual Settings */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Visual Settings
                </h3>
                <div className="space-y-3">
                  {/* High Contrast */}
                  <button
                    onClick={toggleHighContrast}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      preferences.prefersHighContrast
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Contrast className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">High Contrast</p>
                        <p className="text-sm text-gray-500">Increase color contrast</p>
                      </div>
                    </div>
                    <div
                      className={`w-12 h-7 rounded-full transition-colors ${
                        preferences.prefersHighContrast ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-1 ${
                          preferences.prefersHighContrast ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </button>

                  {/* Reduced Motion */}
                  <button
                    onClick={toggleReducedMotion}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      preferences.prefersReducedMotion
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Reduce Motion</p>
                        <p className="text-sm text-gray-500">Minimize animations</p>
                      </div>
                    </div>
                    <div
                      className={`w-12 h-7 rounded-full transition-colors ${
                        preferences.prefersReducedMotion ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-1 ${
                          preferences.prefersReducedMotion ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </button>
                </div>
              </section>

              {/* Detected Settings */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Detected Settings</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Touch Screen</span>
                    <span className="font-medium">{preferences.touchScreen ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pointer Type</span>
                    <span className="font-medium capitalize">{preferences.pointerType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Screen Reader</span>
                    <span className="font-medium">{preferences.likelyScreenReader ? 'Likely' : 'Not detected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">System Theme</span>
                    <span className="font-medium capitalize">{preferences.prefersColorScheme}</span>
                  </div>
                </div>
              </section>

              {/* Reset Button */}
              <button
                onClick={resetToDefaults}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Reset to System Defaults
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Floating accessibility button
 */
export function AccessibilityButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-40 w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
      aria-label="Open accessibility settings"
    >
      <Accessibility className="w-6 h-6" />
    </button>
  );
}
