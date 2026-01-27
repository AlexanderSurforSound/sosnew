'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle, Calendar, Package, Users, Clock, Camera, Zap, Sparkles } from 'lucide-react';
import { api, TripDashboard as TripDashboardType } from '@/lib/api';
import { TripDashboard } from '@/components/trip/TripDashboard';
import { SmartHomeControls } from '@/components/trip/SmartHomeControls';
import { useAuth } from '@/hooks/useAuth';
import TripCountdown from '@/components/trips/TripCountdown';
import PackingList from '@/components/trips/PackingList';
import CalendarSync from '@/components/trips/CalendarSync';
import TripScrapbook from '@/components/trips/TripScrapbook';
import HouseManual from '@/components/property/HouseManual';

export default function TripDashboardPage() {
  const params = useParams();
  const reservationId = params.reservationId as string;
  const { user, isLoading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<TripDashboardType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      if (!user || !reservationId) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getTripDashboard(reservationId);
        setDashboard(data);
      } catch (err) {
        setError('Failed to load trip details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      fetchDashboard();
    }
  }, [user, authLoading, reservationId]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your trip details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in required</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your trip details.</p>
          <Link href="/login" className="btn-primary btn-lg">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="container-page py-16">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip not found</h1>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't find this trip. It may have been cancelled or you may not have access."}
          </p>
          <Link href="/trips" className="btn-primary btn-lg">
            View All Trips
          </Link>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'packing' | 'calendar' | 'manual' | 'memories'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Clock },
    { id: 'devices', label: 'Smart Home', icon: Zap },
    { id: 'packing', label: 'Packing', icon: Package },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'manual', label: 'House Manual', icon: Users },
    { id: 'memories', label: 'Memories', icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Countdown */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all trips
          </Link>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {dashboard.property.name}
              </h1>
              <p className="text-ocean-100">
                {new Date(dashboard.countdown.checkInDate).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric'
                })} - {new Date(dashboard.countdown.checkOutDate).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <TripCountdown
                checkInDate={new Date(dashboard.countdown.checkInDate)}
                checkOutDate={new Date(dashboard.countdown.checkOutDate)}
                propertyName={dashboard.property.name}
                location={dashboard.property.village || 'Hatteras Island, NC'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-4 font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-ocean-600 text-ocean-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <TripDashboard dashboard={dashboard} />
        )}

        {activeTab === 'devices' && (
          <SmartHomeControls
            reservationId={reservationId}
            checkInDate={dashboard.countdown.checkInDate}
            checkOutDate={dashboard.countdown.checkOutDate}
          />
        )}

        {activeTab === 'packing' && (
          <PackingList
            tripDuration={dashboard.countdown.tripDuration}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarSync
            tripName={`Trip to ${dashboard.property.name}`}
            checkIn={new Date(dashboard.countdown.checkInDate)}
            checkOut={new Date(dashboard.countdown.checkOutDate)}
            propertyName={dashboard.property.name}
            propertyAddress={dashboard.property.address || dashboard.property.village || ''}
          />
        )}

        {activeTab === 'manual' && (
          <HouseManual propertyName={dashboard.property.name} />
        )}

        {activeTab === 'memories' && (
          <TripScrapbook
            tripName={`Trip to ${dashboard.property.name}`}
            propertyName={dashboard.property.name}
            location={dashboard.property.village || 'Hatteras Island'}
            tripDates={{
              start: new Date(dashboard.countdown.checkInDate),
              end: new Date(dashboard.countdown.checkOutDate)
            }}
          />
        )}
      </div>
    </div>
  );
}
