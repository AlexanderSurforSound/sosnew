'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Luggage,
  Check,
  Plus,
  X,
  Sun,
  Umbrella,
  Baby,
  Dog,
  Waves,
  Camera,
  Laptop,
  Pill,
  ChevronDown,
  Download,
  Share2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface PackingItem {
  id: string;
  name: string;
  packed: boolean;
  quantity?: number;
  category: string;
}

interface PackingCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: PackingItem[];
  expanded: boolean;
}

interface PackingListProps {
  tripDuration: number;
  hasKids?: boolean;
  hasPets?: boolean;
  activities?: string[];
  weather?: {
    avgTemp: number;
    rainyDays: number;
    sunny: boolean;
  };
}

const generatePackingList = (props: PackingListProps): PackingCategory[] => {
  const { tripDuration, hasKids, hasPets, activities = [], weather } = props;

  const categories: PackingCategory[] = [
    {
      id: 'essentials',
      name: 'Essentials',
      icon: <Luggage className="w-5 h-5" />,
      expanded: true,
      items: [
        { id: 'e1', name: 'ID/Passport', packed: false, category: 'essentials' },
        { id: 'e2', name: 'Wallet/Credit Cards', packed: false, category: 'essentials' },
        { id: 'e3', name: 'Phone & Charger', packed: false, category: 'essentials' },
        { id: 'e4', name: 'Booking Confirmation', packed: false, category: 'essentials' },
        { id: 'e5', name: 'Car Keys', packed: false, category: 'essentials' },
        { id: 'e6', name: 'Cash', packed: false, category: 'essentials' },
      ],
    },
    {
      id: 'clothing',
      name: 'Clothing',
      icon: <Sun className="w-5 h-5" />,
      expanded: true,
      items: [
        { id: 'c1', name: 'T-shirts/Tops', packed: false, quantity: Math.ceil(tripDuration * 1.5), category: 'clothing' },
        { id: 'c2', name: 'Shorts/Pants', packed: false, quantity: Math.ceil(tripDuration * 0.8), category: 'clothing' },
        { id: 'c3', name: 'Underwear', packed: false, quantity: tripDuration + 2, category: 'clothing' },
        { id: 'c4', name: 'Socks', packed: false, quantity: tripDuration, category: 'clothing' },
        { id: 'c5', name: 'Swimsuits', packed: false, quantity: 2, category: 'clothing' },
        { id: 'c6', name: 'Cover-up/Beach Dress', packed: false, category: 'clothing' },
        { id: 'c7', name: 'Sandals/Flip Flops', packed: false, category: 'clothing' },
        { id: 'c8', name: 'Sneakers/Walking Shoes', packed: false, category: 'clothing' },
        { id: 'c9', name: 'Pajamas', packed: false, quantity: 2, category: 'clothing' },
        { id: 'c10', name: 'Light Jacket/Hoodie', packed: false, category: 'clothing' },
        ...(weather?.rainyDays && weather.rainyDays > 0
          ? [{ id: 'c11', name: 'Rain Jacket', packed: false, category: 'clothing' }]
          : []),
      ],
    },
    {
      id: 'beach',
      name: 'Beach Gear',
      icon: <Waves className="w-5 h-5" />,
      expanded: true,
      items: [
        { id: 'b1', name: 'Beach Towels', packed: false, quantity: 2, category: 'beach' },
        { id: 'b2', name: 'Sunscreen (SPF 30+)', packed: false, category: 'beach' },
        { id: 'b3', name: 'Sunglasses', packed: false, category: 'beach' },
        { id: 'b4', name: 'Sun Hat/Cap', packed: false, category: 'beach' },
        { id: 'b5', name: 'Beach Bag', packed: false, category: 'beach' },
        { id: 'b6', name: 'Beach Chairs', packed: false, category: 'beach' },
        { id: 'b7', name: 'Beach Umbrella', packed: false, category: 'beach' },
        { id: 'b8', name: 'Cooler', packed: false, category: 'beach' },
        { id: 'b9', name: 'Boogie Board', packed: false, category: 'beach' },
        { id: 'b10', name: 'Snorkel Gear', packed: false, category: 'beach' },
        { id: 'b11', name: 'Sand Toys', packed: false, category: 'beach' },
      ],
    },
    {
      id: 'toiletries',
      name: 'Toiletries',
      icon: <Pill className="w-5 h-5" />,
      expanded: false,
      items: [
        { id: 't1', name: 'Toothbrush & Toothpaste', packed: false, category: 'toiletries' },
        { id: 't2', name: 'Shampoo & Conditioner', packed: false, category: 'toiletries' },
        { id: 't3', name: 'Body Wash/Soap', packed: false, category: 'toiletries' },
        { id: 't4', name: 'Deodorant', packed: false, category: 'toiletries' },
        { id: 't5', name: 'Razor', packed: false, category: 'toiletries' },
        { id: 't6', name: 'Hair Brush/Comb', packed: false, category: 'toiletries' },
        { id: 't7', name: 'Aloe Vera (for sunburn)', packed: false, category: 'toiletries' },
        { id: 't8', name: 'Bug Spray', packed: false, category: 'toiletries' },
        { id: 't9', name: 'First Aid Kit', packed: false, category: 'toiletries' },
        { id: 't10', name: 'Medications', packed: false, category: 'toiletries' },
        { id: 't11', name: 'Motion Sickness Pills', packed: false, category: 'toiletries' },
      ],
    },
    {
      id: 'electronics',
      name: 'Electronics',
      icon: <Camera className="w-5 h-5" />,
      expanded: false,
      items: [
        { id: 'el1', name: 'Camera', packed: false, category: 'electronics' },
        { id: 'el2', name: 'Portable Charger', packed: false, category: 'electronics' },
        { id: 'el3', name: 'Waterproof Phone Case', packed: false, category: 'electronics' },
        { id: 'el4', name: 'Bluetooth Speaker', packed: false, category: 'electronics' },
        { id: 'el5', name: 'E-Reader/Tablet', packed: false, category: 'electronics' },
        { id: 'el6', name: 'Headphones', packed: false, category: 'electronics' },
      ],
    },
  ];

  // Add kids items if traveling with children
  if (hasKids) {
    categories.push({
      id: 'kids',
      name: 'Kids Essentials',
      icon: <Baby className="w-5 h-5" />,
      expanded: true,
      items: [
        { id: 'k1', name: 'Diapers/Pull-ups', packed: false, category: 'kids' },
        { id: 'k2', name: 'Baby Wipes', packed: false, category: 'kids' },
        { id: 'k3', name: 'Kids Sunscreen', packed: false, category: 'kids' },
        { id: 'k4', name: 'Swim Diapers', packed: false, category: 'kids' },
        { id: 'k5', name: 'Floaties/Life Jacket', packed: false, category: 'kids' },
        { id: 'k6', name: 'Snacks', packed: false, category: 'kids' },
        { id: 'k7', name: 'Games/Activities', packed: false, category: 'kids' },
        { id: 'k8', name: 'Favorite Toys', packed: false, category: 'kids' },
        { id: 'k9', name: 'Stroller', packed: false, category: 'kids' },
        { id: 'k10', name: 'Baby Monitor', packed: false, category: 'kids' },
      ],
    });
  }

  // Add pet items if traveling with pets
  if (hasPets) {
    categories.push({
      id: 'pets',
      name: 'Pet Supplies',
      icon: <Dog className="w-5 h-5" />,
      expanded: true,
      items: [
        { id: 'p1', name: 'Pet Food', packed: false, category: 'pets' },
        { id: 'p2', name: 'Food/Water Bowls', packed: false, category: 'pets' },
        { id: 'p3', name: 'Leash & Collar', packed: false, category: 'pets' },
        { id: 'p4', name: 'Poop Bags', packed: false, category: 'pets' },
        { id: 'p5', name: 'Pet Bed/Blanket', packed: false, category: 'pets' },
        { id: 'p6', name: 'Pet Toys', packed: false, category: 'pets' },
        { id: 'p7', name: 'Pet Medications', packed: false, category: 'pets' },
        { id: 'p8', name: 'Vaccination Records', packed: false, category: 'pets' },
        { id: 'p9', name: 'Pet Carrier/Crate', packed: false, category: 'pets' },
      ],
    });
  }

  // Add activity-specific items
  if (activities.includes('fishing')) {
    categories.push({
      id: 'fishing',
      name: 'Fishing Gear',
      icon: <Waves className="w-5 h-5" />,
      expanded: false,
      items: [
        { id: 'f1', name: 'Fishing Rod', packed: false, category: 'fishing' },
        { id: 'f2', name: 'Tackle Box', packed: false, category: 'fishing' },
        { id: 'f3', name: 'Fishing License', packed: false, category: 'fishing' },
        { id: 'f4', name: 'Cooler for Catch', packed: false, category: 'fishing' },
      ],
    });
  }

  if (activities.includes('work')) {
    categories.push({
      id: 'work',
      name: 'Work from Beach',
      icon: <Laptop className="w-5 h-5" />,
      expanded: false,
      items: [
        { id: 'w1', name: 'Laptop', packed: false, category: 'work' },
        { id: 'w2', name: 'Laptop Charger', packed: false, category: 'work' },
        { id: 'w3', name: 'Mouse', packed: false, category: 'work' },
        { id: 'w4', name: 'Notebook/Planner', packed: false, category: 'work' },
        { id: 'w5', name: 'Webcam', packed: false, category: 'work' },
        { id: 'w6', name: 'Hotspot Device', packed: false, category: 'work' },
      ],
    });
  }

  return categories;
};

