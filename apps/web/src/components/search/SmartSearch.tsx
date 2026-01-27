'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, TrendingUp, MapPin, Home, X, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface SearchSuggestion {
  type: 'property' | 'village' | 'amenity' | 'recent' | 'trending';
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
}

const trendingSearches = [
  { title: 'Oceanfront homes', url: '/properties?amenities=oceanfront' },
  { title: 'Pet friendly', url: '/properties?petFriendly=true' },
  { title: 'Homes with pools', url: '/properties?amenities=pool' },
  { title: 'Large family homes', url: '/properties?minBedrooms=5' },
  { title: 'Rodanthe', url: '/properties?village=rodanthe' },
];

const villages = [
  { id: 'rodanthe', name: 'Rodanthe', properties: 85 },
  { id: 'waves', name: 'Waves', properties: 72 },
  { id: 'salvo', name: 'Salvo', properties: 68 },
  { id: 'avon', name: 'Avon', properties: 156 },
  { id: 'buxton', name: 'Buxton', properties: 134 },
  { id: 'frisco', name: 'Frisco', properties: 89 },
  { id: 'hatteras', name: 'Hatteras Village', properties: 45 },
];

export default function SmartSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recent_searches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const searchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 200));

    const results: SearchSuggestion[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    // Match villages
    villages.forEach((village) => {
      if (village.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'village',
          id: village.id,
          title: village.name,
          subtitle: `${village.properties} properties`,
          url: `/properties?village=${village.id}`,
        });
      }
    });

    // Match amenities
    const amenities = [
      { name: 'Pool', slug: 'pool' },
      { name: 'Hot Tub', slug: 'hot-tub' },
      { name: 'Ocean View', slug: 'ocean-view' },
      { name: 'Oceanfront', slug: 'oceanfront' },
      { name: 'Pet Friendly', slug: 'pet-friendly' },
      { name: 'Game Room', slug: 'game-room' },
      { name: 'Private Beach Access', slug: 'private-beach' },
      { name: 'Elevator', slug: 'elevator' },
    ];

    amenities.forEach((amenity) => {
      if (amenity.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'amenity',
          id: amenity.slug,
          title: amenity.name,
          subtitle: 'Amenity filter',
          url: `/properties?amenities=${amenity.slug}`,
        });
      }
    });

    setSuggestions(results.slice(0, 8));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchSuggestions(query);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, searchSuggestions]);

  const handleSelect = (suggestion: SearchSuggestion) => {
    // Save to recent searches
    const newRecent = [suggestion.title, ...recentSearches.filter((s) => s !== suggestion.title)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recent_searches', JSON.stringify(newRecent));

    router.push(suggestion.url);
    setIsOpen(false);
    setQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Save to recent
      const newRecent = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('recent_searches', JSON.stringify(newRecent));

      router.push(`/properties?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  const clearRecent = (search: string) => {
    const newRecent = recentSearches.filter((s) => s !== search);
    setRecentSearches(newRecent);
    localStorage.setItem('recent_searches', JSON.stringify(newRecent));
  };

  const getIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'village':
        return <MapPin className="w-4 h-4" />;
      case 'property':
        return <Home className="w-4 h-4" />;
      case 'amenity':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl" id="search">
      <form onSubmit={handleSubmit}>
        <div
          className={`relative flex items-center bg-white rounded-xl shadow-sm border-2 transition-all ${
            isOpen ? 'border-ocean-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Search className="absolute left-4 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Search properties, villages, amenities..."
            className="w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none text-gray-900 placeholder-gray-400"
            data-search-input
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Loading state */}
            {isLoading && (
              <div className="p-4 flex items-center gap-3 text-gray-500">
                <div className="w-4 h-4 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin" />
                Searching...
              </div>
            )}

            {/* Suggestions */}
            {!isLoading && suggestions.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Suggestions
                </p>
                {suggestions.map((suggestion) => (
                  <button
                    key={`${suggestion.type}-${suggestion.id}`}
                    onClick={() => handleSelect(suggestion)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                      {getIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{suggestion.title}</p>
                      {suggestion.subtitle && (
                        <p className="text-sm text-gray-500 truncate">{suggestion.subtitle}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 capitalize">{suggestion.type}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Recent searches */}
            {!isLoading && !query && recentSearches.length > 0 && (
              <div className="p-2 border-b border-gray-100">
                <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Recent Searches
                </p>
                {recentSearches.map((search) => (
                  <div
                    key={search}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <button
                      onClick={() => router.push(`/properties?q=${encodeURIComponent(search)}`)}
                      className="flex-1 text-left text-gray-700 hover:text-gray-900"
                    >
                      {search}
                    </button>
                    <button
                      onClick={() => clearRecent(search)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Trending */}
            {!isLoading && !query && (
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" />
                  Trending Searches
                </p>
                <div className="flex flex-wrap gap-2 px-3 py-2">
                  {trendingSearches.map((item) => (
                    <button
                      key={item.title}
                      onClick={() => router.push(item.url)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {!isLoading && query && suggestions.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-gray-500 mb-2">No results found for "{query}"</p>
                <button
                  onClick={() => router.push(`/properties?q=${encodeURIComponent(query)}`)}
                  className="text-ocean-600 hover:text-ocean-700 font-medium"
                >
                  Search all properties →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
