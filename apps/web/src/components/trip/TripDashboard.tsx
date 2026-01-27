'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Users,
  Sun,
  Cloud,
  CloudSun,
  Umbrella,
  Wind,
  Thermometer,
  CheckCircle2,
  Circle,
  Clock,
  Wifi,
  Car,
  Key,
  CreditCard,
  Luggage,
  ChevronRight,
  Check,
  Sparkles,
  Home,
  Fish,
  Anchor,
  Ship,
  Bird,
  Sunset,
  Sailboat
} from 'lucide-react';
import type { TripDashboard as TripDashboardType, WeatherDay, ActivitySuggestion, PackingCategory, Milestone } from '@/lib/api';
import { cn } from '@/lib/utils';

interface TripDashboardProps {
  dashboard: TripDashboardType;
}

export function TripDashboard({ dashboard }: TripDashboardProps) {
  const { property, countdown, milestones, weather, activities, packingList, checkInInfo, guests, payment } = dashboard;

  return (
    <div className="space-y-8">
      {/* Hero Countdown Section */}
      <CountdownHero property={property} countdown={countdown} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Milestones Timeline */}
          <MilestonesSection milestones={milestones} />

          {/* Weather Forecast */}
          <WeatherSection weather={weather} />

          {/* Activity Suggestions */}
          <ActivitiesSection activities={activities} village={property.village} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Check-in Info Card */}
          <CheckInCard checkInInfo={checkInInfo} />

          {/* Guest Info */}
          <GuestCard guests={guests} />

          {/* Payment Status */}
          <PaymentCard payment={payment} />

          {/* Packing List */}
          <PackingListCard packingList={packingList} />
        </div>
      </div>
    </div>
  );
}

