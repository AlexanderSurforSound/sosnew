import { View, Text, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';
import { TrendingUp, DollarSign, Calendar, Users } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

type TimeRange = '7d' | '30d' | '90d' | '1y';

export default function AnalyticsScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  const { data: properties } = useQuery({
    queryKey: ['owner-properties'],
    queryFn: () => api.getOwnerProperties(),
  });

  const { data: analytics } = useQuery({
    queryKey: ['owner-analytics', timeRange, selectedProperty],
    queryFn: () => api.getOwnerAnalytics({
      timeRange,
      propertyId: selectedProperty ?? undefined,
    }),
  });

  const timeRangeOptions: { label: string; value: TimeRange }[] = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: '1 Year', value: '1y' },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Time Range Selector */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {timeRangeOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setTimeRange(option.value)}
              className={`px-4 py-2 rounded-full mr-2 ${
                timeRange === option.value ? 'bg-blue-600' : 'bg-gray-100'
              }`}
            >
              <Text
                className={
                  timeRange === option.value ? 'text-white' : 'text-gray-700'
                }
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Property Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-3 bg-white"
      >
        <Pressable
          onPress={() => setSelectedProperty(null)}
          className={`px-4 py-2 rounded-lg mr-2 border ${
            !selectedProperty
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <Text
            className={!selectedProperty ? 'text-blue-600' : 'text-gray-700'}
          >
            All Properties
          </Text>
        </Pressable>
        {properties?.map((property) => (
          <Pressable
            key={property.id}
            onPress={() => setSelectedProperty(property.id)}
            className={`px-4 py-2 rounded-lg mr-2 border ${
              selectedProperty === property.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <Text
              className={
                selectedProperty === property.id
                  ? 'text-blue-600'
                  : 'text-gray-700'
              }
              numberOfLines={1}
            >
              {property.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Key Metrics */}
      <View className="px-4 py-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Key Metrics
        </Text>

        <View className="flex-row flex-wrap -mx-2">
          <MetricCard
            icon={DollarSign}
            title="Total Revenue"
            value={`$${(analytics?.totalRevenue ?? 0).toLocaleString()}`}
            subtext={`+${analytics?.revenueGrowth ?? 0}% vs previous period`}
            positive={true}
          />
          <MetricCard
            icon={Calendar}
            title="Bookings"
            value={String(analytics?.totalBookings ?? 0)}
            subtext={`${analytics?.avgNightsPerBooking ?? 0} avg nights`}
            positive={true}
          />
          <MetricCard
            icon={TrendingUp}
            title="Occupancy Rate"
            value={`${analytics?.occupancyRate ?? 0}%`}
            subtext={`${analytics?.bookedNights ?? 0} of ${analytics?.availableNights ?? 0} nights`}
            positive={(analytics?.occupancyRate ?? 0) > 60}
          />
          <MetricCard
            icon={Users}
            title="Avg. Daily Rate"
            value={`$${analytics?.avgDailyRate ?? 0}`}
            subtext={`RevPAN: $${analytics?.revPan ?? 0}`}
            positive={true}
          />
        </View>
      </View>

      {/* Revenue Chart Placeholder */}
      <View className="px-4 mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Revenue Trend
        </Text>
        <View className="bg-white rounded-xl p-4 h-48 items-center justify-center">
          <View className="flex-row items-end h-32 space-x-2">
            {analytics?.revenueByPeriod?.map((item, index) => (
              <View key={index} className="items-center">
                <View
                  className="bg-blue-500 rounded-t w-8"
                  style={{
                    height: Math.max(
                      8,
                      (item.amount / (analytics?.maxRevenue || 1)) * 100
                    ),
                  }}
                />
                <Text className="text-xs text-gray-500 mt-1">{item.label}</Text>
              </View>
            )) ?? (
              <Text className="text-gray-400">No data available</Text>
            )}
          </View>
        </View>
      </View>

      {/* Top Performing Properties */}
      {!selectedProperty && (
        <View className="px-4 pb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Property Performance
          </Text>

          {analytics?.propertyPerformance?.map((property, index) => (
            <View
              key={property.id}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
                    <Text className="text-blue-600 font-bold">{index + 1}</Text>
                  </View>
                  <Text
                    className="flex-1 ml-3 font-semibold text-gray-900"
                    numberOfLines={1}
                  >
                    {property.name}
                  </Text>
                </View>
                <Text className="text-gray-900 font-semibold">
                  ${property.revenue.toLocaleString()}
                </Text>
              </View>

              <View className="flex-row justify-between mt-2">
                <View>
                  <Text className="text-gray-500 text-xs">Occupancy</Text>
                  <Text className="text-gray-900">{property.occupancy}%</Text>
                </View>
                <View>
                  <Text className="text-gray-500 text-xs">Bookings</Text>
                  <Text className="text-gray-900">{property.bookings}</Text>
                </View>
                <View>
                  <Text className="text-gray-500 text-xs">Avg Rate</Text>
                  <Text className="text-gray-900">${property.avgRate}</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${property.occupancy}%` }}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  subtext,
  positive,
}: {
  icon: any;
  title: string;
  value: string;
  subtext: string;
  positive: boolean;
}) {
  return (
    <View className="w-1/2 px-2 mb-4">
      <View className="bg-white rounded-xl p-4 shadow-sm">
        <View className="flex-row items-center mb-2">
          <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
            <Icon color="#2563eb" size={16} />
          </View>
        </View>
        <Text className="text-2xl font-bold text-gray-900">{value}</Text>
        <Text className="text-gray-500 text-sm">{title}</Text>
        <Text
          className={`text-xs mt-1 ${
            positive ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {subtext}
        </Text>
      </View>
    </View>
  );
}
