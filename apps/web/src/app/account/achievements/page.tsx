'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Trophy,
  Star,
  Lock,
  Check,
  ChevronRight,
  Sparkles,
  Calendar,
  MapPin,
  Heart,
  MessageSquare,
  Users,
  Gift,
  Zap,
  Award,
  Target,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  earnedAt?: string;
  progress?: {
    current: number;
    target: number;
  };
  isSecret?: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Trophy },
  { id: 'booking', name: 'Bookings', icon: Calendar },
  { id: 'explorer', name: 'Explorer', icon: MapPin },
  { id: 'social', name: 'Social', icon: Users },
  { id: 'special', name: 'Special', icon: Star },
];

const RARITY_COLORS = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-500 to-purple-700',
  legendary: 'from-amber-400 to-orange-500',
};

const RARITY_BG = {
  common: 'bg-gray-50 border-gray-200',
  rare: 'bg-blue-50 border-blue-200',
  epic: 'bg-purple-50 border-purple-200',
  legendary: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200',
};

// Mock achievements for demonstration
const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    name: 'First Voyage',
    description: 'Complete your first booking',
    icon: '🚀',
    category: 'booking',
    points: 100,
    earnedAt: '2024-06-15',
    rarity: 'common',
  },
  {
    id: '2',
    name: 'Return Guest',
    description: 'Book your second stay',
    icon: '🔄',
    category: 'booking',
    points: 250,
    earnedAt: '2024-08-20',
    rarity: 'common',
  },
  {
    id: '3',
    name: 'Village Hopper',
    description: 'Stay in 3 different villages',
    icon: '🏘️',
    category: 'explorer',
    points: 500,
    progress: { current: 2, target: 3 },
    rarity: 'rare',
  },
  {
    id: '4',
    name: 'Island Expert',
    description: 'Stay in all 7 Hatteras villages',
    icon: '🗺️',
    category: 'explorer',
    points: 2000,
    progress: { current: 2, target: 7 },
    rarity: 'legendary',
  },
  {
    id: '5',
    name: 'Wordsmith',
    description: 'Write your first review',
    icon: '✍️',
    category: 'social',
    points: 150,
    rarity: 'common',
  },
  {
    id: '6',
    name: 'Trendsetter',
    description: 'Share a property with friends',
    icon: '📢',
    category: 'social',
    points: 100,
    earnedAt: '2024-07-10',
    rarity: 'common',
  },
  {
    id: '7',
    name: 'Loyal Islander',
    description: 'Complete 5 stays with us',
    icon: '🏝️',
    category: 'booking',
    points: 1000,
    progress: { current: 2, target: 5 },
    rarity: 'epic',
  },
  {
    id: '8',
    name: 'Winter Wanderer',
    description: 'Book a stay during off-season',
    icon: '❄️',
    category: 'special',
    points: 300,
    rarity: 'rare',
  },
  {
    id: '9',
    name: 'Early Bird',
    description: 'Book 60+ days in advance',
    icon: '🐦',
    category: 'booking',
    points: 200,
    earnedAt: '2024-05-01',
    rarity: 'common',
  },
  {
    id: '10',
    name: 'Ambassador',
    description: 'Refer 3 friends who book',
    icon: '🤝',
    category: 'social',
    points: 1500,
    progress: { current: 1, target: 3 },
    rarity: 'epic',
  },
  {
    id: '11',
    name: 'Hidden Gem',
    description: '???',
    icon: '🔮',
    category: 'special',
    points: 500,
    isSecret: true,
    rarity: 'rare',
  },
  {
    id: '12',
    name: 'Lighthouse Keeper',
    description: 'Stay near Cape Hatteras Lighthouse',
    icon: '🗼',
    category: 'explorer',
    points: 300,
    rarity: 'rare',
  },
];

