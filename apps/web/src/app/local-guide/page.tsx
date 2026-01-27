'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Utensils,
  Calendar,
  ShoppingBag,
  MapPin,
  Star,
  Clock,
  Phone,
  ExternalLink,
  Filter,
  ChevronRight,
  Waves,
  Music,
  Users,
  Bird,
  Trophy,
  Heart,
  DollarSign
} from 'lucide-react';
import {
  restaurants,
  localEvents,
  localShops,
  getAllCuisines,
  getPriceLevelDisplay,
  Restaurant,
  LocalEvent,
  LocalShop
} from '@/lib/local-guide-data';
import { villages } from '@/lib/island-data';
import { cn } from '@/lib/utils';
import LocalExperiences from '@/components/experiences/LocalExperiences';

type Tab = 'dining' | 'events' | 'shops';

export default function LocalGuidePage() {
  const [activeTab, setActiveTab] = useState<Tab>('dining');
  const [selectedVillage, setSelectedVillage] = useState<string>('all');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');

  const cuisines = getAllCuisines();

  const filteredRestaurants = restaurants.filter(r => {
    if (selectedVillage !== 'all' && r.village !== selectedVillage) return false;
    if (selectedCuisine !== 'all' && !r.cuisine.includes(selectedCuisine)) return false;
    return true;
  });

  const filteredEvents = localEvents.filter(e =>
    selectedVillage === 'all' || e.village === selectedVillage
  );

  const filteredShops = localShops.filter(s =>
    selectedVillage === 'all' || s.village === selectedVillage
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white py-16">
        <div className="container-page">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-orange-200 mb-4">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wide">Local Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Taste & Experience Hatteras
            </h1>
            <p className="text-xl text-orange-100 mb-6">
              Discover the best local restaurants, upcoming events, and unique shops across the island.
              From fresh-caught seafood to hidden gems, we've curated the essentials.
            </p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="container-page">
          <div className="flex items-center gap-1 overflow-x-auto py-4">
            <TabButton
              active={activeTab === 'dining'}
              onClick={() => setActiveTab('dining')}
              icon={<Utensils className="w-5 h-5" />}
              label="Dining"
              count={restaurants.length}
            />
            <TabButton
              active={activeTab === 'events'}
              onClick={() => setActiveTab('events')}
              icon={<Calendar className="w-5 h-5" />}
              label="Events"
              count={localEvents.length}
            />
            <TabButton
              active={activeTab === 'shops'}
              onClick={() => setActiveTab('shops')}
              icon={<ShoppingBag className="w-5 h-5" />}
              label="Shops"
              count={localShops.length}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 border-b">
        <div className="container-page py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter:</span>
            </div>

            {/* Village Filter */}
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Villages</option>
              {villages.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>

            {/* Cuisine Filter (only for dining) */}
            {activeTab === 'dining' && (
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Cuisines</option>
                {cuisines.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-page py-12">
        {activeTab === 'dining' && (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredRestaurants.map((restaurant, index) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />
            ))}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            {filteredEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        )}

        {activeTab === 'shops' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop, index) => (
              <ShopCard key={shop.id} shop={shop} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'dining' && filteredRestaurants.length === 0) ||
          (activeTab === 'events' && filteredEvents.length === 0) ||
          (activeTab === 'shops' && filteredShops.length === 0)) && (
          <div className="text-center py-12">
            <p className="text-gray-500">No results found with the selected filters.</p>
            <button
              onClick={() => {
                setSelectedVillage('all');
                setSelectedCuisine('all');
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Local Experiences Section */}
      <section className="py-16 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="container-page">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 text-teal-600 mb-2">
              <Waves className="w-5 h-5" />
              <span className="font-medium">Unique Experiences</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Book Local Adventures</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From kayaking through the marshes to guided fishing trips, discover authentic
              Hatteras Island experiences led by local experts.
            </p>
          </div>
          <LocalExperiences />
        </div>
      </section>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap',
        active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      )}
    >
      {icon}
      <span>{label}</span>
      <span className={cn(
        'text-xs px-1.5 py-0.5 rounded-full',
        active ? 'bg-white/20' : 'bg-gray-200'
      )}>
        {count}
      </span>
    </button>
  );
}

function RestaurantCard({ restaurant, index }: { restaurant: Restaurant; index: number }) {
  const villageName = villages.find(v => v.id === restaurant.village)?.name || restaurant.village;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{restaurant.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">{restaurant.rating}</span>
              </div>
              <span className="text-gray-400">·</span>
              <span className="text-sm text-gray-500">{restaurant.reviewCount} reviews</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-green-600 font-medium">
              {getPriceLevelDisplay(restaurant.priceLevel)}
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{restaurant.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {restaurant.cuisine.map(c => (
            <span key={c} className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded">
              {c}
            </span>
          ))}
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{villageName}</span>
          </div>
          {restaurant.hours && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{restaurant.hours}</span>
            </div>
          )}
          {restaurant.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <a href={`tel:${restaurant.phone}`} className="text-blue-600 hover:underline">
                {restaurant.phone}
              </a>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          {restaurant.features.slice(0, 4).map(f => (
            <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {f}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function EventCard({ event, index }: { event: LocalEvent; index: number }) {
  const villageName = villages.find(v => v.id === event.village)?.name || event.village;

  const getCategoryIcon = (category: LocalEvent['category']) => {
    const icons = {
      festival: <Music className="w-5 h-5" />,
      market: <ShoppingBag className="w-5 h-5" />,
      music: <Music className="w-5 h-5" />,
      sports: <Trophy className="w-5 h-5" />,
      nature: <Bird className="w-5 h-5" />,
      family: <Users className="w-5 h-5" />,
      community: <Heart className="w-5 h-5" />
    };
    return icons[category] || <Calendar className="w-5 h-5" />;
  };

  const getCategoryColor = (category: LocalEvent['category']) => {
    const colors = {
      festival: 'bg-purple-100 text-purple-700',
      market: 'bg-green-100 text-green-700',
      music: 'bg-pink-100 text-pink-700',
      sports: 'bg-blue-100 text-blue-700',
      nature: 'bg-emerald-100 text-emerald-700',
      family: 'bg-amber-100 text-amber-700',
      community: 'bg-red-100 text-red-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col md:flex-row">
        {/* Date Badge */}
        <div className="md:w-32 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold">
            {new Date(event.date).getDate()}
          </span>
          <span className="text-blue-200">
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
          </span>
          {event.isRecurring && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded mt-2">
              Recurring
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize', getCategoryColor(event.category))}>
                  {event.category}
                </span>
                {event.isFree && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Free
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-lg text-gray-900">{event.name}</h3>
            </div>
            <div className="text-blue-600">
              {getCategoryIcon(event.category)}
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4">{event.description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{event.location}, {villageName}</span>
            </div>
            {event.time && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{event.time}</span>
              </div>
            )}
          </div>

          {event.recurrencePattern && (
            <p className="text-xs text-gray-500 mt-3 italic">{event.recurrencePattern}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ShopCard({ shop, index }: { shop: LocalShop; index: number }) {
  const villageName = villages.find(v => v.id === shop.village)?.name || shop.village;

  const getCategoryIcon = (category: LocalShop['category']) => {
    const icons = {
      surf: <Waves className="w-5 h-5" />,
      gifts: <ShoppingBag className="w-5 h-5" />,
      grocery: <ShoppingBag className="w-5 h-5" />,
      clothing: <ShoppingBag className="w-5 h-5" />,
      art: <Heart className="w-5 h-5" />,
      outdoor: <Bird className="w-5 h-5" />,
      convenience: <ShoppingBag className="w-5 h-5" />
    };
    return icons[category] || <ShoppingBag className="w-5 h-5" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
          {getCategoryIcon(shop.category)}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{shop.name}</h3>
          <p className="text-sm text-gray-500 capitalize">{shop.category}</p>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4">{shop.description}</p>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{villageName}</span>
        </div>
        {shop.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <a href={`tel:${shop.phone}`} className="text-blue-600 hover:underline">
              {shop.phone}
            </a>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {shop.features.map(f => (
          <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {f}
          </span>
        ))}
      </div>

      {shop.website && (
        <a
          href={shop.website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Visit Website
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </motion.div>
  );
}
