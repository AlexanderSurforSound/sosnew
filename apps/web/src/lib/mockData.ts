// Mock data for demo mode - used when API is unavailable
import type { Property, Village, Amenity } from '@surf-or-sound/types';

export const MOCK_VILLAGES: Village[] = [
  {
    id: '1',
    name: 'Rodanthe Village',
    slug: 'rodanthe-village',
    description: 'Famous for the "Nights in Rodanthe" house and world-class kiteboarding. This charming village offers pristine beaches and stunning sunsets.',
    shortDescription: 'Kiteboarding paradise with iconic beaches',
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    highlights: ['Kiteboarding', 'Pier Fishing', 'Iconic Beach House', 'Sunrise Views'],
  },
  {
    id: '2',
    name: 'Waves Village',
    slug: 'waves-village',
    description: 'A small, quiet village perfect for families seeking a peaceful retreat with easy beach access and friendly neighbors.',
    shortDescription: 'Quiet family-friendly retreat',
    heroImage: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80',
    highlights: ['Family Beach', 'Quiet Streets', 'Local Shops', 'Sound Access'],
  },
  {
    id: '3',
    name: 'Salvo Village',
    slug: 'salvo-village',
    description: 'Known for excellent fishing and a laid-back atmosphere. Salvo offers the quintessential Outer Banks experience.',
    shortDescription: 'Laid-back fishing village',
    heroImage: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200&q=80',
    highlights: ['Surf Fishing', 'Day Trips', 'Local Dining', 'Relaxed Vibe'],
  },
  {
    id: '4',
    name: 'Avon Village',
    slug: 'avon-village',
    description: 'The largest village on Hatteras Island with shopping, dining, and beautiful beaches. Perfect for those wanting amenities nearby.',
    shortDescription: 'Shopping, dining & beautiful beaches',
    heroImage: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200&q=80',
    highlights: ['Shopping', 'Restaurants', 'Wide Beaches', 'Fishing Pier'],
  },
  {
    id: '5',
    name: 'Buxton Village',
    slug: 'buxton-village',
    description: 'Home to the iconic Cape Hatteras Lighthouse and legendary surf breaks. A must-visit for surfers and history buffs alike.',
    shortDescription: 'Lighthouse views & legendary surfing',
    heroImage: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&q=80',
    highlights: ['Cape Hatteras Lighthouse', 'World-Class Surfing', 'Nature Trails', 'Historic Sites'],
  },
  {
    id: '6',
    name: 'Frisco Village',
    slug: 'frisco-village',
    description: 'A hidden gem with stunning soundside sunsets and access to some of the island\'s best secret beaches.',
    shortDescription: 'Hidden gem with stunning sunsets',
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    highlights: ['Soundside Sunsets', 'Native American Museum', 'Mini Golf', 'Secret Beaches'],
  },
  {
    id: '7',
    name: 'Hatteras Village',
    slug: 'hatteras-village',
    description: 'The southernmost village, gateway to Ocracoke Island. Famous for offshore fishing charters and fresh seafood.',
    shortDescription: 'Gateway to Ocracoke & fishing capital',
    heroImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
    highlights: ['Ferry to Ocracoke', 'Charter Fishing', 'Fresh Seafood', 'Marina'],
  },
];

export const MOCK_AMENITIES: Amenity[] = [
  { id: '1', name: 'Private Pool', slug: 'private-pool', category: 'outdoor', icon: 'pool' },
  { id: '2', name: 'Hot Tub', slug: 'hot-tub', category: 'outdoor', icon: 'hot-tub' },
  { id: '3', name: 'Ocean View', slug: 'ocean-view', category: 'views', icon: 'waves' },
  { id: '4', name: 'Oceanfront', slug: 'oceanfront', category: 'location', icon: 'beach' },
  { id: '5', name: 'Pet Friendly', slug: 'pet-friendly', category: 'policies', icon: 'paw' },
  { id: '6', name: 'WiFi', slug: 'wifi', category: 'essentials', icon: 'wifi' },
  { id: '7', name: 'Game Room', slug: 'game-room', category: 'entertainment', icon: 'gamepad' },
  { id: '8', name: 'Home Theater', slug: 'home-theater', category: 'entertainment', icon: 'tv' },
  { id: '9', name: 'Elevator', slug: 'elevator', category: 'accessibility', icon: 'elevator' },
  { id: '10', name: 'Grill', slug: 'grill', category: 'outdoor', icon: 'flame' },
];

const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
  'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=800&q=80',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80',
];

