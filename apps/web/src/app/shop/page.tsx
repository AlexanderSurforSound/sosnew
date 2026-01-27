'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Star,
  ArrowRight,
  Shirt,
  Coffee,
  Gift,
  Heart,
  ShoppingCart,
} from 'lucide-react';

const categories = [
  { id: 'all', label: 'All Items', icon: ShoppingBag },
  { id: 'apparel', label: 'Apparel', icon: Shirt },
  { id: 'accessories', label: 'Accessories', icon: Gift },
  { id: 'home', label: 'Home & Decor', icon: Coffee },
];

const products = [
  {
    id: '1',
    name: 'Surf or Sound Logo Tee',
    category: 'apparel',
    price: 28,
    description: 'Classic cotton tee with vintage Surf or Sound logo',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
    colors: ['Navy', 'White', 'Sand'],
    bestseller: true,
  },
  {
    id: '2',
    name: 'Hatteras Island Hoodie',
    category: 'apparel',
    price: 55,
    description: 'Cozy fleece hoodie with Hatteras Island coordinates',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80',
    colors: ['Charcoal', 'Navy', 'Ocean Blue'],
    bestseller: true,
  },
  {
    id: '3',
    name: 'OBX Lighthouse Cap',
    category: 'accessories',
    price: 24,
    description: 'Embroidered cap featuring Cape Hatteras Lighthouse',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80',
    colors: ['Navy', 'Khaki'],
    bestseller: false,
  },
  {
    id: '4',
    name: 'Beach Day Tote',
    category: 'accessories',
    price: 35,
    description: 'Large canvas tote perfect for beach essentials',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80',
    colors: ['Natural', 'Navy'],
    bestseller: false,
  },
  {
    id: '5',
    name: 'Hatteras Coffee Mug',
    category: 'home',
    price: 18,
    description: 'Ceramic mug with seven villages map design',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80',
    colors: ['White', 'Navy'],
    bestseller: true,
  },
  {
    id: '6',
    name: 'Beach House Candle',
    category: 'home',
    price: 32,
    description: 'Hand-poured soy candle with ocean breeze scent',
    image: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=400&q=80',
    colors: [],
    bestseller: false,
  },
  {
    id: '7',
    name: 'Kids Lighthouse Tee',
    category: 'apparel',
    price: 22,
    description: 'Fun lighthouse design for little beachcombers',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&q=80',
    colors: ['White', 'Light Blue', 'Coral'],
    bestseller: false,
  },
  {
    id: '8',
    name: 'Surf or Sound Sticker Pack',
    category: 'accessories',
    price: 12,
    description: 'Set of 5 waterproof vinyl stickers',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    colors: [],
    bestseller: false,
  },
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const bestsellers = products.filter(p => p.bestseller);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <ShoppingBag className="w-6 h-6" />
              <span className="font-medium">Official Merchandise</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Surf or Sound Shop
            </h1>
            <p className="text-xl text-amber-100 mb-8">
              Take a piece of Hatteras Island home with you. Apparel, accessories, and gifts.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bestsellers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Bestsellers</h2>
            <span className="text-amber-600 font-medium text-sm">Most Popular</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {bestsellers.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold">
                      Bestseller
                    </span>
                  </div>
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{product.description}</p>
                <p className="font-bold text-gray-900">${product.price}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* All Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors text-sm">
                {product.name}
              </h3>
              {product.colors.length > 0 && (
                <p className="text-xs text-gray-500 mb-1">{product.colors.length} colors</p>
              )}
              <p className="font-bold text-gray-900">${product.price}</p>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Note */}
        <div className="mt-16 text-center bg-gray-100 rounded-2xl p-8">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Online Store Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            Our full online store with checkout is launching soon. For now, visit our offices to purchase merchandise.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
          >
            Find Our Office Locations
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
