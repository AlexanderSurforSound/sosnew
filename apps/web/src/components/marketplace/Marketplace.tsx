'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Store,
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  ChevronRight,
  Filter,
  Search,
  Heart,
  X,
  Check,
  Bike,
  Car,
  Baby,
  Sparkles,
  UtensilsCrossed,
  Camera,
  Waves,
  Shirt,
  Package,
  Shield,
  Calendar,
} from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  slug: string;
  category: VendorCategory;
  description: string;
  logo?: string;
  coverImage?: string;
  rating: number;
  reviewCount: number;
  location: string;
  phone?: string;
  website?: string;
  hours?: string;
  verified: boolean;
  featured: boolean;
  services: Service[];
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  priceType: 'flat' | 'hourly' | 'daily' | 'per_item';
  image?: string;
  popular?: boolean;
}

type VendorCategory =
  | 'equipment_rentals'
  | 'vehicle_rentals'
  | 'baby_gear'
  | 'home_services'
  | 'wellness'
  | 'photography'
  | 'water_sports'
  | 'fishing'
  | 'catering';

const categories: { id: VendorCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'equipment_rentals', label: 'Beach & Bikes', icon: <Bike className="w-5 h-5" /> },
  { id: 'vehicle_rentals', label: 'Jeep & Cars', icon: <Car className="w-5 h-5" /> },
  { id: 'baby_gear', label: 'Baby Gear', icon: <Baby className="w-5 h-5" /> },
  { id: 'home_services', label: 'Home Services', icon: <Sparkles className="w-5 h-5" /> },
  { id: 'wellness', label: 'Wellness & Spa', icon: <Shirt className="w-5 h-5" /> },
  { id: 'photography', label: 'Photography', icon: <Camera className="w-5 h-5" /> },
  { id: 'water_sports', label: 'Water Sports', icon: <Waves className="w-5 h-5" /> },
  { id: 'fishing', label: 'Fishing Charters', icon: <Waves className="w-5 h-5" /> },
  { id: 'catering', label: 'Catering & Chef', icon: <UtensilsCrossed className="w-5 h-5" /> },
];

