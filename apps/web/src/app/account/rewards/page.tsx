'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Gift,
  ChevronRight,
  Sparkles,
  Award,
  Clock,
  Check,
  AlertCircle,
  Tag,
  Percent,
  DollarSign,
  Star,
  Crown,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: 'discount' | 'upgrade' | 'experience' | 'merchandise';
  icon: string;
  value?: string;
  available: boolean;
  limitedTime?: boolean;
  expiresAt?: string;
}

interface RedemptionHistory {
  id: string;
  reward: Reward;
  redeemedAt: string;
  status: 'active' | 'used' | 'expired';
  code?: string;
}

const TIERS = [
  { name: 'Explorer', minPoints: 0, color: 'from-gray-400 to-gray-500', icon: '🌊' },
  { name: 'Adventurer', minPoints: 1000, color: 'from-blue-400 to-blue-600', icon: '🏄' },
  { name: 'Islander', minPoints: 5000, color: 'from-purple-500 to-purple-700', icon: '🏝️' },
  { name: 'Legend', minPoints: 15000, color: 'from-amber-400 to-orange-500', icon: '👑' },
];

const MOCK_REWARDS: Reward[] = [
  {
    id: '1',
    name: '$25 Off Your Next Stay',
    description: 'Get $25 off your next booking of $500 or more',
    pointsCost: 500,
    category: 'discount',
    icon: '💰',
    value: '$25',
    available: true,
  },
  {
    id: '2',
    name: '10% Off Any Booking',
    description: 'Save 10% on any reservation (max $200)',
    pointsCost: 1000,
    category: 'discount',
    icon: '🏷️',
    value: '10%',
    available: true,
  },
  {
    id: '3',
    name: 'Early Check-in',
    description: 'Check in at 1 PM instead of 4 PM (subject to availability)',
    pointsCost: 300,
    category: 'upgrade',
    icon: '⏰',
    available: true,
  },
  {
    id: '4',
    name: 'Late Check-out',
    description: 'Check out at 1 PM instead of 10 AM (subject to availability)',
    pointsCost: 300,
    category: 'upgrade',
    icon: '🌅',
    available: true,
  },
  {
    id: '5',
    name: 'Free Beach Equipment',
    description: 'Free beach chairs, umbrella, and cooler for your stay',
    pointsCost: 200,
    category: 'experience',
    icon: '🏖️',
    available: true,
  },
  {
    id: '6',
    name: 'Kayak Adventure',
    description: '2-hour guided kayak tour of the sound',
    pointsCost: 800,
    category: 'experience',
    icon: '🛶',
    available: true,
  },
  {
    id: '7',
    name: 'Surf or Sound T-Shirt',
    description: 'Exclusive member t-shirt',
    pointsCost: 250,
    category: 'merchandise',
    icon: '👕',
    available: true,
  },
  {
    id: '8',
    name: 'VIP Concierge Service',
    description: 'Dedicated concierge for your entire stay',
    pointsCost: 2000,
    category: 'upgrade',
    icon: '🎩',
    available: true,
  },
  {
    id: '9',
    name: 'Free Night Stay',
    description: 'Earn a free night at select properties (up to $300 value)',
    pointsCost: 5000,
    category: 'discount',
    icon: '🌟',
    value: 'FREE NIGHT',
    available: true,
    limitedTime: true,
    expiresAt: '2024-03-31',
  },
];

const MOCK_HISTORY: RedemptionHistory[] = [
  {
    id: '1',
    reward: MOCK_REWARDS[0],
    redeemedAt: '2024-01-15',
    status: 'active',
    code: 'SAVE25-ABC123',
  },
  {
    id: '2',
    reward: MOCK_REWARDS[4],
    redeemedAt: '2024-01-10',
    status: 'used',
  },
];

