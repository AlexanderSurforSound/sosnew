'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Waves,
  Umbrella,
  Thermometer,
  Droplets,
  Fish,
  Camera,
  BookOpen,
  ShoppingBag,
  Utensils,
  Gamepad,
  Film,
  Palette,
  Music,
  Bike,
  Sailboat,
  Tent,
  Star,
  ChevronRight,
} from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy';
  windSpeed: number;
  precipitation: number;
  humidity: number;
  uvIndex: number;
}

interface Activity {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'outdoor' | 'indoor' | 'water' | 'rainy-day';
  weatherConditions: WeatherData['condition'][];
  minTemp?: number;
  maxTemp?: number;
  maxWind?: number;
  duration: string;
  location?: string;
}

const activities: Activity[] = [
  // Outdoor Activities
  {
    id: 'beach-day',
    name: 'Beach Day',
    description: 'Perfect conditions for sunbathing and swimming',
    icon: <Sun className="w-5 h-5" />,
    category: 'outdoor',
    weatherConditions: ['sunny', 'partly-cloudy'],
    minTemp: 75,
    maxWind: 15,
    duration: 'Full day',
  },
  {
    id: 'lighthouse-tour',
    name: 'Cape Hatteras Lighthouse',
    description: 'Climb 257 steps for panoramic views',
    icon: <Camera className="w-5 h-5" />,
    category: 'outdoor',
    weatherConditions: ['sunny', 'partly-cloudy', 'cloudy'],
    maxWind: 25,
    duration: '2-3 hours',
    location: 'Buxton',
  },
  {
    id: 'kayaking',
    name: 'Sound-side Kayaking',
    description: 'Explore the calm waters of Pamlico Sound',
    icon: <Sailboat className="w-5 h-5" />,
    category: 'water',
    weatherConditions: ['sunny', 'partly-cloudy'],
    minTemp: 70,
    maxWind: 10,
    duration: '2-4 hours',
  },
  {
    id: 'fishing',
    name: 'Fishing Charter',
    description: 'Offshore or sound fishing adventures',
    icon: <Fish className="w-5 h-5" />,
    category: 'water',
    weatherConditions: ['sunny', 'partly-cloudy', 'cloudy'],
    maxWind: 20,
    duration: 'Half or full day',
  },
  {
    id: 'biking',
    name: 'Biking the Island',
    description: 'Explore scenic trails and paths',
    icon: <Bike className="w-5 h-5" />,
    category: 'outdoor',
    weatherConditions: ['sunny', 'partly-cloudy', 'cloudy'],
    minTemp: 60,
    maxWind: 20,
    duration: '1-3 hours',
  },
  {
    id: 'nature-walk',
    name: 'Buxton Woods Trail',
    description: 'Maritime forest hiking adventure',
    icon: <Tent className="w-5 h-5" />,
    category: 'outdoor',
    weatherConditions: ['sunny', 'partly-cloudy', 'cloudy'],
    maxWind: 30,
    duration: '1-2 hours',
    location: 'Buxton',
  },
  // Indoor Activities
  {
    id: 'graveyard-museum',
    name: 'Graveyard of the Atlantic Museum',
    description: 'Explore maritime history and shipwrecks',
    icon: <BookOpen className="w-5 h-5" />,
    category: 'indoor',
    weatherConditions: ['sunny', 'partly-cloudy', 'cloudy', 'rainy', 'stormy'],
    duration: '2-3 hours',
    location: 'Hatteras Village',
  },
  {
    id: 'shopping',
    name: 'Local Boutique Shopping',
    description: 'Browse unique OBX shops and galleries',
    icon: <ShoppingBag className="w-5 h-5" />,
    category: 'indoor',
    weatherConditions: ['sunny', 'partly-cloudy', 'cloudy', 'rainy', 'stormy'],
    duration: '2-4 hours',
  },
  {
    id: 'cooking',
    name: 'Seafood Cooking Class',
    description: 'Learn to prepare fresh local catch',
    icon: <Utensils className="w-5 h-5" />,
    category: 'indoor',
    weatherConditions: ['sunny', 'partly-cloudy', 'cloudy', 'rainy', 'stormy'],
    duration: '3 hours',
  },
  {
    id: 'game-night',
    name: 'Family Game Night',
    description: 'Board games and puzzles at the rental',
    icon: <Gamepad className="w-5 h-5" />,
    category: 'rainy-day',
    weatherConditions: ['rainy', 'stormy'],
    duration: 'All evening',
  },
  {
    id: 'movie-marathon',
    name: 'Beach Movie Marathon',
    description: 'Cozy up with classic beach films',
    icon: <Film className="w-5 h-5" />,
    category: 'rainy-day',
    weatherConditions: ['rainy', 'stormy'],
    duration: 'Flexible',
  },
  {
    id: 'art-gallery',
    name: 'Hatteras Art Galleries',
    description: 'View local artists and coastal art',
    icon: <Palette className="w-5 h-5" />,
    category: 'indoor',
    weatherConditions: ['sunny', 'partly-cloudy', 'cloudy', 'rainy', 'stormy'],
    duration: '1-2 hours',
  },
  {
    id: 'live-music',
    name: 'Live Music at Local Bars',
    description: 'Catch local bands and island vibes',
    icon: <Music className="w-5 h-5" />,
    category: 'indoor',
    weatherConditions: ['sunny', 'partly-cloudy', 'cloudy', 'rainy', 'stormy'],
    duration: 'Evening',
  },
];

