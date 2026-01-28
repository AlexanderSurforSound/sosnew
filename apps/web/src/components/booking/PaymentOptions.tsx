'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Calendar, CreditCard, Info, Clock, Shield, Mail, Percent } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

interface PaymentOptionsProps {
  totalAmount: number;
  checkInDate: string;
  onPaymentOptionChange: (option: PaymentPlanType) => void;
  selectedOption: PaymentPlanType;
  onPaymentMethodChange?: (method: PaymentMethodType) => void;
  selectedMethod?: PaymentMethodType;
}

// Payment plan types matching current site
export type PaymentPlanType = 'one' | 'two' | 'three' | 'four';
export type PaymentMethodType = 'credit' | 'debit' | 'mail';

// Legacy export for compatibility
export type PaymentOption = 'full' | 'deposit' | 'split3';

interface PaymentScheduleItem {
  label: string;
  amount: number;
  dueDate: Date | null;
  isPaid?: boolean;
}

interface PaymentPlan {
  id: PaymentPlanType;
  name: string;
  description: string;
  schedule: PaymentScheduleItem[];
  available: boolean;
  availableReason?: string;
}

// Payment plan percentages from current site
const PAYMENT_SPLITS = {
  one: [1.0],
  two: [0.55, 0.45],
  three: [0.30, 0.30, 0.40],
  four: [0.30, 0.30, 0.20, 0.20],
};

// Minimum days before check-in for each payment plan
const MIN_DAYS_FOR_PLAN = {
  one: 0,
  two: 30,
  three: 97,
  four: 127,
};

