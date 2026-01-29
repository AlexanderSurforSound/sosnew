'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  getAvailableWalletMethods,
  processWalletPayment,
  WalletPaymentRequest,
  WalletPaymentResult,
} from '@/lib/walletPayment';

interface WalletPaymentButtonProps {
  amount: number;
  propertyName?: string;
  checkIn?: string;
  checkOut?: string;
  onSuccess: (result: WalletPaymentResult) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export function WalletPaymentButton({
  amount,
  propertyName,
  checkIn,
  checkOut,
  onSuccess,
  onError,
  disabled = false,
  className = '',
}: WalletPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [walletMethods, setWalletMethods] = useState<{
    applePay: boolean;
    googlePay: boolean;
    anyWallet: boolean;
  } | null>(null);

  useEffect(() => {
    getAvailableWalletMethods().then(setWalletMethods);
  }, []);

  const handlePayment = async (preferApplePay: boolean) => {
    setIsLoading(true);

    const request: WalletPaymentRequest = {
      amount,
      propertyName,
      checkIn,
      checkOut,
      label: 'Surf or Sound Realty',
    };

    try {
      const result = await processWalletPayment(request);

      if (result.success) {
        onSuccess(result);
      } else {
        onError(result.error || 'Payment failed');
      }
    } catch (err) {
      onError((err as Error).message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if no wallet methods available
  if (!walletMethods?.anyWallet) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Apple Pay Button */}
      {walletMethods.applePay && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handlePayment(true)}
          disabled={disabled || isLoading}
          className="w-full h-12 bg-black text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          aria-label="Pay with Apple Pay"
        >
          {isLoading ? (
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <>
              <ApplePayIcon className="h-5" />
              <span>Pay</span>
            </>
          )}
        </motion.button>
      )}

      {/* Google Pay Button */}
      {walletMethods.googlePay && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handlePayment(false)}
          disabled={disabled || isLoading}
          className="w-full h-12 bg-white border-2 border-gray-300 text-gray-800 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          aria-label="Pay with Google Pay"
        >
          {isLoading ? (
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600" />
          ) : (
            <>
              <GooglePayIcon className="h-5" />
            </>
          )}
        </motion.button>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">or pay with card</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Apple Pay Icon
 */
function ApplePayIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 165.52 105.97"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path d="M150.7 0H14.82A14.83 14.83 0 000 14.82v76.33a14.83 14.83 0 0014.82 14.82H150.7a14.83 14.83 0 0014.82-14.82V14.82A14.83 14.83 0 00150.7 0z" fill="#000" />
      <path d="M43.77 35.42a8.19 8.19 0 01-1.87 5.5 6.82 6.82 0 01-5.38 2.5 7.9 7.9 0 01-.08-1.1 8.1 8.1 0 012-5.31 8.42 8.42 0 015.25-2.61 8.56 8.56 0 01.08 1.02zm.08 7.13v1.83a10.56 10.56 0 00-5.27 1.4 10.26 10.26 0 00-4.18 8.35c0 5.3 3.68 8.89 9.13 8.89a16.4 16.4 0 003.08-.35l.2-.05c-.09-.17-.17-.34-.25-.52a26.93 26.93 0 01-2.1-10.21c0-3.3.7-6.4 2.1-9.27a3.27 3.27 0 00-2.71-.07z" fill="#fff" />
      <path d="M56.27 63.02h-4.24l-2.33-7.3h-8.07l-2.21 7.3h-4.13l8-24.75h4.94zm-7.29-10.76l-2.1-6.5c-.22-.67-.64-2.24-1.25-4.7h-.07c-.24 1.01-.63 2.58-1.18 4.7l-2.06 6.5z" fill="#fff" />
      <path d="M72.23 52.82c0 3.38-.91 6.04-2.74 7.98-1.64 1.73-3.66 2.6-6.08 2.6-2.6 0-4.48-.94-5.62-2.81h-.08v10.43h-4.07V49.68c0-2.13-.05-4.31-.16-6.56h3.58l.23 3.16h.08c1.45-2.38 3.67-3.56 6.64-3.56 2.34 0 4.28.91 5.84 2.74 1.57 1.82 2.38 4.22 2.38 7.36zm-4.16.15c0-1.97-.44-3.6-1.33-4.87-.97-1.33-2.27-2-3.9-2-1.1 0-2.1.37-3 1.1a5.33 5.33 0 00-1.82 2.84c-.15.57-.23 1.04-.23 1.41v3.38c0 1.47.45 2.71 1.36 3.71.91 1 2.1 1.5 3.56 1.5 1.69 0 3.02-.65 3.97-1.95.96-1.31 1.39-3.02 1.39-5.12z" fill="#fff" />
      <path d="M88.3 52.82c0 3.38-.92 6.04-2.75 7.98-1.63 1.73-3.66 2.6-6.07 2.6-2.61 0-4.48-.94-5.63-2.81h-.07v10.43h-4.08V49.68c0-2.13-.05-4.31-.15-6.56h3.57l.24 3.16h.07c1.46-2.38 3.67-3.56 6.65-3.56 2.33 0 4.28.91 5.83 2.74 1.58 1.82 2.39 4.22 2.39 7.36zm-4.16.15c0-1.97-.45-3.6-1.34-4.87-.96-1.33-2.27-2-3.9-2-1.1 0-2.1.37-3 1.1-.9.72-1.5 1.68-1.81 2.84-.15.57-.23 1.04-.23 1.41v3.38c0 1.47.45 2.71 1.36 3.71.9 1 2.09 1.5 3.56 1.5 1.69 0 3.01-.65 3.97-1.95.95-1.31 1.39-3.02 1.39-5.12z" fill="#fff" />
      <path d="M104.8 55.31c0 2.34-.82 4.25-2.44 5.71-1.78 1.6-4.27 2.4-7.45 2.4-2.94 0-5.3-.57-7.07-1.7l1.01-3.38c1.92 1.15 4.02 1.73 6.32 1.73 1.69 0 3.01-.38 3.96-1.14a3.65 3.65 0 001.42-2.99c0-1.1-.38-2.03-1.13-2.78-.75-.76-2-1.46-3.74-2.12-4.74-1.8-7.11-4.43-7.11-7.9 0-2.27.85-4.13 2.54-5.58 1.69-1.46 3.95-2.18 6.77-2.18 2.51 0 4.6.44 6.26 1.31l-1.1 3.32a10.64 10.64 0 00-5.35-1.26c-1.58 0-2.82.39-3.7 1.17a3.25 3.25 0 00-1.09 2.51c0 1.07.41 1.96 1.24 2.67.74.63 2.1 1.34 4.07 2.13 2.34.93 4.05 2.02 5.14 3.26 1.1 1.25 1.65 2.8 1.65 4.68z" fill="#fff" />
      <path d="M117.39 46.5h-4.48v9.6c0 2.44.86 3.66 2.56 3.66.79 0 1.44-.07 1.96-.2l.12 3.08c-.87.32-2 .49-3.4.49-1.72 0-3.07-.52-4.04-1.58-.97-1.05-1.46-2.82-1.46-5.3v-9.75h-2.67v-3.04h2.67v-3.35l4-.2v3.55h4.48v3.04z" fill="#fff" />
      <path d="M132.84 52.9a9.3 9.3 0 01-2.26 6.5c-1.57 1.82-3.66 2.73-6.28 2.73-2.51 0-4.52-.87-6.01-2.62a9.34 9.34 0 01-2.23-6.45c0-2.66.77-4.85 2.31-6.57 1.55-1.73 3.61-2.59 6.2-2.59 2.52 0 4.54.87 6.05 2.62 1.5 1.68 2.22 3.85 2.22 6.38zm-4.2.1c0-1.59-.34-2.95-1.01-4.1-.79-1.38-1.93-2.08-3.43-2.08-1.55 0-2.72.7-3.51 2.08-.68 1.15-1.01 2.53-1.01 4.15 0 1.59.33 2.95 1.01 4.1.82 1.38 1.98 2.08 3.48 2.08 1.47 0 2.6-.71 3.43-2.12.7-1.17 1.04-2.53 1.04-4.11z" fill="#fff" />
      <path d="M145 47.01a7.04 7.04 0 00-1.27-.12c-1.58 0-2.8.6-3.66 1.78-.75 1.03-1.13 2.34-1.13 3.93v10.42h-4.08l.04-13.6c0-2.3-.05-4.4-.16-6.3h3.55l.15 3.82h.12c.47-1.31 1.21-2.36 2.22-3.16a5.34 5.34 0 013.24-1.07c.38 0 .72.03 1.02.08v3.82z" fill="#fff" />
      <path d="M158.67 52.11c0 .68-.05 1.26-.12 1.73h-12.23c.05 1.69.6 2.98 1.65 3.88 1.04.87 2.39 1.31 4.04 1.31 1.83 0 3.5-.29 5-.87l.64 2.82c-1.75.76-3.82 1.14-6.22 1.14-2.87 0-5.13-.85-6.77-2.54-1.63-1.7-2.45-3.97-2.45-6.83 0-2.8.76-5.14 2.29-7.01 1.6-1.99 3.76-2.98 6.5-2.98 2.69 0 4.73 1 6.1 2.98 1.1 1.58 1.57 3.53 1.57 5.37zm-3.89-1c.02-1.13-.22-2.1-.72-2.94-.64-1.07-1.63-1.6-2.98-1.6-1.21 0-2.21.52-2.98 1.56-.63.83-1.01 1.82-1.14 2.98h7.82z" fill="#fff" />
    </svg>
  );
}

