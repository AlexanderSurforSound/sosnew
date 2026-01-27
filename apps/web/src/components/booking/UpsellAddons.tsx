'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ShoppingBag,
  Sparkles,
  Umbrella,
  Bike,
  Fish,
  ChevronDown,
  Check,
  Info,
  Star,
} from 'lucide-react';

export interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  priceType: 'flat' | 'per_night' | 'per_day';
  icon: React.ElementType;
  category: 'convenience' | 'experience' | 'gear';
  popular?: boolean;
}

interface UpsellAddonsProps {
  nights: number;
  onAddonsChange: (addons: { id: string; quantity: number }[]) => void;
  selectedAddons: { id: string; quantity: number }[];
}

const availableAddons: Addon[] = [
  {
    id: 'early-checkin',
    name: 'Early Check-in',
    description: 'Arrive as early as 1:00 PM instead of 4:00 PM',
    price: 75,
    priceType: 'flat',
    icon: Clock,
    category: 'convenience',
    popular: true,
  },
  {
    id: 'late-checkout',
    name: 'Late Check-out',
    description: 'Stay until 1:00 PM instead of 10:00 AM',
    price: 75,
    priceType: 'flat',
    icon: Clock,
    category: 'convenience',
    popular: true,
  },
  {
    id: 'grocery-delivery',
    name: 'Grocery Pre-Stock',
    description: 'Have groceries delivered and stocked before your arrival',
    price: 45,
    priceType: 'flat',
    icon: ShoppingBag,
    category: 'convenience',
  },
  {
    id: 'mid-stay-cleaning',
    name: 'Mid-Stay Cleaning',
    description: 'Professional cleaning service during your stay',
    price: 150,
    priceType: 'flat',
    icon: Sparkles,
    category: 'convenience',
  },
  {
    id: 'beach-gear',
    name: 'Beach Gear Package',
    description: 'Chairs, umbrella, cooler, and beach toys',
    price: 35,
    priceType: 'per_day',
    icon: Umbrella,
    category: 'gear',
    popular: true,
  },
  {
    id: 'bike-rental',
    name: 'Bike Rental',
    description: '2 adult beach cruiser bikes',
    price: 25,
    priceType: 'per_day',
    icon: Bike,
    category: 'gear',
  },
  {
    id: 'fishing-gear',
    name: 'Fishing Gear',
    description: 'Rods, tackle box, and bait voucher',
    price: 40,
    priceType: 'per_day',
    icon: Fish,
    category: 'experience',
  },
];

export function UpsellAddons({ nights, onAddonsChange, selectedAddons }: UpsellAddonsProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('convenience');

  const categories = [
    { id: 'convenience', label: 'Convenience', description: 'Make your trip easier' },
    { id: 'gear', label: 'Beach Gear', description: 'Everything for the beach' },
    { id: 'experience', label: 'Experiences', description: 'Enhance your vacation' },
  ];

  const toggleAddon = (addonId: string) => {
    const existing = selectedAddons.find((a) => a.id === addonId);
    if (existing) {
      onAddonsChange(selectedAddons.filter((a) => a.id !== addonId));
    } else {
      onAddonsChange([...selectedAddons, { id: addonId, quantity: 1 }]);
    }
  };

  const calculateAddonPrice = (addon: Addon): number => {
    switch (addon.priceType) {
      case 'per_day':
      case 'per_night':
        return addon.price * nights;
      default:
        return addon.price;
    }
  };

  const totalAddonsPrice = selectedAddons.reduce((sum, selected) => {
    const addon = availableAddons.find((a) => a.id === selected.id);
    return sum + (addon ? calculateAddonPrice(addon) * selected.quantity : 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Enhance Your Stay</h2>
        <p className="text-gray-500">Add services and gear to make your vacation even better</p>
      </div>

      {/* Popular Add-ons Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span className="font-semibold text-amber-800">Most Popular Add-ons</span>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {availableAddons
            .filter((a) => a.popular)
            .map((addon) => {
              const Icon = addon.icon;
              const isSelected = selectedAddons.some((s) => s.id === addon.id);
              return (
                <button
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-ocean-500 bg-ocean-50'
                      : 'border-transparent bg-white hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-ocean-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {isSelected ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{addon.name}</p>
                    <p className="text-sm text-gray-500">
                      ${calculateAddonPrice(addon)}
                      {addon.priceType !== 'flat' && (
                        <span className="text-xs"> for {nights} nights</span>
                      )}
                    </p>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Category Accordions */}
      <div className="space-y-3">
        {categories.map((category) => {
          const categoryAddons = availableAddons.filter((a) => a.category === category.id);
          const selectedInCategory = categoryAddons.filter((a) =>
            selectedAddons.some((s) => s.id === a.id)
          ).length;

          return (
            <div key={category.id} className="border rounded-xl overflow-hidden">
              <button
                onClick={() =>
                  setExpandedCategory(expandedCategory === category.id ? null : category.id)
                }
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{category.label}</span>
                  <span className="text-sm text-gray-500">{category.description}</span>
                </div>
                <div className="flex items-center gap-3">
                  {selectedInCategory > 0 && (
                    <span className="px-2 py-1 bg-ocean-100 text-ocean-700 rounded-full text-xs font-medium">
                      {selectedInCategory} selected
                    </span>
                  )}
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedCategory === category.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              <AnimatePresence>
                {expandedCategory === category.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-3">
                      {categoryAddons.map((addon) => {
                        const Icon = addon.icon;
                        const isSelected = selectedAddons.some((s) => s.id === addon.id);
                        const totalPrice = calculateAddonPrice(addon);

                        return (
                          <div
                            key={addon.id}
                            className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-ocean-500 bg-ocean-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => toggleAddon(addon.id)}
                          >
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                isSelected ? 'bg-ocean-500 text-white' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {isSelected ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900">{addon.name}</h4>
                                  <p className="text-sm text-gray-500 mt-1">{addon.description}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">${totalPrice}</p>
                                  {addon.priceType !== 'flat' && (
                                    <p className="text-xs text-gray-500">
                                      ${addon.price}/{addon.priceType === 'per_day' ? 'day' : 'night'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Total Add-ons Summary */}
      {totalAddonsPrice > 0 && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-400" />
            <span className="text-gray-600">
              {selectedAddons.length} add-on{selectedAddons.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <span className="font-semibold text-lg">+${totalAddonsPrice}</span>
        </div>
      )}
    </div>
  );
}

export { availableAddons };
