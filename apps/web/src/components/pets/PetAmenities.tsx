'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dog,
  Cat,
  Check,
  X,
  MapPin,
  Phone,
  Clock,
  Star,
  Waves,
  Trees,
  ShoppingBag,
  Stethoscope,
  Scissors,
  Home,
  Info,
  ChevronDown,
  Heart,
} from 'lucide-react';

interface PetAmenity {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'property' | 'nearby';
}

interface LocalPetService {
  id: string;
  name: string;
  type: 'vet' | 'groomer' | 'store' | 'beach' | 'park' | 'boarding';
  address: string;
  phone?: string;
  hours?: string;
  distance: string;
  rating?: number;
  emergency?: boolean;
}

const propertyAmenities: PetAmenity[] = [
  {
    id: 'fenced-yard',
    name: 'Fenced Yard',
    description: 'Fully enclosed yard for off-leash play',
    icon: <Home className="w-5 h-5" />,
    category: 'property',
  },
  {
    id: 'dog-door',
    name: 'Dog Door',
    description: 'Easy access to outdoor areas',
    icon: <Home className="w-5 h-5" />,
    category: 'property',
  },
  {
    id: 'pet-beds',
    name: 'Pet Beds Provided',
    description: 'Cozy beds for your furry friends',
    icon: <Home className="w-5 h-5" />,
    category: 'property',
  },
  {
    id: 'food-bowls',
    name: 'Food & Water Bowls',
    description: 'Bowls provided for convenience',
    icon: <Home className="w-5 h-5" />,
    category: 'property',
  },
  {
    id: 'pet-shower',
    name: 'Outdoor Pet Shower',
    description: 'Rinse off sandy paws',
    icon: <Waves className="w-5 h-5" />,
    category: 'property',
  },
  {
    id: 'crate',
    name: 'Pet Crate Available',
    description: 'Crate for travel or rest',
    icon: <Home className="w-5 h-5" />,
    category: 'property',
  },
  {
    id: 'treats',
    name: 'Welcome Treats',
    description: 'Treats for your pet upon arrival',
    icon: <Heart className="w-5 h-5" />,
    category: 'property',
  },
  {
    id: 'waste-bags',
    name: 'Waste Bags',
    description: 'Poop bags provided',
    icon: <ShoppingBag className="w-5 h-5" />,
    category: 'property',
  },
];

const localServices: LocalPetService[] = [
  {
    id: 'v1',
    name: 'Hatteras Island Animal Hospital',
    type: 'vet',
    address: '57648 NC-12, Hatteras, NC',
    phone: '(252) 986-6134',
    hours: '8 AM - 5 PM Mon-Fri',
    distance: '3.2 mi',
    rating: 4.8,
    emergency: true,
  },
  {
    id: 'v2',
    name: 'Outer Banks Veterinary Clinic',
    type: 'vet',
    address: 'Manteo, NC',
    phone: '(252) 473-5283',
    hours: '24/7 Emergency',
    distance: '45 mi',
    rating: 4.9,
    emergency: true,
  },
  {
    id: 'g1',
    name: 'Sandy Paws Grooming',
    type: 'groomer',
    address: 'Avon, NC',
    phone: '(252) 995-4747',
    hours: '9 AM - 5 PM',
    distance: '4.5 mi',
    rating: 4.7,
  },
  {
    id: 's1',
    name: 'Hatteras Island Pet Supply',
    type: 'store',
    address: 'Buxton, NC',
    phone: '(252) 995-5060',
    hours: '9 AM - 6 PM',
    distance: '2.1 mi',
    rating: 4.6,
  },
  {
    id: 'b1',
    name: 'Ramp 43 Pet Beach',
    type: 'beach',
    address: 'Frisco, NC',
    distance: '1.5 mi',
  },
  {
    id: 'b2',
    name: 'Cape Point Beach (Off-leash)',
    type: 'beach',
    address: 'Buxton, NC',
    distance: '3.0 mi',
  },
  {
    id: 'p1',
    name: 'Buxton Woods Nature Trail',
    type: 'park',
    address: 'Buxton, NC',
    distance: '2.8 mi',
  },
  {
    id: 'bo1',
    name: 'Island Pet Retreat',
    type: 'boarding',
    address: 'Avon, NC',
    phone: '(252) 995-6789',
    hours: 'By appointment',
    distance: '5.2 mi',
    rating: 4.5,
  },
];

interface PetAmenitiesProps {
  propertyAmenityIds?: string[];
  petPolicy?: {
    allowed: boolean;
    maxPets: number;
    petFee: number;
    restrictions?: string[];
  };
}

