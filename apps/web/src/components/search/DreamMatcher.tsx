'use client';

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Search, MapPin, Bed, PawPrint, X, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { api, DreamMatchResult, ExtractedSearchCriteria } from '@/lib/api';
import { cn } from '@/lib/utils';

const EXAMPLE_DREAMS = [
  "A cozy oceanfront cottage for a romantic getaway with my partner",
  "Large house with pool for our family reunion, 6 bedrooms, pet-friendly",
  "Quiet retreat near the lighthouse for a solo writing vacation",
  "Budget-friendly place in Avon that sleeps 8 for our annual surf trip"
];

export function DreamMatcher() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<DreamMatchResult[] | null>(null);
  const [criteria, setCriteria] = useState<ExtractedSearchCriteria | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    setError(null);
    setResults(null);

    try {
      const response = await api.dreamMatch({ query, maxResults: 6 });
      setResults(response.matches);
      setCriteria(response.searchCriteria);
      setSummary(response.summary);
      setIsExpanded(true);
    } catch (err) {
      setError('Sorry, we had trouble finding your dream vacation. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  const handleClear = () => {
    setResults(null);
    setCriteria(null);
    setSummary(null);
    setQuery('');
    setIsExpanded(false);
  };

  return (
    <div className="w-full">
      {/* Main Search Area */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4">
            <Search className="w-5 h-5 text-amber-300" />
            <span className="text-white text-sm font-medium">Smart Search</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Describe Your Dream Vacation
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Tell us what you're looking for in your own words, and Sandy will find the perfect matches
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., We want a pet-friendly oceanfront house with a pool for our family of 6, somewhere quiet but close to restaurants..."
              className="w-full px-6 py-4 pr-32 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 resize-none min-h-[100px]"
              rows={3}
              disabled={isSearching}
            />
            <button
              type="submit"
              disabled={!query.trim() || isSearching}
              className={cn(
                'absolute right-3 bottom-3 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all',
                query.trim() && !isSearching
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              )}
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Find My Match</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Example Prompts */}
        {!results && (
          <div className="mt-6 max-w-3xl mx-auto">
            <p className="text-blue-200 text-sm mb-3 text-center">Try one of these:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLE_DREAMS.map((example, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(example)}
                  className="text-sm bg-white/10 text-white px-4 py-2 rounded-full hover:bg-white/20 transition-colors text-left max-w-xs truncate"
                >
                  "{example.substring(0, 40)}..."
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {results && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                  Your Perfect Matches
                </h3>
                {summary && <p className="text-gray-600 mt-1">{summary}</p>}
              </div>
              <button
                onClick={handleClear}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>

            {/* Extracted Criteria Pills */}
            {criteria && (
              <div className="flex flex-wrap gap-2 mb-6">
                {criteria.preferredVillage && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    <MapPin className="w-3 h-3" />
                    {criteria.preferredVillage}
                  </span>
                )}
                {criteria.minBedrooms && (
                  <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    <Bed className="w-3 h-3" />
                    {criteria.minBedrooms}+ bedrooms
                  </span>
                )}
                {criteria.petFriendly && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <PawPrint className="w-3 h-3" />
                    Pet-friendly
                  </span>
                )}
                {criteria.locationPreference && (
                  <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">
                    {criteria.locationPreference}
                  </span>
                )}
                {criteria.vibe && (
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm capitalize">
                    {criteria.vibe} vibe
                  </span>
                )}
              </div>
            )}

            {/* Results Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result, index) => (
                <DreamMatchCard key={result.property.id} result={result} rank={index + 1} />
              ))}
            </div>

            {/* View All Button */}
            <div className="mt-8 text-center">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Browse All Properties
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* No Results */}
        {results && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center py-12 bg-gray-50 rounded-xl"
          >
            <p className="text-gray-600 mb-4">
              We couldn't find exact matches for your dream vacation.
            </p>
            <Link
              href="/properties"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Browse all properties instead
            </Link>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DreamMatchCard({ result, rank }: { result: DreamMatchResult; rank: number }) {
  const { property, matchScore, matchExplanation, highlightedFeatures } = result;
  const primaryImage = property.images?.find((img) => img.isPrimary) || property.images?.[0];

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100"
    >
      {/* Image */}
      <div className="relative aspect-[4/3]">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || property.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}

        {/* Match Score Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
          <Sparkles className="w-4 h-4" />
          #{rank} Match
        </div>

        {/* Highlighted Features */}
        {highlightedFeatures.length > 0 && (
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
            {highlightedFeatures.slice(0, 3).map((feature, i) => (
              <span
                key={i}
                className="bg-black/70 text-white text-xs px-2 py-1 rounded"
              >
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
          {property.name}
        </h4>
        <p className="text-sm text-gray-500 mb-2">
          {property.village?.name || 'Hatteras Island'} • {property.bedrooms} BR • Sleeps {property.sleeps}
        </p>

        {/* AI Explanation */}
        <div className="bg-blue-50 rounded-lg p-3 mt-3">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 line-clamp-3">{matchExplanation}</p>
          </div>
        </div>

        {/* Price */}
        {property.baseRate && (
          <div className="mt-3 pt-3 border-t flex items-center justify-between">
            <span>
              <span className="text-lg font-semibold text-gray-900">
                ${property.baseRate.toLocaleString()}
              </span>
              <span className="text-gray-500 text-sm"> / night</span>
            </span>
            <span className="text-blue-600 font-medium text-sm group-hover:underline">
              View Property
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