export default function AchievementsPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Fetch achievements from API
  const { data: achievementsData, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/achievements`,
          {
            headers: {
              ...(api.getToken() ? { Authorization: `Bearer ${api.getToken()}` } : {}),
            },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      } catch {
        return { achievements: MOCK_ACHIEVEMENTS };
      }
    },
  });

  const achievements = achievementsData?.achievements || MOCK_ACHIEVEMENTS;

  const filteredAchievements =
    activeCategory === 'all'
      ? achievements
      : achievements.filter((a: Achievement) => a.category === activeCategory);

  const earnedCount = achievements.filter((a: Achievement) => a.earnedAt).length;
  const totalPoints = achievements
    .filter((a: Achievement) => a.earnedAt)
    .reduce((sum: number, a: Achievement) => sum + a.points, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white">
        <div className="container-page py-8">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Account
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
                <Trophy className="w-8 h-8" />
                Achievements
              </h1>
              <p className="text-white/80">
                Collect badges and earn rewards for your adventures
              </p>
            </div>

            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold">{earnedCount}</p>
                <p className="text-sm text-white/80">Earned</p>
              </div>
              <div className="w-px bg-white/30" />
              <div className="text-center">
                <p className="text-4xl font-bold">{achievements.length}</p>
                <p className="text-sm text-white/80">Total</p>
              </div>
              <div className="w-px bg-white/30" />
              <div className="text-center">
                <p className="text-4xl font-bold">{totalPoints.toLocaleString()}</p>
                <p className="text-sm text-white/80">Points</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                activeCategory === category.id
                  ? 'bg-ocean-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <category.icon className="w-4 h-4" />
              {category.name}
            </button>
          ))}
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-ocean-600" />
            Your Progress
          </h2>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
                style={{ width: `${(earnedCount / achievements.length) * 100}%` }}
              />
            </div>
            <span className="font-medium text-gray-900">
              {Math.round((earnedCount / achievements.length) * 100)}%
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {achievements.length - earnedCount} achievements remaining to unlock
          </p>
        </div>

        {/* Achievements Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement: Achievement, index: number) => (
            <motion.button
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedAchievement(achievement)}
              className={`relative p-5 rounded-2xl border text-left transition-all hover:shadow-lg ${
                achievement.earnedAt
                  ? RARITY_BG[achievement.rarity]
                  : 'bg-gray-100 border-gray-200'
              }`}
            >
              {/* Rarity Badge */}
              {achievement.earnedAt && (
                <div
                  className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${
                    RARITY_COLORS[achievement.rarity]
                  }`}
                >
                  {achievement.rarity}
                </div>
              )}

              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                    achievement.earnedAt
                      ? 'bg-white shadow-sm'
                      : 'bg-gray-200 grayscale opacity-50'
                  }`}
                >
                  {achievement.isSecret && !achievement.earnedAt ? '❓' : achievement.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold mb-1 ${
                      achievement.earnedAt ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {achievement.isSecret && !achievement.earnedAt ? '???' : achievement.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {achievement.isSecret && !achievement.earnedAt
                      ? 'Complete a secret challenge to unlock'
                      : achievement.description}
                  </p>

                  {/* Progress Bar */}
                  {achievement.progress && !achievement.earnedAt && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>
                          {achievement.progress.current}/{achievement.progress.target}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-ocean-500 to-ocean-600 rounded-full"
                          style={{
                            width: `${(achievement.progress.current / achievement.progress.target) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Earned Badge */}
                  {achievement.earnedAt && (
                    <div className="flex items-center gap-2 mt-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-gray-500">
                        Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Points */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className={achievement.earnedAt ? 'text-amber-600 font-medium' : 'text-gray-400'}>
                    {achievement.points} pts
                  </span>
                </div>
                {!achievement.earnedAt && <Lock className="w-4 h-4 text-gray-400" />}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAchievement(null)}
          >
            <div className="absolute inset-0 bg-black/50" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl max-w-md w-full p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`w-24 h-24 mx-auto mb-4 rounded-2xl flex items-center justify-center text-5xl ${
                  selectedAchievement.earnedAt
                    ? `bg-gradient-to-br ${RARITY_COLORS[selectedAchievement.rarity]}`
                    : 'bg-gray-200'
                }`}
              >
                <span className={selectedAchievement.earnedAt ? '' : 'grayscale opacity-50'}>
                  {selectedAchievement.icon}
                </span>
              </div>

              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white mb-3 bg-gradient-to-r ${
                  RARITY_COLORS[selectedAchievement.rarity]
                }`}
              >
                {selectedAchievement.rarity.toUpperCase()}
              </span>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedAchievement.name}
              </h3>
              <p className="text-gray-600 mb-4">{selectedAchievement.description}</p>

              <div className="flex items-center justify-center gap-2 text-amber-600 font-semibold text-lg mb-6">
                <Award className="w-5 h-5" />
                {selectedAchievement.points} Points
              </div>

              {selectedAchievement.earnedAt ? (
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Achievement Unlocked!</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Earned on {new Date(selectedAchievement.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              ) : selectedAchievement.progress ? (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {selectedAchievement.progress.current} / {selectedAchievement.progress.target}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-ocean-500 to-ocean-600 rounded-full"
                      style={{
                        width: `${(selectedAchievement.progress.current / selectedAchievement.progress.target) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-500">
                  <Lock className="w-5 h-5" />
                  <span>Not yet unlocked</span>
                </div>
              )}

              <button
                onClick={() => setSelectedAchievement(null)}
                className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
