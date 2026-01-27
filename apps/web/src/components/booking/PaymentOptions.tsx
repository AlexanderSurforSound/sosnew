'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Calendar, CreditCard, Info, Percent, Clock, Shield } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

interface PaymentOptionsProps {
  totalAmount: number;
  checkInDate: string;
  onPaymentOptionChange: (option: PaymentOption) => void;
  selectedOption: PaymentOption;
}

export type PaymentOption = 'full' | 'deposit' | 'split3';

interface PaymentPlan {
  id: PaymentOption;
  name: string;
  description: string;
  icon: React.ElementType;
  schedule: { label: string; amount: number; dueDate: string | null }[];
  benefits: string[];
  fee?: number;
}

export function PaymentOptions({
  totalAmount,
  checkInDate,
  onPaymentOptionChange,
  selectedOption,
}: PaymentOptionsProps) {
  const today = new Date();
  const checkIn = new Date(checkInDate);
  const daysUntilCheckIn = differenceInDays(checkIn, today);

  // Deposit is 50% of total
  const depositAmount = Math.round(totalAmount * 0.5);
  const balanceAmount = totalAmount - depositAmount;

  // Split into 3 payments
  const splitAmount = Math.round(totalAmount / 3);
  const finalSplitAmount = totalAmount - splitAmount * 2;

  // Balance due 30 days before check-in
  const balanceDueDate = addDays(checkIn, -30);
  const isBalanceDueSoon = daysUntilCheckIn <= 30;

  // Split payment dates
  const splitDate2 = addDays(today, 14);
  const splitDate3 = addDays(today, 28);

  const paymentPlans: PaymentPlan[] = [
    {
      id: 'full',
      name: 'Pay in Full',
      description: 'One payment, done!',
      icon: CreditCard,
      schedule: [
        { label: 'Due today', amount: totalAmount, dueDate: null },
      ],
      benefits: ['No future payments to remember', 'Best value - no fees'],
    },
    {
      id: 'deposit',
      name: 'Pay Deposit',
      description: isBalanceDueSoon ? 'Due within 30 days' : '50% now, 50% later',
      icon: Percent,
      schedule: [
        { label: 'Deposit due today', amount: depositAmount, dueDate: null },
        {
          label: 'Balance due',
          amount: balanceAmount,
          dueDate: isBalanceDueSoon ? 'Due now (within 30 days)' : format(balanceDueDate, 'MMM d, yyyy'),
        },
      ],
      benefits: ['Secure your dates with half down', 'Pay balance 30 days before arrival'],
    },
    {
      id: 'split3',
      name: 'Split into 3',
      description: 'Pay over time',
      icon: Calendar,
      schedule: [
        { label: 'Payment 1 (today)', amount: splitAmount, dueDate: null },
        { label: 'Payment 2', amount: splitAmount, dueDate: format(splitDate2, 'MMM d, yyyy') },
        { label: 'Payment 3', amount: finalSplitAmount, dueDate: format(splitDate3, 'MMM d, yyyy') },
      ],
      benefits: ['Spread out payments', 'Automatic billing every 2 weeks'],
      fee: 15,
    },
  ];

  // If less than 30 days until check-in, only show full payment
  const availablePlans = daysUntilCheckIn < 30
    ? paymentPlans.filter(p => p.id === 'full')
    : paymentPlans;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Choose How to Pay</h2>
        <p className="text-gray-500">Select a payment option that works best for you</p>
      </div>

      {/* Notice if close to check-in */}
      {daysUntilCheckIn < 30 && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-800">Full payment required</p>
            <p className="text-blue-700 mt-1">
              Since your check-in is within 30 days, full payment is required to complete your booking.
            </p>
          </div>
        </div>
      )}

      {/* Payment Plan Options */}
      <div className="space-y-3">
        {availablePlans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedOption === plan.id;
          const todayAmount = plan.schedule[0].amount + (plan.fee || 0);

          return (
            <motion.div
              key={plan.id}
              layout
              onClick={() => onPaymentOptionChange(plan.id)}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-ocean-500 bg-ocean-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                    isSelected
                      ? 'border-ocean-500 bg-ocean-500'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                        {plan.id === 'full' && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Best Value
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">
                        ${todayAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">due today</p>
                    </div>
                  </div>

                  {/* Payment Schedule */}
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
                                {payment.dueDate && (
                                  <p className="text-xs text-gray-500">{payment.dueDate}</p>
                                )}
                              </div>
                            </div>
                            <span className="font-semibold">${payment.amount.toLocaleString()}</span>
                          </div>
                        ))}
                        {plan.fee && (
                          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-100 text-amber-600">
                                <Info className="w-4 h-4" />
                              </div>
                              <span className="text-sm text-amber-800">Processing fee</span>
                            </div>
                            <span className="font-semibold text-amber-800">${plan.fee}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Benefits */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 flex flex-wrap gap-2"
                    >
                      {plan.benefits.map((benefit) => (
                        <span
                          key={benefit}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                        >
                          <Check className="w-3 h-3 text-green-500" />
                          {benefit}
                        </span>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Security Note */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Shield className="w-4 h-4" />
        <span>All payments are secure and encrypted</span>
      </div>
    </div>
  );
}