interface WeatherActivitiesProps {
  weather?: WeatherData;
}

export default function WeatherActivities({
  weather = {
    temperature: 82,
    condition: 'sunny',
    windSpeed: 12,
    precipitation: 0,
    humidity: 65,
    uvIndex: 8,
  },
}: WeatherActivitiesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getWeatherIcon = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="w-8 h-8 text-amber-500" />;
      case 'partly-cloudy':
        return <Cloud className="w-8 h-8 text-gray-400" />;
      case 'cloudy':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'rainy':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'stormy':
        return <CloudRain className="w-8 h-8 text-gray-700" />;
    }
  };

  const getWeatherGradient = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny':
        return 'from-amber-400 to-orange-500';
      case 'partly-cloudy':
        return 'from-blue-400 to-gray-400';
      case 'cloudy':
        return 'from-gray-400 to-gray-500';
      case 'rainy':
        return 'from-blue-500 to-gray-600';
      case 'stormy':
        return 'from-gray-600 to-gray-800';
    }
  };

  const isActivityRecommended = (activity: Activity) => {
    // Check weather condition
    if (!activity.weatherConditions.includes(weather.condition)) return false;

    // Check temperature
    if (activity.minTemp && weather.temperature < activity.minTemp) return false;
    if (activity.maxTemp && weather.temperature > activity.maxTemp) return false;

    // Check wind
    if (activity.maxWind && weather.windSpeed > activity.maxWind) return false;

    return true;
  };

  const recommendedActivities = activities.filter(isActivityRecommended);
  const filteredActivities =
    selectedCategory === 'all'
      ? recommendedActivities
      : recommendedActivities.filter((a) => a.category === selectedCategory);

  const getCategoryColor = (category: Activity['category']) => {
    switch (category) {
      case 'outdoor':
        return 'bg-green-100 text-green-600';
      case 'indoor':
        return 'bg-purple-100 text-purple-600';
      case 'water':
        return 'bg-blue-100 text-blue-600';
      case 'rainy-day':
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Weather Header */}
      <div
        className={`p-6 bg-gradient-to-r ${getWeatherGradient(
          weather.condition
        )} text-white`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              {getWeatherIcon(weather.condition)}
            </div>
            <div>
              <p className="text-5xl font-bold">{weather.temperature}°</p>
              <p className="text-white/80 capitalize">
                {weather.condition.replace('-', ' ')}
              </p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Wind className="w-4 h-4" />
              {weather.windSpeed} mph
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Droplets className="w-4 h-4" />
              {weather.humidity}%
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sun className="w-4 h-4" />
              UV {weather.uvIndex}
            </div>
          </div>
        </div>

        {/* Weather Tips */}
        {weather.uvIndex >= 6 && (
          <div className="bg-white/20 rounded-xl p-3 flex items-center gap-3">
            <Umbrella className="w-5 h-5" />
            <p className="text-sm">
              High UV today! Don't forget sunscreen (SPF 30+) and stay hydrated.
            </p>
          </div>
        )}
      </div>

      {/* Activity Recommendations */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            Today's Recommended Activities
          </h3>
          <span className="text-sm text-gray-500">
            {recommendedActivities.length} activities
          </span>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'outdoor', label: 'Outdoor' },
            { id: 'water', label: 'Water' },
            { id: 'indoor', label: 'Indoor' },
            { id: 'rainy-day', label: 'Rainy Day' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-ocean-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Activities Grid */}
        <div className="space-y-3">
          {filteredActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryColor(
                  activity.category
                )}`}
              >
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">{activity.name}</h4>
                  {activity.location && (
                    <span className="text-xs text-gray-500">
                      • {activity.location}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Duration: {activity.duration}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </motion.div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-8">
            <Cloud className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No activities match the current weather</p>
            <p className="text-sm text-gray-400">
              Check back when conditions change
            </p>
          </div>
        )}
      </div>

      {/* Tomorrow's Forecast Hint */}
      <div className="p-4 bg-ocean-50 border-t border-ocean-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-ocean-600" />
            <span className="text-sm text-ocean-700">
              Tomorrow: Perfect beach weather expected!
            </span>
          </div>
          <button className="text-sm text-ocean-600 font-medium hover:underline">
            5-Day Forecast →
          </button>
        </div>
      </div>
    </div>
  );
}
