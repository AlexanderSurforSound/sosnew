'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import type { GuestInfo as GuestInfoType } from '@/types';

interface GuestInfoProps {
  initialValues: GuestInfoType;
  onBack: () => void;
  onComplete: (info: GuestInfoType) => void;
  isLoggedIn: boolean;
}

export function GuestInfo({ initialValues, onBack, onComplete, isLoggedIn }: GuestInfoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestInfoType>({
    defaultValues: initialValues,
  });

  const onSubmit = (data: GuestInfoType) => {
    onComplete(data);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Guest Information</h2>

      {!isLoggedIn && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium underline">
              Sign in
            </Link>{' '}
            to auto-fill your information and earn loyalty points.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">First Name *</label>
            <input
              {...register('firstName', { required: 'First name is required' })}
              className="input"
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="label">Last Name *</label>
            <input
              {...register('lastName', { required: 'Last name is required' })}
              className="input"
              placeholder="Smith"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="label">Email Address *</label>
          <input
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            className="input"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Confirmation and trip details will be sent to this email
          </p>
        </div>

        <div className="mb-6">
          <label className="label">Phone Number *</label>
          <input
            type="tel"
            {...register('phone', { required: 'Phone number is required' })}
            className="input"
            placeholder="(555) 123-4567"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            For important trip updates and check-in instructions
          </p>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Home Address (Optional)</h3>
          <p className="text-sm text-gray-500 mb-4">
            Used for travel insurance or other optional services
          </p>

          <div className="mb-4">
            <label className="label">Street Address</label>
            <input
              {...register('address.street')}
              className="input"
              placeholder="123 Main St"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="label">City</label>
              <input {...register('address.city')} className="input" placeholder="City" />
            </div>
            <div>
              <label className="label">State</label>
              <input {...register('address.state')} className="input" placeholder="NC" />
            </div>
            <div>
              <label className="label">ZIP Code</label>
              <input {...register('address.zip')} className="input" placeholder="12345" />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={onBack} className="btn-outline btn-lg">
            Back
          </button>
          <button type="submit" className="btn-primary btn-lg flex-1">
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );
}
