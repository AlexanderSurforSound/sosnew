'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  Leaf,
  Snowflake,
  Flower,
  Calendar,
  Waves,
  Fish,
  Bird,
  Camera,
  Music,
  Utensils,
  ShoppingBag,
  Star,
  ChevronRight,
  ThermometerSun,
  Users,
  DollarSign,
  Sparkles,
} from 'lucide-react';

type Season = 'spring' | 'summer' | 'fall' | 'winter';

interface SeasonalEvent {
  name: string;
  date: string;
  description: string;
  type: 'festival' | 'nature' | 'activity' | 'special';
}

interface SeasonInfo {
  id: Season;
  name: string;
  months: string;
  icon: React.ReactNode;
  gradient: string;
  avgTemp: { high: number; low: number };
  waterTemp: number;
  crowdLevel: 'Low' | 'Moderate' | 'High' | 'Peak';
  priceLevel: '$' | '$$' | '$$$';
  highlights: string[];
  events: SeasonalEvent[];
  bestFor: string[];
}

const seasons: SeasonInfo[] = [
  {
    id: 'spring',
    name: 'Spring',
    months: 'March - May',
    icon: <Flower className="w-6 h-6" />,
    gradient: 'from-green-400 to-emerald-500',
    avgTemp: { high: 72, low: 55 },
    waterTemp: 62,
    crowdLevel: 'Moderate',
    priceLevel: '$$',
    highlights: [
      'Perfect weather for outdoor activities',
      'Fewer crowds than summer',
      'Spring fishing runs begin',
      'Wildlife migrations passing through',
      'Off-season pricing available early',
    ],
    events: [
      {
        name: 'OBX Kite Festival',
        date: 'April',
        description: 'Colorful kites fill the sky at Jockey\'s Ridge',
        type: 'festival',
      },
      {
        name: 'Red Drum Run',
        date: 'March-May',
        description: 'Prime time for catching trophy red drum',
        type: 'activity',
      },
      {
        name: 'Shorebird Migration',
        date: 'April-May',
        description: 'Thousands of birds stop on Hatteras Island',
        type: 'nature',
      },
    ],
    bestFor: ['Fishing', 'Birdwatching', 'Kiteboarding', 'Value seekers'],
  },
  {
    id: 'summer',
    name: 'Summer',
    months: 'June - August',
    icon: <Sun className="w-6 h-6" />,
    gradient: 'from-amber-400 to-orange-500',
    avgTemp: { high: 88, low: 72 },
    waterTemp: 78,
    crowdLevel: 'Peak',
    priceLevel: '$$$',
    highlights: [
      'Warmest ocean water temperatures',
      'Perfect beach and swimming weather',
      'All attractions and restaurants open',
      'Sea turtle nesting season',
      'Offshore fishing at its best',
    ],
    events: [
      {
        name: 'Sea Turtle Nesting',
        date: 'June-August',
        description: 'Loggerhead turtles nest on Hatteras beaches',
        type: 'nature',
      },
      {
        name: 'Hatteras Village Offshore Open',
        date: 'July',
        description: 'Major fishing tournament with big prizes',
        type: 'activity',
      },
      {
        name: 'Fourth of July Celebrations',
        date: 'July 4th',
        description: 'Fireworks and festivities island-wide',
        type: 'special',
      },
      {
        name: 'Gulf Stream Fishing',
        date: 'All Summer',
        description: 'Mahi, tuna, and marlin are running',
        type: 'activity',
      },
    ],
    bestFor: ['Families', 'Beach lovers', 'Swimming', 'Offshore fishing'],
  },
  {
    id: 'fall',
    name: 'Fall',
    months: 'September - November',
    icon: <Leaf className="w-6 h-6" />,
    gradient: 'from-orange-400 to-red-500',
    avgTemp: { high: 75, low: 58 },
    waterTemp: 68,
    crowdLevel: 'Low',
    priceLevel: '$',
    highlights: [
      'Best surfing conditions of the year',
      'Spectacular sunsets and weather',
      'Fall fishing runs peak',
      'Lowest prices and fewest crowds',
      'Hurricane season (monitor weather)',
    ],
    events: [
      {
        name: 'Hatteras Day of the Dead Festival',
        date: 'Late October',
        description: 'Colorful celebration with music and food',
        type: 'festival',
      },
      {
        name: 'Fall Surf Season',
        date: 'September-November',
        description: 'Hurricane swells bring world-class waves',
        type: 'activity',
      },
      {
        name: 'Red Drum Fall Run',
        date: 'October-November',
        description: 'Giant red drum return to the sound',
        type: 'activity',
      },
      {
        name: 'Monarch Migration',
        date: 'October',
        description: 'Butterflies pass through on their journey south',
        type: 'nature',
      },
    ],
    bestFor: ['Surfers', 'Budget travelers', 'Photographers', 'Anglers'],
  },
  {
    id: 'winter',
    name: 'Winter',
    months: 'December - February',
    icon: <Snowflake className="w-6 h-6" />,
    gradient: 'from-blue-400 to-cyan-500',
    avgTemp: { high: 55, low: 38 },
    waterTemp: 52,
    crowdLevel: 'Low',
    priceLevel: '$',
    highlights: [
      'Ultimate tranquility and solitude',
      'Best rates of the year',
      'Dramatic winter storms and waves',
      'Excellent birdwatching',
      'Cozy vacation rental experience',
    ],
    events: [
      {
        name: 'Holiday at Hatteras',
        date: 'December',
        description: 'Local shops and restaurants with holiday spirit',
        type: 'special',
      },
      {
        name: 'Winter Birding',
        date: 'December-February',
        description: 'Waterfowl and shorebirds overwinter here',
        type: 'nature',
      },
      {
        name: 'Off-Season Surfing',
        date: 'All Winter',
        description: 'Cold but powerful winter swells',
        type: 'activity',
      },
    ],
    bestFor: ['Birders', 'Writers & artists', 'Budget travelers', 'Solitude seekers'],
  },
];

