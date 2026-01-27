'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UtensilsCrossed,
  MapPin,
  Clock,
  Star,
  Users,
  Calendar,
  Phone,
  ExternalLink,
  Search,
  Filter,
  Check,
  Heart,
  DollarSign,
  Wifi,
  Car,
  Wine,
  Fish,
  Beef,
  Leaf,
  ChevronRight,
  X,
} from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  priceRange: 1 | 2 | 3 | 4;
  rating: number;
  reviewCount: number;
  image?: string;
  location: string;
  distance: string;
  description: string;
  features: string[];
  hours: string;
  phone: string;
  website?: string;
  popular: boolean;
  acceptsReservations: boolean;
  availableTimes?: string[];
}

const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Cafe Pamlico',
    cuisine: ['Seafood', 'American'],
    priceRange: 3,
    rating: 4.7,
    reviewCount: 342,
    location: 'Buxton',
    distance: '2.3 mi',
    description: 'Upscale waterfront dining featuring fresh local seafood and stunning sunset views.',
    features: ['Waterfront', 'Full Bar', 'Outdoor Seating', 'Reservations'],
    hours: '5:00 PM - 9:30 PM',
    phone: '(252) 995-7483',
    website: 'https://cafepamlico.com',
    popular: true,
    acceptsReservations: true,
    availableTimes: ['5:00 PM', '5:30 PM', '6:00 PM', '7:00 PM', '7:30 PM', '8:00 PM'],
  },
  {
    id: '2',
    name: 'Dinky\'s Waterfront Restaurant',
    cuisine: ['Seafood', 'Southern'],
    priceRange: 2,
    rating: 4.5,
    reviewCount: 567,
    location: 'Hatteras Village',
    distance: '5.1 mi',
    description: 'Casual family-friendly spot known for fresh catch and OBX hospitality.',
    features: ['Waterfront', 'Kid-Friendly', 'Outdoor Seating', 'Full Bar'],
    hours: '11:30 AM - 9:00 PM',
    phone: '(252) 986-2345',
    popular: true,
    acceptsReservations: true,
    availableTimes: ['6:00 PM', '6:30 PM', '7:00 PM', '8:00 PM'],
  },
  {
    id: '3',
    name: 'Breakwater Restaurant',
    cuisine: ['Seafood', 'Fine Dining'],
    priceRange: 4,
    rating: 4.8,
    reviewCount: 215,
    location: 'Hatteras Village',
    distance: '5.3 mi',
    description: 'Fine dining experience with innovative coastal cuisine and extensive wine list.',
    features: ['Fine Dining', 'Wine Selection', 'Reservations Required', 'Romantic'],
    hours: '5:30 PM - 9:00 PM',
    phone: '(252) 986-2733',
    popular: true,
    acceptsReservations: true,
    availableTimes: ['5:30 PM', '6:00 PM', '7:30 PM', '8:00 PM'],
  },
  {
    id: '4',
    name: 'Orange Blossom Bakery',
    cuisine: ['Bakery', 'Breakfast', 'Cafe'],
    priceRange: 1,
    rating: 4.9,
    reviewCount: 892,
    location: 'Buxton',
    distance: '2.1 mi',
    description: 'Famous for their apple uglies and fresh-baked goods. A local institution.',
    features: ['Breakfast', 'Bakery', 'Coffee', 'Casual'],
    hours: '6:30 AM - 2:00 PM',
    phone: '(252) 995-4109',
    popular: true,
    acceptsReservations: false,
  },
  {
    id: '5',
    name: 'Rusty\'s Surf & Turf',
    cuisine: ['Seafood', 'Steakhouse'],
    priceRange: 3,
    rating: 4.4,
    reviewCount: 234,
    location: 'Buxton',
    distance: '2.5 mi',
    description: 'Local favorite for both surf and turf. Great steaks and fresh seafood.',
    features: ['Full Bar', 'Steaks', 'Outdoor Seating', 'Sports TV'],
    hours: '4:00 PM - 9:00 PM',
    phone: '(252) 995-4184',
    popular: false,
    acceptsReservations: true,
    availableTimes: ['5:00 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'],
  },
  {
    id: '6',
    name: 'Atlantic Surf Tacos',
    cuisine: ['Mexican', 'Tacos', 'Casual'],
    priceRange: 1,
    rating: 4.6,
    reviewCount: 445,
    location: 'Avon',
    distance: '4.2 mi',
    description: 'Surf-inspired tacos and burritos with fresh ingredients and ocean views.',
    features: ['Quick Service', 'Outdoor Seating', 'Ocean View', 'Dog-Friendly'],
    hours: '11:00 AM - 8:00 PM',
    phone: '(252) 995-2888',
    popular: true,
    acceptsReservations: false,
  },
  {
    id: '7',
    name: 'Diamond Shoals Restaurant',
    cuisine: ['Seafood', 'American'],
    priceRange: 2,
    rating: 4.3,
    reviewCount: 678,
    location: 'Buxton',
    distance: '2.0 mi',
    description: 'Classic OBX dining since 1965. Fresh seafood in a casual atmosphere.',
    features: ['Historic', 'Family-Friendly', 'Large Groups', 'Full Bar'],
    hours: '11:00 AM - 9:00 PM',
    phone: '(252) 995-5217',
    popular: false,
    acceptsReservations: true,
    availableTimes: ['5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '8:00 PM', '8:30 PM'],
  },
  {
    id: '8',
    name: 'Pangea Tavern',
    cuisine: ['International', 'Tapas', 'Wine Bar'],
    priceRange: 3,
    rating: 4.6,
    reviewCount: 189,
    location: 'Avon',
    distance: '4.0 mi',
    description: 'Global tapas and craft cocktails in a stylish, intimate setting.',
    features: ['Wine Bar', 'Tapas', 'Date Night', 'Craft Cocktails'],
    hours: '5:00 PM - 10:00 PM',
    phone: '(252) 995-3119',
    popular: false,
    acceptsReservations: true,
    availableTimes: ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'],
  },
];

