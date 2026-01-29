'use client';

import { useState } from 'react';
import { CreditCard, Lock, AlertCircle, Mail, Info } from 'lucide-react';
import { PaymentMethodType } from './PaymentOptions';

interface PaymentFormProps {
  amount: number;
  onBack: () => void;
  onSubmit: (paymentData: PaymentData) => void;
  isLoading: boolean;
  error: string | null;
  paymentMethod?: PaymentMethodType;
}

export interface PaymentData {
  // Card info (for credit/debit)
  cardNumber?: string;
  cardExpMonth?: string;
  cardExpYear?: string;
  cardCvv?: string;
  cardType?: string;
  // Billing info
  firstName: string;
  lastName: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email?: string;
  // Payment method type
  paymentMethod: PaymentMethodType;
}

// Detect card type from number
function detectCardType(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  if (/^4/.test(cleanNumber)) return 'visa';
  if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
  if (/^3[47]/.test(cleanNumber)) return 'amex';
  if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
  return 'unknown';
}

// Format card number with spaces
function formatCardNumber(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  const parts = [];
  for (let i = 0; i < cleanValue.length && i < 16; i += 4) {
    parts.push(cleanValue.slice(i, i + 4));
  }
  return parts.join(' ');
}

// Validate card number using Luhn algorithm
function isValidCardNumber(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleanNumber)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// Validate expiration date
function isValidExpiration(month: string, year: string): boolean {
  const expMonth = parseInt(month, 10);
  const expYear = parseInt(year, 10) + 2000;

  if (expMonth < 1 || expMonth > 12) return false;

  const now = new Date();
  const expDate = new Date(expYear, expMonth);

  return expDate > now;
}