const sampleVendors: Vendor[] = [
  {
    id: '1',
    name: 'OBX Beach Rentals',
    slug: 'obx-beach-rentals',
    category: 'equipment_rentals',
    description: 'Premium beach equipment delivered to your rental. Chairs, umbrellas, bikes, and more.',
    rating: 4.9,
    reviewCount: 234,
    location: 'Serves all Hatteras Island',
    phone: '252-555-0101',
    website: 'obxbeachrentals.com',
    hours: '8 AM - 6 PM',
    verified: true,
    featured: true,
    services: [
      { id: 's1', name: 'Beach Chair (Daily)', description: 'Comfortable folding beach chair', price: 15, priceType: 'daily', popular: true },
      { id: 's2', name: 'Beach Umbrella (Daily)', description: '7ft umbrella with sand anchor', price: 20, priceType: 'daily', popular: true },
      { id: 's3', name: 'Beach Package', description: '2 chairs, umbrella, cooler', price: 45, priceType: 'daily', popular: true },
      { id: 's4', name: 'Cruiser Bike (Daily)', description: 'Adult beach cruiser', price: 25, priceType: 'daily' },
      { id: 's5', name: 'Kayak (Daily)', description: 'Single person kayak with paddle', price: 50, priceType: 'daily' },
      { id: 's6', name: 'Paddleboard (Daily)', description: 'SUP with paddle and leash', price: 55, priceType: 'daily' },
    ],
  },
  {
    id: '2',
    name: 'Island Jeep Adventures',
    slug: 'island-jeep-adventures',
    category: 'vehicle_rentals',
    description: 'Rent a Jeep Wrangler and explore the beaches. 4x4 beach driving permits available.',
    rating: 4.8,
    reviewCount: 156,
    location: 'Avon',
    phone: '252-555-0102',
    hours: '9 AM - 5 PM',
    verified: true,
    featured: true,
    services: [
      { id: 's1', name: 'Jeep Wrangler (Daily)', description: '4-door Jeep Wrangler', price: 175, priceType: 'daily', popular: true },
      { id: 's2', name: 'Jeep Wrangler (Weekly)', description: '4-door Jeep Wrangler - 7 days', price: 950, priceType: 'flat', popular: true },
      { id: 's3', name: 'Beach Driving Permit', description: 'Required for beach access', price: 50, priceType: 'flat' },
      { id: 's4', name: 'Golf Cart (Daily)', description: 'Street legal golf cart', price: 85, priceType: 'daily' },
    ],
  },
  {
    id: '3',
    name: 'Baby Beach Gear',
    slug: 'baby-beach-gear',
    category: 'baby_gear',
    description: 'Everything you need for traveling with little ones. Clean, sanitized, delivered.',
    rating: 5.0,
    reviewCount: 89,
    location: 'Delivers to all Hatteras',
    phone: '252-555-0103',
    verified: true,
    featured: false,
    services: [
      { id: 's1', name: 'Pack n Play', description: 'Portable crib with sheets', price: 12, priceType: 'daily', popular: true },
      { id: 's2', name: 'High Chair', description: 'Full-size high chair', price: 8, priceType: 'daily' },
      { id: 's3', name: 'Stroller', description: 'Jogging stroller', price: 15, priceType: 'daily' },
      { id: 's4', name: 'Baby Beach Tent', description: 'UV protection tent', price: 10, priceType: 'daily' },
      { id: 's5', name: 'Baby Package', description: 'Crib, high chair, stroller', price: 30, priceType: 'daily', popular: true },
    ],
  },
  {
    id: '4',
    name: 'Hatteras Home Services',
    slug: 'hatteras-home-services',
    category: 'home_services',
    description: 'Mid-stay cleaning, grocery stocking, and concierge services for your vacation.',
    rating: 4.9,
    reviewCount: 178,
    location: 'All Hatteras Island',
    phone: '252-555-0104',
    verified: true,
    featured: true,
    services: [
      { id: 's1', name: 'Mid-Stay Cleaning', description: 'Full house cleaning', price: 150, priceType: 'flat', popular: true },
      { id: 's2', name: 'Grocery Stocking', description: 'We shop and stock your kitchen', price: 50, priceType: 'flat', popular: true },
      { id: 's3', name: 'Linen Service', description: 'Fresh linens mid-week', price: 75, priceType: 'flat' },
      { id: 's4', name: 'Pool Service', description: 'Pool cleaning and chemical balance', price: 85, priceType: 'flat' },
    ],
  },
  {
    id: '5',
    name: 'Island Wellness Spa',
    slug: 'island-wellness-spa',
    category: 'wellness',
    description: 'In-home massage and spa services. Relax without leaving your vacation rental.',
    rating: 4.9,
    reviewCount: 112,
    location: 'Mobile - comes to you',
    phone: '252-555-0105',
    verified: true,
    featured: false,
    services: [
      { id: 's1', name: 'Swedish Massage (60 min)', description: 'Relaxing full body massage', price: 120, priceType: 'flat', popular: true },
      { id: 's2', name: 'Deep Tissue (60 min)', description: 'Therapeutic massage', price: 140, priceType: 'flat' },
      { id: 's3', name: 'Couples Massage', description: 'Side-by-side massage', price: 220, priceType: 'flat', popular: true },
      { id: 's4', name: 'Facial Treatment', description: 'Rejuvenating facial', price: 95, priceType: 'flat' },
    ],
  },
  {
    id: '6',
    name: 'OBX Photo Co',
    slug: 'obx-photo-co',
    category: 'photography',
    description: 'Capture your beach vacation memories with professional photography sessions.',
    rating: 5.0,
    reviewCount: 203,
    location: 'Beach locations',
    phone: '252-555-0106',
    website: 'obxphotoco.com',
    verified: true,
    featured: true,
    services: [
      { id: 's1', name: 'Mini Session (30 min)', description: '15 edited digital photos', price: 250, priceType: 'flat', popular: true },
      { id: 's2', name: 'Full Session (1 hour)', description: '40 edited digital photos', price: 400, priceType: 'flat', popular: true },
      { id: 's3', name: 'Sunrise Session', description: 'Golden hour magic', price: 450, priceType: 'flat' },
      { id: 's4', name: 'Proposal Package', description: 'Hidden photographer capture', price: 500, priceType: 'flat' },
    ],
  },
  {
    id: '7',
    name: 'Chef At Your Beach House',
    slug: 'chef-at-your-beach-house',
    category: 'catering',
    description: 'Private chef experiences in your rental. From romantic dinners to family feasts.',
    rating: 4.9,
    reviewCount: 67,
    location: 'All Hatteras Island',
    phone: '252-555-0107',
    verified: true,
    featured: false,
    services: [
      { id: 's1', name: 'Breakfast Service', description: 'Chef-prepared breakfast', price: 35, priceType: 'per_item', popular: true },
      { id: 's2', name: 'Dinner for 2', description: '3-course romantic dinner', price: 200, priceType: 'flat', popular: true },
      { id: 's3', name: 'Family Dinner (6)', description: 'Family-style meal for 6', price: 350, priceType: 'flat' },
      { id: 's4', name: 'Seafood Boil', description: 'Low country boil for 8', price: 400, priceType: 'flat', popular: true },
    ],
  },
];

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<{ service: Service; vendor: Vendor; quantity: number; dates?: string }[]>([]);

  const filteredVendors = sampleVendors.filter((vendor) => {
    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredVendors = filteredVendors.filter((v) => v.featured);
  const otherVendors = filteredVendors.filter((v) => !v.featured);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const addToCart = (vendor: Vendor, service: Service) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.service.id === service.id && item.vendor.id === vendor.id);
      if (existing) {
        return prev.map((item) =>
          item.service.id === service.id && item.vendor.id === vendor.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { service, vendor, quantity: 1 }];
    });
  };

  const getCategoryIcon = (category: VendorCategory) => {
    return categories.find((c) => c.id === category)?.icon || <Store className="w-5 h-5" />;
  };

  const getPriceLabel = (priceType: Service['priceType']) => {
    switch (priceType) {
      case 'daily':
        return '/day';
      case 'hourly':
        return '/hour';
      case 'per_item':
        return '/person';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container-page py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Vacation Marketplace</h1>
              <p className="text-emerald-100">Local services & rentals delivered to your door</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for services, rentals, vendors..."
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container-page py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Store className="w-4 h-4" />
              All Services
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        {/* Featured Vendors */}
        {featuredVendors.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              Featured Partners
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onSelect={() => setSelectedVendor(vendor)}
                  onFavorite={() => toggleFavorite(vendor.id)}
                  isFavorite={favorites.includes(vendor.id)}
                  getCategoryIcon={getCategoryIcon}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Vendors */}
        {otherVendors.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Services</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherVendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onSelect={() => setSelectedVendor(vendor)}
                  onFavorite={() => toggleFavorite(vendor.id)}
                  isFavorite={favorites.includes(vendor.id)}
                  getCategoryIcon={getCategoryIcon}
                />
              ))}
            </div>
          </section>
        )}

        {filteredVendors.length === 0 && (
          <div className="text-center py-16">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {/* Vendor Detail Modal */}
      <AnimatePresence>
        {selectedVendor && (
          <VendorDetailModal
            vendor={selectedVendor}
            onClose={() => setSelectedVendor(null)}
            onAddToCart={addToCart}
            getPriceLabel={getPriceLabel}
            getCategoryIcon={getCategoryIcon}
          />
        )}
      </AnimatePresence>

      {/* Cart Preview */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-4 px-6 py-4 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
          >
            <Package className="w-5 h-5" />
            <span className="font-semibold">
              {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full">
              ${cart.reduce((sum, item) => sum + item.service.price * item.quantity, 0)}
            </span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      )}
    </div>
  );
}

