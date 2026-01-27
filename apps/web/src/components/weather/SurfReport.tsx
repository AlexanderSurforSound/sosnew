'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Waves,
  Wind,
  Compass,
  Thermometer,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Sun,
  Droplets,
  ChevronRight,
} from 'lucide-react';

interface SurfConditions {
  waveHeight: number;
  waveHeightMax: number;
  wavePeriod: number;
  waveDirection: string;
  windSpeed: number;
  windDirection: string;
  waterTemp: number;
  airTemp: number;
  visibility: string;
  uvIndex: number;
  rating: 'poor' | 'fair' | 'good' | 'excellent';
}

interface TideData {
  time: string;
  height: number;
  type: 'high' | 'low';
}

interface Forecast {
  date: Date;
  waveHeight: number;
  windSpeed: number;
  rating: 'poor' | 'fair' | 'good' | 'excellent';
}

export default function SurfReport() {
  const [conditions, setConditions] = useState<SurfConditions>({
    waveHeight: 3.5,
    waveHeightMax: 5,
    wavePeriod: 8,
    waveDirection: 'SE',
    windSpeed: 12,
    windDirection: 'SW',
    waterTemp: 76,
    airTemp: 82,
    visibility: 'Good',
    uvIndex: 8,
    rating: 'good',
  });

  const [tides, setTides] = useState<TideData[]>([
    { time: '6:23 AM', height: 0.3, type: 'low' },
    { time: '12:47 PM', height: 3.2, type: 'high' },
    { time: '6:58 PM', height: 0.5, type: 'low' },
    { time: '1:12 AM', height: 2.9, type: 'high' },
  ]);

  const [forecast, setForecast] = useState<Forecast[]>([
    { date: new Date(), waveHeight: 3.5, windSpeed: 12, rating: 'good' },
    { date: new Date(Date.now() + 86400000), waveHeight: 4, windSpeed: 15, rating: 'good' },
    { date: new Date(Date.now() + 172800000), waveHeight: 5, windSpeed: 18, rating: 'excellent' },
    { date: new Date(Date.now() + 259200000), waveHeight: 3, windSpeed: 10, rating: 'fair' },
    { date: new Date(Date.now() + 345600000), waveHeight: 2.5, windSpeed: 8, rating: 'fair' },
  ]);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'fair':
        return 'text-amber-600 bg-amber-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRatingEmoji = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return '🤙';
      case 'good':
        return '👍';
      case 'fair':
        return '👌';
      default:
        return '😕';
    }
  };

  const getWindIcon = (speed: number) => {
    if (speed < 10) return <Minus className="w-4 h-4" />;
    if (speed < 20) return <TrendingUp className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const nextTide = tides.find((t) => {
    const [time, period] = t.time.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let tideHour = hours;
    if (period === 'PM' && hours !== 12) tideHour += 12;
    if (period === 'AM' && hours === 12) tideHour = 0;

    const now = new Date();
    const tideDate = new Date();
    tideDate.setHours(tideHour, minutes, 0);

    return tideDate > now;
  }) || tides[0];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Surf & Tide Report</h2>
              <p className="text-cyan-200 text-sm">Cape Hatteras - Updated 15 min ago</p>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getRatingColor(
                conditions.rating
              )}`}
            >
              <span>{getRatingEmoji(conditions.rating)}</span>
              <span className="capitalize">{conditions.rating}</span>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-cyan-200 mb-1">
              <Waves className="w-4 h-4" />
              <span className="text-xs">Wave Height</span>
            </div>
            <p className="text-2xl font-bold">
              {conditions.waveHeight}-{conditions.waveHeightMax}
              <span className="text-sm font-normal ml-1">ft</span>
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-cyan-200 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Period</span>
            </div>
            <p className="text-2xl font-bold">
              {conditions.wavePeriod}
              <span className="text-sm font-normal ml-1">sec</span>
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-cyan-200 mb-1">
              <Wind className="w-4 h-4" />
              <span className="text-xs">Wind</span>
            </div>
            <p className="text-2xl font-bold">
              {conditions.windSpeed}
              <span className="text-sm font-normal ml-1">mph {conditions.windDirection}</span>
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-cyan-200 mb-1">
              <Thermometer className="w-4 h-4" />
              <span className="text-xs">Water Temp</span>
            </div>
            <p className="text-2xl font-bold">
              {conditions.waterTemp}
              <span className="text-sm font-normal">°F</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tide Schedule */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-cyan-600" />
          Today's Tides
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {tides.map((tide, index) => (
            <div
              key={index}
              className={`flex-shrink-0 p-4 rounded-xl border-2 ${
                tide === nextTide
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {tide.type === 'high' ? (
                  <TrendingUp className="w-4 h-4 text-cyan-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-blue-600" />
                )}
                <span className="text-sm font-medium capitalize text-gray-600">
                  {tide.type}
                </span>
              </div>
              <p className="font-bold text-gray-900">{tide.time}</p>
              <p className="text-sm text-gray-500">{tide.height} ft</p>
              {tide === nextTide && (
                <span className="text-xs text-cyan-600 font-medium">Next</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500" />
          5-Day Surf Forecast
        </h3>
        <div className="space-y-3">
          {forecast.map((day, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 text-center">
                  <p className="text-sm text-gray-500">
                    {index === 0
                      ? 'Today'
                      : day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="font-bold text-gray-900">
                    {day.date.toLocaleDateString('en-US', { day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {day.waveHeight} ft @ {day.windSpeed} mph
                  </p>
                  <p className="text-sm text-gray-500">
                    {day.waveHeight >= 4 ? 'Great for surfing' : 'Good for beginners'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRatingColor(
                    day.rating
                  )}`}
                >
                  {day.rating}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 bg-amber-50 border-t border-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Beach Safety</p>
            <p className="text-sm text-amber-700">
              Always swim near a lifeguard. Check conditions before entering the water.
              Rip currents can be present even on calm days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
