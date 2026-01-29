'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bed,
  Bath,
  Users,
  MapPin,
  Check,
  Dog,
  GitCompare,
  Star,
  Sparkles,
} from 'lucide-react';
import type { PropertyDetail } from '@/types';
import { PhotoGallery } from '@/components/gallery';
import { ShareButton } from '@/components/sharing';
import { FavoriteButton } from '@/components/favorites';
import { PropertyReviews, ReviewForm } from '@/components/reviews';
import { WeatherWidget } from '@/components/weather';
import { NearbyAttractions } from '@/components/attractions';
import { BookingWidget } from '@/components/booking/BookingWidget';
import PriceCalendar from '@/components/booking/PriceCalendar';
import { AmenityList } from '@/components/property/AmenityList';
import { VirtualTour } from '@/components/property/VirtualTour';
import { SimilarProperties } from '@/components/property/SimilarProperties';
import { FloorPlanViewer } from '@/components/property/FloorPlanViewer';
import { PropertyAskSandy, PropertyAskSandyInline } from '@/components/property/PropertyAskSandy';
import { RealTimeViewers, PropertyUrgencyIndicator } from '@/components/property/RealTimeViewers';
import { useCompare } from '@/contexts/CompareContext';
import { useFavorites } from '@/contexts/FavoritesContext';

interface PropertyDetailClientProps {
  property: PropertyDetail;
}