export default function RewardsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRedeemConfirm, setShowRedeemConfirm] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const userPoints = user?.loyaltyPoints || 750;
  const userTier = TIERS.reduce((highest, tier) =>
    userPoints >= tier.minPoints ? tier : highest
  , TIERS[0]);
  const nextTier = TIERS.find(t => t.minPoints > userPoints);

  const categories = [
    { id: 'all', name: 'All Rewards', icon: Gift },
    { id: 'discount', name: 'Discounts', icon: Percent },
    { id: 'upgrade', name: 'Upgrades', icon: Zap },
    { id: 'experience', name: 'Experiences', icon: Star },
    { id: 'merchandise', name: 'Merch', icon: Tag },
  ];

  const filteredRewards = activeCategory === 'all'
    ? MOCK_REWARDS
    : MOCK_REWARDS.filter(r => r.category === activeCategory);

  const redeemMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { code: `REWARD-${Math.random().toString(36).substring(7).toUpperCase()}` };
    },
    onSuccess: () => {
      setShowRedeemConfirm(false);
      setRedeemSuccess(true);
      // Would refetch user data to update points
    },
  });

  const handleRedeem = () => {
    if (selectedReward) {
      redeemMutation.mutate(selectedReward.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="container-page py-8">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Account
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
                <Gift className="w-8 h-8" />
                Rewards Center
              </h1>
              <p className="text-purple-200">
                Redeem your points for exclusive rewards
              </p>
            </div>

            {/* Points Balance Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 min-w-[280px]">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${userTier.color} flex items-center justify-center text-2xl`}>
                  {userTier.icon}
                </div>
                <div>
                  <p className="text-sm text-purple-200">{userTier.name} Member</p>
                  <p className="text-2xl font-bold">{userPoints.toLocaleString()} pts</p>
                </div>
              </div>
              {nextTier && (
                <div>
                  <div className="flex justify-between text-sm text-purple-200 mb-1">
                    <span>Progress to {nextTier.name}</span>
                    <span>{nextTier.minPoints - userPoints} pts to go</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full"
                      style={{ width: `${(userPoints / nextTier.minPoints) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        {/* Tier Benefits */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            Membership Tiers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`p-4 rounded-xl border-2 transition-all ${
                  userTier.name === tier.name
                    ? 'border-purple-500 bg-purple-50'
                    : userPoints >= tier.minPoints
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-gray-200 opacity-60'
                }`}
              >
                <div className="text-2xl mb-2">{tier.icon}</div>
                <p className="font-semibold text-gray-900">{tier.name}</p>
                <p className="text-sm text-gray-500">{tier.minPoints.toLocaleString()}+ pts</p>
                {userTier.name === tier.name && (
                  <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-purple-600">
                    <Check className="w-3 h-3" /> Current Tier
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredRewards.map((reward, index) => {
            const canAfford = userPoints >= reward.pointsCost;

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative bg-white rounded-2xl border p-5 transition-all ${
                  canAfford
                    ? 'border-gray-200 hover:border-purple-300 hover:shadow-lg cursor-pointer'
                    : 'border-gray-200 opacity-60'
                }`}
                onClick={() => canAfford && setSelectedReward(reward)}
              >
                {reward.limitedTime && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Limited
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-3xl">
                    {reward.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{reward.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{reward.description}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span className={`font-semibold ${canAfford ? 'text-purple-600' : 'text-gray-400'}`}>
                      {reward.pointsCost.toLocaleString()} pts
                    </span>
                  </div>
                  {reward.value && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
                      {reward.value}
                    </span>
                  )}
                </div>

                {!canAfford && (
                  <p className="mt-3 text-xs text-gray-400">
                    Need {(reward.pointsCost - userPoints).toLocaleString()} more points
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Redemption History */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            Redemption History
          </h2>

          {MOCK_HISTORY.length > 0 ? (
            <div className="space-y-3">
              {MOCK_HISTORY.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl">
                      {item.reward.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.reward.name}</p>
                      <p className="text-sm text-gray-500">
                        Redeemed {new Date(item.redeemedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'used'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.status === 'active' && <Check className="w-3 h-3" />}
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                    {item.code && item.status === 'active' && (
                      <p className="text-sm font-mono mt-1 text-gray-600">{item.code}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No redemptions yet</p>
              <p className="text-sm">Redeem your first reward above!</p>
            </div>
          )}
        </div>
      </div>

      {/* Redeem Confirmation Modal */}
      <AnimatePresence>
        {selectedReward && !showRedeemConfirm && !redeemSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReward(null)}
          >
            <div className="absolute inset-0 bg-black/50" />
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">
                  {selectedReward.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedReward.name}</h3>
                <p className="text-gray-600">{selectedReward.description}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cost</span>
                  <span className="font-semibold text-purple-600 flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    {selectedReward.pointsCost.toLocaleString()} points
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-600">Your Balance</span>
                  <span className="font-semibold">{userPoints.toLocaleString()} points</span>
                </div>
                <hr className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">After Redemption</span>
                  <span className="font-semibold text-green-600">
                    {(userPoints - selectedReward.pointsCost).toLocaleString()} points
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedReward(null)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowRedeemConfirm(true)}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
                >
                  Redeem Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showRedeemConfirm && selectedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50" />
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative bg-white rounded-2xl max-w-sm w-full p-6 text-center"
            >
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Confirm Redemption?</h3>
              <p className="text-gray-600 mb-6">
                You're about to redeem <strong>{selectedReward.name}</strong> for{' '}
                <strong>{selectedReward.pointsCost.toLocaleString()} points</strong>.
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRedeemConfirm(false)}
                  disabled={redeemMutation.isPending}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Go Back
                </button>
                <button
                  onClick={handleRedeem}
                  disabled={redeemMutation.isPending}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {redeemMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {redeemSuccess && selectedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setRedeemSuccess(false);
              setSelectedReward(null);
            }}
          >
            <div className="absolute inset-0 bg-black/50" />
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative bg-white rounded-2xl max-w-sm w-full p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Reward Redeemed!</h3>
              <p className="text-gray-600 mb-4">
                You've successfully redeemed <strong>{selectedReward.name}</strong>
              </p>
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Your reward code:</p>
                <p className="font-mono text-lg font-bold text-purple-600">
                  REWARD-{Math.random().toString(36).substring(7).toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => {
                  setRedeemSuccess(false);
                  setSelectedReward(null);
                }}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