type CuisineFilter = 'all' | 'seafood' | 'american' | 'casual' | 'fine-dining';
type PriceFilter = 'all' | 1 | 2 | 3 | 4;

interface RestaurantReservationsProps {
  tripDates?: { start: Date; end: Date };
  onReservation?: (reservation: ReservationData) => void;
}

interface ReservationData {
  restaurant: Restaurant;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string;
}

export default function RestaurantReservations({
  tripDates,
  onReservation,
}: RestaurantReservationsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState<CuisineFilter>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [reservationStep, setReservationStep] = useState<'select' | 'details' | 'confirmed'>('select');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.some((c) =>
        c.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCuisine =
      cuisineFilter === 'all' ||
      (cuisineFilter === 'seafood' && restaurant.cuisine.includes('Seafood')) ||
      (cuisineFilter === 'american' && restaurant.cuisine.includes('American')) ||
      (cuisineFilter === 'casual' && restaurant.priceRange <= 2) ||
      (cuisineFilter === 'fine-dining' && restaurant.priceRange >= 3);

    const matchesPrice = priceFilter === 'all' || restaurant.priceRange === priceFilter;

    return matchesSearch && matchesCuisine && matchesPrice;
  });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const getPriceLabel = (range: number) => {
    return Array.from({ length: range })
      .map(() => '$')
      .join('');
  };

  const handleMakeReservation = () => {
    if (selectedRestaurant && onReservation) {
      onReservation({
        restaurant: selectedRestaurant,
        date: selectedDate,
        time: selectedTime,
        partySize,
        specialRequests,
      });
    }
    setReservationStep('confirmed');
  };

  const resetReservation = () => {
    setSelectedRestaurant(null);
    setReservationStep('select');
    setSelectedDate('');
    setSelectedTime('');
    setPartySize(2);
    setSpecialRequests('');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white">
        <div className="flex items-center gap-3 mb-4">
          <UtensilsCrossed className="w-6 h-6" />
          <div>
            <h2 className="text-lg font-bold">Local Dining</h2>
            <p className="text-rose-100 text-sm">
              Discover Hatteras Island's best restaurants
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-200" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants or cuisine..."
              className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-rose-200 focus:outline-none focus:bg-white/30"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters ? 'bg-white text-rose-600' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-100 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Cuisine</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All', icon: null },
                    { id: 'seafood', label: 'Seafood', icon: <Fish className="w-4 h-4" /> },
                    { id: 'american', label: 'American', icon: <Beef className="w-4 h-4" /> },
                    { id: 'casual', label: 'Casual', icon: null },
                    { id: 'fine-dining', label: 'Fine Dining', icon: <Wine className="w-4 h-4" /> },
                  ].map((cuisine) => (
                    <button
                      key={cuisine.id}
                      onClick={() => setCuisineFilter(cuisine.id as CuisineFilter)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        cuisineFilter === cuisine.id
                          ? 'bg-rose-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cuisine.icon}
                      {cuisine.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Price Range</p>
                <div className="flex gap-2">
                  {['all', 1, 2, 3, 4].map((price) => (
                    <button
                      key={price}
                      onClick={() => setPriceFilter(price as PriceFilter)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        priceFilter === price
                          ? 'bg-rose-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {price === 'all' ? 'All' : getPriceLabel(price as number)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Filters */}
      <div className="p-3 border-b border-gray-100 flex gap-2 overflow-x-auto">
        <span className="flex-shrink-0 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-full text-sm font-medium">
          Accepts Reservations
        </span>
        <span className="flex-shrink-0 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
          Popular
        </span>
        <span className="flex-shrink-0 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          Waterfront
        </span>
      </div>

      {/* Restaurant List */}
      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {filteredRestaurants.map((restaurant, index) => (
          <motion.div
            key={restaurant.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => {
              setSelectedRestaurant(restaurant);
              setReservationStep('select');
            }}
          >
            <div className="flex gap-4">
              {/* Image Placeholder */}
              <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-orange-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                <UtensilsCrossed className="w-8 h-8 text-rose-300" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                      {restaurant.popular && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {restaurant.cuisine.join(' • ')} • {getPriceLabel(restaurant.priceRange)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(restaurant.id);
                    }}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.includes(restaurant.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-gray-900">{restaurant.rating}</span>
                    <span className="text-gray-500">({restaurant.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {restaurant.distance}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    {restaurant.hours.split(' - ')[0]}
                  </div>
                </div>

                <div className="flex gap-1 mt-2 overflow-x-auto">
                  {restaurant.features.slice(0, 3).map((feature) => (
                    <span
                      key={feature}
                      className="flex-shrink-0 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Available Times Preview */}
            {restaurant.acceptsReservations && restaurant.availableTimes && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Tonight's availability:</p>
                <div className="flex gap-2 overflow-x-auto">
                  {restaurant.availableTimes.slice(0, 5).map((time) => (
                    <button
                      key={time}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRestaurant(restaurant);
                        setSelectedTime(time);
                        setReservationStep('details');
                      }}
                      className="px-3 py-1.5 bg-rose-50 text-rose-600 text-sm font-medium rounded-lg hover:bg-rose-100 transition-colors"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Restaurant Detail / Reservation Modal */}
      <AnimatePresence>
        {selectedRestaurant && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetReservation}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl z-50"
            >
              {/* Confirmed Step */}
              {reservationStep === 'confirmed' && (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-10 h-10 text-green-600" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Reservation Confirmed!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {selectedRestaurant.name} on {selectedDate} at {selectedTime} for{' '}
                    {partySize} {partySize === 1 ? 'guest' : 'guests'}
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{selectedRestaurant.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{selectedRestaurant.location}</span>
                    </div>
                  </div>
                  <button
                    onClick={resetReservation}
                    className="px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Details Step */}
              {reservationStep === 'details' && (
                <div>
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => setReservationStep('select')}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <h3 className="font-semibold">Complete Reservation</h3>
                    <button
                      onClick={resetReservation}
                      className="p-1 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="bg-rose-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900">{selectedRestaurant.name}</h4>
                      <p className="text-sm text-gray-600">{selectedRestaurant.location}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedRestaurant.availableTimes?.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                              selectedTime === time
                                ? 'bg-rose-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Party Size
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setPartySize(Math.max(1, partySize - 1))}
                          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          <Users className="w-5 h-5" />
                        </button>
                        <span className="text-2xl font-bold w-12 text-center">{partySize}</span>
                        <button
                          onClick={() => setPartySize(Math.min(20, partySize + 1))}
                          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          <Users className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requests (optional)
                      </label>
                      <textarea
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Allergies, celebrations, seating preferences..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-100">
                    <button
                      onClick={handleMakeReservation}
                      disabled={!selectedDate || !selectedTime}
                      className="w-full py-4 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirm Reservation
                    </button>
                  </div>
                </div>
              )}

              {/* Select Step - Restaurant Details */}
              {reservationStep === 'select' && (
                <div>
                  {/* Restaurant Image */}
                  <div className="relative h-48 bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center">
                    <UtensilsCrossed className="w-16 h-16 text-rose-300" />
                    <button
                      onClick={resetReservation}
                      className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {selectedRestaurant.name}
                        </h3>
                        <p className="text-gray-500">
                          {selectedRestaurant.cuisine.join(' • ')} •{' '}
                          {getPriceLabel(selectedRestaurant.priceRange)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{selectedRestaurant.rating}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{selectedRestaurant.description}</p>

                    {/* Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{selectedRestaurant.hours}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">
                          {selectedRestaurant.location} • {selectedRestaurant.distance}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <a
                          href={`tel:${selectedRestaurant.phone}`}
                          className="text-rose-600 hover:underline"
                        >
                          {selectedRestaurant.phone}
                        </a>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedRestaurant.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    {selectedRestaurant.acceptsReservations ? (
                      <button
                        onClick={() => setReservationStep('details')}
                        className="w-full py-4 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-5 h-5" />
                        Make a Reservation
                      </button>
                    ) : (
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-gray-600 mb-2">
                          This restaurant doesn't accept reservations
                        </p>
                        <a
                          href={`tel:${selectedRestaurant.phone}`}
                          className="inline-flex items-center gap-2 text-rose-600 font-medium hover:underline"
                        >
                          <Phone className="w-4 h-4" />
                          Call for inquiries
                        </a>
                      </div>
                    )}

                    {selectedRestaurant.website && (
                      <a
                        href={selectedRestaurant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 mt-3 text-gray-600 hover:text-gray-900"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
