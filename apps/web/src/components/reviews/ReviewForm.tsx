'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type CreateReviewRequest } from '@/lib/api';

interface ReviewFormProps {
  propertyId: string;
  propertyName: string;
  reservationId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const StarInput = ({
  value,
  onChange,
  label,
  required = false,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  required?: boolean;
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            onClick={() => onChange(star)}
            className="p-0.5 focus:outline-none focus:ring-2 focus:ring-ocean-500 rounded"
          >
            <svg
              className={`w-6 h-6 transition-colors ${
                star <= (hoverValue || value)
                  ? 'text-amber-400'
                  : 'text-gray-300 hover:text-amber-200'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500 w-8">
          {value > 0 ? value : '-'}
        </span>
      </div>
    </div>
  );
};

const tripTypes = [
  { value: 'family', label: 'Family Vacation', icon: '👨‍👩‍👧‍👦' },
  { value: 'couples', label: 'Couples Getaway', icon: '💑' },
  { value: 'friends', label: 'Friends Trip', icon: '👯' },
  { value: 'solo', label: 'Solo Travel', icon: '🧳' },
  { value: 'business', label: 'Business Trip', icon: '💼' },
];

export default function ReviewForm({
  propertyId,
  propertyName,
  reservationId,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [overallRating, setOverallRating] = useState(0);
  const [cleanlinessRating, setCleanlinessRating] = useState(0);
  const [accuracyRating, setAccuracyRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [locationRating, setLocationRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tripType, setTripType] = useState('');
  const [stayDate, setStayDate] = useState('');

  const canProceedStep1 = overallRating > 0;
  const canProceedStep2 = content.length >= 20;
  const canSubmit = canProceedStep1 && canProceedStep2 && stayDate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const request: CreateReviewRequest = {
        propertyId,
        reservationId,
        overallRating,
        cleanlinessRating: cleanlinessRating || undefined,
        accuracyRating: accuracyRating || undefined,
        communicationRating: communicationRating || undefined,
        locationRating: locationRating || undefined,
        valueRating: valueRating || undefined,
        title: title || undefined,
        content,
        stayDate,
        tripType: tripType || undefined,
      };

      await api.createReview(request);
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
        >
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
        <p className="text-gray-600">Your review has been submitted and will help other guests.</p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 px-6 py-4 text-white">
        <h2 className="text-xl font-bold">Write a Review</h2>
        <p className="text-ocean-100 text-sm">{propertyName}</p>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {['Rate', 'Review', 'Details'].map((label, index) => (
            <div key={label} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step > index + 1
                    ? 'bg-green-500 text-white'
                    : step === index + 1
                    ? 'bg-ocean-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > index + 1 ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={`ml-2 text-sm ${step >= index + 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                {label}
              </span>
              {index < 2 && (
                <div className={`w-12 sm:w-24 h-0.5 mx-2 sm:mx-4 ${step > index + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-6 py-6 space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">How was your stay?</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <StarInput
                    value={overallRating}
                    onChange={setOverallRating}
                    label="Overall Experience"
                    required
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Rate specific aspects (optional)</h4>
                <div className="space-y-3">
                  <StarInput value={cleanlinessRating} onChange={setCleanlinessRating} label="Cleanliness" />
                  <StarInput value={accuracyRating} onChange={setAccuracyRating} label="Accuracy" />
                  <StarInput value={communicationRating} onChange={setCommunicationRating} label="Communication" />
                  <StarInput value={locationRating} onChange={setLocationRating} label="Location" />
                  <StarInput value={valueRating} onChange={setValueRating} label="Value" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-6 py-6 space-y-6"
            >
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title (optional)
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience in a few words"
                  maxLength={100}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your experience with future guests. What did you love? What could be improved?"
                  rows={6}
                  maxLength={2000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-between mt-2 text-sm">
                  <span className={content.length < 20 ? 'text-amber-600' : 'text-gray-500'}>
                    {content.length < 20 ? `${20 - content.length} more characters needed` : 'Minimum reached'}
                  </span>
                  <span className="text-gray-500">{content.length}/2000</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-6 py-6 space-y-6"
            >
              <div>
                <label htmlFor="stayDate" className="block text-sm font-medium text-gray-700 mb-2">
                  When did you stay? <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="stayDate"
                  value={stayDate}
                  onChange={(e) => setStayDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What type of trip was this? (optional)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {tripTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setTripType(tripType === type.value ? '' : type.value)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        tripType === type.value
                          ? 'border-ocean-500 bg-ocean-50 text-ocean-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {reservationId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium text-green-800">Verified Stay</p>
                    <p className="text-sm text-green-700">This review will be marked as verified since it's linked to your reservation.</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (step === 1) {
                onCancel?.();
              } else {
                setStep(step - 1);
              }
            }}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              className="px-6 py-2 bg-ocean-600 text-white rounded-lg font-medium hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="px-6 py-2 bg-ocean-600 text-white rounded-lg font-medium hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
