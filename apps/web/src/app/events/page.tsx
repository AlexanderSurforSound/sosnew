'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Music,
  Fish,
  Camera,
  Palette,
  Waves,
  Flag,
  Sun,
  Star,
} from 'lucide-react';

const events = [
  {
    id: '1',
    title: 'OBX Surf Classic',
    date: '2024-03-15',
    endDate: '2024-03-17',
    time: '8:00 AM - 5:00 PM',
    location: 'Rodanthe Pier',
    village: 'Rodanthe',
    category: 'Sports',
    description: 'Annual surf competition featuring local and regional surfers. Categories for all ages and skill levels.',
    icon: Waves,
    featured: true,
  },
  {
    id: '2',
    title: 'Hatteras Village Offshore Open',
    date: '2024-04-20',
    endDate: '2024-04-21',
    time: '6:00 AM - 6:00 PM',
    location: 'Hatteras Village Marina',
    village: 'Hatteras',
    category: 'Fishing',
    description: 'Big game fishing tournament with prizes for largest catches. Species include marlin, tuna, and wahoo.',
    icon: Fish,
    featured: true,
  },
  {
    id: '3',
    title: 'Avon Art Walk',
    date: '2024-03-22',
    time: '10:00 AM - 4:00 PM',
    location: 'Downtown Avon',
    village: 'Avon',
    category: 'Arts',
    description: 'Local artists showcase paintings, photography, sculptures, and crafts. Live music and food vendors.',
    icon: Palette,
    featured: false,
  },
  {
    id: '4',
    title: 'Cape Hatteras Lighthouse Anniversary',
    date: '2024-04-01',
    time: '9:00 AM - 5:00 PM',
    location: 'Cape Hatteras Lighthouse',
    village: 'Buxton',
    category: 'History',
    description: 'Celebrate the lighthouse\'s history with special tours, exhibits, and family activities.',
    icon: Camera,
    featured: false,
  },
  {
    id: '5',
    title: 'Kiteboarding Festival',
    date: '2024-05-10',
    endDate: '2024-05-12',
    time: 'All Day',
    location: 'Canadian Hole',
    village: 'Buxton',
    category: 'Sports',
    description: 'Three days of kiteboarding action featuring demos, lessons, and competitions.',
    icon: Flag,
    featured: true,
  },
  {
    id: '6',
    title: 'Salvo Summer Kickoff',
    date: '2024-05-25',
    time: '12:00 PM - 9:00 PM',
    location: 'Salvo Day Use Area',
    village: 'Salvo',
    category: 'Festival',
    description: 'Welcome summer with live music, local food, games, and fireworks at sunset.',
    icon: Sun,
    featured: false,
  },
  {
    id: '7',
    title: 'OBX Music Festival',
    date: '2024-06-15',
    endDate: '2024-06-16',
    time: '3:00 PM - 11:00 PM',
    location: 'Frisco Woods Campground',
    village: 'Frisco',
    category: 'Music',
    description: 'Two days of live music featuring local and regional bands. Beach vibes and good times.',
    icon: Music,
    featured: false,
  },
  {
    id: '8',
    title: 'Waves Art & Craft Fair',
    date: '2024-07-04',
    time: '9:00 AM - 3:00 PM',
    location: 'Waves Village Center',
    village: 'Waves',
    category: 'Arts',
    description: 'Independence Day celebration with local artisans, food, and family activities.',
    icon: Star,
    featured: false,
  },
];

const categories = [
  { id: 'all', label: 'All Events', icon: Calendar },
  { id: 'Sports', label: 'Sports', icon: Waves },
  { id: 'Fishing', label: 'Fishing', icon: Fish },
  { id: 'Music', label: 'Music', icon: Music },
  { id: 'Arts', label: 'Arts & Culture', icon: Palette },
  { id: 'Festival', label: 'Festivals', icon: Flag },
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear] = useState(new Date().getFullYear());

  const filteredEvents = activeCategory === 'all'
    ? events
    : events.filter((event) => event.category === activeCategory);

  const monthEvents = filteredEvents.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
  });

  const featuredEvents = events.filter((e) => e.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="w-6 h-6" />
              <span className="font-medium">What's Happening</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Hatteras Island Events
            </h1>
            <p className="text-xl text-purple-100">
              From fishing tournaments to music festivals, there's always something exciting happening on the island.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Featured Events */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid md:grid-cols-3 gap-6">
          {featuredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="relative h-32 bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <event.icon className="w-12 h-12 text-white/30" />
                <div className="absolute top-4 left-4">
                  <span className="px-2 py-1 bg-amber-400 text-amber-900 rounded-full text-xs font-bold">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-sm text-purple-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <MapPin className="w-4 h-4" />
                  {event.location}, {event.village}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <category.icon className="w-4 h-4" />
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setCurrentMonth((m) => (m === 0 ? 11 : m - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              {months[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={() => setCurrentMonth((m) => (m === 11 ? 0 : m + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Events List */}
          {monthEvents.length > 0 ? (
            <div className="space-y-4">
              {monthEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-16 text-center flex-shrink-0">
                    <div className="text-3xl font-bold text-purple-600">
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="text-sm text-gray-500 uppercase">
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.category === 'Sports' ? 'bg-blue-100 text-blue-700' :
                        event.category === 'Fishing' ? 'bg-cyan-100 text-cyan-700' :
                        event.category === 'Music' ? 'bg-pink-100 text-pink-700' :
                        event.category === 'Arts' ? 'bg-purple-100 text-purple-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {event.category}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events this month</h3>
              <p className="text-gray-600">
                Check back later or browse other months for upcoming events.
              </p>
            </div>
          )}
        </div>

        {/* Submit Event CTA */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Know About an Event?</h2>
          <p className="text-purple-100 mb-6">
            Help us keep our calendar up to date. Submit local events for review.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
          >
            Submit an Event
          </Link>
        </div>
      </div>
    </div>
  );
}