function VendorCard({
  vendor,
  onSelect,
  onFavorite,
  isFavorite,
  getCategoryIcon,
}: {
  vendor: Vendor;
  onSelect: () => void;
  onFavorite: () => void;
  isFavorite: boolean;
  getCategoryIcon: (category: VendorCategory) => React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onSelect}
    >
      <div className="relative h-40 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center text-emerald-600">
          {getCategoryIcon(vendor.category)}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite();
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
        {vendor.verified && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-xs font-medium rounded-full">
            <Shield className="w-3 h-3" />
            Verified
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1">{vendor.name}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{vendor.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-gray-900">{vendor.rating}</span>
            <span className="text-gray-500 text-sm">({vendor.reviewCount})</span>
          </div>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {vendor.location}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function VendorDetailModal({
  vendor,
  onClose,
  onAddToCart,
  getPriceLabel,
  getCategoryIcon,
}: {
  vendor: Vendor;
  onClose: () => void;
  onAddToCart: (vendor: Vendor, service: Service) => void;
  getPriceLabel: (priceType: Service['priceType']) => string;
  getCategoryIcon: (category: VendorCategory) => React.ReactNode;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50"
      />
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-white rounded-t-3xl z-50 overflow-hidden"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{vendor.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-70px)]">
          {/* Header */}
          <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-emerald-600">
                {getCategoryIcon(vendor.category)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {vendor.verified && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600 text-white text-xs font-medium rounded-full">
                      <Shield className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{vendor.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{vendor.rating}</span>
                    <span className="text-gray-500">({vendor.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1 text-gray-600">
                <MapPin className="w-4 h-4" />
                {vendor.location}
              </span>
              {vendor.phone && (
                <a href={`tel:${vendor.phone}`} className="flex items-center gap-1 text-emerald-600 hover:underline">
                  <Phone className="w-4 h-4" />
                  {vendor.phone}
                </a>
              )}
              {vendor.hours && (
                <span className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  {vendor.hours}
                </span>
              )}
            </div>
          </div>

          {/* Services */}
          <div className="p-6">
            <h3 className="font-bold text-gray-900 mb-4">Services & Rentals</h3>
            <div className="space-y-3">
              {vendor.services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{service.name}</h4>
                      {service.popular && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <span className="text-xl font-bold text-gray-900">${service.price}</span>
                      <span className="text-gray-500 text-sm">{getPriceLabel(service.priceType)}</span>
                    </div>
                    <button
                      onClick={() => onAddToCart(vendor, service)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
