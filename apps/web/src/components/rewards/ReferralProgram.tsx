'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  Users,
  Share2,
  Copy,
  Check,
  Mail,
  MessageSquare,
  Twitter,
  Facebook,
  Link,
  DollarSign,
  TrendingUp,
  Clock,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface Referral {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'signed_up' | 'booked' | 'completed';
  dateReferred: Date;
  rewardAmount?: number;
}

interface ReferralProgramProps {
  referralCode?: string;
  referralLink?: string;
  rewardAmount?: number;
  friendReward?: number;
  totalEarned?: number;
  referrals?: Referral[];
}

export default function ReferralProgram({
  referralCode = 'BEACH2024',
  referralLink = 'https://surfororsound.com/ref/BEACH2024',
  rewardAmount = 75,
  friendReward = 50,
  totalEarned = 225,
  referrals = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@email.com',
      status: 'completed',
      dateReferred: new Date(Date.now() - 86400000 * 30),
      rewardAmount: 75,
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike@email.com',
      status: 'completed',
      dateReferred: new Date(Date.now() - 86400000 * 20),
      rewardAmount: 75,
    },
    {
      id: '3',
      name: 'Emily Davis',
      email: 'emily@email.com',
      status: 'completed',
      dateReferred: new Date(Date.now() - 86400000 * 10),
      rewardAmount: 75,
    },
    {
      id: '4',
      name: 'Alex Wilson',
      email: 'alex@email.com',
      status: 'booked',
      dateReferred: new Date(Date.now() - 86400000 * 5),
    },
    {
      id: '5',
      name: 'Jessica Brown',
      email: 'jessica@email.com',
      status: 'signed_up',
      dateReferred: new Date(Date.now() - 86400000 * 2),
    },
  ],
}: ReferralProgramProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const sendInvites = () => {
    // Handle sending invites
    setShowInviteForm(false);
    setInviteEmails('');
  };

  const getStatusColor = (status: Referral['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-600';
      case 'signed_up':
        return 'bg-blue-100 text-blue-600';
      case 'booked':
        return 'bg-amber-100 text-amber-600';
      case 'completed':
        return 'bg-green-100 text-green-600';
    }
  };

  const getStatusLabel = (status: Referral['status']) => {
    switch (status) {
      case 'pending':
        return 'Invited';
      case 'signed_up':
        return 'Signed Up';
      case 'booked':
        return 'Trip Booked';
      case 'completed':
        return 'Reward Earned';
    }
  };

  const pendingRewards = referrals.filter(
    (r) => r.status === 'booked' || r.status === 'signed_up'
  ).length * rewardAmount;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Refer Friends, Earn Rewards</h2>
            <p className="text-violet-100">
              Give ${friendReward}, Get ${rewardAmount}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">${totalEarned}</p>
            <p className="text-sm text-violet-200">Total Earned</p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{referrals.length}</p>
            <p className="text-sm text-violet-200">Friends Referred</p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">${pendingRewards}</p>
            <p className="text-sm text-violet-200">Pending</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">How It Works</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              step: 1,
              icon: <Share2 className="w-5 h-5" />,
              title: 'Share Your Link',
              description: 'Send your unique referral link to friends',
            },
            {
              step: 2,
              icon: <Users className="w-5 h-5" />,
              title: 'Friends Book',
              description: `They get $${friendReward} off their first stay`,
            },
            {
              step: 3,
              icon: <DollarSign className="w-5 h-5" />,
              title: 'You Earn',
              description: `Get $${rewardAmount} credit after they complete their trip`,
            },
          ].map((item, index) => (
            <div key={item.step} className="flex gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="font-medium text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              {index < 2 && (
                <ArrowRight className="w-5 h-5 text-gray-300 hidden sm:block self-center" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Share Section */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Share Your Code</h3>

        {/* Referral Code */}
        <div className="mb-4">
          <label className="block text-sm text-gray-500 mb-2">Your Referral Code</label>
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-3 bg-violet-50 border-2 border-violet-200 border-dashed rounded-xl font-mono text-lg font-bold text-violet-700 text-center">
              {referralCode}
            </div>
            <button
              onClick={copyCode}
              className="px-4 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors flex items-center gap-2"
            >
              {copiedCode ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Referral Link */}
        <div className="mb-6">
          <label className="block text-sm text-gray-500 mb-2">Your Referral Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-sm"
            />
            <button
              onClick={copyLink}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              {copiedLink ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Link className="w-5 h-5" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowInviteForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Email Friends
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            <MessageSquare className="w-5 h-5" />
            WhatsApp
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <Facebook className="w-5 h-5" />
            Facebook
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
            <Twitter className="w-5 h-5" />
            Twitter
          </button>
        </div>
      </div>

      {/* Referrals List */}
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Your Referrals</h3>

        {referrals.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No referrals yet</p>
            <p className="text-sm text-gray-400">
              Share your code to start earning rewards
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((referral, index) => (
              <motion.div
                key={referral.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-medium">
                    {referral.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{referral.name}</p>
                    <p className="text-sm text-gray-500">
                      {referral.dateReferred.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      referral.status
                    )}`}
                  >
                    {getStatusLabel(referral.status)}
                  </span>
                  {referral.rewardAmount && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      +${referral.rewardAmount}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Bonus Tier Info */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-amber-900">Unlock Bigger Rewards!</p>
            <p className="text-sm text-amber-700">
              Refer 5 friends to unlock $100 per referral
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-amber-600">
              {referrals.filter((r) => r.status === 'completed').length}/5
            </p>
            <div className="w-20 h-2 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{
                  width: `${
                    (referrals.filter((r) => r.status === 'completed').length / 5) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Email Invite Modal */}
      <AnimatePresence>
        {showInviteForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInviteForm(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Invite Friends via Email
                </h3>
                <p className="text-gray-600 mb-4">
                  Enter email addresses separated by commas
                </p>
                <textarea
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  placeholder="friend1@email.com, friend2@email.com"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none mb-4"
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowInviteForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendInvites}
                    disabled={!inviteEmails.trim()}
                    className="px-6 py-2 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
                  >
                    Send Invites
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mini referral widget
export function ReferralWidget() {
  return (
    <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-4 text-white">
      <div className="flex items-center gap-3">
        <Gift className="w-8 h-8" />
        <div className="flex-1">
          <p className="font-semibold">Refer a Friend</p>
          <p className="text-sm text-violet-200">Get $75 for each booking</p>
        </div>
        <button className="px-4 py-2 bg-white text-violet-600 rounded-lg font-medium hover:bg-violet-50 transition-colors">
          Share
        </button>
      </div>
    </div>
  );
}
