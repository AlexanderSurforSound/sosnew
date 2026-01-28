'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  Calendar,
  Award,
  Heart,
  Gift,
  Settings,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  Sparkles,
  Trophy,
  Target,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useFavorites } from '@/contexts/FavoritesContext';

export default function AccountDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { favorites } = useFavorites();

  // Fetch upcoming trips
  const { data: upcomingTrips } = useQuery({
    queryKey: ['upcomingTrips'],
    queryFn: () => api.getUpcomingTrips(),
    enabled: !!user,
  });

  // Fetch achievements
  const { data: achievements } = useQuery({
    queryKey: ['myAchievements'],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/me/achievements`,
        {
          headers: {
            Authorization: `Bearer ${api.getToken()}`,
          },
        }
      );
      if (!response.ok) return { earned: [], progress: [] };
      return response.json();
    },
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-ocean-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in to view your account</h1>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-ocean-600 text-white rounded-lg font-medium hover:bg-ocean-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const currentTrip = upcomingTrips?.find((t) => t.isCurrentTrip);
  const nextTrip = upcomingTrips?.find((t) => !t.isCurrentTrip && t.daysUntil >= 0);

  const recentAchievements = achievements?.earned?.slice(0, 3) || [];
  const achievementProgress = achievements?.progress?.slice(0, 2) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-ocean-700 via-ocean-600 to-ocean-800 text-white">
        <div className="container-page py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.firstName || 'User'}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome back, {user.firstName || 'Guest'}!
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="px-3 py-1 bg-amber-400 text-amber-900 rounded-full text-sm font-semibold">
                    {user.loyaltyTier || 'Explorer'}
                  </span>
                  <span className="text-ocean-200 flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    {user.loyaltyPoints?.toLocaleString() || 0} points
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{user.totalStays || 0}</p>
                <p className="text-sm text-ocean-200">Total Stays</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{favorites.length}</p>
                <p className="text-sm text-ocean-200">Favorites</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{recentAchievements.length}</p>
                <p className="text-sm text-ocean-200">Achievements</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current/Upcoming Trip Banner */}
            {(currentTrip || nextTrip) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {currentTrip ? (
                  <Link
                    href={`/trips/${currentTrip.reservationId}`}
                    className="block bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium mb-1">
                          YOU'RE ON VACATION!
                        </p>
                        <h2 className="text-2xl font-bold mb-2">{currentTrip.propertyName}</h2>
                        <p className="text-green-100 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {currentTrip.village || 'Hatteras Island'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold">Day {Math.abs(currentTrip.daysUntil) + 1}</p>
                        <p className="text-green-100">of your trip</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-green-100">View your trip dashboard</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </Link>
                ) : nextTrip ? (
                  <Link
                    href={`/trips/${nextTrip.reservationId}`}
                    className="block bg-gradient-to-r from-ocean-500 to-blue-600 rounded-2xl p-6 text-white hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium mb-1">
                          UPCOMING TRIP
                        </p>
                        <h2 className="text-2xl font-bold mb-2">{nextTrip.propertyName}</h2>
                        <p className="text-blue-100 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(nextTrip.checkIn).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-5xl font-bold">{nextTrip.daysUntil}</p>
                        <p className="text-blue-100">days to go</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-blue-100">Prepare for your trip</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </Link>
                ) : null}
              </motion.div>
            )}

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  href: '/properties',
                  icon: MapPin,
                  title: 'Find a Property',
                  description: 'Browse vacation rentals',
                  color: 'bg-ocean-50 text-ocean-600',
                },
                {
                  href: '/account/bookings',
                  icon: Calendar,
                  title: 'My Bookings',
                  description: 'View past & upcoming trips',
                  color: 'bg-purple-50 text-purple-600',
                },
                {
                  href: '/favorites',
                  icon: Heart,
                  title: 'Favorites',
                  description: `${favorites.length} saved properties`,
                  color: 'bg-red-50 text-red-600',
                },
                {
                  href: '/account/rewards',
                  icon: Gift,
                  title: 'Rewards',
                  description: 'Redeem your points',
                  color: 'bg-amber-50 text-amber-600',
                },
              ].map((action, index) => (
                <motion.div
                  key={action.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={action.href}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color}`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Achievement Progress */}
            {achievementProgress.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-ocean-600" />
                    Almost There!
                  </h2>
                  <Link
                    href="/account/achievements"
                    className="text-sm text-ocean-600 hover:text-ocean-700 font-medium"
                  >
                    View All
                  </Link>
                </div>

                <div className="space-y-4">
                  {achievementProgress.map((achievement: any) => (
                    <div key={achievement.id} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                        {achievement.icon || '🎯'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{achievement.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-ocean-500 to-ocean-600 rounded-full"
                              style={{ width: `${(achievement.current / achievement.target) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500">
                            {achievement.current}/{achievement.target}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Achievements */}
            {recentAchievements.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Recent Achievements
                  </h2>
                  <Link
                    href="/account/achievements"
                    className="text-sm text-ocean-600 hover:text-ocean-700 font-medium"
                  >
                    View All
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {recentAchievements.map((achievement: any) => (
                    <div
                      key={achievement.id}
                      className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl"
                    >
                      <div className="text-3xl mb-2">{achievement.icon || '🏆'}</div>
                      <p className="font-medium text-gray-900 text-sm">{achievement.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(achievement.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Loyalty Card */}
            <div className="bg-gradient-to-br from-ocean-600 via-ocean-700 to-ocean-800 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Sparkles className="w-8 h-8 text-amber-300" />
                <span className="text-sm text-ocean-200">Member Since 2023</span>
              </div>

              <p className="text-3xl font-bold mb-1">
                {user.loyaltyPoints?.toLocaleString() || 0}
              </p>
              <p className="text-ocean-200 text-sm mb-4">Reward Points</p>

              <div className="bg-white/20 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-ocean-100">{user.loyaltyTier || 'Explorer'}</span>
                  <span className="text-ocean-100">Next: Adventurer</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${Math.min((user.loyaltyPoints || 0) / 1000 * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-ocean-200 mt-2">
                  {Math.max(0, 1000 - (user.loyaltyPoints || 0))} points to next tier
                </p>
              </div>

              <Link
                href="/account/rewards"
                className="block w-full text-center py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
              >
                View Rewards
              </Link>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-gray-200 divide-y">
              {[
                { href: '/account/profile', icon: User, label: 'Edit Profile' },
                { href: '/account/settings', icon: Settings, label: 'Settings' },
                { href: '/account/achievements', icon: Trophy, label: 'Achievements' },
                { href: '/account/referrals', icon: Gift, label: 'Refer & Earn' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                >
                  <link.icon className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">{link.label}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                </Link>
              ))}
            </div>

            {/* Sandy AI Tip */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sandy's Tip</p>
                  <p className="text-xs text-gray-500">Your AI Concierge</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                {nextTrip
                  ? `Pack light layers! Weather on Hatteras Island can change quickly. Don't forget sunscreen!`
                  : `Looking for your next adventure? Spring is a great time for fishing and fewer crowds!`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