const INTERIOR_IMAGES = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
];

const BEACH_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80',
  'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&q=80',
];

const PROPERTY_NAMES = [
  'Oceanfront Oasis',
  'Sunset Paradise',
  'Beach Haven',
  'Coastal Retreat',
  'Seaside Sanctuary',
  'Dune Dreams',
  'Lighthouse View',
  'Wave Rider',
  'Sandy Shores',
  'Island Escape',
  'Tidewater Treasure',
  'Pelican Point',
];

const HEADLINES = [
  'Stunning oceanfront home with private pool',
  'Luxury beachfront retreat for the whole family',
  'Charming cottage steps from the sand',
  'Spacious home with panoramic ocean views',
  'Modern beach house with all the amenities',
  'Classic Outer Banks charm meets modern comfort',
];

function generateProperty(index: number): Property {
  const village = MOCK_VILLAGES[index % MOCK_VILLAGES.length];
  const bedrooms = Math.floor(Math.random() * 6) + 2; // 2-7 bedrooms
  const bathrooms = Math.floor(bedrooms * 0.75) + 1;
  const sleeps = bedrooms * 2 + Math.floor(Math.random() * 4);
  const baseRate = (bedrooms * 75) + Math.floor(Math.random() * 200) + 150;

  const numAmenities = Math.floor(Math.random() * 5) + 4;
  const shuffledAmenities = [...MOCK_AMENITIES].sort(() => Math.random() - 0.5);

  return {
    id: `prop-${index + 1}`,
    trackId: `TRACK-${1000 + index}`,
    name: PROPERTY_NAMES[index % PROPERTY_NAMES.length] + (index >= PROPERTY_NAMES.length ? ` ${Math.floor(index / PROPERTY_NAMES.length) + 1}` : ''),
    slug: `${PROPERTY_NAMES[index % PROPERTY_NAMES.length].toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
    headline: HEADLINES[index % HEADLINES.length],
    description: `Experience the ultimate Outer Banks vacation at this beautiful ${bedrooms}-bedroom home in ${village.name}. With stunning views, modern amenities, and easy beach access, this property offers everything you need for an unforgettable getaway. Perfect for families, groups of friends, or anyone looking to escape to the coast.`,
    village: village,
    bedrooms,
    bathrooms,
    sleeps,
    propertyType: bedrooms > 5 ? 'House' : bedrooms > 3 ? 'Cottage' : 'Condo',
    images: [
      { url: PROPERTY_IMAGES[index % PROPERTY_IMAGES.length], alt: 'Property exterior', isPrimary: true },
      { url: INTERIOR_IMAGES[0], alt: 'Living room' },
      { url: INTERIOR_IMAGES[1], alt: 'Kitchen' },
      { url: INTERIOR_IMAGES[2], alt: 'Master bedroom' },
      { url: BEACH_IMAGES[index % BEACH_IMAGES.length], alt: 'Beach view' },
    ],
    amenities: shuffledAmenities.slice(0, numAmenities),
    petFriendly: Math.random() > 0.5,
    featured: index < 6,
    baseRate,
  };
}

export const MOCK_PROPERTIES: Property[] = Array.from({ length: 24 }, (_, i) => generateProperty(i));

export const MOCK_FEATURED_PROPERTIES = MOCK_PROPERTIES.filter(p => p.featured);

export const HERO_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80';

export const getMockProperty = (slug: string): Property | undefined => {
  return MOCK_PROPERTIES.find(p => p.slug === slug);
};

export const getMockPropertiesByVillage = (villageSlug: string): Property[] => {
  return MOCK_PROPERTIES.filter(p => p.village?.slug === villageSlug);
};

export const searchMockProperties = (params: {
  village?: string;
  minBedrooms?: number;
  maxBedrooms?: number;
  petFriendly?: boolean;
  amenities?: string[];
}): Property[] => {
  let results = [...MOCK_PROPERTIES];

  if (params.village) {
    results = results.filter(p => p.village?.slug === params.village);
  }
  if (params.minBedrooms) {
    results = results.filter(p => p.bedrooms >= params.minBedrooms!);
  }
  if (params.maxBedrooms) {
    results = results.filter(p => p.bedrooms <= params.maxBedrooms!);
  }
  if (params.petFriendly) {
    results = results.filter(p => p.petFriendly);
  }
  if (params.amenities && params.amenities.length > 0) {
    results = results.filter(p =>
      params.amenities!.some(a => p.amenities.some(pa => pa.slug === a))
    );
  }

  return results;
};
