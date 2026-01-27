/**
 * CMS Property Mappers
 * Convert CMS data types to frontend data types
 */

import type { Property, PropertyImage, Amenity, Village } from '@/types';
import type { CMSProperty, CMSImage, CMSAmenity, CMSVillage } from './types';

/**
 * Convert CMS image to frontend PropertyImage
 */
function mapImage(img: CMSImage): PropertyImage {
  return {
    url: img.url,
    alt: img.alt,
    caption: img.caption,
    isPrimary: img.isPrimary,
  };
}

/**
 * Convert CMS amenity to frontend Amenity
 */
function mapAmenity(amenity: CMSAmenity): Amenity {
  return {
    id: amenity._id,
    name: amenity.name,
    slug: amenity.slug,
    category: amenity.category,
    icon: amenity.icon,
    description: amenity.description,
  };
}

/**
 * Convert CMS village to frontend Village
 */
function mapVillage(village: CMSVillage): Village {
  return {
    id: village._id,
    name: village.name,
    slug: village.slug,
    description: village.description,
    shortDescription: village.shortDescription,
    heroImage: village.image?.url,
    highlights: village.highlights,
    location: village.coordinates,
  };
}

/**
 * Calculate base weekly rate from CMS weekly rates
 * Returns the minimum rate from all seasons (starting price)
 */
function calculateBaseRate(weeklyRates?: CMSProperty['weeklyRates']): number | undefined {
  if (!weeklyRates || weeklyRates.length === 0) return undefined;

  // Get the minimum rate across all seasons (the "from" price)
  const allMinRates = weeklyRates.map(r => r.minRate).filter(r => r > 0);
  if (allMinRates.length === 0) return undefined;

  return Math.min(...allMinRates);
}

/**
 * Convert CMS property to frontend Property type
 *
 * Note: Some fields like bedrooms, bathrooms, sleeps come from Track PMS
 * and may not be available in CMS data. They default to 0 here.
 */
export function mapCMSPropertyToProperty(cmsProperty: CMSProperty): Property {
  const baseRate = calculateBaseRate(cmsProperty.weeklyRates);

  return {
    id: cmsProperty._id,
    trackId: cmsProperty.trackId,
    name: cmsProperty.name,
    slug: cmsProperty.slug,
    headline: cmsProperty.headline,
    description: cmsProperty.description?.text || '',
    village: cmsProperty.village ? mapVillage(cmsProperty.village) : undefined,
    // These fields typically come from Track PMS - default to reasonable values
    bedrooms: 0, // Will be enriched from Track
    bathrooms: 0, // Will be enriched from Track
    sleeps: 0, // Will be enriched from Track
    propertyType: 'House',
    images: cmsProperty.images?.map(mapImage) || [],
    amenities: cmsProperty.amenities?.map(mapAmenity) || [],
    petFriendly: cmsProperty.amenities?.some(a =>
      a.name.toLowerCase().includes('pet') ||
      a.name.toLowerCase().includes('dog')
    ) || false,
    featured: cmsProperty.featured || false,
    baseRate, // Weekly rate from CMS
    primaryImage: cmsProperty.images?.[0]?.url,
  };
}

/**
 * Map array of CMS properties to frontend properties
 */
export function mapCMSPropertiesToProperties(cmsProperties: CMSProperty[]): Property[] {
  return cmsProperties.map(mapCMSPropertyToProperty);
}
