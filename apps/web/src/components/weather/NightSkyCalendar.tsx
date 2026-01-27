'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Moon,
  Star,
  Sun,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
  Eye,
  Camera,
} from 'lucide-react';

interface MoonPhase {
  date: Date;
  phase: 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent';
  illumination: number;
  moonrise: string;
  moonset: string;
}

interface CelestialEvent {
  date: Date;
  name: string;
  description: string;
  type: 'meteor-shower' | 'eclipse' | 'planet-viewing' | 'special';
}

const celestialEvents: CelestialEvent[] = [
  {
    date: new Date(2024, 7, 12),
    name: 'Perseid Meteor Shower Peak',
    description: 'Up to 100 meteors per hour! Best viewing after midnight.',
    type: 'meteor-shower',
  },
  {
    date: new Date(2024, 7, 19),
    name: 'Blue Moon',
    description: 'Second full moon of the month - a rare occurrence.',
    type: 'special',
  },
  {
    date: new Date(2024, 8, 17),
    name: 'Partial Lunar Eclipse',
    description: 'Visible from the East Coast starting at 9:12 PM.',
    type: 'eclipse',
  },
  {
    date: new Date(2024, 9, 21),
    name: 'Orionid Meteor Shower',
    description: 'Debris from Halley\'s Comet creates 20+ meteors per hour.',
    type: 'meteor-shower',
  },
  {
    date: new Date(2024, 10, 15),
    name: 'Saturn at Opposition',
    description: 'Saturn will be at its brightest - visible all night.',
    type: 'planet-viewing',
  },
];

// Simplified moon phase calculation
const getMoonPhase = (date: Date): MoonPhase => {
  const synodicMonth = 29.53059;
  const knownNewMoon = new Date(2024, 0, 11).getTime();
  const daysSinceNew = (date.getTime() - knownNewMoon) / (1000 * 60 * 60 * 24);
  const moonAge = ((daysSinceNew % synodicMonth) + synodicMonth) % synodicMonth;

  let phase: MoonPhase['phase'];
  let illumination: number;

  if (moonAge < 1.85) {
    phase = 'new';
    illumination = 0;
  } else if (moonAge < 7.38) {
    phase = 'waxing-crescent';
    illumination = Math.round((moonAge / 7.38) * 50);
  } else if (moonAge < 9.23) {
    phase = 'first-quarter';
    illumination = 50;
  } else if (moonAge < 14.77) {
    phase = 'waxing-gibbous';
    illumination = Math.round(50 + ((moonAge - 9.23) / 5.54) * 50);
  } else if (moonAge < 16.61) {
    phase = 'full';
    illumination = 100;
  } else if (moonAge < 22.15) {
    phase = 'waning-gibbous';
    illumination = Math.round(100 - ((moonAge - 16.61) / 5.54) * 50);
  } else if (moonAge < 24) {
    phase = 'last-quarter';
    illumination = 50;
  } else {
    phase = 'waning-crescent';
    illumination = Math.round(50 - ((moonAge - 24) / 5.54) * 50);
  }

  // Approximate moonrise/set times
  const baseRise = 19 + Math.floor(moonAge / 2);
  const baseSet = 7 + Math.floor(moonAge / 2);

  return {
    date,
    phase,
    illumination,
    moonrise: `${baseRise % 24}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} PM`,
    moonset: `${baseSet % 12 || 12}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} AM`,
  };
};

interface NightSkyCalendarProps {
  tripDates?: { start: Date; end: Date };
}