function CountdownHero({ property, countdown }: { property: TripDashboardType['property']; countdown: TripDashboardType['countdown'] }) {
  const [timeLeft, setTimeLeft] = useState({ days: countdown.daysUntilTrip, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const checkInDate = new Date(countdown.checkInDate + 'T16:00:00');

    const timer = setInterval(() => {
      const now = new Date();
      const diff = checkInDate.getTime() - now.getTime();

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown.checkInDate]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {property.primaryImage ? (
          <Image
            src={property.primaryImage}
            alt={property.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 md:p-12">
        <div className="max-w-3xl">
          {/* Phase Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-white text-sm font-medium">{countdown.phase} Phase</span>
          </div>

          {/* Property Name */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{property.name}</h1>
          <p className="text-white/80 flex items-center gap-2 mb-6">
            <MapPin className="w-4 h-4" />
            {property.village || 'Hatteras Island'}, NC
          </p>

          {/* Countdown Timer */}
          {countdown.daysUntilTrip > 0 ? (
            <div className="mb-6">
              <p className="text-white/70 text-sm mb-3">Your adventure begins in</p>
              <div className="flex gap-4">
                <CountdownUnit value={timeLeft.days} label="Days" />
                <CountdownUnit value={timeLeft.hours} label="Hours" />
                <CountdownUnit value={timeLeft.minutes} label="Minutes" />
                <CountdownUnit value={timeLeft.seconds} label="Seconds" />
              </div>
            </div>
          ) : countdown.phase === 'OnTrip' ? (
            <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-green-400/30">
              <p className="text-green-100 text-lg font-semibold">You're on vacation!</p>
              <p className="text-green-200/80">Enjoy every moment of your stay.</p>
            </div>
          ) : null}

          {/* Phase Message */}
          <p className="text-xl text-white/90 mb-6">{countdown.phaseMessage}</p>

          {/* Trip Dates */}
          <div className="flex flex-wrap gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Check-in: {formatDate(countdown.checkInDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Check-out: {formatDate(countdown.checkOutDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{countdown.tripDuration} nights</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-center min-w-[70px]">
      <div className="text-3xl font-bold text-white">{value.toString().padStart(2, '0')}</div>
      <div className="text-xs text-white/70 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function MilestonesSection({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Trip Timeline</h2>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="relative flex gap-4">
              {/* Icon */}
              <div
                className={cn(
                  'relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  milestone.isCompleted
                    ? 'bg-green-500 text-white'
                    : milestone.isCurrent
                    ? 'bg-blue-500 text-white ring-4 ring-blue-100'
                    : 'bg-gray-200 text-gray-500'
                )}
              >
                {milestone.isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <div className="flex items-center justify-between">
                  <h3
                    className={cn(
                      'font-medium',
                      milestone.isCompleted ? 'text-gray-500' : 'text-gray-900'
                    )}
                  >
                    {milestone.title}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {milestone.daysFromNow === 0
                      ? 'Today'
                      : milestone.daysFromNow > 0
                      ? `${milestone.daysFromNow} days`
                      : `${Math.abs(milestone.daysFromNow)} days ago`}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(milestone.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeatherSection({ weather }: { weather: WeatherDay[] }) {
  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sun':
        return <Sun className="w-8 h-8 text-amber-500" />;
      case 'cloud':
        return <Cloud className="w-8 h-8 text-gray-400" />;
      case 'cloud-sun':
        return <CloudSun className="w-8 h-8 text-amber-400" />;
      default:
        return <Sun className="w-8 h-8 text-amber-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Weather Forecast</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {weather.map((day) => (
          <div key={day.date} className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <p className="text-sm font-medium text-gray-900">{day.dayOfWeek}</p>
            <p className="text-xs text-gray-500 mb-2">
              {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
            <div className="flex justify-center mb-2">{getWeatherIcon(day.icon)}</div>
            <p className="text-xs text-gray-600 mb-2">{day.condition}</p>
            <div className="flex justify-center gap-2 text-sm">
              <span className="font-semibold text-gray-900">{day.highTemp}°</span>
              <span className="text-gray-400">{day.lowTemp}°</span>
            </div>
            {day.precipChance > 20 && (
              <p className="text-xs text-blue-500 mt-1 flex items-center justify-center gap-1">
                <Umbrella className="w-3 h-3" />
                {day.precipChance}%
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivitiesSection({ activities, village }: { activities: ActivitySuggestion[]; village?: string }) {
  const getActivityIcon = (icon: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'umbrella-beach': <Umbrella className="w-5 h-5" />,
      'landmark': <Home className="w-5 h-5" />,
      'water': <Sailboat className="w-5 h-5" />,
      'ship': <Ship className="w-5 h-5" />,
      'fish': <Fish className="w-5 h-5" />,
      'anchor': <Anchor className="w-5 h-5" />,
      'sailboat': <Sailboat className="w-5 h-5" />,
      'bird': <Bird className="w-5 h-5" />,
      'sunset': <Sunset className="w-5 h-5" />
    };
    return iconMap[icon] || <MapPin className="w-5 h-5" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Things to Do</h2>
        {village && <span className="text-sm text-gray-500">Near {village}</span>}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                {getActivityIcon(activity.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900">{activity.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-0.5 rounded">{activity.category}</span>
                  <span>{activity.duration}</span>
                  <span>{activity.distance}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckInCard({ checkInInfo }: { checkInInfo: TripDashboardType['checkInInfo'] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Key className="w-5 h-5 text-blue-600" />
        Check-In Information
      </h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Check-in Time</p>
          <p className="font-medium">{checkInInfo.time}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Address</p>
          <p className="font-medium">{checkInInfo.address}</p>
        </div>
        {checkInInfo.wifiName && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">WiFi</span>
            </div>
            <p className="text-sm">Network: <span className="font-mono">{checkInInfo.wifiName}</span></p>
            {checkInInfo.wifiPassword && (
              <p className="text-sm">Password: <span className="font-mono">{checkInInfo.wifiPassword}</span></p>
            )}
          </div>
        )}
        {checkInInfo.parkingInstructions && (
          <div className="flex items-start gap-2 text-sm">
            <Car className="w-4 h-4 text-gray-400 mt-0.5" />
            <p className="text-gray-600">{checkInInfo.parkingInstructions}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GuestCard({ guests }: { guests: TripDashboardType['guests'] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-600" />
        Guest Details
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Adults</span>
          <span className="font-medium">{guests.adults}</span>
        </div>
        {guests.children > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Children</span>
            <span className="font-medium">{guests.children}</span>
          </div>
        )}
        {guests.pets > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Pets</span>
            <span className="font-medium">{guests.pets}</span>
          </div>
        )}
        <div className="pt-2 border-t flex justify-between">
          <span className="text-gray-900 font-medium">Total Guests</span>
          <span className="font-semibold">{guests.total}</span>
        </div>
      </div>
    </div>
  );
}

function PaymentCard({ payment }: { payment: TripDashboardType['payment'] }) {
  const isPaid = payment.amountDue <= 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-blue-600" />
        Payment Status
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total</span>
          <span className="font-medium">${payment.totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Paid</span>
          <span className="font-medium text-green-600">${payment.amountPaid.toLocaleString()}</span>
        </div>
        {!isPaid && (
          <>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-gray-900 font-medium">Balance Due</span>
              <span className="font-semibold text-amber-600">${payment.amountDue.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500">Due by {new Date(payment.dueDate).toLocaleDateString()}</p>
          </>
        )}
        {isPaid && (
          <div className="bg-green-50 text-green-700 rounded-lg p-3 text-center text-sm font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Paid in Full
          </div>
        )}
      </div>
    </div>
  );
}

function PackingListCard({ packingList }: { packingList: PackingCategory[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    const newChecked = new Set(checkedItems);
    if (newChecked.has(key)) {
      newChecked.delete(key);
    } else {
      newChecked.add(key);
    }
    setCheckedItems(newChecked);
  };

  const totalItems = packingList.reduce((acc, cat) => acc + cat.items.length, 0);
  const packedItems = checkedItems.size;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Luggage className="w-5 h-5 text-blue-600" />
          Packing List
        </h3>
        <span className="text-sm text-gray-500">{packedItems}/{totalItems}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(packedItems / totalItems) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        {packingList.map((category, catIndex) => (
          <div key={category.category} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === category.category ? null : category.category)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900 text-sm">{category.category}</span>
              <ChevronRight
                className={cn(
                  'w-4 h-4 text-gray-400 transition-transform',
                  expanded === category.category && 'rotate-90'
                )}
              />
            </button>
            {expanded === category.category && (
              <div className="px-3 pb-3 space-y-1">
                {category.items.map((item, itemIndex) => {
                  const isChecked = checkedItems.has(`${catIndex}-${itemIndex}`);
                  return (
                    <label
                      key={item.name}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleItem(catIndex, itemIndex)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className={cn(
                        'text-sm',
                        isChecked ? 'text-gray-400 line-through' : 'text-gray-700'
                      )}>
                        {item.name}
                        {item.isEssential && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
