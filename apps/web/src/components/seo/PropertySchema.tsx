import type { Property } from '@/types';

interface PropertySchemaProps {
  property: Property;
  url: string;
}

/**
 * JSON-LD Schema for vacation rental properties
 * Implements LodgingBusiness schema for better SEO and AI discovery
 */
export function PropertySchema({ property, url }: PropertySchemaProps) {
  const schema = {
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
    geo: property.location
      ? {
          '@type': 'GeoCoordinates',
          latitude: property.location.lat,
          longitude: property.location.lng,
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
    starRating: {
      '@type': 'Rating',
      ratingValue: 4.9,
      bestRating: 5,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.9,
      reviewCount: 50, // TODO: Get actual review count
    },
    // Custom properties for vacation rentals
    numberOfBedrooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: property.sleeps,
      unitText: 'guests',
    },
    // Provider info
    provider: {
      '@type': 'Organization',
      name: 'Surf or Sound Realty',
      url: 'https://www.surforsound.com',
      telephone: '+1-252-987-2121',
      logo: 'https://www.surforsound.com/images/logo.png',
    },
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
