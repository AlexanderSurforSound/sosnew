'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Heart, TrendingUp, Users, Waves } from 'lucide-react';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { searchRealProperties } from '@/lib/realProperties';

// Local type for recommendation data
interface RecommendationProperty {
  id: string;
  slug: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  sleeps: number;
  village: string;
  primaryImage: string;
  pricePerNight: number;
}

interface RecommendationSection {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  properties: RecommendationProperty[];
  reason: string;
}

export default function PersonalizedRecommendations() {
  const { recentlyViewed } = useRecentlyViewed();
  const { favorites } = useFavorites();
  const [sections, setSections] = useState<RecommendationSection[]>([]);
  const [activeSection, setActiveSection] = useState(0);

  // Get real properties from the same source as vacation rentals
  const availableProperties = useMemo(() => {
    const properties = searchRealProperties({});
    return properties.slice(0, 16).map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      sleeps: p.sleeps || p.bedrooms * 2,
      village: typeof p.village === 'string' ? p.village : p.village?.name || 'Hatteras Island',
      primaryImage: p.images?.[0]?.url || '',
      pricePerNight: Math.round((p.baseRate || 1500) / 7),
    }));
  }, []);

  useEffect(() => {
    if (availableProperties.length === 0) return;

    // Build personalized recommendations based on user behavior
    const newSections: RecommendationSection[] = [];

    // If user has favorites, recommend similar
    if (favorites.length > 0 && availableProperties.length > 0) {
      const avgBedrooms = Math.round(favorites.reduce((acc, p) => acc + (p.bedrooms || 0), 0) / favorites.length);
      const similarProps = availableProperties.filter((p) => Math.abs(p.bedrooms - avgBedrooms) <= 1);
      if (similarProps.length > 0) {
        newSections.push({
          title: 'Because You Loved',
          subtitle: `Similar to your ${favorites.length} saved properties`,
          icon: <Heart className="w-5 h-5 text-red-500" />,
          properties: similarProps,
          reason: `Based on your preference for ${avgBedrooms}-bedroom homes`,
        });
      }
    }

    // If user has viewed properties, recommend in same areas
    if (recentlyViewed.length > 0 && availableProperties.length > 0) {
      const villages = [...new Set(recentlyViewed.map((v) => {
        const village = v.property.village;
        return typeof village === 'string' ? village : village?.name;
      }).filter(Boolean))] as string[];
      if (villages.length > 0) {
        const areaProps = availableProperties.filter((p) => villages.includes(p.village));
        if (areaProps.length > 0) {
          newSections.push({
            title: 'More in Your Favorite Areas',
            subtitle: `Explore more in ${villages.slice(0, 2).join(' & ')}`,
            icon: <Waves className="w-5 h-5 text-ocean-500" />,
            properties: areaProps.length >= 4 ? areaProps : availableProperties,
            reason: `You've been exploring ${villages[0]}`,
          });
        }
      }
    }

    // Always show trending if we have properties
    if (availableProperties.length > 0) {
      newSections.push({
        title: 'Trending This Week',
        subtitle: 'Most popular with guests right now',
        icon: <TrendingUp className="w-5 h-5 text-green-500" />,
        properties: availableProperties.slice(0, 4),
        reason: 'Booked 50+ times this month',
      });

      // Staff picks / featured
      newSections.push({
        title: 'Staff Picks',
        subtitle: 'Hand-selected by our local experts',
        icon: <Sparkles className="w-5 h-5 text-amber-500" />,
        properties: availableProperties.slice(4, 8).length >= 4 ? availableProperties.slice(4, 8) : availableProperties.slice(0, 4),
        reason: 'Featured for exceptional quality',
      });

      // Family favorites
      const familyProps = availableProperties.filter((p) => p.bedrooms >= 3);
      if (familyProps.length >= 2) {
        newSections.push({
          title: 'Perfect for Families',
          subtitle: 'Kid-friendly homes with space to spread out',
          icon: <Users className="w-5 h-5 text-purple-500" />,
          properties: familyProps.slice(0, 4),
          reason: 'Great for groups with children',
        });
      }
    }

    setSections(newSections);
  }, [favorites, recentlyViewed, availableProperties]);

  // Don't show anything if no sections
  if (sections.length === 0) return null;

  const currentSection = sections[activeSection];

  return (
    <section className="py-16 bg-white">
      <div className="container-page">
        {/* Section tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {sections.map((section, index) => (
            <button
              key={section.title}
              onClick={() => setActiveSection(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                index === activeSection
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {section.icon}
              <span className="font-medium">{section.title}</span>
            </button>
          ))}
        </div>

        {/* Current section header */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              {currentSection.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentSection.title}</h2>
              <p className="text-gray-500">{currentSection.subtitle}</p>
            </div>
          </div>
          <p className="text-sm text-ocean-600 ml-15 pl-0.5">{currentSection.reason}</p>
        </motion.div>

        {/* Properties grid */}
        <motion.div
          key={`grid-${activeSection}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {currentSection.properties.slice(0, 4).map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/properties/${property.slug}`}
                className="block bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all group"
              >
                <div className="relative aspect-[4/3]">
                  {property.primaryImage ? (
                    <Image
                      src={property.primaryImage}
                      alt={property.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-ocean-100 to-ocean-200 flex items-center justify-center">
                      <Waves className="w-12 h-12 text-ocean-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-semibold truncate">{property.name}</p>
                    <p className="text-white/80 text-sm">{property.village}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {property.bedrooms} bed · {property.sleeps} guests
                    </span>
                    <span className="font-bold text-gray-900">
                      ${property.pricePerNight}
                      <span className="text-sm font-normal text-gray-500">/nt</span>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View all link */}
        <div className="text-center mt-8">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors"
          >
            View all properties
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
