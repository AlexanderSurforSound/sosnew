import type { Property } from '@/types';

interface PropertySchemaProps {
  property: Property;
  url: string;
  reviewStats?: {
    averageRating: number;
    totalReviews: number;
  };
}

/**
 * JSON-LD Schema for vacation rental properties
 * Implements LodgingBusiness schema for better SEO and AI discovery
 */
export function PropertySchema({ property, url, reviewStats }: PropertySchemaProps) {
  // Use provided review stats or reasonable defaults based on property data
  const avgRating = reviewStats?.averageRating ?? property.rating ?? 4.8;
  const reviewCount = reviewStats?.totalReviews ?? property.reviewCount ?? 0;

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    '@id': url,
    name: property.name,
    description: property.description || property.headline,
    url: url,
    image: property.images?.map((img) => img.url) || [],
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.village?.name || 'Hatteras Island',
      addressRegion: 'NC',
      addressCountry: 'US',
    },
    geo: property.latitude && property.longitude
      ? {
          '@type': 'GeoCoordinates',
          latitude: property.latitude,
          longitude: property.longitude,
        }
      : undefined,
    numberOfRooms: property.bedrooms,
    amenityFeature: property.amenities?.map((amenity) => ({
      '@type': 'LocationFeatureSpecification',
      name: typeof amenity === 'string' ? amenity : amenity.name,
      value: true,
    })),
    priceRange: property.baseRate
      ? `$${property.baseRate.toLocaleString()}/week`
      : undefined,
    checkinTime: '16:00',
    checkoutTime: '10:00',
    petsAllowed: property.petFriendly || false,
  };

  // Only include ratings if we have reviews (avoids misleading SEO)
  if (reviewCount > 0) {
    schema.starRating = {
      '@type': 'Rating',
      ratingValue: avgRating,
      bestRating: 5,
    };
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avgRating,
      reviewCount: reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Custom properties for vacation rentals
  schema.numberOfBedrooms = property.bedrooms;
  schema.numberOfBathroomsTotal = property.bathrooms;
  schema.occupancy = {
    '@type': 'QuantitativeValue',
    maxValue: property.sleeps,
    unitText: 'guests',
  };
  // Provider info
  schema.provider = {
    '@type': 'Organization',
    name: 'Surf or Sound Realty',
    url: 'https://www.surforsound.com',
    telephone: '+1-252-987-2121',
    logo: 'https://www.surforsound.com/images/logo.png',
  };

  // Remove undefined values
  const cleanSchema = JSON.parse(JSON.stringify(schema));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanSchema) }}
    />
  );
}

/**
 * Organization schema for the main site
 */
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Surf or Sound Realty',
    url: 'https://www.surforsound.com',
    logo: 'https://www.surforsound.com/images/logo.png',
    description:
      'Premier vacation rental company on Hatteras Island, North Carolina. 600+ vacation rentals on the Outer Banks.',
    telephone: '+1-252-987-2121',
    email: 'reservations@surforsound.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '24502 NC Highway 12',
      addressLocality: 'Waves',
      addressRegion: 'NC',
      postalCode: '27968',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 35.5635,
      longitude: -75.4658,
    },
    areaServed: {
      '@type': 'Place',
      name: 'Hatteras Island, Outer Banks, North Carolina',
    },
    sameAs: [
      'https://www.facebook.com/SurfOrSound',
      'https://www.instagram.com/surforsound',
      'https://twitter.com/surforsound',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Breadcrumb schema for navigation
 */
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * FAQ schema for property pages
 */
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSchema({ faqs }: { faqs: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
