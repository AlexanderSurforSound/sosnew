/**
 * Sanity CMS Adapter
 * Implements the CMSAdapter interface for Sanity.io
 */

import { createClient, type SanityClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { CMSAdapter, CMSConfig } from '../adapter';
import type {
  CMSProperty,
  CMSVillage,
  CMSAmenity,
  CMSBlogPost,
  CMSPage,
  CMSImage,
  CMSRichText,
  CMSQueryOptions,
  CMSPaginatedResponse,
  CMSWeeklyRate,
} from '../types';

export class SanityAdapter implements CMSAdapter {
  readonly name = 'sanity';
  readonly version = '1.0.0';

  private client: SanityClient | null = null;
  private previewClient: SanityClient | null = null;
  private imageBuilder: ReturnType<typeof imageUrlBuilder> | null = null;
  private config: CMSConfig;
  private _isPreviewEnabled = false;

  constructor(config: CMSConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    this.client = createClient({
      projectId: this.config.projectId!,
      dataset: this.config.dataset || 'production',
      apiVersion: '2024-01-01',
      useCdn: this.config.useCdn ?? true,
    });

    // Preview client with token for draft content
    if (this.config.previewToken) {
      this.previewClient = createClient({
        projectId: this.config.projectId!,
        dataset: this.config.dataset || 'production',
        apiVersion: '2024-01-01',
        useCdn: false,
        token: this.config.previewToken,
      });
    }

    this.imageBuilder = imageUrlBuilder(this.client);
  }

  async disconnect(): Promise<void> {
    this.client = null;
    this.previewClient = null;
    this.imageBuilder = null;
  }

  isConnected(): boolean {
    return this.client !== null;
  }

  private getActiveClient(): SanityClient {
    if (!this.client) throw new Error('Sanity client not connected');
    return this._isPreviewEnabled && this.previewClient ? this.previewClient : this.client;
  }

  // Transform Sanity image to CMS image
  private transformImage(sanityImage: unknown): CMSImage | undefined {
    if (!sanityImage || !this.imageBuilder) return undefined;

    const img = sanityImage as { asset?: { _ref?: string }; alt?: string; caption?: string; isPrimary?: boolean };
    if (!img.asset?._ref) return undefined;

    return {
      url: this.imageBuilder.image(img).url(),
      alt: img.alt,
      caption: img.caption,
      isPrimary: img.isPrimary,
    };
  }

  // Transform Sanity block content to CMS rich text
  private transformRichText(blocks: unknown): CMSRichText | undefined {
    if (!blocks) return undefined;
    return {
      raw: blocks,
      // HTML rendering would be done client-side with @portabletext/react
    };
  }

  // Transform weekly rates
  private transformWeeklyRates(rates: unknown): CMSWeeklyRate[] | undefined {
    if (!Array.isArray(rates)) return undefined;
    return rates.map(r => ({
      season: (r as Record<string, unknown>).season as string,
      minRate: (r as Record<string, unknown>).minRate as number,
      maxRate: (r as Record<string, unknown>).maxRate as number,
    }));
  }

  // Transform Sanity property to CMS property
  private transformProperty(doc: Record<string, unknown>): CMSProperty {
    return {
      _id: doc._id as string,
      _type: 'property',
      _createdAt: doc._createdAt as string,
      _updatedAt: doc._updatedAt as string,
      trackId: doc.trackId as string,
      houseNumber: doc.houseNumber as string,
      name: doc.name as string,
      slug: (doc.slug as { current: string })?.current || '',
      headline: doc.headline as string,
      description: this.transformRichText(doc.description),
      highlights: doc.highlights as string[],
      images: (doc.images as unknown[])?.map(img => this.transformImage(img)).filter(Boolean) as CMSImage[],
      virtualTourUrl: doc.virtualTourUrl as string,
      videoUrl: doc.videoUrl as string,
      village: doc.village ? this.transformVillage(doc.village as Record<string, unknown>) : undefined,
      amenities: (doc.amenities as Record<string, unknown>[])?.map(a => this.transformAmenity(a)),
      houseRules: this.transformRichText(doc.houseRules),
      checkInInstructions: this.transformRichText(doc.checkInInstructions),
      parkingInstructions: doc.parkingInstructions as string,
      wifiName: doc.wifiName as string,
      wifiPassword: doc.wifiPassword as string,
      localTips: this.transformRichText(doc.localTips),
      featured: doc.featured as boolean,
      isNew: doc.isNew as boolean,
      weeklyRates: this.transformWeeklyRates(doc.weeklyRates),
      seo: doc.seo as { title?: string; description?: string },
    };
  }

  // Transform Sanity village to CMS village
  private transformVillage(doc: Record<string, unknown>): CMSVillage {
    return {
      _id: doc._id as string,
      _type: 'village',
      name: doc.name as string,
      slug: (doc.slug as { current: string })?.current || '',
      description: doc.description as string,
      shortDescription: doc.shortDescription as string,
      image: this.transformImage(doc.image),
      highlights: doc.highlights as string[],
      coordinates: doc.coordinates as { lat: number; lng: number },
    };
  }

  // Transform Sanity amenity to CMS amenity
  private transformAmenity(doc: Record<string, unknown>): CMSAmenity {
    return {
      _id: doc._id as string,
      _type: 'amenity',
      name: doc.name as string,
      slug: (doc.slug as { current: string })?.current || '',
      category: doc.category as string,
      icon: doc.icon as string,
      description: doc.description as string,
    };
  }

  // Transform Sanity blog post to CMS blog post
  private transformBlogPost(doc: Record<string, unknown>): CMSBlogPost {
    return {
      _id: doc._id as string,
      _type: 'blogPost',
      _createdAt: doc._createdAt as string,
      title: doc.title as string,
      slug: (doc.slug as { current: string })?.current || '',
      excerpt: doc.excerpt as string,
      body: this.transformRichText(doc.body),
      featuredImage: this.transformImage(doc.featuredImage),
      author: doc.author as { name: string; avatar?: CMSImage },
      publishedAt: doc.publishedAt as string,
      categories: doc.categories as string[],
      tags: doc.tags as string[],
    };
  }

  // Transform Sanity page to CMS page
  private transformPage(doc: Record<string, unknown>): CMSPage {
    return {
      _id: doc._id as string,
      _type: 'page',
      title: doc.title as string,
      slug: (doc.slug as { current: string })?.current || '',
      body: this.transformRichText(doc.body),
      seo: doc.seo as { title?: string; description?: string },
    };
  }

  // Properties
  async getProperty(slug: string): Promise<CMSProperty | null> {
    const client = this.getActiveClient();
    const doc = await client.fetch(
      `*[_type == "property" && slug.current == $slug][0]{
        ...,
        village->,
        amenities[]->
      }`,
      { slug }
    );
    return doc ? this.transformProperty(doc) : null;
  }

  async getProperties(options?: CMSQueryOptions): Promise<CMSPaginatedResponse<CMSProperty>> {
    const client = this.getActiveClient();
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    const [items, total] = await Promise.all([
      client.fetch(
        `*[_type == "property"] | order(${options?.orderBy || '_createdAt'} ${options?.order || 'desc'}) [${offset}...${offset + limit}]{
          ...,
          village->,
          amenities[]->
        }`
      ),
      client.fetch(`count(*[_type == "property"])`),
    ]);

    return {
      items: items.map((doc: Record<string, unknown>) => this.transformProperty(doc)),
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  async getFeaturedProperties(limit = 6): Promise<CMSProperty[]> {
    const client = this.getActiveClient();
    const items = await client.fetch(
      `*[_type == "property" && featured == true][0...${limit}]{
        ...,
        village->,
        amenities[]->
      }`
    );
    return items.map((doc: Record<string, unknown>) => this.transformProperty(doc));
  }

  async getPropertiesByVillage(villageSlug: string, options?: CMSQueryOptions): Promise<CMSPaginatedResponse<CMSProperty>> {
    const client = this.getActiveClient();
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    const [items, total] = await Promise.all([
      client.fetch(
        `*[_type == "property" && village->slug.current == $villageSlug] | order(${options?.orderBy || '_createdAt'} ${options?.order || 'desc'}) [${offset}...${offset + limit}]{
          ...,
          village->,
          amenities[]->
        }`,
        { villageSlug }
      ),
      client.fetch(`count(*[_type == "property" && village->slug.current == $villageSlug])`, { villageSlug }),
    ]);

    return {
      items: items.map((doc: Record<string, unknown>) => this.transformProperty(doc)),
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  // Villages
  async getVillage(slug: string): Promise<CMSVillage | null> {
    const client = this.getActiveClient();
    const doc = await client.fetch(`*[_type == "village" && slug.current == $slug][0]`, { slug });
    return doc ? this.transformVillage(doc) : null;
  }

  async getVillages(): Promise<CMSVillage[]> {
    const client = this.getActiveClient();
    const items = await client.fetch(`*[_type == "village"] | order(name asc)`);
    return items.map((doc: Record<string, unknown>) => this.transformVillage(doc));
  }

  // Amenities
  async getAmenity(slug: string): Promise<CMSAmenity | null> {
    const client = this.getActiveClient();
    const doc = await client.fetch(`*[_type == "amenity" && slug.current == $slug][0]`, { slug });
    return doc ? this.transformAmenity(doc) : null;
  }

  async getAmenities(): Promise<CMSAmenity[]> {
    const client = this.getActiveClient();
    const items = await client.fetch(`*[_type == "amenity"] | order(category asc, name asc)`);
    return items.map((doc: Record<string, unknown>) => this.transformAmenity(doc));
  }

  async getAmenitiesByCategory(category: string): Promise<CMSAmenity[]> {
    const client = this.getActiveClient();
    const items = await client.fetch(`*[_type == "amenity" && category == $category] | order(name asc)`, { category });
    return items.map((doc: Record<string, unknown>) => this.transformAmenity(doc));
  }

  // Blog
  async getBlogPost(slug: string): Promise<CMSBlogPost | null> {
    const client = this.getActiveClient();
    const doc = await client.fetch(`*[_type == "blogPost" && slug.current == $slug][0]`, { slug });
    return doc ? this.transformBlogPost(doc) : null;
  }

  async getBlogPosts(options?: CMSQueryOptions): Promise<CMSPaginatedResponse<CMSBlogPost>> {
    const client = this.getActiveClient();
    const limit = options?.limit || 10;
    const offset = options?.offset || 0;

    const [items, total] = await Promise.all([
      client.fetch(
        `*[_type == "blogPost"] | order(publishedAt desc) [${offset}...${offset + limit}]`
      ),
      client.fetch(`count(*[_type == "blogPost"])`),
    ]);

    return {
      items: items.map((doc: Record<string, unknown>) => this.transformBlogPost(doc)),
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  async getBlogPostsByCategory(category: string, options?: CMSQueryOptions): Promise<CMSPaginatedResponse<CMSBlogPost>> {
    const client = this.getActiveClient();
    const limit = options?.limit || 10;
    const offset = options?.offset || 0;

    const [items, total] = await Promise.all([
      client.fetch(
        `*[_type == "blogPost" && $category in categories] | order(publishedAt desc) [${offset}...${offset + limit}]`,
        { category }
      ),
      client.fetch(`count(*[_type == "blogPost" && $category in categories])`, { category }),
    ]);

    return {
      items: items.map((doc: Record<string, unknown>) => this.transformBlogPost(doc)),
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  // Pages
  async getPage(slug: string): Promise<CMSPage | null> {
    const client = this.getActiveClient();
    const doc = await client.fetch(`*[_type == "page" && slug.current == $slug][0]`, { slug });
    return doc ? this.transformPage(doc) : null;
  }

  // Search
  async search(query: string, types?: string[]): Promise<Array<CMSProperty | CMSBlogPost | CMSPage>> {
    const client = this.getActiveClient();
    const typeFilter = types?.length ? `_type in [${types.map(t => `"${t}"`).join(', ')}]` : '_type in ["property", "blogPost", "page"]';

    const groqQuery = `*[${typeFilter} && [name, title, headline, excerpt] match $query][0...20]`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = await (client.fetch as any)(groqQuery, { query: `*${query}*` }) as Record<string, unknown>[];

    return items.map((doc: Record<string, unknown>) => {
      switch (doc._type) {
        case 'property':
          return this.transformProperty(doc);
        case 'blogPost':
          return this.transformBlogPost(doc);
        case 'page':
          return this.transformPage(doc);
        default:
          return doc as unknown as CMSPage;
      }
    });
  }

  // Preview mode
  enablePreview(token: string): void {
    if (this.previewClient || token) {
      this._isPreviewEnabled = true;
    }
  }

  disablePreview(): void {
    this._isPreviewEnabled = false;
  }

  isPreviewEnabled(): boolean {
    return this._isPreviewEnabled;
  }

  // Cache control
  async invalidateCache(_type?: string, _id?: string): Promise<void> {
    // Sanity CDN cache is automatically invalidated on publish
    // For custom caching, implement revalidation logic here
  }
}
