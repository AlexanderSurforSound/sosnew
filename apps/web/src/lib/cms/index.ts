/**
 * CMS Gateway
 *
 * Single entry point for all CMS operations.
 * Switch providers by changing the CMS_PROVIDER env variable.
 *
 * Usage:
 *   import { cms } from '@/lib/cms';
 *
 *   // Get a property
 *   const property = await cms.getProperty('oceanfront-paradise');
 *
 *   // Get all villages
 *   const villages = await cms.getVillages();
 *
 * To switch CMS:
 *   1. Set CMS_PROVIDER=contentful (or sanity, strapi, etc.)
 *   2. Set the corresponding env vars (CONTENTFUL_SPACE_ID, etc.)
 *   3. That's it - no code changes needed!
 */

import type { CMSAdapter, CMSConfig } from './adapter';
import { SanityAdapter } from './adapters/sanity';
import { ContentfulAdapter } from './adapters/contentful';

// Re-export types for convenience
export * from './types';
export type { CMSAdapter, CMSConfig } from './adapter';

// Supported CMS providers
type CMSProvider = 'sanity' | 'contentful' | 'strapi' | 'prismic';

// Get configuration from environment
function getConfig(): CMSConfig {
  const provider = (process.env.CMS_PROVIDER || 'sanity') as CMSProvider;

  switch (provider) {
    case 'sanity':
      return {
        provider: 'sanity',
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
        previewToken: process.env.SANITY_API_TOKEN,
        useCdn: process.env.NODE_ENV === 'production',
      };

    case 'contentful':
      return {
        provider: 'contentful',
        projectId: process.env.CONTENTFUL_SPACE_ID,
        apiKey: process.env.CONTENTFUL_ACCESS_TOKEN,
        previewToken: process.env.CONTENTFUL_PREVIEW_TOKEN,
      };

    case 'strapi':
      return {
        provider: 'strapi',
        apiUrl: process.env.STRAPI_API_URL,
        apiKey: process.env.STRAPI_API_TOKEN,
      };

    case 'prismic':
      return {
        provider: 'prismic',
        projectId: process.env.PRISMIC_REPOSITORY,
        apiKey: process.env.PRISMIC_ACCESS_TOKEN,
      };

    default:
      throw new Error(`Unknown CMS provider: ${provider}`);
  }
}

// Create adapter based on provider
function createAdapter(config: CMSConfig): CMSAdapter {
  switch (config.provider) {
    case 'sanity':
      return new SanityAdapter(config);

    case 'contentful':
      return new ContentfulAdapter(config);

    case 'strapi':
      // return new StrapiAdapter(config);
      throw new Error('Strapi adapter not implemented yet');

    case 'prismic':
      // return new PrismicAdapter(config);
      throw new Error('Prismic adapter not implemented yet');

    default:
      throw new Error(`Unknown CMS provider: ${config.provider}`);
  }
}

// Singleton instance with lazy initialization
let _cms: CMSAdapter | null = null;
let _initialized = false;

async function getCMS(): Promise<CMSAdapter> {
  if (!_cms) {
    const config = getConfig();
    _cms = createAdapter(config);
  }

  if (!_initialized) {
    await _cms.connect();
    _initialized = true;
  }

  return _cms;
}

/**
 * CMS client singleton
 *
 * Provides a proxy that lazily initializes the CMS adapter.
 * All methods are async and return promises.
 */
export const cms = {
  // Provider info
  get name() {
    return _cms?.name || 'not initialized';
  },

  // Properties
  getProperty: async (slug: string) => (await getCMS()).getProperty(slug),
  getProperties: async (options?: Parameters<CMSAdapter['getProperties']>[0]) =>
    (await getCMS()).getProperties(options),
  getFeaturedProperties: async (limit?: number) =>
    (await getCMS()).getFeaturedProperties(limit),
  getPropertiesByVillage: async (
    villageSlug: string,
    options?: Parameters<CMSAdapter['getPropertiesByVillage']>[1]
  ) => (await getCMS()).getPropertiesByVillage(villageSlug, options),

  // Villages
  getVillage: async (slug: string) => (await getCMS()).getVillage(slug),
  getVillages: async () => (await getCMS()).getVillages(),

  // Amenities
  getAmenity: async (slug: string) => (await getCMS()).getAmenity(slug),
  getAmenities: async () => (await getCMS()).getAmenities(),
  getAmenitiesByCategory: async (category: string) =>
    (await getCMS()).getAmenitiesByCategory(category),

  // Blog
  getBlogPost: async (slug: string) => (await getCMS()).getBlogPost(slug),
  getBlogPosts: async (options?: Parameters<CMSAdapter['getBlogPosts']>[0]) =>
    (await getCMS()).getBlogPosts(options),
  getBlogPostsByCategory: async (
    category: string,
    options?: Parameters<CMSAdapter['getBlogPostsByCategory']>[1]
  ) => (await getCMS()).getBlogPostsByCategory(category, options),

  // Pages
  getPage: async (slug: string) => (await getCMS()).getPage(slug),

  // Search
  search: async (query: string, types?: string[]) =>
    (await getCMS()).search(query, types),

  // Preview mode
  enablePreview: async (token: string) => (await getCMS()).enablePreview(token),
  disablePreview: async () => (await getCMS()).disablePreview(),
  isPreviewEnabled: async () => (await getCMS()).isPreviewEnabled(),

  // Cache control
  invalidateCache: async (type?: string, id?: string) =>
    (await getCMS()).invalidateCache(type, id),

  // Direct adapter access (for advanced use cases)
  getAdapter: getCMS,
};

// For Server Components / RSC
export async function getCMSClient(): Promise<CMSAdapter> {
  return getCMS();
}
