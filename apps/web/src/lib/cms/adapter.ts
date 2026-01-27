/**
 * CMS Adapter Interface
 * All CMS providers must implement this interface.
 * This ensures your app can swap CMS providers without code changes.
 */

import type {
  CMSProperty,
  CMSVillage,
  CMSAmenity,
  CMSBlogPost,
  CMSPage,
  CMSQueryOptions,
  CMSPaginatedResponse,
} from './types';

export interface CMSAdapter {
  // Provider info
  readonly name: string;
  readonly version: string;

  // Connection
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Properties
  getProperty(slug: string): Promise<CMSProperty | null>;
  getProperties(options?: CMSQueryOptions): Promise<CMSPaginatedResponse<CMSProperty>>;
  getFeaturedProperties(limit?: number): Promise<CMSProperty[]>;
  getPropertiesByVillage(villageSlug: string, options?: CMSQueryOptions): Promise<CMSPaginatedResponse<CMSProperty>>;

  // Villages
  getVillage(slug: string): Promise<CMSVillage | null>;
  getVillages(): Promise<CMSVillage[]>;

  // Amenities
  getAmenity(slug: string): Promise<CMSAmenity | null>;
  getAmenities(): Promise<CMSAmenity[]>;
  getAmenitiesByCategory(category: string): Promise<CMSAmenity[]>;

  // Blog
  getBlogPost(slug: string): Promise<CMSBlogPost | null>;
  getBlogPosts(options?: CMSQueryOptions): Promise<CMSPaginatedResponse<CMSBlogPost>>;
  getBlogPostsByCategory(category: string, options?: CMSQueryOptions): Promise<CMSPaginatedResponse<CMSBlogPost>>;

  // Pages
  getPage(slug: string): Promise<CMSPage | null>;

  // Search
  search(query: string, types?: string[]): Promise<Array<CMSProperty | CMSBlogPost | CMSPage>>;

  // Preview mode (for draft content)
  enablePreview(token: string): void;
  disablePreview(): void;
  isPreviewEnabled(): boolean;

  // Cache control
  invalidateCache(type?: string, id?: string): Promise<void>;
}

// Configuration for CMS adapters
export interface CMSConfig {
  provider: 'sanity' | 'contentful' | 'strapi' | 'prismic' | 'custom';
  projectId?: string;
  dataset?: string;
  apiKey?: string;
  apiUrl?: string;
  previewToken?: string;
  useCdn?: boolean;
  cacheMaxAge?: number;
}