export function PaymentOptions({
  totalAmount,
  checkInDate,
  onPaymentOptionChange,
  selectedOption,
  onPaymentMethodChange,
  selectedMethod = 'credit',
}: PaymentOptionsProps) {
  const today = new Date();
  const checkIn = new Date(checkInDate);
  const daysUntilCheckIn = differenceInDays(checkIn, today);

  // Calculate payment schedules based on current site logic
  const getPaymentSchedule = (planType: PaymentPlanType): PaymentScheduleItem[] => {
    const splits = PAYMENT_SPLITS[planType];
    const schedule: PaymentScheduleItem[] = [];

    // First payment is due 2 days from now (if more than 30 days out) or tomorrow
    const firstPaymentDate = daysUntilCheckIn > 30
      ? addDays(today, 2)
      : addDays(today, 1);

    splits.forEach((percent, index) => {
      const amount = Math.round(totalAmount * percent);
      let dueDate: Date;
      let label: string;

      if (index === 0) {
        dueDate = firstPaymentDate;
        label = 'Due today';
      } else if (planType === 'two' && index === 1) {
        // Second payment for 2-payment plan: 30 days before check-in
        dueDate = addDays(checkIn, -30);
        label = 'Balance due';
      } else if (planType === 'three') {
        if (index === 1) {
          // Second payment: 32 days after reservation
          dueDate = addDays(today, 32);
          label = 'Payment 2';
        } else {
          // Third payment: 30 days before check-in
          dueDate = addDays(checkIn, -30);
          label = 'Final payment';
        }
      } else if (planType === 'four') {
        if (index === 1) {
          // Second payment: 32 days after reservation
          dueDate = addDays(today, 32);
          label = 'Payment 2';
        } else if (index === 2) {
          // Third payment: 60 days before check-in
          dueDate = addDays(checkIn, -60);
          label = 'Payment 3';
        } else {
          // Fourth payment: 30 days before check-in
          dueDate = addDays(checkIn, -30);
          label = 'Final payment';
        }
      } else {
        dueDate = today;
        label = `Payment ${index + 1}`;
      }

      schedule.push({
        label,
        amount,
        dueDate,
      });
    });

    // Adjust for rounding - ensure total matches
    const scheduledTotal = schedule.reduce((sum, p) => sum + p.amount, 0);
    if (scheduledTotal !== totalAmount && schedule.length > 0) {
      schedule[schedule.length - 1].amount += totalAmount - scheduledTotal;
    }

    return schedule;
  };

  const paymentPlans: PaymentPlan[] = [
    {
      id: 'one',
      name: 'Pay in Full',
      description: 'One payment, all done',
      schedule: getPaymentSchedule('one'),
      available: true,
    },
    {
      id: 'two',
      name: '2 Payments',
      description: '55% now, 45% before arrival',
      schedule: getPaymentSchedule('two'),
      available: daysUntilCheckIn >= MIN_DAYS_FOR_PLAN.two,
      availableReason: 'Available when booking 30+ days in advance',
    },
    {
      id: 'three',
      name: '3 Payments',
      description: '30% / 30% / 40%',
      schedule: getPaymentSchedule('three'),
      available: daysUntilCheckIn >= MIN_DAYS_FOR_PLAN.three,
      availableReason: 'Available when booking 97+ days in advance',
    },
    {
      id: 'four',
      name: '4 Payments',
      description: '30% / 30% / 20% / 20%',
      schedule: getPaymentSchedule('four'),
      available: daysUntilCheckIn >= MIN_DAYS_FOR_PLAN.four,
      availableReason: 'Available when booking 127+ days in advance',
    },
  ];

  const availablePlans = paymentPlans.filter(p => p.available);

  // Show mail option only if more than 30 days out
  const showMailOption = daysUntilCheckIn > 30;

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Payment Method</h2>
        <p className="text-gray-500 text-sm mb-4">Select how you'd like to pay</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() => onPaymentMethodChange?.('credit')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedMethod === 'credit'
                ? 'border-ocean-500 bg-ocean-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <CreditCard className={`w-5 h-5 mb-2 ${selectedMethod === 'credit' ? 'text-ocean-600' : 'text-gray-400'}`} />
            <p className="font-medium text-sm">Credit Card</p>
            <p className="text-xs text-gray-500">Visa, MC, Amex, Discover</p>
          </button>

          <button
            onClick={() => onPaymentMethodChange?.('debit')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedMethod === 'debit'
                ? 'border-ocean-500 bg-ocean-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <CreditCard className={`w-5 h-5 mb-2 ${selectedMethod === 'debit' ? 'text-ocean-600' : 'text-gray-400'}`} />
            <p className="font-medium text-sm">Debit Card</p>
            <p className="text-xs text-gray-500">Bank debit card</p>
          </button>

          {showMailOption && (
            <button
              onClick={() => onPaymentMethodChange?.('mail')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedMethod === 'mail'
                  ? 'border-ocean-500 bg-ocean-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Mail className={`w-5 h-5 mb-2 ${selectedMethod === 'mail' ? 'text-ocean-600' : 'text-gray-400'}`} />
              <p className="font-medium text-sm">Mail Check</p>
              <p className="text-xs text-gray-500">Pay by check</p>
            </button>
          )}
        </div>
      </div>

      {/* Payment Plan Selection */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Payment Plan</h2>
        <p className="text-gray-500 text-sm mb-4">Choose how many payments to split your total</p>

        {/* Notice if close to check-in */}
        {daysUntilCheckIn < 30 && (
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Full payment required</p>
              <p className="text-blue-700 mt-1">
                Since your check-in is within 30 days, full payment is required to complete your booking.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {paymentPlans.map((plan) => {
            const isSelected = selectedOption === plan.id;
            const firstPayment = plan.schedule[0];

            return (
              <motion.div
                key={plan.id}
                layout
                onClick={() => plan.available && onPaymentOptionChange(plan.id)}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  !plan.available
                    ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'border-ocean-500 bg-ocean-50 cursor-pointer'
                    : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      isSelected
                        ? 'border-ocean-500 bg-ocean-500'
                        : plan.available
                        ? 'border-gray-300'
                        : 'border-gray-200'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                          {plan.id === 'one' && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Simplest
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{plan.description}</p>
                        {!plan.available && plan.availableReason && (
                          <p className="text-xs text-gray-400 mt-1">{plan.availableReason}</p>
                        )}
                      </div>
                      {plan.available && (
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">
                            ${firstPayment.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">due today</p>
                        </div>
                      )}
                    </div>

                    {/* Payment Schedule - show when selected */}
                    {isSelected && plan.schedule.length > 1 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Payment Schedule</h5>
                        <div className="space-y-2">
                          {plan.schedule.map((payment, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-white rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    idx === 0 ? 'bg-ocean-100 text-ocean-600' : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  {idx === 0 ? <CreditCard className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{payment.label}</p>
                                  {payment.dueDate && idx > 0 && (
                                    <p className="text-xs text-gray-500">
                                      {format(payment.dueDate, 'MMM d, yyyy')}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className="font-semibold">${payment.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Convenience Fee Notice */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <Percent className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-gray-700">Payment Processing Fee</p>
          <p className="text-gray-600 mt-1">
            {selectedMethod === 'credit' && 'A convenience fee applies to credit card payments.'}
            {selectedMethod === 'debit' && 'A convenience fee applies to debit card payments.'}
            {selectedMethod === 'mail' && 'A handling fee of $35 per payment applies to mail check payments.'}
          </p>
        </div>
      </div>

      {/* Security Note */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Shield className="w-4 h-4" />
        <span>All payments are secure and encrypted</span>
      </div>
    </div>
  );
}
