'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Fish,
  Waves,
  Wind,
  Thermometer,
  Clock,
  MapPin,
  Anchor,
  Target,
  TrendingUp,
  Calendar,
  Star,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';

interface FishSpecies {
  id: string;
  name: string;
  status: 'hot' | 'good' | 'slow' | 'off-season';
  bestTime: string;
  bestLocation: string;
  technique: string;
  avgSize: string;
  image?: string;
}

interface FishingConditions {
  waterTemp: number;
  airTemp: number;
  windSpeed: number;
  windDirection: string;
  tideStatus: 'incoming' | 'outgoing' | 'high' | 'low';
  nextTide: string;
  waveHeight: number;
  visibility: string;
  overallRating: 1 | 2 | 3 | 4 | 5;
}

interface RecentCatch {
  species: string;
  weight: string;
  location: string;
  angler: string;
  date: Date;
}

const fishSpecies: FishSpecies[] = [
  {
    id: 'redDrum',
    name: 'Red Drum',
    status: 'hot',
    bestTime: 'Early morning, late evening',
    bestLocation: 'Sound-side flats, Cape Point',
    technique: 'Cut bait, artificial lures',
    avgSize: '18-27 inches',
  },
  {
    id: 'speckledTrout',
    name: 'Speckled Trout',
    status: 'good',
    bestTime: 'Dawn and dusk',
    bestLocation: 'Pamlico Sound, grass beds',
    technique: 'Soft plastics, live shrimp',
    avgSize: '14-20 inches',
  },
  {
    id: 'flounder',
    name: 'Flounder',
    status: 'good',
    bestTime: 'Midday on incoming tide',
    bestLocation: 'Oregon Inlet, sound channels',
    technique: 'Live minnows, bucktail jigs',
    avgSize: '16-22 inches',
  },
  {
    id: 'bluefish',
    name: 'Bluefish',
    status: 'hot',
    bestTime: 'Any time, feeding frenzies',
    bestLocation: 'Surf, Cape Point',
    technique: 'Metal lures, cut bait',
    avgSize: '2-8 lbs',
  },
  {
    id: 'cobia',
    name: 'Cobia',
    status: 'good',
    bestTime: 'Early morning',
    bestLocation: 'Nearshore wrecks, buoys',
    technique: 'Sight casting, live eels',
    avgSize: '30-50 lbs',
  },
  {
    id: 'kingMackerel',
    name: 'King Mackerel',
    status: 'slow',
    bestTime: 'Early morning',
    bestLocation: 'Offshore, 10-20 miles',
    technique: 'Trolling, live bait',
    avgSize: '10-30 lbs',
  },
  {
    id: 'mahiMahi',
    name: 'Mahi-Mahi',
    status: 'hot',
    bestTime: 'All day offshore',
    bestLocation: 'Gulf Stream, 40+ miles',
    technique: 'Trolling, ballyhoo',
    avgSize: '10-25 lbs',
  },
  {
    id: 'yellowfinTuna',
    name: 'Yellowfin Tuna',
    status: 'good',
    bestTime: 'Dawn',
    bestLocation: 'Gulf Stream',
    technique: 'Chunking, trolling',
    avgSize: '30-80 lbs',
  },
];

const recentCatches: RecentCatch[] = [
  {
    species: 'Red Drum',
    weight: '42 inches (released)',
    location: 'Cape Point',
    angler: 'Captain Mike',
    date: new Date(Date.now() - 86400000),
  },
  {
    species: 'Yellowfin Tuna',
    weight: '67 lbs',
    location: 'Gulf Stream',
    angler: 'Charter: Blue Water',
    date: new Date(Date.now() - 86400000 * 2),
  },
  {
    species: 'Mahi-Mahi',
    weight: '32 lbs',
    location: '45 miles offshore',
    angler: 'Private boat',
    date: new Date(Date.now() - 86400000 * 2),
  },
  {
    species: 'Speckled Trout',
    weight: '6 lbs 4 oz',
    location: 'Pamlico Sound',
    angler: 'Wade fisherman',
    date: new Date(Date.now() - 86400000 * 3),
  },
];

