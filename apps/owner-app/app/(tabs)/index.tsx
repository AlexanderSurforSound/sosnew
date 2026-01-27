import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Home,
  ChevronRight,
  AlertCircle,
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useState } from 'react';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['owner-stats'],
    queryFn: () => api.getOwnerStats(),
  });

  const { data: properties } = useQuery({
    queryKey: ['owner-properties'],
    queryFn: () => api.getOwnerProperties(),
  });

  const { data: upcomingReservations } = useQuery({
    queryKey: ['owner-upcoming-reservations'],
    queryFn: () => api.getOwnerReservations({ status: 'upcoming', limit: 5 }),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchStats();
    setRefreshing(false);
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Quick Stats */}
      <View className="px-4 py-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">This Month</Text>
        <View className="flex-row flex-wrap -mx-2">
          <StatCard
            title="Revenue"
            value={`$${(stats?.monthlyRevenue ?? 0).toLocaleString()}`}
            change={stats?.revenueChange ?? 0}
            icon={DollarSign}
          />
          <StatCard
            title="Bookings"
            value={String(stats?.monthlyBookings ?? 0)}
            change={stats?.bookingsChange ?? 0}
            icon={Calendar}
          />
          <StatCard
            title="Occupancy"
            value={`${stats?.occupancyRate ?? 0}%`}
            change={stats?.occupancyChange ?? 0}
            icon={Home}
          />
          <StatCard
            title="Avg. Rate"
            value={`$${stats?.averageRate ?? 0}`}
            change={stats?.rateChange ?? 0}
            icon={TrendingUp}
          />
        </View>
      </View>

      {/* Alerts */}
      {stats?.alerts && stats.alerts.length > 0 && (
        <View className="px-4 mb-6">
          <View className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <View className="flex-row items-center mb-2">
              <AlertCircle color="#d97706" size={20} />
              <Text className="text-amber-800 font-semibold ml-2">
                Action Required
              </Text>
            </View>
            {stats.alerts.map((alert, index) => (
              <Text key={index} className="text-amber-700 text-sm mb-1">
                • {alert}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Properties Overview */}
      <View className="px-4 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-gray-900">Your Properties</Text>
          <Link href="/properties" asChild>
            <Pressable className="flex-row items-center">
              <Text className="text-blue-600 text-sm">View All</Text>
              <ChevronRight color="#2563eb" size={16} />
            </Pressable>
          </Link>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {properties?.map((property) => (
            <Link key={property.id} href={`/property/${property.id}`} asChild>
              <Pressable className="bg-white rounded-xl shadow-sm mr-4 w-64 overflow-hidden">
                <Image
                  source={{ uri: property.images[0]?.url }}
                  className="w-full h-32"
                  contentFit="cover"
                />
                <View className="p-3">
                  <Text className="font-semibold text-gray-900" numberOfLines={1}>
                    {property.name}
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    {property.bedrooms} BR • {property.bathrooms} BA
                  </Text>
                  <View className="flex-row items-center justify-between mt-2">
                    <View
                      className={`px-2 py-1 rounded-full ${
                        property.nextReservation
                          ? 'bg-green-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          property.nextReservation
                            ? 'text-green-700'
                            : 'text-gray-600'
                        }`}
                      >
                        {property.nextReservation
                          ? `Booked ${property.nextReservation}`
                          : 'Available'}
                      </Text>
                    </View>
                    <Text className="text-blue-600 font-semibold text-sm">
                      ${property.monthlyRevenue?.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </Link>
          ))}
        </ScrollView>
      </View>

      {/* Upcoming Reservations */}
      <View className="px-4 pb-8">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-gray-900">
            Upcoming Reservations
          </Text>
          <Link href="/calendar" asChild>
            <Pressable className="flex-row items-center">
              <Text className="text-blue-600 text-sm">Calendar</Text>
              <ChevronRight color="#2563eb" size={16} />
            </Pressable>
          </Link>
        </View>

        {upcomingReservations?.length === 0 ? (
          <View className="bg-white rounded-xl p-6 items-center">
            <Calendar color="#9ca3af" size={40} />
            <Text className="text-gray-500 mt-2">No upcoming reservations</Text>
          </View>
        ) : (
          upcomingReservations?.map((reservation) => (
            <Link
              key={reservation.id}
              href={`/reservation/${reservation.id}`}
              asChild
            >
              <Pressable className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900">
                      {reservation.property?.name}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      {reservation.guestName} • {reservation.adults + reservation.children} guests
                    </Text>
                    <Text className="text-blue-600 text-sm mt-1">
                      {reservation.checkIn} - {reservation.checkOut}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-gray-900 font-semibold">
                      ${reservation.totalAmount.toLocaleString()}
                    </Text>
                    <View
                      className={`mt-1 px-2 py-1 rounded-full ${
                        reservation.status === 'confirmed'
                          ? 'bg-green-100'
                          : 'bg-yellow-100'
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          reservation.status === 'confirmed'
                            ? 'text-green-700'
                            : 'text-yellow-700'
                        }`}
                      >
                        {reservation.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            </Link>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: number;
  icon: any;
}) {
  const isPositive = change >= 0;

  return (
    <View className="w-1/2 px-2 mb-4">
      <View className="bg-white rounded-xl p-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-2">
          <Icon color="#6b7280" size={20} />
          <View
            className={`flex-row items-center ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? (
              <TrendingUp color="#16a34a" size={14} />
            ) : (
              <TrendingDown color="#dc2626" size={14} />
            )}
            <Text
              className={`text-xs ml-1 ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {Math.abs(change)}%
            </Text>
          </View>
        </View>
        <Text className="text-2xl font-bold text-gray-900">{value}</Text>
        <Text className="text-gray-500 text-sm">{title}</Text>
      </View>
    </View>
  );
}