export default function PetAmenities({
  propertyAmenityIds = ['fenced-yard', 'pet-shower', 'food-bowls', 'waste-bags'],
  petPolicy = {
    allowed: true,
    maxPets: 2,
    petFee: 75,
    restrictions: ['Dogs only', 'Max 50 lbs per pet'],
  },
}: PetAmenitiesProps) {
  const [activeTab, setActiveTab] = useState<'amenities' | 'nearby'>('amenities');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [showPolicyDetails, setShowPolicyDetails] = useState(false);

  const matchedAmenities = propertyAmenities.filter((a) =>
    propertyAmenityIds.includes(a.id)
  );

  const filteredServices =
    serviceFilter === 'all'
      ? localServices
      : localServices.filter((s) => s.type === serviceFilter);

  const getServiceIcon = (type: LocalPetService['type']) => {
    switch (type) {
      case 'vet':
        return <Stethoscope className="w-5 h-5" />;
      case 'groomer':
        return <Scissors className="w-5 h-5" />;
      case 'store':
        return <ShoppingBag className="w-5 h-5" />;
      case 'beach':
        return <Waves className="w-5 h-5" />;
      case 'park':
        return <Trees className="w-5 h-5" />;
      case 'boarding':
        return <Home className="w-5 h-5" />;
    }
  };

  const getServiceColor = (type: LocalPetService['type']) => {
    switch (type) {
      case 'vet':
        return 'bg-red-100 text-red-600';
      case 'groomer':
        return 'bg-purple-100 text-purple-600';
      case 'store':
        return 'bg-green-100 text-green-600';
      case 'beach':
        return 'bg-blue-100 text-blue-600';
      case 'park':
        return 'bg-emerald-100 text-emerald-600';
      case 'boarding':
        return 'bg-amber-100 text-amber-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex -space-x-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Dog className="w-5 h-5" />
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Cat className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold">Pet-Friendly Property</h2>
            <p className="text-amber-100 text-sm">
              Bring your furry friends along!
            </p>
          </div>
        </div>

        {/* Pet Policy Summary */}
        <button
          onClick={() => setShowPolicyDetails(!showPolicyDetails)}
          className="w-full bg-white/20 rounded-xl p-4 text-left hover:bg-white/30 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-300" />
                <span>Pets Welcome</span>
              </div>
              <span className="text-amber-200">•</span>
              <span>Up to {petPolicy.maxPets} pets</span>
              <span className="text-amber-200">•</span>
              <span>${petPolicy.petFee} fee</span>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                showPolicyDetails ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {/* Policy Details Dropdown */}
        <AnimatePresence>
          {showPolicyDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 bg-white/10 rounded-xl p-4">
                <h4 className="font-semibold mb-2">Pet Policy Details</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Maximum {petPolicy.maxPets} pets allowed
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    One-time pet fee: ${petPolicy.petFee}
                  </li>
                  {petPolicy.restrictions?.map((restriction, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-amber-200" />
                      {restriction}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('amenities')}
          className={`flex-1 py-4 text-sm font-medium transition-colors ${
            activeTab === 'amenities'
              ? 'text-amber-600 border-b-2 border-amber-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Property Amenities
        </button>
        <button
          onClick={() => setActiveTab('nearby')}
          className={`flex-1 py-4 text-sm font-medium transition-colors ${
            activeTab === 'nearby'
              ? 'text-amber-600 border-b-2 border-amber-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Nearby Pet Services
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'amenities' && (
          <div className="grid sm:grid-cols-2 gap-3">
            {matchedAmenities.map((amenity) => (
              <motion.div
                key={amenity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-3 bg-green-50 rounded-xl"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 flex-shrink-0">
                  {amenity.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{amenity.name}</h4>
                  <p className="text-sm text-gray-500">{amenity.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'nearby' && (
          <>
            {/* Filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'vet', label: 'Vets' },
                { id: 'beach', label: 'Pet Beaches' },
                { id: 'park', label: 'Parks' },
                { id: 'store', label: 'Stores' },
                { id: 'groomer', label: 'Groomers' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setServiceFilter(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    serviceFilter === filter.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Services List */}
            <div className="space-y-3">
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getServiceColor(
                        service.type
                      )}`}
                    >
                      {getServiceIcon(service.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        {service.emergency && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            24/7 Emergency
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {service.distance}
                        </span>
                        {service.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {service.rating}
                          </span>
                        )}
                        {service.hours && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {service.hours}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{service.address}</p>
                    </div>
                    {service.phone && (
                      <a
                        href={`tel:${service.phone}`}
                        className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Emergency Banner */}
      <div className="p-4 bg-red-50 border-t border-red-100">
        <div className="flex items-start gap-3">
          <Stethoscope className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900">Pet Emergency?</p>
            <p className="text-sm text-red-700">
              Call Hatteras Island Animal Hospital at{' '}
              <a href="tel:252-986-6134" className="underline font-medium">
                (252) 986-6134
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pet-friendly badge for property cards
export function PetFriendlyBadge({ fee }: { fee?: number }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
      <Dog className="w-3.5 h-3.5" />
      <span className="text-xs font-medium">
        Pet Friendly{fee && ` • $${fee} fee`}
      </span>
    </div>
  );
}