export default function PackingList(props: PackingListProps) {
  const initialCategories = useMemo(() => generatePackingList(props), [props]);
  const [categories, setCategories] = useState<PackingCategory[]>(initialCategories);
  const [newItemText, setNewItemText] = useState('');
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null);

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const packedItems = categories.reduce(
    (sum, cat) => sum + cat.items.filter((item) => item.packed).length,
    0
  );
  const progress = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  const toggleItem = (categoryId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, packed: !item.packed } : item
              ),
            }
          : cat
      )
    );
  };

  const toggleCategory = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };

  const addItem = (categoryId: string) => {
    if (!newItemText.trim()) return;

    const newItem: PackingItem = {
      id: Date.now().toString(),
      name: newItemText.trim(),
      packed: false,
      category: categoryId,
    };

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, items: [...cat.items, newItem] } : cat
      )
    );

    setNewItemText('');
    setAddingToCategory(null);
  };

  const removeItem = (categoryId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) }
          : cat
      )
    );
  };

  const resetList = () => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => ({ ...item, packed: false })),
      }))
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Luggage className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Packing List</h2>
              <p className="text-emerald-200 text-sm">
                {props.tripDuration} night beach trip
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetList}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Reset all items"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-emerald-100 text-sm mt-2">
          {packedItems} of {totalItems} items packed ({progress}%)
        </p>
      </div>

      {/* AI Suggestion Banner */}
      <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-amber-600" />
        <p className="text-sm text-amber-800">
          <span className="font-medium">Pro tip:</span> Based on the forecast, pack light layers.
          Expect {props.weather?.avgTemp || 75}°F average with {props.weather?.rainyDays || 1} possible rainy day(s).
        </p>
      </div>

      {/* Categories */}
      <div className="divide-y divide-gray-100">
        {categories.map((category) => {
          const categoryPacked = category.items.filter((item) => item.packed).length;
          const categoryTotal = category.items.length;

          return (
            <div key={category.id}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                    {category.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">
                      {categoryPacked}/{categoryTotal} packed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {categoryPacked === categoryTotal && categoryTotal > 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Complete
                    </span>
                  )}
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      category.expanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Category Items */}
              <AnimatePresence>
                {category.expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {category.items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            item.packed ? 'bg-green-50' : 'bg-gray-50'
                          }`}
                        >
                          <button
                            onClick={() => toggleItem(category.id, item.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              item.packed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-400'
                            }`}
                          >
                            {item.packed && <Check className="w-4 h-4" />}
                          </button>
                          <span
                            className={`flex-1 ${
                              item.packed ? 'text-gray-500 line-through' : 'text-gray-900'
                            }`}
                          >
                            {item.name}
                            {item.quantity && (
                              <span className="text-gray-400 ml-1">×{item.quantity}</span>
                            )}
                          </span>
                          <button
                            onClick={() => removeItem(category.id, item.id)}
                            className="p-1 hover:bg-gray-200 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        </motion.div>
                      ))}

                      {/* Add Item */}
                      {addingToCategory === category.id ? (
                        <div className="flex gap-2 p-2">
                          <input
                            type="text"
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addItem(category.id)}
                            placeholder="Item name"
                            autoFocus
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => addItem(category.id)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setAddingToCategory(null);
                              setNewItemText('');
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingToCategory(category.id)}
                          className="w-full flex items-center gap-2 p-3 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-sm font-medium">Add item</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
