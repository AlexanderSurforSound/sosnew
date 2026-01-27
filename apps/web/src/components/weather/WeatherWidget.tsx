'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    uvIndex: number;
  };
  forecast: {
    date: string;
    dayOfWeek: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    precipChance: number;
  }[];
}

interface WeatherWidgetProps {
  village?: string;
  compact?: boolean;
}

const weatherIcons: Record<string, React.ReactNode> = {
  sunny: (
    <svg className="w-full h-full text-amber-400" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  'partly-cloudy': (
    <svg className="w-full h-full" viewBox="0 0 24 24">
      <circle cx="10" cy="8" r="4" className="text-amber-400" fill="currentColor" />
      <path d="M18 15a4 4 0 00-8 0h-1a3 3 0 100 6h10a3 3 0 100-6h-1z" className="text-gray-300" fill="currentColor" />
    </svg>
  ),
  cloudy: (
    <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 16a4 4 0 00-4-4 4.08 4.08 0 00-.85.09 5 5 0 00-9.3 2.33A3 3 0 005 20h13a4 4 0 001-8z" />
    </svg>
  ),
  rainy: (
    <svg className="w-full h-full" viewBox="0 0 24 24">
      <path d="M19 12a4 4 0 00-4-4 4.08 4.08 0 00-.85.09 5 5 0 00-9.3 2.33A3 3 0 005 16h13a4 4 0 001-4z" className="text-gray-400" fill="currentColor" />
      <path d="M8 19v2m4-2v2m4-2v2" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  stormy: (
    <svg className="w-full h-full" viewBox="0 0 24 24">
      <path d="M19 10a4 4 0 00-4-4 4.08 4.08 0 00-.85.09 5 5 0 00-9.3 2.33A3 3 0 005 14h13a4 4 0 001-4z" className="text-gray-500" fill="currentColor" />
      <path d="M13 14l-2 4h3l-2 4" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
};

// Simulated weather data for Hatteras Island
const generateWeatherData = (village?: string): WeatherData => {
  const conditions = ['sunny', 'partly-cloudy', 'cloudy', 'rainy'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  const forecast = Array.from({ length: 5 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    return {
      date: date.toISOString().split('T')[0],
      dayOfWeek: dayNames[date.getDay()],
      high: Math.floor(70 + Math.random() * 20),
      low: Math.floor(55 + Math.random() * 15),
      condition,
      icon: condition,
      precipChance: condition === 'rainy' ? Math.floor(60 + Math.random() * 40) : Math.floor(Math.random() * 30),
    };
  });

  return {
    current: {
      temp: Math.floor(72 + Math.random() * 15),
      feelsLike: Math.floor(75 + Math.random() * 10),
      condition: 'Partly Cloudy',
      icon: 'partly-cloudy',
      humidity: Math.floor(60 + Math.random() * 25),
      windSpeed: Math.floor(8 + Math.random() * 15),
      uvIndex: Math.floor(4 + Math.random() * 6),
    },
    forecast,
  };
};

export default function WeatherWidget({ village = 'Hatteras Island', compact = false }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setWeather(generateWeatherData(village));
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [village]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-xl p-6 text-white animate-pulse">
        <div className="h-6 bg-white/20 rounded w-1/3 mb-4" />
        <div className="h-16 bg-white/20 rounded w-1/2 mb-4" />
        <div className="h-4 bg-white/20 rounded w-2/3" />
      </div>
    );
  }

  if (!weather) return null;

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ocean-100">{village}</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{weather.current.temp}°</span>
              <span className="text-ocean-100">{weather.current.condition}</span>
            </div>
          </div>
          <div className="w-12 h-12">
            {weatherIcons[weather.current.icon] || weatherIcons.sunny}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-xl overflow-hidden text-white"
    >
      {/* Current Weather */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-1">{village}</h3>
            <p className="text-ocean-100 text-sm">Current Weather</p>
          </div>
          <div className="w-16 h-16">
            {weatherIcons[weather.current.icon] || weatherIcons.sunny}
          </div>
        </div>

        <div className="flex items-end gap-4 mb-6">
          <span className="text-5xl font-bold">{weather.current.temp}°</span>
          <div className="pb-1">
            <p className="text-ocean-100 text-sm">Feels like {weather.current.feelsLike}°</p>
            <p className="font-medium">{weather.current.condition}</p>
          </div>
        </div>

        {/* Weather details */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <svg className="w-5 h-5 mx-auto mb-1 text-ocean-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <p className="text-lg font-semibold">{weather.current.humidity}%</p>
            <p className="text-xs text-ocean-200">Humidity</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <svg className="w-5 h-5 mx-auto mb-1 text-ocean-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
            <p className="text-lg font-semibold">{weather.current.windSpeed} mph</p>
            <p className="text-xs text-ocean-200">Wind</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <svg className="w-5 h-5 mx-auto mb-1 text-ocean-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-lg font-semibold">{weather.current.uvIndex}</p>
            <p className="text-xs text-ocean-200">UV Index</p>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div className="bg-white/10 p-4">
        <h4 className="text-sm font-medium text-ocean-100 mb-3">5-Day Forecast</h4>
        <div className="flex justify-between">
          {weather.forecast.map((day, index) => (
            <div key={day.date} className="text-center">
              <p className="text-xs text-ocean-200 mb-1">
                {index === 0 ? 'Today' : day.dayOfWeek}
              </p>
              <div className="w-8 h-8 mx-auto mb-1">
                {weatherIcons[day.icon] || weatherIcons.sunny}
              </div>
              <p className="text-sm font-semibold">{day.high}°</p>
              <p className="text-xs text-ocean-200">{day.low}°</p>
              {day.precipChance > 20 && (
                <p className="text-xs text-blue-300 mt-1">{day.precipChance}%</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Beach conditions */}
      <div className="px-4 pb-4">
        <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium">Great beach day!</p>
            <p className="text-sm text-ocean-200">Perfect conditions for swimming and sunbathing</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
