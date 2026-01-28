'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Map,
  Utensils,
  Calendar,
  Waves,
  Camera,
  Fish,
  BookOpen,
  ArrowRight,
  MapPin,
  Clock,
  TrendingUp,
} from 'lucide-react';

const villages = [
  { name: 'Rodanthe', slug: 'rodanthe-village', description: 'Northern gateway with amazing kiteboarding' },
  { name: 'Waves', slug: 'waves-village', description: 'Quiet beaches and peaceful setting' },
  { name: 'Salvo', slug: 'salvo-village', description: 'Family-friendly with sound access' },
  { name: 'Avon', slug: 'avon-village', description: 'Central hub with restaurants and Avon Pier' },
  { name: 'Buxton', slug: 'buxton-village', description: 'Home of Cape Hatteras Lighthouse' },
  { name: 'Frisco', slug: 'frisco-village', description: 'Quiet community with Native American Museum' },
  { name: 'Hatteras', slug: 'hatteras-village', description: 'Historic fishing village' },
];

const categories = [
  { id: 'all', label: 'All', icon: Map },
  { id: 'dining', label: 'Dining', icon: Utensils },
  { id: 'activities', label: 'Activities', icon: Waves },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'attractions', label: 'Attractions', icon: Camera },
  { id: 'fishing', label: 'Fishing', icon: Fish },
  { id: 'blog', label: 'Blog', icon: BookOpen },
];

const highlights = [
  {
    title: 'Cape Hatteras Lighthouse',
    category: 'attractions',
    village: 'Buxton',
    description: 'America\'s tallest brick lighthouse. Climb 257 steps for panoramic views.',
    image: '/images/lighthouse.jpg',
  },
  {
    title: 'Avon Pier',
    category: 'fishing',
    village: 'Avon',
    description: 'Premier fishing pier with tackle shop and daily catches.',
    image: '/images/avon-pier.jpg',
  },
  {
    title: 'Canadian Hole',
    category: 'activities',
    village: 'Buxton',
    description: 'World-famous kiteboarding and windsurfing destination.',
    image: '/images/canadian-hole.jpg',
  },
  {
    title: 'Hatteras Ferry',
    category: 'attractions',
    village: 'Hatteras',
    description: 'Free ferry to Ocracoke Island. A scenic 40-minute ride.',
    image: '/images/ferry.jpg',
  },
];

// Blog posts - will be pulled from Sanity CMS
const blogPosts = [
  {
    title: 'Best Time to Visit Hatteras Island',
    slug: 'best-time-to-visit',
    category: 'blog',
    excerpt: 'Planning your Outer Banks vacation? Here\'s everything you need to know about seasonal weather, crowds, and activities throughout the year.',
    readTime: '5 min read',
    date: 'Jan 15, 2026',
    featured: true,
  },
  {
    title: 'Top 10 Restaurants on Hatteras Island',
    slug: 'top-restaurants',
    category: 'dining',
    excerpt: 'From fresh seafood to casual beach bites, discover the best local dining spots recommended by island locals.',
    readTime: '8 min read',
    date: 'Jan 10, 2026',
    featured: true,
  },
  {
    title: 'Beginner\'s Guide to Kiteboarding',
    slug: 'kiteboarding-guide',
    category: 'activities',
    excerpt: 'Hatteras Island is one of the best places in the world to learn kiteboarding. Here\'s how to get started.',
    readTime: '6 min read',
    date: 'Jan 5, 2026',
    featured: false,
  },
  {
    title: 'Fishing Calendar: What\'s Biting When',
    slug: 'fishing-calendar',
    category: 'fishing',
    excerpt: 'A month-by-month guide to the best fishing opportunities on Hatteras Island, from surf fishing to offshore charters.',
    readTime: '7 min read',
    date: 'Dec 28, 2025',
    featured: false,
  },
  {
    title: 'History of the Cape Hatteras Lighthouse',
    slug: 'lighthouse-history',
    category: 'attractions',
    excerpt: 'Learn about the fascinating history of America\'s tallest brick lighthouse and its dramatic 1999 relocation.',
    readTime: '10 min read',
    date: 'Dec 20, 2025',
    featured: false,
  },
  {
    title: 'Hidden Gems: Secret Spots Only Locals Know',
    slug: 'hidden-gems',
    category: 'blog',
    excerpt: 'Discover the lesser-known beaches, trails, and experiences that make Hatteras Island truly special.',
    readTime: '6 min read',
    date: 'Dec 15, 2025',
    featured: true,
  },
];

export default function IslandGuidePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeVillage, setActiveVillage] = useState<string | null>(null);

  const filteredHighlights = highlights.filter(h => activeCategory === 'all' || h.category === activeCategory);
  const filteredPosts = blogPosts.filter(p => activeCategory === 'all' || p.category === activeCategory || activeCategory === 'blog');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Map className="w-6 h-6" />
              <span className="font-medium">Discover Hatteras Island</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Island Guide & Blog
            </h1>
            <p className="text-xl text-cyan-100 mb-8">
              Your complete resource for Hatteras Island - dining, activities, events, local tips, and travel inspiration.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Interactive Map Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore the Seven Villages</h2>
          <div className="grid md:grid-cols-7 gap-4">
            {villages.map((village) => (
              <button
                key={village.slug}
                onClick={() => setActiveVillage(activeVillage === village.slug ? null : village.slug)}
                className={`p-4 rounded-xl text-left transition-all ${
                  activeVillage === village.slug
                    ? 'bg-cyan-600 text-white shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                }`}
              >
                <div className="font-semibold mb-1">{village.name}</div>
                <div className={`text-xs ${activeVillage === village.slug ? 'text-cyan-100' : 'text-gray-500'}`}>
                  {village.description}
                </div>
              </button>
            ))}
          </div>

          {activeVillage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 pt-6 border-t"
            >
              <Link
                href={`/properties?village=${activeVillage}`}
                className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium"
              >
                View {villages.find(v => v.slug === activeVillage)?.name} Properties
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Featured Blog Posts */}
        {(activeCategory === 'all' || activeCategory === 'blog') && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
              <h2 className="text-xl font-bold text-gray-900">Featured Articles</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {blogPosts.filter(p => p.featured).map((post, index) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="h-40 bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-white/30 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime}
                      </span>
                      <span>{post.date}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                    <Link
                      href={`/island-guide/${post.slug}`}
                      className="inline-flex items-center gap-1 text-cyan-600 text-sm font-medium mt-3 hover:gap-2 transition-all"
                    >
                      Read more
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        )}

        {/* Highlights Grid */}
        {activeCategory !== 'blog' && filteredHighlights.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Things to Do & See</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredHighlights.map((highlight, index) => (
                <motion.div
                  key={highlight.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-40 bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-white/30" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{highlight.village}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{highlight.title}</h3>
                    <p className="text-sm text-gray-600">{highlight.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Blog Posts */}
        {filteredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {activeCategory === 'blog' ? 'All Articles' : 'Related Articles'}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredPosts.filter(p => activeCategory === 'blog' || !p.featured).map((post, index) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow group flex gap-5"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime}
                      </span>
                      <span>{post.date}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-cyan-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Stay in the Loop</h2>
          <p className="text-cyan-100 mb-6 max-w-2xl mx-auto">
            Get the latest Hatteras Island news, travel tips, and exclusive offers delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-cyan-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-colors"
          >
            Find Your Perfect Rental
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
