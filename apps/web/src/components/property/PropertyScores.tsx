'use client';

import { motion } from 'framer-motion';
import { Waves, MapPin, Star, Wifi, Car, Shield } from 'lucide-react';

interface Score {
  label: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  color: string;
}

interface PropertyScoresProps {
  beachAccess?: number;
  location?: number;
  amenities?: number;
  cleanliness?: number;
  value?: number;
  communication?: number;
}

export default function PropertyScores({
  beachAccess = 9.2,
  location = 9.5,
  amenities = 8.8,
  cleanliness = 9.7,
  value = 9.0,
  communication = 9.8,
}: PropertyScoresProps) {
  const scores: Score[] = [
    {
      label: 'Beach Access',
      value: beachAccess,
      icon: <Waves className="w-5 h-5" />,
      description: '2 min walk to beach',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      label: 'Location',
      value: location,
      icon: <MapPin className="w-5 h-5" />,
      description: 'Prime island location',
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Amenities',
      value: amenities,
      icon: <Wifi className="w-5 h-5" />,
      description: '25+ amenities included',
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Cleanliness',
      value: cleanliness,
      icon: <Star className="w-5 h-5" />,
      description: 'Professionally cleaned',
      color: 'from-amber-500 to-orange-500',
    },
    {
      label: 'Value',
      value: value,
      icon: <Shield className="w-5 h-5" />,
      description: 'Great price for features',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      label: 'Communication',
      value: communication,
      icon: <Car className="w-5 h-5" />,
      description: 'Responds in < 1 hour',
      color: 'from-rose-500 to-red-500',
    },
  ];

  const overallScore = (scores.reduce((acc, s) => acc + s.value, 0) / scores.length).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header with overall score */}
      <div className="p-6 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Property Score</h3>
            <p className="text-ocean-100 text-sm">Based on 6 key factors</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{overallScore}</div>
            <div className="text-ocean-200 text-sm">Exceptional</div>
          </div>
        </div>
      </div>

      {/* Individual scores */}
      <div className="p-6 space-y-4">
        {scores.map((score, index) => (
          <motion.div
            key={score.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${score.color} text-white`}>
                  {score.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{score.label}</p>
                  <p className="text-sm text-gray-500">{score.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">{score.value}</span>
                <span className="text-gray-400">/10</span>
              </div>
            </div>
            {/* Score bar */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score.value * 10}%` }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.5, ease: 'easeOut' }}
                className={`h-full rounded-full bg-gradient-to-r ${score.color}`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <p className="text-sm text-gray-500 text-center">
          Scores calculated from guest reviews and property features
        </p>
      </div>
    </div>
  );
}
