'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart2,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';

type TimeRange = '7d' | '30d' | '90d' | '12m';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: () => api.getAnalytics(timeRange),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">Detailed insights into your business performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="12m">Last 12 Months</option>
          </select>
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${(analytics?.totalRevenue || 0).toLocaleString()}`}
          change={analytics?.revenueChange || 0}
          icon={DollarSign}
          trend={analytics?.revenueTrend || []}
        />
        <MetricCard
          title="Bookings"
          value={String(analytics?.totalBookings || 0)}
          change={analytics?.bookingsChange || 0}
          icon={Calendar}
          trend={analytics?.bookingsTrend || []}
        />
        <MetricCard
          title="Avg. Daily Rate"
          value={`$${(analytics?.avgDailyRate || 0).toFixed(0)}`}
          change={analytics?.adrChange || 0}
          icon={TrendingUp}
          trend={analytics?.adrTrend || []}
        />
        <MetricCard
          title="Occupancy Rate"
          value={`${(analytics?.occupancyRate || 0).toFixed(1)}%`}
          change={analytics?.occupancyChange || 0}
          icon={BarChart2}
          trend={analytics?.occupancyTrend || []}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-primary-500 rounded-full" />
                Revenue
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-gray-300 rounded-full" />
                Last Period
              </span>
            </div>
          </div>
          <RevenueChart data={analytics?.revenueByDay || []} />
        </div>

        {/* Bookings Funnel */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Booking Funnel</h3>
          </div>
          <BookingFunnel data={analytics?.funnel || {}} />
        </div>
      </div>

      {/* Performance Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Properties */}
        <div className="card">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Top Performing Properties</h3>
          </div>
          <div className="divide-y">
            {(analytics?.topProperties || mockTopProperties).slice(0, 5).map((property, i) => (
              <div key={property.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{property.name}</p>
                    <p className="text-sm text-gray-500">{property.village}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${property.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{property.bookings} bookings</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Village */}
        <div className="card">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Revenue by Village</h3>
          </div>
          <div className="p-4">
            {(analytics?.revenueByVillage || mockVillageRevenue).map((village) => (
              <div key={village.name} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{village.name}</span>
                  <span className="text-sm text-gray-500">${village.revenue.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${village.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Guest Demographics */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Guest Demographics</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Booking Sources */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-4">Booking Sources</h4>
            <div className="space-y-3">
              {(analytics?.bookingSources || mockBookingSources).map((source) => (
                <div key={source.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{source.name}</span>
                  <span className="text-sm font-medium">{source.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trip Types */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-4">Trip Types</h4>
            <div className="space-y-3">
              {(analytics?.tripTypes || mockTripTypes).map((type) => (
                <div key={type.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{type.name}</span>
                  <span className="text-sm font-medium">{type.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guest Origins */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-4">Top Guest Origins</h4>
            <div className="space-y-3">
              {(analytics?.guestOrigins || mockGuestOrigins).map((origin) => (
                <div key={origin.state} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{origin.state}</span>
                  <span className="text-sm font-medium">{origin.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  change: number;
  icon: any;
  trend: number[];
}) {
  const isPositive = change >= 0;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-600" />
        </div>
        {change !== 0 && (
          <div
            className={`flex items-center gap-1 text-sm ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
      {/* Mini Sparkline */}
      {trend.length > 0 && (
        <div className="mt-3 flex items-end gap-0.5 h-8">
          {trend.map((val, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm ${isPositive ? 'bg-green-200' : 'bg-red-200'}`}
              style={{ height: `${(val / Math.max(...trend)) * 100}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RevenueChart({ data }: { data: { date: string; revenue: number; previousRevenue: number }[] }) {
  if (!data.length) {
    data = mockRevenueData;
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.revenue, d.previousRevenue)));

  return (
    <div className="h-64 flex items-end gap-1">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex items-end justify-center gap-0.5 h-48">
            <div
              className="w-3 bg-gray-200 rounded-t"
              style={{ height: `${(item.previousRevenue / maxValue) * 100}%` }}
            />
            <div
              className="w-3 bg-primary-500 rounded-t"
              style={{ height: `${(item.revenue / maxValue) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left whitespace-nowrap">
            {item.date}
          </span>
        </div>
      ))}
    </div>
  );
}

function BookingFunnel({ data }: { data: { views?: number; searches?: number; inquiries?: number; bookings?: number } }) {
  const funnel = [
    { name: 'Property Views', value: data.views || 45230, color: 'bg-blue-500' },
    { name: 'Searches', value: data.searches || 12450, color: 'bg-purple-500' },
    { name: 'Inquiries', value: data.inquiries || 856, color: 'bg-amber-500' },
    { name: 'Bookings', value: data.bookings || 234, color: 'bg-green-500' },
  ];

  const maxValue = funnel[0].value;

  return (
    <div className="space-y-4">
      {funnel.map((step, i) => {
        const conversionRate = i > 0 ? ((step.value / funnel[i - 1].value) * 100).toFixed(1) : null;

        return (
          <div key={step.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{step.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{step.value.toLocaleString()}</span>
                {conversionRate && (
                  <span className="text-xs text-gray-500">({conversionRate}%)</span>
                )}
              </div>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className={`h-full ${step.color} rounded-lg transition-all`}
                style={{ width: `${(step.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Mock data
const mockTopProperties = [
  { id: '1', name: 'Oceanfront Paradise', village: 'Avon', revenue: 85420, bookings: 32 },
  { id: '2', name: 'Sunset Views', village: 'Buxton', revenue: 72350, bookings: 28 },
  { id: '3', name: 'Beach Haven', village: 'Rodanthe', revenue: 68900, bookings: 25 },
  { id: '4', name: 'Island Escape', village: 'Waves', revenue: 62100, bookings: 23 },
  { id: '5', name: 'Serenity Now', village: 'Salvo', revenue: 58750, bookings: 21 },
];

const mockVillageRevenue = [
  { name: 'Avon', revenue: 245000, percentage: 28 },
  { name: 'Buxton', revenue: 198000, percentage: 23 },
  { name: 'Rodanthe', revenue: 156000, percentage: 18 },
  { name: 'Waves', revenue: 134000, percentage: 15 },
  { name: 'Salvo', revenue: 89000, percentage: 10 },
  { name: 'Frisco', revenue: 52000, percentage: 6 },
];

const mockBookingSources = [
  { name: 'Direct Website', percentage: 45 },
  { name: 'VRBO', percentage: 28 },
  { name: 'Airbnb', percentage: 18 },
  { name: 'Phone', percentage: 9 },
];

const mockTripTypes = [
  { name: 'Family Vacation', percentage: 42 },
  { name: 'Couples Getaway', percentage: 25 },
  { name: 'Friends Trip', percentage: 18 },
  { name: 'Solo Travel', percentage: 8 },
  { name: 'Business', percentage: 7 },
];

const mockGuestOrigins = [
  { state: 'Virginia', percentage: 22 },
  { state: 'North Carolina', percentage: 18 },
  { state: 'Maryland', percentage: 12 },
  { state: 'Pennsylvania', percentage: 10 },
  { state: 'New York', percentage: 8 },
];

const mockRevenueData = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  revenue: Math.floor(Math.random() * 15000) + 5000,
  previousRevenue: Math.floor(Math.random() * 12000) + 4000,
}));
