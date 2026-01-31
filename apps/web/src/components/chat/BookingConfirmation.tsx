'use client';

import Link from 'next/link';
import { Calendar, Users, PawPrint, Clock, ArrowRight, X } from 'lucide-react';
import type { BookingIntent } from '@/hooks/useAgentChat';

interface BookingConfirmationProps {
  intent: BookingIntent;
  onDismiss: () => void;
}

export function BookingConfirmation({ intent, onDismiss }: BookingConfirmationProps) {
  // Format dates
  const checkInDate = new Date(intent.checkIn);
  const checkOutDate = new Date(intent.checkOut);
  const expiresAt = new Date(intent.expiresAt);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate time remaining
  const now = new Date();
  const minutesRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60)));

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">{intent.propertyName}</h4>
          <p className="text-xs text-gray-500">Booking prepared</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 p-1"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="w-4 h-4 text-cyan-600" />
          <span>{formatDate(checkInDate)} - {formatDate(checkOutDate)}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Users className="w-4 h-4 text-cyan-600" />
            <span>{intent.guests} guest{intent.guests > 1 ? 's' : ''}</span>
          </div>
          {intent.pets > 0 && (
            <div className="flex items-center gap-2 text-gray-700">
              <PawPrint className="w-4 h-4 text-cyan-600" />
              <span>{intent.pets} pet{intent.pets > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="bg-white rounded-lg px-3 py-2 flex items-center justify-between">
        <span className="text-sm text-gray-600">Estimated Total</span>
        <span className="text-lg font-bold text-gray-900">
          ${intent.estimatedTotal.toLocaleString()}
        </span>
      </div>

      {/* Expiration warning */}
      <div className="flex items-center gap-1 text-xs text-amber-600">
        <Clock className="w-3 h-3" />
        <span>
          {minutesRemaining > 0
            ? `Expires in ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}`
            : 'Expired'}
        </span>
      </div>

      {/* CTA Button */}
      <Link
        href={intent.bookingUrl}
        className="flex items-center justify-center gap-2 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
      >
        Continue to Booking
        <ArrowRight className="w-4 h-4" />
      </Link>

      <p className="text-[10px] text-gray-400 text-center">
        You won't be charged until you complete the booking process
      </p>
    </div>
  );
}
