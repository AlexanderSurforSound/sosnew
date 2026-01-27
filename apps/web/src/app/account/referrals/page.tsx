'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gift, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ReferralProgram from '@/components/rewards/ReferralProgram';

export default function ReferralsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to access referrals</h1>
          <p className="text-gray-600 mb-6">
            Earn rewards by referring friends and family to Surf or Sound.
          </p>
          <Link href="/auth/login" className="btn-primary btn-lg">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/account/profile"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-white mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Refer a Friend</h1>
              <p className="text-purple-100">Earn rewards for every successful referral</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {[
              { href: '/account/profile', label: 'Profile' },
              { href: '/account/bookings', label: 'Bookings' },
              { href: '/account/referrals', label: 'Referrals', active: true },
              { href: '/account/settings', label: 'Settings' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  item.active
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ReferralProgram />
        </motion.div>

        {/* How It Works */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-purple-600">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Share Your Link</h3>
              <p className="text-sm text-gray-600">
                Send your unique referral link to friends and family planning a beach vacation.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-purple-600">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">They Book a Stay</h3>
              <p className="text-sm text-gray-600">
                When they book their first vacation rental, they get $50 off their stay.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">You Earn Rewards</h3>
              <p className="text-sm text-gray-600">
                After their completed stay, you receive a $100 credit toward your next booking.
              </p>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Referral rewards are subject to our{' '}
            <Link href="/terms" className="text-purple-600 hover:underline">
              Terms & Conditions
            </Link>
            . Rewards are credited after the referred guest's completed stay.
          </p>
        </div>
      </div>
    </div>
  );
}
