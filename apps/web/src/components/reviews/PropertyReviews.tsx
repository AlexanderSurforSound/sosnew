'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type ReviewList, type ReviewStats, type Review } from '@/lib/api';

interface PropertyReviewsProps {
  propertyId: string;
  propertyName?: string;
}

const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating ? 'text-amber-400' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const RatingBar = ({ label, rating }: { label: string; rating: number | null | undefined }) => {
  if (!rating) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-28">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(rating / 5) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-amber-400 rounded-full"
        />
      </div>
      <span className="text-sm font-medium text-gray-900 w-8">{rating.toFixed(1)}</span>
    </div>
  );
};

const ReviewCard = ({ review, onMarkHelpful }: { review: Review; onMarkHelpful: (id: string) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const handleHelpful = () => {
    if (!hasMarkedHelpful) {
      onMarkHelpful(review.id);
      setHasMarkedHelpful(true);
    }
  };

  const tripTypeLabels: Record<string, string> = {
    family: 'Family vacation',
    couples: 'Couples getaway',
    friends: 'Friends trip',
    solo: 'Solo travel',
    business: 'Business trip',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-gray-200 last:border-0 py-6"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center text-white font-semibold">
            {review.guest?.firstName?.[0] || 'G'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {review.guest?.firstName || 'Guest'}
                {review.guest?.lastInitial && ` ${review.guest.lastInitial}.`}
              </span>
              {review.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verified Stay
                </span>
              )}
            </div>
            {review.guest?.location && (
              <span className="text-sm text-gray-500">{review.guest.location}</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <StarRating rating={review.overallRating} />
          <span className="text-sm text-gray-500 mt-1 block">
            Stayed {formatDate(review.stayDate)}
          </span>
        </div>
      </div>

      {review.tripType && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
            {tripTypeLabels[review.tripType] || review.tripType}
          </span>
        </div>
      )}

      {review.title && (
        <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
      )}

      <div className="relative">
        <p className={`text-gray-700 leading-relaxed ${!isExpanded && review.content.length > 300 ? 'line-clamp-3' : ''}`}>
          {review.content}
        </p>
        {review.content.length > 300 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-ocean-600 hover:text-ocean-700 text-sm font-medium mt-1"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Sub-ratings */}
      {(review.cleanlinessRating || review.accuracyRating || review.communicationRating || review.locationRating || review.valueRating) && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {review.cleanlinessRating && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Cleanliness:</span>
              <StarRating rating={review.cleanlinessRating} size="sm" />
            </div>
          )}
          {review.accuracyRating && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Accuracy:</span>
              <StarRating rating={review.accuracyRating} size="sm" />
            </div>
          )}
          {review.communicationRating && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Communication:</span>
              <StarRating rating={review.communicationRating} size="sm" />
            </div>
          )}
          {review.locationRating && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Location:</span>
              <StarRating rating={review.locationRating} size="sm" />
            </div>
          )}
          {review.valueRating && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Value:</span>
              <StarRating rating={review.valueRating} size="sm" />
            </div>
          )}
        </div>
      )}

      {/* Owner Response */}
      {review.ownerResponse && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4 border-l-4 border-ocean-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-900">Response from owner</span>
            {review.ownerResponseDate && (
              <span className="text-sm text-gray-500">
                {formatDate(review.ownerResponseDate)}
              </span>
            )}
          </div>
          <p className="text-gray-700 text-sm">{review.ownerResponse}</p>
        </div>
      )}

      {/* Helpful */}
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={handleHelpful}
          disabled={hasMarkedHelpful}
          className={`flex items-center gap-2 text-sm ${
            hasMarkedHelpful
              ? 'text-ocean-600 cursor-default'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          <span>
            {hasMarkedHelpful ? 'Marked helpful' : 'Helpful'}
            {(review.helpfulCount > 0 || hasMarkedHelpful) && (
              <span className="ml-1">
                ({hasMarkedHelpful ? review.helpfulCount + 1 : review.helpfulCount})
              </span>
            )}
          </span>
        </button>
      </div>
    </motion.div>
  );
};

const RatingDistribution = ({ distribution, total }: { distribution: Record<number, number>; total: number }) => {
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = distribution[rating] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;

        return (
          <div key={rating} className="flex items-center gap-2">
            <span className="text-sm text-gray-600 w-3">{rating}</span>
            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: (5 - rating) * 0.1 }}
                className="h-full bg-amber-400 rounded-full"
              />
            </div>
            <span className="text-sm text-gray-500 w-8">{count}</span>
          </div>
        );
      })}
    </div>
  );
};

export default function PropertyReviews({ propertyId, propertyName }: PropertyReviewsProps) {
  const [reviews, setReviews] = useState<ReviewList | null>(null);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reviewsData, statsData] = await Promise.all([
          api.getPropertyReviews(propertyId, page, 10),
          api.getPropertyReviewStats(propertyId),
        ]);
        setReviews(reviewsData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId, page]);

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const sessionId = typeof window !== 'undefined'
        ? localStorage.getItem('session_id') || `anon_${Date.now()}`
        : undefined;

      if (typeof window !== 'undefined' && !localStorage.getItem('session_id')) {
        localStorage.setItem('session_id', sessionId!);
      }

      await api.markReviewHelpful(reviewId, sessionId);
    } catch (error) {
      console.error('Failed to mark review helpful:', error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
        <p className="text-gray-600">Be the first to share your experience at this property!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Guest Reviews</h2>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</span>
          <div>
            <StarRating rating={Math.round(stats.averageRating)} size="md" />
            <span className="text-sm text-gray-500">{stats.totalReviews} reviews</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 gap-8 p-6 bg-gray-50 rounded-xl">
        {/* Rating Distribution */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h3>
          <RatingDistribution distribution={stats.ratingDistribution} total={stats.totalReviews} />
        </div>

        {/* Category Ratings */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Category Scores</h3>
          <div className="space-y-3">
            <RatingBar label="Cleanliness" rating={stats.averageCleanliness} />
            <RatingBar label="Accuracy" rating={stats.averageAccuracy} />
            <RatingBar label="Communication" rating={stats.averageCommunication} />
            <RatingBar label="Location" rating={stats.averageLocation} />
            <RatingBar label="Value" rating={stats.averageValue} />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div>
        <AnimatePresence mode="wait">
          {reviews?.reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onMarkHelpful={handleMarkHelpful}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {reviews && reviews.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: reviews.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === reviews.totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-lg ${
                      p === page
                        ? 'bg-ocean-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(reviews.totalPages, p + 1))}
            disabled={page === reviews.totalPages}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