/**
 * Google Pay Icon
 */
function GooglePayIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 435 173"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M206.2 84.7v50.5h-16V8.6h42.4c10.2 0 19 3.4 26.2 10.2 7.4 6.8 11.1 15.2 11.1 25.2 0 10.2-3.7 18.6-11.1 25.4-7.1 6.8-15.9 10.2-26.2 10.2h-26.4zm0-60.4v44.7h26.8c6 0 11.1-2.1 15.2-6.3 4.2-4.2 6.3-9.2 6.3-15 0-5.7-2.1-10.7-6.3-14.9-4.1-4.2-9.1-6.3-15.2-6.3h-26.8v-2.2z"
        fill="#5F6368"
      />
      <path
        d="M312.5 50.5c11.8 0 21.1 3.2 28 9.5 6.9 6.3 10.3 15 10.3 26v52.5h-15.3v-11.8h-.7c-6.6 9.7-15.4 14.5-26.3 14.5-9.3 0-17.1-2.8-23.3-8.3-6.2-5.6-9.3-12.5-9.3-20.9 0-8.8 3.3-15.8 10-21.1 6.7-5.2 15.6-7.8 26.7-7.8 9.5 0 17.3 1.7 23.4 5.2v-3.7c0-5.6-2.2-10.4-6.7-14.2-4.5-3.9-9.7-5.8-15.6-5.8-9 0-16.1 3.8-21.3 11.5l-14.1-8.9c7.6-11.4 19-17.1 34.2-17.1zm-20.6 62.5c0 4.2 1.8 7.8 5.5 10.6 3.6 2.8 7.9 4.3 12.8 4.3 6.9 0 13-2.6 18.2-7.7 5.2-5.1 7.8-11.1 7.8-17.8-5-4.1-11.9-6.1-20.9-6.1-6.5 0-12 1.6-16.4 4.7-4.4 3.2-7 7.1-7 11.9z"
        fill="#5F6368"
      />
      <path
        d="M425.6 53.2l-53.2 122.3h-16.6l19.8-42.8-35.1-79.4h17.5l25 60.1h.3l24.4-60.1h17.9z"
        fill="#5F6368"
      />
      <path
        d="M141.1 73.6c0-4.9-.4-9.6-1.2-14.1H72v26.7h38.9c-1.7 9-6.7 16.6-14.2 21.7v18h23c13.4-12.4 21.4-30.6 21.4-52.3z"
        fill="#4285F4"
      />
      <path
        d="M72 144c19.2 0 35.3-6.4 47.1-17.3l-23-18c-6.4 4.3-14.5 6.8-24.1 6.8-18.5 0-34.2-12.5-39.8-29.3H8.4v18.5C20.1 128.5 44.5 144 72 144z"
        fill="#34A853"
      />
      <path
        d="M32.2 86.2c-1.4-4.3-2.2-8.8-2.2-13.5s.8-9.2 2.2-13.5V40.7H8.4C3.1 51.2 0 63.2 0 75.7s3.1 24.5 8.4 35l23.8-18.5z"
        fill="#FBBC04"
      />
      <path
        d="M72 29.9c10.4 0 19.8 3.6 27.2 10.6l20.4-20.4C107.2 8.2 91.1 0 72 0 44.5 0 20.1 15.5 8.4 38.7l23.8 18.5c5.6-16.8 21.3-27.3 39.8-27.3z"
        fill="#EA4335"
      />
    </svg>
  );
}

/**
 * Express Checkout Section
 * Combines wallet payments with a header
 */
export function ExpressCheckout({
  amount,
  propertyName,
  checkIn,
  checkOut,
  onSuccess,
  onError,
  disabled,
}: WalletPaymentButtonProps) {
  const [hasWallets, setHasWallets] = useState<boolean | null>(null);

  useEffect(() => {
    getAvailableWalletMethods().then((methods) => {
      setHasWallets(methods.anyWallet);
    });
  }, []);

  // Don't render if no wallets available
  if (hasWallets === false) {
    return null;
  }

  // Loading state
  if (hasWallets === null) {
    return (
      <div className="h-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400" />
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Express Checkout</h3>
      <WalletPaymentButton
        amount={amount}
        propertyName={propertyName}
        checkIn={checkIn}
        checkOut={checkOut}
        onSuccess={onSuccess}
        onError={onError}
        disabled={disabled}
      />
    </div>
  );
}