interface SeasonalHighlightsProps {
  currentSeason?: Season;
}

export default function SeasonalHighlights({
  currentSeason,
}: SeasonalHighlightsProps) {
  const getCurrentSeason = (): Season => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  };

  const [activeSeason, setActiveSeason] = useState<Season>(
    currentSeason || getCurrentSeason()
  );

  const season = seasons.find((s) => s.id === activeSeason)!;

  const getEventIcon = (type: SeasonalEvent['type']) => {
    switch (type) {
      case 'festival':
        return <Music className="w-4 h-4" />;
      case 'nature':
        return <Bird className="w-4 h-4" />;
      case 'activity':
        return <Fish className="w-4 h-4" />;
      case 'special':
        return <Star className="w-4 h-4" />;
    }
  };

  const getCrowdColor = (level: SeasonInfo['crowdLevel']) => {
    switch (level) {
      case 'Low':
        return 'text-green-600 bg-green-100';
      case 'Moderate':
        return 'text-amber-600 bg-amber-100';
      case 'High':
        return 'text-orange-600 bg-orange-100';
      case 'Peak':
        return 'text-red-600 bg-red-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Season Header */}
      <div
        className={`p-6 bg-gradient-to-r ${season.gradient} text-white transition-all duration-500`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              {season.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{season.name} on Hatteras</h2>
              <p className="text-white/80">{season.months}</p>
            </div>
          </div>
          {activeSeason === getCurrentSeason() && (
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              Current Season
            </span>
          )}
        </div>

        {/* Season Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <ThermometerSun className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xl font-bold">
              {season.avgTemp.high}°/{season.avgTemp.low}°
            </p>
            <p className="text-xs text-white/80">Avg High/Low</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <Waves className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xl font-bold">{season.waterTemp}°</p>
            <p className="text-xs text-white/80">Water Temp</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <Users className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xl font-bold">{season.crowdLevel}</p>
            <p className="text-xs text-white/80">Crowds</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <DollarSign className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xl font-bold">{season.priceLevel}</p>
            <p className="text-xs text-white/80">Prices</p>
          </div>
        </div>
      </div>

      {/* Season Tabs */}
      <div className="flex border-b border-gray-100">
        {seasons.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSeason(s.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${
              activeSeason === s.id
                ? `text-${s.id === 'spring' ? 'emerald' : s.id === 'summer' ? 'amber' : s.id === 'fall' ? 'orange' : 'blue'}-600 border-b-2 border-current`
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {s.icon}
            <span className="hidden sm:inline">{s.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeSeason}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6"
      >
        {/* Best For */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Best For
          </h3>
          <div className="flex flex-wrap gap-2">
            {season.bestFor.map((item) => (
              <span
                key={item}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Season Highlights</h3>
          <ul className="space-y-2">
            {season.highlights.map((highlight, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 text-gray-600"
              >
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Star className="w-3 h-3" />
                </span>
                {highlight}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Events */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Events & Activities
          </h3>
          <div className="space-y-3">
            {season.events.map((event, index) => (
              <motion.div
                key={event.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      event.type === 'festival'
                        ? 'bg-purple-100 text-purple-600'
                        : event.type === 'nature'
                        ? 'bg-green-100 text-green-600'
                        : event.type === 'activity'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{event.name}</h4>
                      <span className="text-xs text-gray-500">• {event.date}</span>
                    </div>
                    <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <div className={`p-4 bg-gradient-to-r ${season.gradient}`}>
        <div className="flex items-center justify-between text-white">
          <div>
            <p className="font-semibold">Ready to plan your {season.name.toLowerCase()} getaway?</p>
            <p className="text-sm text-white/80">
              Browse our {seasons.find((s) => s.id === activeSeason)?.crowdLevel === 'Low' ? 'available' : 'popular'} properties
            </p>
          </div>
          <button className="px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
            View Properties
          </button>
        </div>
      </div>
    </div>
  );
}
