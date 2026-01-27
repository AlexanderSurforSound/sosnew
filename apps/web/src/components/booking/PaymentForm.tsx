'use client';

import { useState, useRef, useEffect } from 'react';
import Script from 'next/script';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  onBack: () => void;
  onSubmit: (paymentToken: string) => void;
  isLoading: boolean;
  error: string | null;
}

declare global {
  interface Window {
    Track?: {
      init: (config: { publishableKey: string }) => void;
      createToken: (element: HTMLElement) => Promise<{ token: string; error?: string }>;
    };
  }
}

export function PaymentForm({ amount, onBack, onSubmit, isLoading, error }: PaymentFormProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [trackLoaded, setTrackLoaded] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  useEffect(() => {
    if (trackLoaded && cardRef.current && window.Track) {
      window.Track.init({
        publishableKey: process.env.NEXT_PUBLIC_TRACK_PUBLISHABLE_KEY || '',
      });
    }
  }, [trackLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardError(null);

    // Validate billing info
    if (!billingInfo.firstName || !billingInfo.lastName || !billingInfo.address ||
        !billingInfo.city || !billingInfo.state || !billingInfo.zip) {
      setCardError('Please fill in all billing fields');
      return;
    }

    // For demo purposes, generate a mock token
    // In production, this would use Track.js to tokenize the card
    if (cardRef.current) {
      try {
        // Simulated token for development
        const mockToken = `tok_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        onSubmit(mockToken);
      } catch {
        setCardError('Failed to process card. Please try again.');
      }
    }
  };

  return (
    <>
      <Script
        src="https://js.trackhs.com/v1/track.js"
        onLoad={() => setTrackLoaded(true)}
        onError={() => setTrackLoaded(true)} // Continue even if Track.js fails to load
      />

      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold mb-6">Payment Details</h2>

        {/* Security Notice */}
        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-lg mb-6">
          <Lock className="w-5 h-5" />
          <span className="text-sm">Your payment information is encrypted and secure</span>
        </div>

        {/* Error Display */}
        {(error || cardError) && (
          <div className="flex items-start gap-2 p-4 bg-red-50 text-red-800 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Payment Error</p>
              <p className="text-sm">{error || cardError}</p>
            </div>
          </div>
        )}

        {/* Card Element */}
        <div className="mb-6">
          <label className="label">Card Information</label>
          <div
            ref={cardRef}
            className="p-4 border rounded-lg bg-white min-h-[50px] flex items-center gap-3"
          >
            <CreditCard className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="4242 4242 4242 4242"
              className="flex-1 outline-none"
              maxLength={19}
            />
            <input
              type="text"
              placeholder="MM/YY"
              className="w-16 outline-none"
              maxLength={5}
            />
            <input
              type="text"
              placeholder="CVC"
              className="w-12 outline-none"
              maxLength={4}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Test card: 4242 4242 4242 4242, any future date, any 3 digits
          </p>
        </div>

        {/* Billing Address */}
        <div className="mb-6">
          <h3 className="font-medium mb-4">Billing Address</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">First Name *</label>
              <input
                type="text"
                value={billingInfo.firstName}
                onChange={(e) => setBillingInfo({ ...billingInfo, firstName: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input
                type="text"
                value={billingInfo.lastName}
                onChange={(e) => setBillingInfo({ ...billingInfo, lastName: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="label">Street Address *</label>
            <input
              type="text"
              value={billingInfo.address}
              onChange={(e) => setBillingInfo({ ...billingInfo, address: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="label">City *</label>
              <input
                type="text"
                value={billingInfo.city}
                onChange={(e) => setBillingInfo({ ...billingInfo, city: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">State *</label>
              <input
                type="text"
                value={billingInfo.state}
                onChange={(e) => setBillingInfo({ ...billingInfo, state: e.target.value })}
                className="input"
                maxLength={2}
                required
              />
            </div>
            <div>
              <label className="label">ZIP Code *</label>
              <input
                type="text"
                value={billingInfo.zip}
                onChange={(e) => setBillingInfo({ ...billingInfo, zip: e.target.value })}
                className="input"
                maxLength={10}
                required
              />
            </div>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="p-4 bg-gray-50 rounded-lg mb-6">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total Due Today</span>
            <span>${amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button type="button" onClick={onBack} className="btn-outline btn-lg">
            Back
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary btn-lg flex-1 disabled:bg-gray-400"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Processing...
              </span>
            ) : (
              `Pay $${amount.toLocaleString()}`
            )}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          By clicking Pay, you agree to our{' '}
          <a href="/terms" className="text-primary-600 hover:underline">Terms of Service</a>{' '}
          and{' '}
          <a href="/policies" className="text-primary-600 hover:underline">Rental Policies</a>
        </p>
      </form>
    </>
  );
}
