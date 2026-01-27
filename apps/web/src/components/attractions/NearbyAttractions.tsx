'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Attraction {
  id: string;
  name: string;
  category: 'beach' | 'dining' | 'activity' | 'landmark' | 'shop' | 'nature';
  description: string;
  distance: string;
  rating?: number;
  image?: string;
  hours?: string;
  address?: string;
}

interface NearbyAttractionsProps {
  village?: string;
  propertyName?: string;
}

const categoryConfig = {
  beach: {
    label: 'Beaches',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    color: 'bg-cyan-100 text-cyan-700',
  },
  dining: {
    label: 'Dining',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: 'bg-orange-100 text-orange-700',
  },
  activity: {
    label: 'Activities',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-green-100 text-green-700',
  },
  landmark: {
    label: 'Landmarks',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: 'bg-purple-100 text-purple-700',
  },
  shop: {
    label: 'Shopping',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    color: 'bg-pink-100 text-pink-700',
  },
  nature: {
    label: 'Nature',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    color: 'bg-emerald-100 text-emerald-700',
  },
};

// Sample attractions data for Hatteras Island
const sampleAttractions: Attraction[] = [
  {
    id: '1',
    name: 'Cape Hatteras Lighthouse',
    category: 'landmark',
    description: 'America\'s tallest brick lighthouse and an iconic symbol of the Outer Banks.',
    distance: '0.5 mi',
    rating: 4.9,
    hours: '9 AM - 5 PM',
  },
  {
    id: '2',
    name: 'Hatteras Island Beach Access',
    category: 'beach',
    description: 'Beautiful uncrowded beach with excellent surfing and fishing.',
    distance: '0.2 mi',
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Oden\'s Dock Seafood',
    category: 'dining',
    description: 'Fresh local seafood with waterfront views of Pamlico Sound.',
    distance: '1.2 mi',
    rating: 4.7,
    hours: '11 AM - 9 PM',
  },
  {
    id: '4',
    name: 'Kitty Hawk Kites',
    category: 'activity',
    description: 'Kayak tours, kiteboarding lessons, and outdoor adventure rentals.',
    distance: '0.8 mi',
    rating: 4.6,
    hours: '9 AM - 6 PM',
  },
  {
    id: '5',
    name: 'Pea Island National Wildlife Refuge',
    category: 'nature',
    description: 'Premier birding destination with walking trails and observation decks.',
    distance: '3.5 mi',
    rating: 4.9,
  },
  {
    id: '6',
    name: 'Hatteras Island Trading Company',
    category: 'shop',
    description: 'Local souvenirs, beachwear, and island-inspired gifts.',
    distance: '0.6 mi',
    rating: 4.5,
    hours: '10 AM - 8 PM',
  },
];

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
    </div>
  );
};

export default function NearbyAttractions({ village, propertyName }: NearbyAttractionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>;

  const filteredAttractions = selectedCategory
    ? sampleAttractions.filter((a) => a.category === selectedCategory)
    : sampleAttractions;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Nearby Attractions</h2>
        <p className="text-gray-600 text-sm">
          Discover what's close to {propertyName || 'your rental'}
        </p>
      </div>

      {/* Category filters */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-ocean-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => {
            const config = categoryConfig[cat];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  cat === selectedCategory
                    ? 'bg-ocean-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {config.icon}
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Attractions list */}
      <div className="divide-y divide-gray-100">
        <AnimatePresence mode="wait">
          {filteredAttractions.map((attraction) => (
            <motion.div
              key={attraction.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setExpandedId(expandedId === attraction.id ? null : attraction.id)}
            >
              <div className="flex items-start gap-4">
                {/* Category icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${categoryConfig[attraction.category].color}`}>
                  {categoryConfig[attraction.category].icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{attraction.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-ocean-600 font-medium">
                          {attraction.distance}
                        </span>
                        {attraction.rating && <StarRating rating={attraction.rating} />}
                      </div>
                    </div>
                    <motion.svg
                      animate={{ rotate: expandedId === attraction.id ? 180 : 0 }}
                      className="w-5 h-5 text-gray-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </div>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {expandedId === attraction.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="text-gray-600 text-sm mt-3">{attraction.description}</p>
                        {attraction.hours && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {attraction.hours}
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <button className="flex items-center gap-1 px-3 py-1.5 bg-ocean-600 text-white text-sm rounded-lg hover:bg-ocean-700 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Directions
                          </button>
                          <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            More Info
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <button className="w-full py-2 text-ocean-600 hover:text-ocean-700 font-medium text-sm transition-colors">
          View all nearby attractions
        </button>
      </div>
    </div>
  );
}
