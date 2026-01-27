'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Check,
  ChevronRight,
  Search,
  Package,
  Coffee,
  Wine,
  Apple,
  Croissant,
  Beef,
  Fish,
  Milk,
  IceCream,
  Cookie,
  Sandwich,
  X,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image?: string;
  popular?: boolean;
}

interface CartItem extends GroceryItem {
  quantity: number;
}

type GroceryCategory = {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: GroceryItem[];
};

const groceryCategories: GroceryCategory[] = [
  {
    id: 'essentials',
    name: 'Essentials',
    icon: <Package className="w-5 h-5" />,
    items: [
      { id: 'e1', name: 'Bottled Water (24-pack)', category: 'essentials', price: 6.99, unit: 'pack', popular: true },
      { id: 'e2', name: 'Paper Towels (6-roll)', category: 'essentials', price: 12.99, unit: 'pack' },
      { id: 'e3', name: 'Toilet Paper (12-roll)', category: 'essentials', price: 14.99, unit: 'pack' },
      { id: 'e4', name: 'Trash Bags (30 count)', category: 'essentials', price: 9.99, unit: 'box' },
      { id: 'e5', name: 'Dish Soap', category: 'essentials', price: 4.99, unit: 'bottle' },
      { id: 'e6', name: 'Laundry Detergent', category: 'essentials', price: 12.99, unit: 'bottle' },
    ],
  },
  {
    id: 'breakfast',
    name: 'Breakfast',
    icon: <Croissant className="w-5 h-5" />,
    items: [
      { id: 'b1', name: 'Eggs (dozen)', category: 'breakfast', price: 5.99, unit: 'dozen', popular: true },
      { id: 'b2', name: 'Bacon', category: 'breakfast', price: 8.99, unit: 'lb' },
      { id: 'b3', name: 'Pancake Mix', category: 'breakfast', price: 4.99, unit: 'box' },
      { id: 'b4', name: 'Maple Syrup', category: 'breakfast', price: 7.99, unit: 'bottle' },
      { id: 'b5', name: 'Orange Juice', category: 'breakfast', price: 5.99, unit: '64oz' },
      { id: 'b6', name: 'Bagels (6-pack)', category: 'breakfast', price: 4.99, unit: 'pack' },
      { id: 'b7', name: 'Cream Cheese', category: 'breakfast', price: 3.99, unit: '8oz' },
    ],
  },
  {
    id: 'coffee',
    name: 'Coffee & Tea',
    icon: <Coffee className="w-5 h-5" />,
    items: [
      { id: 'c1', name: 'Ground Coffee (Local Roast)', category: 'coffee', price: 14.99, unit: '12oz', popular: true },
      { id: 'c2', name: 'K-Cups Variety Pack', category: 'coffee', price: 19.99, unit: '24 pods' },
      { id: 'c3', name: 'Creamer', category: 'coffee', price: 4.99, unit: 'bottle' },
      { id: 'c4', name: 'Sugar', category: 'coffee', price: 3.99, unit: '4lb' },
      { id: 'c5', name: 'Tea Variety Pack', category: 'coffee', price: 8.99, unit: '40 bags' },
    ],
  },
  {
    id: 'produce',
    name: 'Fresh Produce',
    icon: <Apple className="w-5 h-5" />,
    items: [
      { id: 'p1', name: 'Bananas', category: 'produce', price: 1.99, unit: 'bunch' },
      { id: 'p2', name: 'Apples (6-pack)', category: 'produce', price: 5.99, unit: 'bag' },
      { id: 'p3', name: 'Strawberries', category: 'produce', price: 4.99, unit: 'lb' },
      { id: 'p4', name: 'Avocados (3-pack)', category: 'produce', price: 5.99, unit: 'pack' },
      { id: 'p5', name: 'Lemons', category: 'produce', price: 0.99, unit: 'each' },
      { id: 'p6', name: 'Tomatoes', category: 'produce', price: 3.99, unit: 'lb' },
      { id: 'p7', name: 'Lettuce Mix', category: 'produce', price: 4.99, unit: 'bag' },
    ],
  },
  {
    id: 'meat',
    name: 'Meat & Poultry',
    icon: <Beef className="w-5 h-5" />,
    items: [
      { id: 'm1', name: 'Ground Beef', category: 'meat', price: 8.99, unit: 'lb', popular: true },
      { id: 'm2', name: 'Chicken Breasts', category: 'meat', price: 9.99, unit: 'lb' },
      { id: 'm3', name: 'Ribeye Steaks (2-pack)', category: 'meat', price: 29.99, unit: 'pack' },
      { id: 'm4', name: 'Pork Chops', category: 'meat', price: 7.99, unit: 'lb' },
      { id: 'm5', name: 'Hot Dogs', category: 'meat', price: 5.99, unit: 'pack' },
      { id: 'm6', name: 'Burger Patties (8-pack)', category: 'meat', price: 14.99, unit: 'pack' },
    ],
  },
  {
    id: 'seafood',
    name: 'Fresh Seafood',
    icon: <Fish className="w-5 h-5" />,
    items: [
      { id: 's1', name: 'Fresh Shrimp', category: 'seafood', price: 14.99, unit: 'lb', popular: true },
      { id: 's2', name: 'Salmon Fillets', category: 'seafood', price: 16.99, unit: 'lb' },
      { id: 's3', name: 'Crab Legs', category: 'seafood', price: 24.99, unit: 'lb' },
      { id: 's4', name: 'Fresh Tuna Steaks', category: 'seafood', price: 18.99, unit: 'lb' },
      { id: 's5', name: 'Oysters (dozen)', category: 'seafood', price: 19.99, unit: 'dozen' },
    ],
  },
  {
    id: 'dairy',
    name: 'Dairy',
    icon: <Milk className="w-5 h-5" />,
    items: [
      { id: 'd1', name: 'Milk (gallon)', category: 'dairy', price: 4.99, unit: 'gallon', popular: true },
      { id: 'd2', name: 'Butter', category: 'dairy', price: 5.99, unit: 'lb' },
      { id: 'd3', name: 'Shredded Cheese', category: 'dairy', price: 4.99, unit: '8oz' },
      { id: 'd4', name: 'Greek Yogurt (4-pack)', category: 'dairy', price: 6.99, unit: 'pack' },
      { id: 'd5', name: 'Sour Cream', category: 'dairy', price: 2.99, unit: '16oz' },
    ],
  },
  {
    id: 'snacks',
    name: 'Snacks',
    icon: <Cookie className="w-5 h-5" />,
    items: [
      { id: 'sn1', name: 'Chips Variety Pack', category: 'snacks', price: 12.99, unit: '20 bags', popular: true },
      { id: 'sn2', name: 'Pretzels', category: 'snacks', price: 4.99, unit: 'bag' },
      { id: 'sn3', name: 'Trail Mix', category: 'snacks', price: 8.99, unit: 'bag' },
      { id: 'sn4', name: 'Crackers & Cheese', category: 'snacks', price: 5.99, unit: 'box' },
      { id: 'sn5', name: 'Cookies', category: 'snacks', price: 4.99, unit: 'package' },
      { id: 'sn6', name: 'Popcorn', category: 'snacks', price: 4.99, unit: 'box' },
    ],
  },
  {
    id: 'frozen',
    name: 'Frozen',
    icon: <IceCream className="w-5 h-5" />,
    items: [
      { id: 'f1', name: 'Ice Cream (half gallon)', category: 'frozen', price: 7.99, unit: 'tub', popular: true },
      { id: 'f2', name: 'Frozen Pizza', category: 'frozen', price: 8.99, unit: 'each' },
      { id: 'f3', name: 'Ice Pops', category: 'frozen', price: 4.99, unit: 'box' },
      { id: 'f4', name: 'Frozen Vegetables', category: 'frozen', price: 3.99, unit: 'bag' },
      { id: 'f5', name: 'Ice (10 lb bag)', category: 'frozen', price: 3.99, unit: 'bag' },
    ],
  },
  {
    id: 'beverages',
    name: 'Beverages',
    icon: <Wine className="w-5 h-5" />,
    items: [
      { id: 'bv1', name: 'Soda Variety Pack', category: 'beverages', price: 9.99, unit: '24 cans', popular: true },
      { id: 'bv2', name: 'Sparkling Water', category: 'beverages', price: 6.99, unit: '12 cans' },
      { id: 'bv3', name: 'Lemonade', category: 'beverages', price: 4.99, unit: '64oz' },
      { id: 'bv4', name: 'Sports Drinks (8-pack)', category: 'beverages', price: 8.99, unit: 'pack' },
      { id: 'bv5', name: 'White Wine', category: 'beverages', price: 14.99, unit: 'bottle' },
      { id: 'bv6', name: 'Red Wine', category: 'beverages', price: 16.99, unit: 'bottle' },
      { id: 'bv7', name: 'Local Craft Beer (6-pack)', category: 'beverages', price: 12.99, unit: 'pack' },
    ],
  },
  {
    id: 'deli',
    name: 'Deli & Prepared',
    icon: <Sandwich className="w-5 h-5" />,
    items: [
      { id: 'dl1', name: 'Deli Turkey', category: 'deli', price: 9.99, unit: 'lb' },
      { id: 'dl2', name: 'Deli Ham', category: 'deli', price: 8.99, unit: 'lb' },
      { id: 'dl3', name: 'Cheese Slices', category: 'deli', price: 7.99, unit: 'lb' },
      { id: 'dl4', name: 'Hummus', category: 'deli', price: 5.99, unit: 'tub' },
      { id: 'dl5', name: 'Rotisserie Chicken', category: 'deli', price: 9.99, unit: 'each' },
    ],
  },
];