export default function FishingReports() {
  const [activeTab, setActiveTab] = useState<'inshore' | 'offshore' | 'surf'>('inshore');
  const [showAllSpecies, setShowAllSpecies] = useState(false);

  const conditions: FishingConditions = {
    waterTemp: 78,
    airTemp: 84,
    windSpeed: 12,
    windDirection: 'SW',
    tideStatus: 'incoming',
    nextTide: 'High at 2:34 PM',
    waveHeight: 2.5,
    visibility: 'Good',
    overallRating: 4,
  };

  const getStatusColor = (status: FishSpecies['status']) => {
    switch (status) {
      case 'hot':
        return 'bg-red-100 text-red-700';
      case 'good':
        return 'bg-green-100 text-green-700';
      case 'slow':
        return 'bg-amber-100 text-amber-700';
      case 'off-season':
        return 'bg-gray-100 text-gray-500';
    }
  };

  const getStatusLabel = (status: FishSpecies['status']) => {
    switch (status) {
      case 'hot':
        return 'Hot Bite!';
      case 'good':
        return 'Good';
      case 'slow':
        return 'Slow';
      case 'off-season':
        return 'Off Season';
    }
  };

  const filteredSpecies = fishSpecies.filter((fish) => {
    if (activeTab === 'inshore')
      return ['redDrum', 'speckledTrout', 'flounder'].includes(fish.id);
    if (activeTab === 'offshore')
      return ['mahiMahi', 'yellowfinTuna', 'cobia', 'kingMackerel'].includes(fish.id);
    return ['redDrum', 'bluefish', 'flounder'].includes(fish.id);
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Fish className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Hatteras Fishing Report</h2>
            <p className="text-blue-100 text-sm">
              Updated {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Conditions Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <Thermometer className="w-5 h-5 mx-auto mb-1" />
            <p className="text-2xl font-bold">{conditions.waterTemp}°</p>
            <p className="text-xs text-blue-200">Water Temp</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <Wind className="w-5 h-5 mx-auto mb-1" />
            <p className="text-2xl font-bold">{conditions.windSpeed}</p>
            <p className="text-xs text-blue-200">{conditions.windDirection} Wind (mph)</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <Waves className="w-5 h-5 mx-auto mb-1" />
            <p className="text-2xl font-bold">{conditions.waveHeight}'</p>
            <p className="text-xs text-blue-200">Wave Height</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <Anchor className="w-5 h-5 mx-auto mb-1" />
            <p className="text-lg font-bold capitalize">{conditions.tideStatus}</p>
            <p className="text-xs text-blue-200">{conditions.nextTide}</p>
          </div>
        </div>

        {/* Overall Rating */}
        <div className="mt-4 flex items-center justify-between bg-white/10 rounded-xl p-3">
          <span className="text-sm">Today's Fishing Conditions</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < conditions.overallRating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {[
          { id: 'inshore', label: 'Inshore', icon: <Anchor className="w-4 h-4" /> },
          { id: 'offshore', label: 'Offshore', icon: <Waves className="w-4 h-4" /> },
          { id: 'surf', label: 'Surf', icon: <Target className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Species Report */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">What's Biting</h3>
        <div className="space-y-3">
          {(showAllSpecies ? filteredSpecies : filteredSpecies.slice(0, 3)).map(
            (fish, index) => (
              <motion.div
                key={fish.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Fish className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{fish.name}</h4>
                      <p className="text-sm text-gray-500">Avg: {fish.avgSize}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      fish.status
                    )}`}
                  >
                    {getStatusLabel(fish.status)}
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Best Time</p>
                    <p className="text-gray-900">{fish.bestTime}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="text-gray-900">{fish.bestLocation}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Technique</p>
                    <p className="text-gray-900">{fish.technique}</p>
                  </div>
                </div>
              </motion.div>
            )
          )}
        </div>

        {filteredSpecies.length > 3 && (
          <button
            onClick={() => setShowAllSpecies(!showAllSpecies)}
            className="w-full mt-4 py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
          >
            {showAllSpecies ? 'Show Less' : `Show ${filteredSpecies.length - 3} More`}
          </button>
        )}
      </div>

      {/* Recent Catches */}
      <div className="p-4 border-t border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-3">Recent Catches</h3>
        <div className="space-y-2">
          {recentCatches.map((catch_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">
                  {catch_.species} - {catch_.weight}
                </p>
                <p className="text-sm text-gray-500">
                  {catch_.location} • {catch_.angler}
                </p>
              </div>
              <span className="text-xs text-gray-400">
                {catch_.date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tide Schedule */}
      <div className="p-4 border-t border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-3">Today's Tides</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { time: '6:12 AM', type: 'Low', icon: <Moon className="w-4 h-4" /> },
            { time: '12:28 PM', type: 'High', icon: <Sun className="w-4 h-4" /> },
            { time: '6:45 PM', type: 'Low', icon: <Moon className="w-4 h-4" /> },
            { time: '11:52 PM', type: 'High', icon: <Moon className="w-4 h-4" /> },
          ].map((tide, i) => (
            <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                {tide.icon}
                <span className="text-xs">{tide.type}</span>
              </div>
              <p className="font-semibold text-gray-900 text-sm">{tide.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Book Charter CTA */}
      <div className="p-4 bg-blue-50 border-t border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Anchor className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Book a Fishing Charter</p>
              <p className="text-sm text-blue-700">
                Half-day and full-day trips available
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            View Charters
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
