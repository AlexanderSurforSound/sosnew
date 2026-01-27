/**
 * CMS-agnostic content types
 * These interfaces define the shape of content your app expects,
 * regardless of which CMS provides it.
 */

// Base content type with common fields
export interface CMSContent {
  _id: string;
  _type: string;
  _createdAt?: string;
  _updatedAt?: string;
}

// Images
export interface CMSImage {
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  isPrimary?: boolean;
}

// Rich text (portable text format, can be adapted)
export interface CMSRichText {
  raw: unknown; // Original CMS format
  html?: string; // Pre-rendered HTML
  text?: string; // Plain text extraction
}

// Village content
export interface CMSVillage extends CMSContent {
  _type: 'village';
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  image?: CMSImage;
  highlights?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Weekly rate by season
export interface CMSWeeklyRate {
  season: string;
  minRate: number;
  maxRate: number;
}

// Property content (editorial/marketing content, not transactional)
export interface CMSProperty extends CMSContent {
  _type: 'property';
  trackId: string;
  houseNumber?: string;
  name: string;
  slug: string;
  headline?: string;
  description?: CMSRichText;
  highlights?: string[];
  images?: CMSImage[];
  virtualTourUrl?: string;
  videoUrl?: string;
  village?: CMSVillage;
  amenities?: CMSAmenity[];
  houseRules?: CMSRichText;
  checkInInstructions?: CMSRichText;
  parkingInstructions?: string;
  wifiName?: string;
  wifiPassword?: string;
  localTips?: CMSRichText;
  featured?: boolean;
  isNew?: boolean;
  weeklyRates?: CMSWeeklyRate[];
  seo?: {
    title?: string;
    description?: string;
  };
}

// Amenity
export interface CMSAmenity extends CMSContent {
  _type: 'amenity';
  name: string;
  slug: string;
  category?: string;
  icon?: string;
  description?: string;
}

// Blog post
export interface CMSBlogPost extends CMSContent {
  _type: 'blogPost';
  title: string;
  slug: string;
  excerpt?: string;
  body?: CMSRichText;
  featuredImage?: CMSImage;
  author?: {
    name: string;
    avatar?: CMSImage;
  };
  publishedAt?: string;
  categories?: string[];
  tags?: string[];
}

// Generic page
export interface CMSPage extends CMSContent {
  _type: 'page';
  title: string;
  slug: string;
  body?: CMSRichText;
  seo?: {
    title?: string;
    description?: string;
  };
}

// Query options
export interface CMSQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

// Paginated response
export interface CMSPaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
