'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Compass,
  Star,
  Clock,
  Users,
  MapPin,
  Calendar,
  ChevronRight,
  Heart,
  Filter,
  X,
  Check,
  Fish,
  Waves,
  Camera,
  Sailboat,
  Bike,
  Utensils,
} from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  price: number;
  priceType: 'person' | 'group';
  duration: string;
  rating: number;
  reviewCount: number;
  location: string;
  maxGuests: number;
  highlights: string[];
  includes: string[];
  provider: string;
  availability: string[];
}

const experiences: Experience[] = [
  {
    id: '1',
    title: 'Offshore Fishing Charter',
    category: 'fishing',
    description: 'Deep sea fishing adventure targeting tuna, mahi-mahi, and wahoo. All equipment provided.',
    image: '/images/experiences/fishing.jpg',
    price: 1200,
    priceType: 'group',
    duration: '8 hours',
    rating: 4.9,
    reviewCount: 127,
    location: 'Hatteras Harbor',
    maxGuests: 6,
    highlights: ['Full-day trip', 'Professional captain', 'Fish cleaning included'],
    includes: ['Fishing gear', 'Bait & tackle', 'Cooler & ice', 'Fish cleaning'],
    provider: 'Hatteras Charters',
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  {
    id: '2',
    title: 'Beginner Surf Lessons',
    category: 'surfing',
    description: 'Learn to surf with patient instructors on perfect beginner waves. Boards and wetsuits included.',
    image: '/images/experiences/surfing.jpg',
    price: 75,
    priceType: 'person',
    duration: '2 hours',
    rating: 4.8,
    reviewCount: 243,
    location: 'Waves Beach',
    maxGuests: 8,
    highlights: ['Small groups', 'All skill levels', 'Stand up guaranteed'],
    includes: ['Surfboard', 'Wetsuit', 'Rash guard', 'Beach photos'],
    provider: 'OBX Surf School',
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  {
    id: '3',
    title: 'Sunset Kayak Tour',
    category: 'kayaking',
    description: 'Paddle through the Pamlico Sound as the sun sets. See wildlife and learn about local ecology.',
    image: '/images/experiences/kayak.jpg',
    price: 55,
    priceType: 'person',
    duration: '2.5 hours',
    rating: 4.9,
    reviewCount: 89,
    location: 'Salvo',
    maxGuests: 12,
    highlights: ['Sunset views', 'Wildlife sightings', 'Eco-friendly'],
    includes: ['Kayak & paddle', 'Life jacket', 'Guide', 'Water bottle'],
    provider: 'Hatteras Watersports',
    availability: ['Tue', 'Thu', 'Sat', 'Sun'],
  },
  {
    id: '4',
    title: 'Lighthouse History Tour',
    category: 'tour',
    description: 'Explore the iconic Cape Hatteras Lighthouse with an expert historian. Learn the fascinating stories.',
    image: '/images/experiences/lighthouse.jpg',
    price: 35,
    priceType: 'person',
    duration: '1.5 hours',
    rating: 4.7,
    reviewCount: 156,
    location: 'Buxton',
    maxGuests: 20,
    highlights: ['Climb the lighthouse', 'Historic photos', 'Gift shop discount'],
    includes: ['Admission', 'Guided tour', 'Souvenir photo'],
    provider: 'Outer Banks History',
    availability: ['Mon', 'Wed', 'Fri', 'Sat'],
  },
  {
    id: '5',
    title: 'Wild Horse Adventure Tour',
    category: 'tour',
    description: 'See the famous Corolla wild horses in their natural habitat on this 4x4 beach adventure.',
    image: '/images/experiences/horses.jpg',
    price: 65,
    priceType: 'person',
    duration: '2 hours',
    rating: 4.9,
    reviewCount: 312,
    location: 'Corolla',
    maxGuests: 10,
    highlights: ['Guaranteed sightings', '4x4 adventure', 'Family friendly'],
    includes: ['4x4 transport', 'Guide', 'Bottled water', 'Photo opportunities'],
    provider: 'Wild Horse Tours',
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  {
    id: '6',
    title: 'Bike the OBX Trail',
    category: 'biking',
    description: 'Explore 25 miles of scenic bike paths through villages and natural areas.',
    image: '/images/experiences/biking.jpg',
    price: 40,
    priceType: 'person',
    duration: '4 hours',
    rating: 4.6,
    reviewCount: 78,
    location: 'Multiple locations',
    maxGuests: 8,
    highlights: ['Self-guided', 'Multiple routes', 'Beach cruisers'],
    includes: ['Bike rental', 'Helmet', 'Lock', 'Map & route guide'],
    provider: 'OBX Bike Rentals',
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
];

const categories = [
  { id: 'all', label: 'All', icon: Compass },
  { id: 'fishing', label: 'Fishing', icon: Fish },
  { id: 'surfing', label: 'Surfing', icon: Waves },
  { id: 'kayaking', label: 'Kayaking', icon: Sailboat },
  { id: 'tour', label: 'Tours', icon: Camera },
  { id: 'biking', label: 'Biking', icon: Bike },
];

export default function LocalExperiences() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredExperiences =
    selectedCategory === 'all'
      ? experiences
      : experiences.filter((e) => e.category === selectedCategory);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.id === category);
    return cat?.icon || Compass;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-rose-600 to-pink-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Local Experiences</h2>
            <p className="text-rose-200 text-sm">Book unforgettable adventures</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-rose-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Experience Grid */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {filteredExperiences.map((experience, index) => {
            const CategoryIcon = getCategoryIcon(experience.category);
            return (
              <motion.div
                key={experience.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                onClick={() => setSelectedExperience(experience)}
              >
                <div className="relative aspect-[16/10]">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-200 to-pink-200 flex items-center justify-center">
                    <CategoryIcon className="w-16 h-16 text-rose-300" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(experience.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.includes(experience.id)
                          ? 'fill-rose-500 text-rose-500'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                      <CategoryIcon className="w-4 h-4" />
                      <span className="capitalize">{experience.category}</span>
                    </div>
                    <h3 className="text-white font-bold text-lg">{experience.title}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {experience.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {experience.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{experience.rating}</span>
                      <span className="text-gray-500 text-sm">({experience.reviewCount})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-gray-900">${experience.price}</span>
                      <span className="text-gray-500 text-sm">
                        /{experience.priceType === 'person' ? 'person' : 'group'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Experience Detail Modal */}
      <AnimatePresence>
        {selectedExperience && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExperience(null)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-white rounded-t-3xl z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{selectedExperience.title}</h2>
                <button
                  onClick={() => setSelectedExperience(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {/* Hero */}
                <div className="relative aspect-video bg-gradient-to-br from-rose-200 to-pink-200 rounded-xl mb-6 flex items-center justify-center">
                  {(() => {
                    const Icon = getCategoryIcon(selectedExperience.category);
                    return <Icon className="w-24 h-24 text-rose-300" />;
                  })()}
                </div>

                {/* Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <span className="font-bold">{selectedExperience.rating}</span>
                      <span className="text-gray-500">({selectedExperience.reviewCount} reviews)</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500">{selectedExperience.provider}</span>
                    </div>

                    <p className="text-gray-600 mb-6">{selectedExperience.description}</p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Highlights</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedExperience.highlights.map((h) => (
                            <span
                              key={h}
                              className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-sm"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">What's Included</h4>
                        <ul className="space-y-2">
                          {selectedExperience.includes.map((item) => (
                            <li key={item} className="flex items-center gap-2 text-gray-600">
                              <Check className="w-4 h-4 text-green-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Booking Card */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-3xl font-bold text-gray-900">
                        ${selectedExperience.price}
                      </span>
                      <span className="text-gray-500">
                        /{selectedExperience.priceType === 'person' ? 'person' : 'group'}
                      </span>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Date
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedExperience.availability.slice(0, 4).map((day) => (
                            <button
                              key={day}
                              onClick={() => setSelectedDate(day)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedDate === day
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-white border border-gray-200 text-gray-700 hover:border-rose-300'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Guests
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setGuests(Math.max(1, guests - 1))}
                            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-semibold text-lg">{guests}</span>
                          <button
                            onClick={() =>
                              setGuests(Math.min(selectedExperience.maxGuests, guests + 1))
                            }
                            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            +
                          </button>
                          <span className="text-sm text-gray-500">
                            Max {selectedExperience.maxGuests} guests
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">
                          ${selectedExperience.price} × {guests}{' '}
                          {selectedExperience.priceType === 'person' ? 'guests' : ''}
                        </span>
                        <span className="font-medium">
                          $
                          {selectedExperience.priceType === 'person'
                            ? selectedExperience.price * guests
                            : selectedExperience.price}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>
                          $
                          {selectedExperience.priceType === 'person'
                            ? selectedExperience.price * guests
                            : selectedExperience.price}
                        </span>
                      </div>
                    </div>

                    <button
                      disabled={!selectedDate}
                      className="w-full py-3 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Book Now
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-3">
                      Free cancellation up to 24 hours before
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
