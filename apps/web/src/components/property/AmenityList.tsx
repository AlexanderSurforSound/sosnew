import {
  Waves,
  Thermometer,
  Wifi,
  Tv,
  Car,
  Dog,
  Wind,
  Flame,
  Dumbbell,
  Gamepad2,
  Accessibility,
  ShieldCheck,
  UtensilsCrossed,
  Sparkles,
  Eye,
  Home,
  type LucideIcon,
} from 'lucide-react';
import type { Amenity } from '@/types';

interface AmenityListProps {
  amenities: Amenity[];
}

const iconMap: Record<string, LucideIcon> = {
  'private-pool': Waves,
  'hot-tub': Thermometer,
  wifi: Wifi,
  tv: Tv,
  parking: Car,
  'pet-friendly': Dog,
  'air-conditioning': Wind,
  fireplace: Flame,
  gym: Dumbbell,
  'game-room': Gamepad2,
  'handicap-accessible': Accessibility,
  'gated-community': ShieldCheck,
  'full-kitchen': UtensilsCrossed,
  'washer-dryer': Sparkles,
  'ocean-view': Eye,
  oceanfront: Waves,
  soundfront: Waves,
  elevator: Home,
};

export function AmenityList({ amenities }: AmenityListProps) {
  // Group amenities by category
  const grouped = amenities.reduce(
    (acc, amenity) => {
      const category = amenity.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(amenity);
      return acc;
    },
    {} as Record<string, Amenity[]>
  );

  const categoryNames: Record<string, string> = {
    pool: 'Pool & Hot Tub',
    beach: 'Beach & Water',
    entertainment: 'Entertainment',
    kitchen: 'Kitchen',
    outdoor: 'Outdoor',
    accessibility: 'Accessibility',
    pet: 'Pet Friendly',
    parking: 'Parking',
    climate: 'Climate',
    safety: 'Safety',
    other: 'Other Amenities',
  };

  const categoryOrder = [
    'pool',
    'beach',
    'entertainment',
    'kitchen',
    'outdoor',
    'climate',
    'parking',
    'pet',
    'accessibility',
    'safety',
    'other',
  ];

  return (
    <div className="space-y-6">
      {categoryOrder.map((category) => {
        const categoryAmenities = grouped[category];
        if (!categoryAmenities?.length) return null;

        return (
          <div key={category}>
            <h3 className="font-medium text-gray-900 mb-3">
              {categoryNames[category] || category}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryAmenities.map((amenity) => {
                const Icon = iconMap[amenity.slug] || iconMap[amenity.icon || ''] || ShieldCheck;
                return (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">{amenity.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