export default function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'location'>('overview');
  const { addToCompare, isInCompare, canAddMore } = useCompare();
  const { isFavorite, toggleFavorite } = useFavorites();

  const inCompare = isInCompare(property.id);
  const propertyIsFavorite = isFavorite(property.id);

  // Keyboard shortcuts for this page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // F for favorite
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        const favoriteProperty = {
          id: property.id,
          slug: property.slug,
          name: property.name,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          sleeps: property.sleeps,
          village: property.village?.name,
          primaryImage: property.images?.[0]?.url,
          pricePerNight: property.baseRate,
        };
        toggleFavorite(favoriteProperty as any);
      }

      // C for compare
      if ((e.key === 'c' || e.key === 'C') && !inCompare && canAddMore) {
        e.preventDefault();
        addToCompare(property as any);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [property, inCompare, canAddMore, addToCompare, toggleFavorite]);

  const galleryImages = property.images.map((img) => ({
    url: img.url,
    alt: img.alt,
    caption: img.caption,
  }));

  const handleCompareClick = () => {
    if (!inCompare && canAddMore) {
      addToCompare(property as any);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="container-page py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/properties" className="text-gray-500 hover:text-gray-700">
              Vacation Rentals
            </Link>
            <span className="text-gray-300">/</span>
            {property.village && (
              <>
                <Link
                  href={`/explore?village=${property.village.slug}`}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {property.village.name}
                </Link>
                <span className="text-gray-300">/</span>
              </>
            )}
            <span className="text-gray-900 font-medium truncate">{property.name}</span>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="container-page py-6">
        <PhotoGallery images={galleryImages} propertyName={property.name} />
      </div>

      {/* Main Content */}
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {property.name}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{property.village?.name || 'Hatteras Island'}, NC</span>
                    </div>
                    <RealTimeViewers propertyId={property.id} variant="inline" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <FavoriteButton
                    property={{
                      id: property.id,
                      slug: property.slug,
                      name: property.name,
                      bedrooms: property.bedrooms,
                      bathrooms: property.bathrooms,
                      sleeps: property.sleeps,
                      village: property.village?.name,
                      primaryImage: property.images?.[0]?.url,
                      pricePerNight: property.baseRate,
                    } as any}
                    variant="button"
                  />
                  <button
                    onClick={handleCompareClick}
                    disabled={inCompare || !canAddMore}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      inCompare
                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                    }`}
                  >
                    <GitCompare className="w-5 h-5" />
                    {inCompare ? 'In Compare' : 'Compare'}
                  </button>
                  <ShareButton
                    title={property.name}
                    description={property.headline || `${property.bedrooms} bedroom vacation rental`}
                    image={property.images?.[0]?.url}
                  />
                </div>
              </div>

              {/* Property Stats */}
              <div className="flex flex-wrap items-center gap-6 py-4 border-y">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">{property.bedrooms}</span>
                  <span className="text-gray-600">Bedrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">{property.bathrooms}</span>
                  <span className="text-gray-600">Bathrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">{property.sleeps}</span>
                  <span className="text-gray-600">Guests</span>
                </div>
                {property.petFriendly && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Dog className="w-5 h-5" />
                    <span className="font-medium">Pet Friendly</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b mb-8">
              <nav className="flex gap-8">
                {(['overview', 'reviews', 'location'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-ocean-600 text-ocean-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Headline */}
                {property.headline && (
                  <p className="text-xl text-gray-700 mb-8">{property.headline}</p>
                )}

                {/* Highlights */}
                {property.highlights && property.highlights.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Property Highlights</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {property.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {property.description && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">About This Property</h2>
                    <div className="prose max-w-none text-gray-700">
                      {property.description}
                    </div>
                  </div>
                )}

                {/* Virtual Tour */}
                {property.virtualTourUrl && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Virtual Tour</h2>
                    <VirtualTour url={property.virtualTourUrl} />
                  </div>
                )}

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                    <AmenityList amenities={property.amenities} />
                  </div>
                )}

                {/* House Rules */}
                {property.houseRules && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">House Rules</h2>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="prose max-w-none text-gray-700">
                        {property.houseRules}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Write Review Button */}
                <div className="flex justify-end mb-6">
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-4 py-2 bg-ocean-600 text-white rounded-lg font-medium hover:bg-ocean-700 transition-colors"
                  >
                    Write a Review
                  </button>
                </div>

                {/* Review Form Modal */}
                {showReviewForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowReviewForm(false)} />
                    <div className="relative z-10 w-full max-w-lg">
                      <ReviewForm
                        propertyId={property.id}
                        propertyName={property.name}
                        onSuccess={() => {
                          setShowReviewForm(false);
                          // Refresh reviews
                          window.location.reload();
                        }}
                        onCancel={() => setShowReviewForm(false)}
                      />
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <PropertyReviews propertyId={property.id} propertyName={property.name} />
              </motion.div>
            )}

            {activeTab === 'location' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Map Placeholder */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Location</h2>
                  <div className="bg-gray-100 rounded-xl aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <span className="text-gray-500">Interactive map</span>
                    </div>
                  </div>
                  {property.village && (
                    <p className="mt-4 text-gray-600">
                      Located in {property.village.name},{' '}
                      {property.village.shortDescription}
                    </p>
                  )}
                </div>

                {/* Nearby Attractions */}
                <NearbyAttractions
                  village={property.village?.name}
                  propertyName={property.name}
                />
              </motion.div>
            )}

            {/* Ask Sandy - Inline Q&A */}
            <div className="mt-8">
              <PropertyAskSandyInline
                propertyId={property.id}
                propertyName={property.name}
                village={property.village?.name}
              />
            </div>
          </div>

          {/* Right Column - Booking Widget & Weather */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <PropertyUrgencyIndicator propertyId={property.id} />
              <BookingWidget property={property} />
              <PriceCalendar propertyId={property.id} baseRate={property.baseRate ?? 0} />
              <WeatherWidget village={property.village?.name || 'Hatteras Island'} />
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        <SimilarProperties
          propertyId={property.id}
          propertyName={property.name}
          village={property.village?.name}
          bedrooms={property.bedrooms}
          amenities={property.amenities?.map((a: any) => a.slug || a.name)}
        />
      </div>

      {/* Floating Ask Sandy Button */}
      <PropertyAskSandy
        propertyId={property.id}
        propertyName={property.name}
        village={property.village?.name}
      />
    </div>
  );
}