export default function NightSkyCalendar({ tripDates }: NightSkyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add padding days from previous month
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add padding days for next month
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  }, [currentMonth]);

  const getPhaseIcon = (phase: MoonPhase['phase']) => {
    switch (phase) {
      case 'new':
        return '🌑';
      case 'waxing-crescent':
        return '🌒';
      case 'first-quarter':
        return '🌓';
      case 'waxing-gibbous':
        return '🌔';
      case 'full':
        return '🌕';
      case 'waning-gibbous':
        return '🌖';
      case 'last-quarter':
        return '🌗';
      case 'waning-crescent':
        return '🌘';
    }
  };

  const getStargazingRating = (moonPhase: MoonPhase) => {
    // Less moon = better stargazing
    if (moonPhase.illumination <= 25) return { rating: 5, label: 'Excellent' };
    if (moonPhase.illumination <= 50) return { rating: 4, label: 'Great' };
    if (moonPhase.illumination <= 75) return { rating: 3, label: 'Good' };
    return { rating: 2, label: 'Fair' };
  };

  const isInTripRange = (date: Date) => {
    if (!tripDates) return false;
    return date >= tripDates.start && date <= tripDates.end;
  };

  const hasEvent = (date: Date) => {
    return celestialEvents.some(
      (e) => e.date.toDateString() === date.toDateString()
    );
  };

  const getEvent = (date: Date) => {
    return celestialEvents.find(
      (e) => e.date.toDateString() === date.toDateString()
    );
  };

  const selectedMoonPhase = selectedDate ? getMoonPhase(selectedDate) : null;
  const selectedEvent = selectedDate ? getEvent(selectedDate) : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-900 to-purple-900 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Night Sky Calendar</h2>
              <p className="text-indigo-200 text-sm">
                Plan your stargazing adventures
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-400 rounded-full" />
            <span className="text-indigo-200">Celestial Event</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-ocean-400 rounded-full" />
            <span className="text-indigo-200">Your Trip</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-green-400" />
            <span className="text-indigo-200">Best Stargazing</span>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
            )
          }
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold text-gray-900">
          {currentMonth.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h3>
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
            )
          }
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((date, index) => {
            const moonPhase = getMoonPhase(date);
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();
            const inTrip = isInTripRange(date);
            const event = hasEvent(date);
            const stargazing = getStargazingRating(moonPhase);

            return (
              <motion.button
                key={index}
                onClick={() => setSelectedDate(date)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative aspect-square p-1 rounded-lg text-center transition-colors ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-300'
                } ${isToday ? 'ring-2 ring-indigo-500' : ''} ${
                  inTrip ? 'bg-ocean-100' : 'hover:bg-gray-100'
                } ${selectedDate?.toDateString() === date.toDateString() ? 'bg-indigo-100' : ''}`}
              >
                <div className="text-sm font-medium">{date.getDate()}</div>
                <div className="text-lg">{getPhaseIcon(moonPhase.phase)}</div>
                {stargazing.rating >= 4 && isCurrentMonth && (
                  <Star className="absolute top-1 right-1 w-3 h-3 text-green-500" />
                )}
                {event && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedMoonPhase && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-gray-100 bg-gray-50"
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">{getPhaseIcon(selectedMoonPhase.phase)}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">
                {selectedDate?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h4>
              <p className="text-sm text-gray-600 capitalize">
                {selectedMoonPhase.phase.replace('-', ' ')} Moon •{' '}
                {selectedMoonPhase.illumination}% illuminated
              </p>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs text-gray-500">Moonrise</p>
                  <p className="text-sm font-medium">{selectedMoonPhase.moonrise}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Moonset</p>
                  <p className="text-sm font-medium">{selectedMoonPhase.moonset}</p>
                </div>
              </div>

              {/* Stargazing Rating */}
              <div className="mt-3 p-3 bg-white rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stargazing Conditions</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < getStargazingRating(selectedMoonPhase).rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedMoonPhase.illumination <= 25
                    ? 'Perfect for viewing the Milky Way!'
                    : selectedMoonPhase.illumination >= 75
                    ? 'Bright moon may wash out fainter stars.'
                    : 'Good conditions for stargazing.'}
                </p>
              </div>
            </div>
          </div>

          {/* Event Details */}
          {selectedEvent && (
            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-amber-900">
                    {selectedEvent.name}
                  </h5>
                  <p className="text-sm text-amber-700">{selectedEvent.description}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Upcoming Events */}
      <div className="p-4 border-t border-gray-100">
        <h4 className="font-semibold text-gray-900 mb-3">Upcoming Celestial Events</h4>
        <div className="space-y-2">
          {celestialEvents
            .filter((e) => e.date >= new Date())
            .slice(0, 3)
            .map((event) => (
              <div
                key={event.name}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                  {event.type === 'meteor-shower' ? (
                    <Sparkles className="w-5 h-5" />
                  ) : event.type === 'eclipse' ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{event.name}</p>
                  <p className="text-xs text-gray-500">
                    {event.date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 bg-indigo-50 border-t border-indigo-100">
        <div className="flex items-start gap-3">
          <Camera className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-indigo-900">
              Hatteras Island has some of the darkest skies on the East Coast!
            </p>
            <p className="text-xs text-indigo-700 mt-1">
              The beach and Cape Point offer minimal light pollution for incredible views.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
