'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  DollarSign,
  Calendar,
  TrendingUp,
  Star,
  Users,
  LogOut,
  ChevronRight,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface DashboardData {
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  properties: Array<{
    id: string;
    name: string;
    address: string;
    thumbnail: string;
    status: 'active' | 'inactive';
    currentBooking?: {
      guestName: string;
      checkIn: string;
      checkOut: string;
    };
    nextBooking?: {
      guestName: string;
      checkIn: string;
      checkOut: string;
    };
  }>;
  stats: {
    totalRevenue: number;
    revenueThisMonth: number;
    totalBookings: number;
    occupancyRate: number;
    upcomingBookings: number;
    averageRating: number;
  };
  recentBookings: Array<{
    id: string;
    propertyName: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    status: 'confirmed' | 'checked-in' | 'completed' | 'cancelled';
    revenue: number;
  }>;
}

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/owner/me');
      const result = await response.json();

      if (!response.ok || !result.authenticated) {
        // Not authenticated, redirect to login
        router.push('/owner-portal');
        return;
      }

      setData(result);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/owner/logout', { method: 'POST' });
      router.push('/owner-portal');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            <Clock className="w-3 h-3" />
            Confirmed
          </span>
        );
      case 'checked-in':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            Checked In
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">Failed to load dashboard</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/owner-portal')}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">Owner Portal</h1>
                <p className="text-xs text-gray-500">Welcome back, {data.owner.name}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${data.stats.totalRevenue.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">This Month</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              ${data.stats.revenueThisMonth.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Total Bookings</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.stats.totalBookings}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Building className="w-4 h-4" />
              <span className="text-xs font-medium">Occupancy</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.stats.occupancyRate}%</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Upcoming</span>
            </div>
            <p className="text-2xl font-bold text-cyan-600">{data.stats.upcomingBookings}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Star className="w-4 h-4" />
              <span className="text-xs font-medium">Avg Rating</span>
            </div>
            <p className="text-2xl font-bold text-amber-500">{data.stats.averageRating}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Properties */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Your Properties</h2>
              </div>

              <div className="divide-y divide-gray-100">
                {data.properties.map((property) => (
                  <div key={property.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{property.name}</h3>
                        <p className="text-sm text-gray-500">{property.address}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          property.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {property.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {property.currentBooking ? (
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-green-700 mb-1">Current Guest</p>
                          <p className="font-medium text-gray-900">{property.currentBooking.guestName}</p>
                          <p className="text-sm text-gray-600">
                            {property.currentBooking.checkIn} - {property.currentBooking.checkOut}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">Current Guest</p>
                          <p className="text-gray-400 italic">No current booking</p>
                        </div>
                      )}

                      {property.nextBooking ? (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-blue-700 mb-1">Next Booking</p>
                          <p className="font-medium text-gray-900">{property.nextBooking.guestName}</p>
                          <p className="text-sm text-gray-600">
                            {property.nextBooking.checkIn} - {property.nextBooking.checkOut}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">Next Booking</p>
                          <p className="text-gray-400 italic">No upcoming bookings</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
              </div>

              <div className="divide-y divide-gray-100">
                {data.recentBookings.map((booking) => (
                  <div key={booking.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{booking.guestName}</p>
                        <p className="text-sm text-gray-500">{booking.propertyName}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {booking.checkIn} - {booking.checkOut}
                      </span>
                      <span className="font-medium text-gray-900">
                        ${booking.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100">
                <button className="w-full flex items-center justify-center gap-2 py-2 text-cyan-600 hover:text-cyan-700 font-medium">
                  View All Bookings
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
