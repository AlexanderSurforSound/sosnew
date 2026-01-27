'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sparkles,
  Mic,
  X,
  Loader2,
  MapPin,
  Home,
  Calendar,
  Users,
  ArrowRight,
  Wand2,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAISearch, SemanticSearchResult } from '@/hooks/useAISearch';
import { VoiceSearchModal } from './VoiceSearch';
import Image from 'next/image';
import Link from 'next/link';

interface AISearchBarProps {
  variant?: 'hero' | 'compact' | 'inline';
  placeholder?: string;
  showVoice?: boolean;
  showSuggestions?: boolean;
  onResultClick?: (result: SemanticSearchResult) => void;
  className?: string;
}

const QUICK_SEARCHES = [
  { label: 'Oceanfront', query: 'oceanfront homes with ocean views' },
  { label: 'Pet Friendly', query: 'pet-friendly vacation homes' },
  { label: 'With Pool', query: 'homes with private pool' },
  { label: 'Large Groups', query: 'large homes for family reunions 6+ bedrooms' },
  { label: 'Romantic', query: 'cozy romantic getaway for couples' },
];

const TRENDING_SEARCHES = [
  'Rodanthe oceanfront homes',
  'Avon pet-friendly with pool',
  'Cape Hatteras lighthouse area',
  'Budget-friendly beach houses',
];

export function AISearchBar({
  variant = 'hero',
  placeholder = 'Describe your perfect beach vacation...',
  showVoice = true,
  showSuggestions = true,
  onResultClick,
  className = '',
}: AISearchBarProps) {
  const router = useRouter();
  const { query, setQuery, search, results, isSearching, reset } = useAISearch();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches
  useEffect(() => {
    const stored = localStorage.getItem('ai_recent_searches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (searchQuery: string) => {
    const newRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('ai_recent_searches', JSON.stringify(newRecent));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    saveRecentSearch(query);

    // Navigate to properties with AI search query
    router.push(`/properties?aiSearch=${encodeURIComponent(query)}`);
    setIsExpanded(false);
  };

  const handleQuickSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    saveRecentSearch(searchQuery);
    router.push(`/properties?aiSearch=${encodeURIComponent(searchQuery)}`);
    setIsExpanded(false);
  };

  const handleVoiceResult = (transcript: string) => {
    setQuery(transcript);
    setShowVoiceModal(false);
    saveRecentSearch(transcript);
    router.push(`/properties?aiSearch=${encodeURIComponent(transcript)}`);
  };

  const handleResultClick = (result: SemanticSearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    } else {
      router.push(`/properties/${result.property.slug}`);
    }
    setIsExpanded(false);
  };

  if (variant === 'compact') {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="AI Search..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 focus:outline-none text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full max-w-4xl mx-auto ${className}`}>
      {/* Main Search Input */}
      <form onSubmit={handleSubmit}>
        <div
          className={`relative flex items-center bg-white rounded-2xl shadow-lg border-2 transition-all ${
            isExpanded ? 'border-ocean-500 shadow-xl' : 'border-transparent hover:border-gray-200'
          }`}
        >
          {/* AI Badge */}
          <div className="absolute left-4 flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>AI</span>
            </div>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder={placeholder}
            className="w-full pl-24 pr-32 py-5 rounded-2xl focus:outline-none text-lg text-gray-900 placeholder-gray-400"
          />

          {/* Right side buttons */}
          <div className="absolute right-3 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  reset();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}

            {showVoice && (
              <button
                type="button"
                onClick={() => setShowVoiceModal(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Voice search"
              >
                <Mic className="w-5 h-5 text-gray-500" />
              </button>
            )}

            <button
              type="submit"
              disabled={!query.trim() || isSearching}
              className={`px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                query.trim() && !isSearching
                  ? 'bg-gradient-to-r from-ocean-600 to-ocean-700 text-white hover:from-ocean-700 hover:to-ocean-800 shadow-md'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Find</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Quick Search Chips */}
      {!isExpanded && showSuggestions && (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {QUICK_SEARCHES.map((item) => (
            <button
              key={item.label}
              onClick={() => handleQuickSearch(item.query)}
              className="px-4 py-2 bg-white/80 hover:bg-white rounded-full text-sm text-gray-700 shadow-sm hover:shadow transition-all border border-gray-100"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Expanded Dropdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            {/* Loading State */}
            {isSearching && (
              <div className="p-6 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-ocean-500 to-amber-500 flex items-center justify-center mb-3">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
                <p className="text-gray-600">Sandy is finding your perfect match...</p>
              </div>
            )}

            {/* AI Search Results */}
            {!isSearching && results && results.results.length > 0 && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <p className="text-sm text-gray-600">{results.interpretedIntent}</p>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {results.results.slice(0, 5).map((result) => (
                    <button
                      key={result.propertyId}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {result.property.images?.[0]?.url ? (
                          <Image
                            src={result.property.images[0].url}
                            alt={result.property.name}
                            width={80}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{result.property.name}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {result.property.village?.name} • {result.property.bedrooms} BR • Sleeps {result.property.sleeps}
                        </p>
                        <p className="text-xs text-ocean-600 mt-1 line-clamp-1">{result.explanation}</p>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <p className="font-semibold text-gray-900">
                          ${result.property.baseRate?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">/night</p>
                      </div>
                    </button>
                  ))}
                </div>

                {results.results.length > 5 && (
                  <Link
                    href={`/properties?aiSearch=${encodeURIComponent(query)}`}
                    className="flex items-center justify-center gap-2 mt-4 py-3 bg-gray-50 rounded-xl text-ocean-600 font-medium hover:bg-gray-100 transition-colors"
                  >
                    View all {results.totalMatches} matches
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}

            {/* No Results */}
            {!isSearching && results && results.results.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-600 mb-4">No properties match that description yet.</p>
                <Link
                  href="/properties"
                  className="text-ocean-600 hover:text-ocean-700 font-medium"
                >
                  Browse all properties →
                </Link>
              </div>
            )}

            {/* Default State - Recent & Trending */}
            {!isSearching && !results && (
              <div className="p-4">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <p className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      <Clock className="w-3 h-3" />
                      Recent Searches
                    </p>
                    <div className="space-y-1">
                      {recentSearches.map((search, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickSearch(search)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left text-gray-700 transition-colors"
                        >
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{search}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches */}
                <div>
                  <p className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    <TrendingUp className="w-3 h-3" />
                    Trending
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_SEARCHES.map((search) => (
                      <button
                        key={search}
                        onClick={() => handleQuickSearch(search)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Features Promo */}
                <div className="mt-4 p-4 bg-gradient-to-br from-ocean-50 to-amber-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-ocean-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Powered by Sandy AI</p>
                      <p className="text-sm text-gray-600">
                        Describe your dream vacation in your own words. Sandy understands requests like
                        "cozy oceanfront cottage for a romantic getaway" or "large house with pool for family reunion"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onSearch={handleVoiceResult}
      />
    </div>
  );
}
