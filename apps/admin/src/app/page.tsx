'use client';

import {
  DollarSign,
  Calendar,
  Home,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { RecentReservations } from '@/components/dashboard/RecentReservations';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.getDashboardStats(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of your vacation rental business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${(stats?.totalRevenue ?? 0).toLocaleString()}`}
          change={stats?.revenueChange ?? 0}
          icon={DollarSign}
          subtitle="This month"
        />
        <StatCard
          title="Bookings"
          value={String(stats?.totalBookings ?? 0)}
          change={stats?.bookingsChange ?? 0}
          icon={Calendar}
          subtitle="This month"
        />
        <StatCard
          title="Active Properties"
          value={String(stats?.activeProperties ?? 0)}
          change={0}
          icon={Home}
          subtitle={`${stats?.occupiedTonight ?? 0} occupied tonight`}
        />
        <StatCard
          title="Guests"
          value={String(stats?.totalGuests ?? 0)}
          change={stats?.guestsChange ?? 0}
          icon={Users}
          subtitle="Registered users"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <RevenueChart data={stats?.revenueByMonth ?? []} />
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Rate</h3>
          <OccupancyChart data={stats?.occupancyByMonth ?? []} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Reservations</h3>
        </div>
        <RecentReservations />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  subtitle,
}: {
  title: string;
  value: string;
  change: number;
  icon: any;
  subtitle: string;
}) {
  const isPositive = change >= 0;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
        {change !== 0 && (
          <div
            className={`flex items-center text-sm ${
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
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