// Preset packages
const presetPackages = [
  {
    id: 'beach-basics',
    name: 'Beach Basics',
    description: 'Everything you need for a relaxing beach day',
    price: 89.99,
    items: ['e1', 'sn1', 'f1', 'bv1', 'e5'],
  },
  {
    id: 'breakfast-bundle',
    name: 'Breakfast Bundle',
    description: 'Start your mornings right',
    price: 49.99,
    items: ['b1', 'b2', 'b3', 'b4', 'c1', 'd1'],
  },
  {
    id: 'grill-master',
    name: 'Grill Master Pack',
    description: 'Everything for an epic cookout',
    price: 129.99,
    items: ['m1', 'm6', 'm5', 's1', 'bv7', 'p6'],
  },
  {
    id: 'seafood-feast',
    name: 'Seafood Feast',
    description: 'Fresh catch for a special dinner',
    price: 149.99,
    items: ['s1', 's2', 's3', 'bv5', 'p5', 'd2'],
  },
];

interface GroceryPrestockProps {
  propertyName?: string;
  checkInDate?: Date;
  onComplete?: (order: CartItem[]) => void;
}

export default function GroceryPrestock({
  propertyName = 'Your Vacation Rental',
  checkInDate,
  onComplete,
}: GroceryPrestockProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('essentials');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [step, setStep] = useState<'shop' | 'checkout' | 'confirmed'>('shop');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const allItems = groceryCategories.flatMap((cat) => cat.items);

  const filteredItems = searchQuery
    ? allItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : groceryCategories.find((cat) => cat.id === activeCategory)?.items || [];

  const addToCart = (item: GroceryItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const addPackage = (packageId: string) => {
    const pkg = presetPackages.find((p) => p.id === packageId);
    if (!pkg) return;

    pkg.items.forEach((itemId) => {
      const item = allItems.find((i) => i.id === itemId);
      if (item) addToCart(item);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cartTotal >= 100 ? 0 : 14.99;
  const serviceFee = cartTotal * 0.1;
  const orderTotal = cartTotal + deliveryFee + serviceFee;

  const getQuantity = (itemId: string) => {
    return cart.find((i) => i.id === itemId)?.quantity || 0;
  };

  if (step === 'confirmed') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Check className="w-10 h-10 text-green-600" />
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
        <p className="text-gray-600 mb-6">
          Your groceries will be delivered to {propertyName} before your check-in
          {checkInDate && ` on ${checkInDate.toLocaleDateString()}`}.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Items</span>
            <span className="font-medium">{cart.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total</span>
            <span className="font-bold text-lg">${orderTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 rounded-xl p-4">
          <Clock className="w-5 h-5" />
          <span className="text-sm">We'll notify you when your delivery is on its way</span>
        </div>
      </motion.div>
    );
  }

  if (step === 'checkout') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 overflow-hidden"
      >
        <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <button
            onClick={() => setStep('shop')}
            className="text-white/80 hover:text-white mb-2 flex items-center gap-1"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to shopping
          </button>
          <h2 className="text-xl font-bold">Checkout</h2>
        </div>

        <div className="p-6">
          {/* Delivery Info */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Delivery Details</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{propertyName}</p>
                  <p className="text-sm text-gray-500">
                    Delivered before check-in
                    {checkInDate && ` on ${checkInDate.toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Special Instructions</h3>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests or dietary needs?"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Delivery {cartTotal >= 100 && <span className="text-green-600">(Free!)</span>}
              </span>
              <span className="text-gray-900">
                {deliveryFee === 0 ? '$0.00' : `$${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Fee</span>
              <span className="text-gray-900">${serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>${orderTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100">
          <button
            onClick={() => {
              setStep('confirmed');
              if (onComplete) onComplete(cart);
            }}
            className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Place Order - ${orderTotal.toFixed(2)}
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            You'll be charged when your order is delivered
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">Grocery Pre-Stocking</h2>
              <p className="text-green-100 text-sm">
                Delivered before you arrive
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-200" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groceries..."
            className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-green-200 focus:outline-none focus:bg-white/30"
          />
        </div>
      </div>

      {/* Preset Packages */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-gray-900">Quick-Start Packages</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {presetPackages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => addPackage(pkg.id)}
              className="flex-shrink-0 p-3 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all text-left"
            >
              <p className="font-semibold text-gray-900 text-sm">{pkg.name}</p>
              <p className="text-xs text-gray-500 mb-2">{pkg.description}</p>
              <p className="text-green-600 font-bold">${pkg.price}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      {!searchQuery && (
        <div className="flex overflow-x-auto border-b border-gray-100">
          {groceryCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {category.icon}
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Items Grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
        {filteredItems.map((item) => {
          const quantity = getQuantity(item.id);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-50 rounded-xl p-3 relative"
            >
              {item.popular && (
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  Popular
                </span>
              )}
              <div className="w-full aspect-square bg-white rounded-lg flex items-center justify-center mb-2">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                {item.name}
              </h4>
              <p className="text-xs text-gray-500 mb-2">{item.unit}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">${item.price.toFixed(2)}</span>
                {quantity === 0 ? (
                  <button
                    onClick={() => addToCart(item)}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-medium text-sm">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Cart Summary Bar */}
      {cart.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="p-4 bg-gray-900 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">
                {cart.reduce((sum, i) => sum + i.quantity, 0)} items
              </p>
              <p className="text-xl font-bold">${cartTotal.toFixed(2)}</p>
            </div>
            <button
              onClick={() => setStep('checkout')}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              Checkout
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          {cartTotal < 100 && (
            <p className="text-xs text-gray-400 mt-2">
              Add ${(100 - cartTotal).toFixed(2)} more for free delivery
            </p>
          )}
        </motion.div>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-xl"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-lg">Your Cart</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded ml-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-gray-100">
                    <div className="flex justify-between mb-4">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-bold">${cartTotal.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => {
                        setShowCart(false);
                        setStep('checkout');
                      }}
                      className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
