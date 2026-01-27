'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Star,
  Gift,
  Zap,
  Crown,
  Gem,
  ChevronRight,
  Check,
  Lock,
  Sparkles,
  Percent,
  Calendar,
  Coffee,
  Umbrella,
  Car,
} from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  icon: React.ReactNode;
  category: 'discount' | 'upgrade' | 'experience' | 'perk';
  available: boolean;
}

interface Tier {
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  minPoints: number;
  benefits: string[];
}

const tiers: Tier[] = [
  {
    name: 'Sand Dollar',
    icon: <Star className="w-6 h-6" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    minPoints: 0,
    benefits: ['Earn 1 point per $1 spent', 'Birthday bonus points', 'Member-only deals'],
  },
  {
    name: 'Starfish',
    icon: <Zap className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    minPoints: 1000,
    benefits: ['Earn 1.5 points per $1', 'Early access to new properties', 'Free late checkout'],
  },
  {
    name: 'Sea Turtle',
    icon: <Crown className="w-6 h-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    minPoints: 5000,
    benefits: ['Earn 2 points per $1', 'Priority customer support', 'Complimentary upgrades'],
  },
  {
    name: 'Lighthouse',
    icon: <Gem className="w-6 h-6" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    minPoints: 15000,
    benefits: ['Earn 3 points per $1', 'VIP concierge service', 'Exclusive properties access'],
  },
];

const rewards: Reward[] = [
  {
    id: '1',
    title: '$50 Off Next Stay',
    description: 'Get $50 off your next booking of $500+',
    pointsCost: 500,
    icon: <Percent className="w-6 h-6" />,
    category: 'discount',
    available: true,
  },
  {
    id: '2',
    title: '$100 Off Next Stay',
    description: 'Get $100 off your next booking of $1000+',
    pointsCost: 900,
    icon: <Percent className="w-6 h-6" />,
    category: 'discount',
    available: true,
  },
  {
    id: '3',
    title: 'Free Early Check-in',
    description: 'Check in at 1 PM instead of 4 PM',
    pointsCost: 300,
    icon: <Calendar className="w-6 h-6" />,
    category: 'perk',
    available: true,
  },
  {
    id: '4',
    title: 'Free Late Checkout',
    description: 'Extend checkout to 1 PM',
    pointsCost: 300,
    icon: <Calendar className="w-6 h-6" />,
    category: 'perk',
    available: true,
  },
  {
    id: '5',
    title: 'Beach Gear Package',
    description: 'Chairs, umbrella, and cooler waiting for you',
    pointsCost: 400,
    icon: <Umbrella className="w-6 h-6" />,
    category: 'experience',
    available: true,
  },
  {
    id: '6',
    title: 'Welcome Coffee Basket',
    description: 'Local coffee and treats upon arrival',
    pointsCost: 250,
    icon: <Coffee className="w-6 h-6" />,
    category: 'experience',
    available: true,
  },
  {
    id: '7',
    title: 'Airport Shuttle',
    description: 'Round-trip shuttle from Norfolk Airport',
    pointsCost: 1500,
    icon: <Car className="w-6 h-6" />,
    category: 'perk',
    available: false,
  },
  {
    id: '8',
    title: 'Property Upgrade',
    description: 'Upgrade to the next tier property',
    pointsCost: 2000,
    icon: <Sparkles className="w-6 h-6" />,
    category: 'upgrade',
    available: false,
  },
];

interface LoyaltyProgramProps {
  currentPoints?: number;
  lifetimePoints?: number;
  memberSince?: string;
}