export function PaymentForm({
  amount,
  onBack,
  onSubmit,
  isLoading,
  error,
  paymentMethod = 'credit',
}: PaymentFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  // Card info state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpMonth, setCardExpMonth] = useState('');
  const [cardExpYear, setCardExpYear] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Billing info state
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    phone: '',
    email: '',
  });

  const isCardPayment = paymentMethod === 'credit' || paymentMethod === 'debit';
  const cardType = detectCardType(cardNumber);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setCardExpMonth(value);
  };

  const handleExpYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setCardExpYear(value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxLength = cardType === 'amex' ? 4 : 3;
    const value = e.target.value.replace(/\D/g, '').slice(0, maxLength);
    setCardCvv(value);
  };

  const validateForm = (): string | null => {
    // Validate billing info (required for all payment methods)
    if (!billingInfo.firstName.trim()) return 'First name is required';
    if (!billingInfo.lastName.trim()) return 'Last name is required';
    if (!billingInfo.address.trim()) return 'Street address is required';
    if (!billingInfo.city.trim()) return 'City is required';
    if (!billingInfo.state.trim()) return 'State is required';
    if (!billingInfo.zip.trim()) return 'ZIP code is required';
    if (!billingInfo.phone.trim()) return 'Phone number is required';

    // Validate card info for card payments
    if (isCardPayment) {
      if (!cardNumber.trim()) return 'Card number is required';
      if (!isValidCardNumber(cardNumber)) return 'Please enter a valid card number';
      if (!cardExpMonth || !cardExpYear) return 'Card expiration is required';
      if (!isValidExpiration(cardExpMonth, cardExpYear)) return 'Card has expired';
      if (!cardCvv) return 'CVV is required';
      const expectedCvvLength = cardType === 'amex' ? 4 : 3;
      if (cardCvv.length !== expectedCvvLength) {
        return `CVV must be ${expectedCvvLength} digits`;
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const paymentData: PaymentData = {
      firstName: billingInfo.firstName,
      lastName: billingInfo.lastName,
      address: billingInfo.address,
      address2: billingInfo.address2,
      city: billingInfo.city,
      state: billingInfo.state,
      zip: billingInfo.zip,
      country: billingInfo.country,
      phone: billingInfo.phone,
      email: billingInfo.email,
      paymentMethod,
    };

    if (isCardPayment) {
      paymentData.cardNumber = cardNumber.replace(/\s/g, '');
      paymentData.cardExpMonth = cardExpMonth.padStart(2, '0');
      paymentData.cardExpYear = cardExpYear;
      paymentData.cardCvv = cardCvv;
      paymentData.cardType = cardType;
    }

    onSubmit(paymentData);
  };

  // Mail check payment form
  if (paymentMethod === 'mail') {
    return (
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold mb-6">Mail Check Payment</h2>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-2">Mail Check Instructions</p>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Make check payable to: <strong>Surf or Sound Realty</strong></li>
                <li>Include your reservation confirmation number on the check</li>
                <li>A $35 processing fee applies to each check payment</li>
                <li>Payment must be received within 7 days to secure your reservation</li>
              </ul>
              <p className="mt-3 font-medium">Mail to:</p>
              <p className="text-blue-800">
                Surf or Sound Realty<br />
                PO Box 729<br />
                Avon, NC 27915
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {(error || formError) && (
          <div className="flex items-start gap-2 p-4 bg-red-50 text-red-800 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error || formError}</p>
            </div>
          </div>
        )}

        {/* Billing Contact Info */}
        <div className="mb-6">
          <h3 className="font-medium mb-4">Contact Information</h3>
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

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Phone *</label>
              <input
                type="tel"
                value={billingInfo.phone}
                onChange={(e) => setBillingInfo({ ...billingInfo, phone: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={billingInfo.email}
                onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
                className="input"
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
                placeholder="NC"
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
            <span>Total Due</span>
            <span>${amount.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Plus $35 check processing fee per payment
          </p>
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
              'Complete Reservation'
            )}
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          By completing your reservation, you agree to our{' '}
          <a href="/terms" className="text-primary-600 hover:underline">Terms of Service</a>{' '}
          and{' '}
          <a href="/policies" className="text-primary-600 hover:underline">Rental Policies</a>
        </p>
      </form>
    );
  }

  // Credit/Debit card payment form
  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-6">
        {paymentMethod === 'debit' ? 'Debit Card' : 'Credit Card'} Payment
      </h2>

      {/* Security Notice */}
      <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-lg mb-6">
        <Lock className="w-5 h-5" />
        <span className="text-sm">Your payment information is encrypted and secure</span>
      </div>

      {/* Error Display */}
      {(error || formError) && (
        <div className="flex items-start gap-2 p-4 bg-red-50 text-red-800 rounded-lg mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Payment Error</p>
            <p className="text-sm">{error || formError}</p>
          </div>
        </div>
      )}

      {/* Card Information */}
      <div className="mb-6">
        <h3 className="font-medium mb-4">Card Information</h3>

        {/* Card Number */}
        <div className="mb-4">
          <label className="label">Card Number *</label>
          <div className="relative">
            <input
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              className="input pl-12"
              maxLength={19}
              required
            />
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            {cardType !== 'unknown' && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600 uppercase">
                {cardType}
              </span>
            )}
          </div>
        </div>

        {/* Cardholder Name */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Cardholder First Name *</label>
            <input
              type="text"
              value={billingInfo.firstName}
              onChange={(e) => setBillingInfo({ ...billingInfo, firstName: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Cardholder Last Name *</label>
            <input
              type="text"
              value={billingInfo.lastName}
              onChange={(e) => setBillingInfo({ ...billingInfo, lastName: e.target.value })}
              className="input"
              required
            />
          </div>
        </div>

        {/* Expiration and CVV */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Exp. Month *</label>
            <input
              type="text"
              value={cardExpMonth}
              onChange={handleExpMonthChange}
              placeholder="MM"
              className="input text-center"
              maxLength={2}
              required
            />
          </div>
          <div>
            <label className="label">Exp. Year *</label>
            <input
              type="text"
              value={cardExpYear}
              onChange={handleExpYearChange}
              placeholder="YY"
              className="input text-center"
              maxLength={2}
              required
            />
          </div>
          <div>
            <label className="label">CVV *</label>
            <input
              type="text"
              value={cardCvv}
              onChange={handleCvvChange}
              placeholder={cardType === 'amex' ? '1234' : '123'}
              className="input text-center"
              maxLength={cardType === 'amex' ? 4 : 3}
              required
            />
          </div>
        </div>
      </div>

      {/* Billing Address */}
      <div className="mb-6">
        <h3 className="font-medium mb-4">Billing Address</h3>

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

        <div className="mb-4">
          <label className="label">Address Line 2</label>
          <input
            type="text"
            value={billingInfo.address2}
            onChange={(e) => setBillingInfo({ ...billingInfo, address2: e.target.value })}
            className="input"
            placeholder="Apt, Suite, Unit, etc."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
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
              onChange={(e) => setBillingInfo({ ...billingInfo, state: e.target.value.toUpperCase() })}
              className="input"
              maxLength={2}
              placeholder="NC"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
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
          <div>
            <label className="label">Country</label>
            <select
              value={billingInfo.country}
              onChange={(e) => setBillingInfo({ ...billingInfo, country: e.target.value })}
              className="input"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Phone *</label>
          <input
            type="tel"
            value={billingInfo.phone}
            onChange={(e) => setBillingInfo({ ...billingInfo, phone: e.target.value })}
            className="input"
            placeholder="(555) 123-4567"
            required
          />
        </div>
      </div>

      {/* Convenience Fee Notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-800">
            {paymentMethod === 'credit' ? 'Convenience Fee (CC/DC)' : 'Convenience Fee'}
          </p>
          <p className="text-amber-700 mt-1">
            A convenience fee will be added to your payment for using a {paymentMethod === 'credit' ? 'credit' : 'debit'} card.
          </p>
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

      <p className="text-center text-sm text-gray-600 mt-4">
        By clicking Pay, you agree to our{' '}
        <a href="/terms" className="text-primary-600 hover:underline">Terms of Service</a>{' '}
        and{' '}
        <a href="/policies" className="text-primary-600 hover:underline">Rental Policies</a>
      </p>
    </form>
  );
}
