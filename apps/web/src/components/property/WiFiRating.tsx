'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Monitor, Video, Gamepad, Download, Upload, Check, Info } from 'lucide-react';

interface WiFiRatingProps {
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  reliability: number; // 1-5
  lastTested?: Date;
}

type WorkScenario = {
  name: string;
  icon: React.ReactNode;
  minDownload: number;
  minUpload: number;
  description: string;
};

const workScenarios: WorkScenario[] = [
  {
    name: 'Video Calls',
    icon: <Video className="w-5 h-5" />,
    minDownload: 5,
    minUpload: 3,
    description: 'Zoom, Teams, Google Meet',
  },
  {
    name: '4K Streaming',
    icon: <Monitor className="w-5 h-5" />,
    minDownload: 25,
    minUpload: 1,
    description: 'Netflix, YouTube, Disney+',
  },
  {
    name: 'Remote Work',
    icon: <Monitor className="w-5 h-5" />,
    minDownload: 10,
    minUpload: 5,
    description: 'Email, browsing, cloud apps',
  },
  {
    name: 'Online Gaming',
    icon: <Gamepad className="w-5 h-5" />,
    minDownload: 15,
    minUpload: 5,
    description: 'Low latency gaming',
  },
  {
    name: 'Large Downloads',
    icon: <Download className="w-5 h-5" />,
    minDownload: 50,
    minUpload: 1,
    description: 'Files, updates, backups',
  },
];

export default function WiFiRating({
  downloadSpeed,
  uploadSpeed,
  reliability,
  lastTested,
}: WiFiRatingProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getOverallRating = () => {
    const speedScore = Math.min((downloadSpeed / 100) * 50 + (uploadSpeed / 50) * 30, 80);
    const reliabilityScore = (reliability / 5) * 20;
    const total = speedScore + reliabilityScore;

    if (total >= 80) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (total >= 60) return { label: 'Great', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (total >= 40) return { label: 'Good', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { label: 'Basic', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const rating = getOverallRating();

  const getSpeedLabel = (speed: number) => {
    if (speed >= 100) return 'Ultra Fast';
    if (speed >= 50) return 'Fast';
    if (speed >= 25) return 'Good';
    if (speed >= 10) return 'Moderate';
    return 'Basic';
  };

  const canHandle = (scenario: WorkScenario) =>
    downloadSpeed >= scenario.minDownload && uploadSpeed >= scenario.minUpload;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">WiFi Performance</h3>
              <p className="text-blue-200 text-sm">Work-from-beach ready</p>
            </div>
          </div>
          <div className={`px-3 py-1 ${rating.bg} ${rating.color} rounded-full text-sm font-semibold`}>
            {rating.label}
          </div>
        </div>
      </div>

      {/* Speed Stats */}
      <div className="p-4 grid grid-cols-2 gap-4 border-b border-gray-100">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
            <Download className="w-3 h-3" />
            Download
          </div>
          <p className="text-2xl font-bold text-gray-900">{downloadSpeed}</p>
          <p className="text-sm text-gray-500">Mbps</p>
          <p className="text-xs text-blue-600 font-medium mt-1">{getSpeedLabel(downloadSpeed)}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
            <Upload className="w-3 h-3" />
            Upload
          </div>
          <p className="text-2xl font-bold text-gray-900">{uploadSpeed}</p>
          <p className="text-sm text-gray-500">Mbps</p>
          <p className="text-xs text-blue-600 font-medium mt-1">{getSpeedLabel(uploadSpeed)}</p>
        </div>
      </div>

      {/* Reliability */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Connection Reliability</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-6 h-2 rounded-full ${
                  i < reliability ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        {lastTested && (
          <p className="text-xs text-gray-400">
            Last tested: {lastTested.toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Work Scenarios */}
      <div className="p-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-3"
        >
          <span>Compatible Activities</span>
          <motion.span
            animate={{ rotate: showDetails ? 180 : 0 }}
            className="text-gray-400"
          >
            ▼
          </motion.span>
        </button>

        <div className="space-y-2">
          {workScenarios.slice(0, showDetails ? undefined : 3).map((scenario) => {
            const compatible = canHandle(scenario);
            return (
              <motion.div
                key={scenario.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  compatible ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      compatible ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {scenario.icon}
                  </div>
                  <div>
                    <p className={`font-medium ${compatible ? 'text-gray-900' : 'text-gray-500'}`}>
                      {scenario.name}
                    </p>
                    <p className="text-xs text-gray-500">{scenario.description}</p>
                  </div>
                </div>
                {compatible ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <span className="text-xs text-gray-400">
                    Needs {scenario.minDownload}+ Mbps
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Info Footer */}
      <div className="p-3 bg-blue-50 border-t border-blue-100">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            Speeds are based on recent tests and may vary. Most properties offer stable connections
            suitable for remote work and video streaming.
          </p>
        </div>
      </div>
    </div>
  );
}

// Simple WiFi badge for property cards
export function WiFiBadge({ downloadSpeed }: { downloadSpeed: number }) {
  const getLevel = () => {
    if (downloadSpeed >= 100) return { label: 'Ultra Fast', color: 'bg-green-500' };
    if (downloadSpeed >= 50) return { label: 'Fast', color: 'bg-blue-500' };
    if (downloadSpeed >= 25) return { label: 'Good', color: 'bg-amber-500' };
    return { label: 'Basic', color: 'bg-gray-500' };
  };

  const level = getLevel();

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/90 backdrop-blur rounded-full">
      <Wifi className="w-3.5 h-3.5 text-gray-600" />
      <span className="text-xs font-medium text-gray-700">{downloadSpeed} Mbps</span>
      <div className={`w-2 h-2 rounded-full ${level.color}`} />
    </div>
  );
}