export default function LoyaltyProgram({
  currentPoints = 1250,
  lifetimePoints = 3500,
  memberSince = 'January 2023',
}: LoyaltyProgramProps) {
  const [activeTab, setActiveTab] = useState<'rewards' | 'history' | 'tiers'>('rewards');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const currentTier = tiers.reduce((prev, curr) =>
    lifetimePoints >= curr.minPoints ? curr : prev
  );

  const nextTier = tiers.find((t) => t.minPoints > lifetimePoints);
  const pointsToNextTier = nextTier ? nextTier.minPoints - lifetimePoints : 0;
  const progressToNextTier = nextTier
    ? ((lifetimePoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  const filteredRewards =
    selectedCategory === 'all'
      ? rewards
      : rewards.filter((r) => r.category === selectedCategory);

  const canRedeem = (reward: Reward) => reward.available && currentPoints >= reward.pointsCost;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 ${currentTier.bgColor} rounded-xl flex items-center justify-center ${currentTier.color}`}>
              {currentTier.icon}
            </div>
            <div>
              <p className="text-amber-100 text-sm">Your Status</p>
              <h2 className="text-2xl font-bold">{currentTier.name}</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-amber-100 text-sm">Available Points</p>
            <p className="text-3xl font-bold">{currentPoints.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="bg-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>{currentTier.name}</span>
              <span>{nextTier.name}</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNextTier}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <p className="text-sm text-amber-100 mt-2">
              {pointsToNextTier.toLocaleString()} points to {nextTier.name}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{lifetimePoints.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Lifetime Points</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">12</p>
          <p className="text-sm text-gray-500">Stays</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{memberSince}</p>
          <p className="text-sm text-gray-500">Member Since</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <div className="flex">
          {[
            { id: 'rewards', label: 'Rewards', icon: Gift },
            { id: 'tiers', label: 'Tiers', icon: Crown },
            { id: 'history', label: 'History', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-amber-600 border-b-2 border-amber-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <>
            {/* Category Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['all', 'discount', 'perk', 'experience', 'upgrade'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'All Rewards' : cat + 's'}
                </button>
              ))}
            </div>

            {/* Rewards Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredRewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    canRedeem(reward)
                      ? 'border-gray-200 hover:border-amber-300 hover:shadow-md cursor-pointer'
                      : 'border-gray-100 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        canRedeem(reward)
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {reward.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{reward.title}</h3>
                      <p className="text-sm text-gray-500">{reward.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-gray-900">
                        {reward.pointsCost.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">points</span>
                    </div>
                    {canRedeem(reward) ? (
                      <button className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
                        Redeem
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-gray-400">
                        <Lock className="w-4 h-4" />
                        {!reward.available
                          ? 'Coming Soon'
                          : `Need ${(reward.pointsCost - currentPoints).toLocaleString()} more`}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Tiers Tab */}
        {activeTab === 'tiers' && (
          <div className="space-y-4">
            {tiers.map((tier, index) => {
              const isCurrentTier = tier.name === currentTier.name;
              const isUnlocked = lifetimePoints >= tier.minPoints;

              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border-2 ${
                    isCurrentTier
                      ? 'border-amber-500 bg-amber-50'
                      : isUnlocked
                      ? 'border-gray-200'
                      : 'border-gray-100 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 ${tier.bgColor} rounded-xl flex items-center justify-center ${tier.color}`}
                    >
                      {tier.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{tier.name}</h3>
                        {isCurrentTier && (
                          <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-medium rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        {tier.minPoints.toLocaleString()}+ lifetime points
                      </p>
                      <ul className="space-y-1">
                        {tier.benefits.map((benefit) => (
                          <li
                            key={benefit}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <Check
                              className={`w-4 h-4 ${
                                isUnlocked ? 'text-green-500' : 'text-gray-300'
                              }`}
                            />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {[
              { date: 'Jan 15, 2024', action: 'Stay at Oceanfront Paradise', points: 450, type: 'earned' },
              { date: 'Jan 10, 2024', action: 'Redeemed: Free Late Checkout', points: -300, type: 'redeemed' },
              { date: 'Dec 20, 2023', action: 'Stay at Sunset Beach House', points: 325, type: 'earned' },
              { date: 'Dec 15, 2023', action: 'Birthday Bonus', points: 100, type: 'bonus' },
              { date: 'Nov 28, 2023', action: 'Stay at Beach Haven', points: 550, type: 'earned' },
              { date: 'Nov 1, 2023', action: 'Referral Bonus', points: 200, type: 'bonus' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.action}</p>
                  <p className="text-sm text-gray-500">{item.date}</p>
                </div>
                <span
                  className={`font-bold ${
                    item.points > 0 ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {item.points > 0 ? '+' : ''}
                  {item.points.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
