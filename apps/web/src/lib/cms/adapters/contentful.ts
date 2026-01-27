/**
 * Contentful CMS Adapter
 * Example implementation showing how easy it is to add another CMS.
 *
 * To use: npm install contentful
 */

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
} from '../types';

// Contentful client types (runtime loaded)
interface ContentfulClient {
  getEntry: (id: string) => Promise<unknown>;
  getEntries: (query: object) => Promise<{ items: unknown[]; total: number }>;
}

interface ContentfulModule {
  createClient: (config: { space: string; accessToken: string; host?: string }) => ContentfulClient;
}

export class ContentfulAdapter implements CMSAdapter {
  readonly name = 'contentful';
  readonly version = '1.0.0';

  private client: ContentfulClient | null = null;
  private previewClient: ContentfulClient | null = null;
  private config: CMSConfig;
  private _isPreviewEnabled = false;

  constructor(config: CMSConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    // Dynamic import to avoid bundling if not used
    let contentful: ContentfulModule;
    try {
      // @ts-expect-error - contentful is an optional peer dependency
      contentful = await import(/* webpackIgnore: true */ 'contentful') as ContentfulModule;
    } catch {
      throw new Error(
        'Contentful adapter requires the "contentful" package. Install it with: npm install contentful'
      );
    }

    this.client = contentful.createClient({
      space: this.config.projectId!,
      accessToken: this.config.apiKey!,
    });

    if (this.config.previewToken) {
      this.previewClient = contentful.createClient({
        space: this.config.projectId!,
        accessToken: this.config.previewToken,
        host: 'preview.contentful.com',
      });
    }
  }

  async disconnect(): Promise<void> {
    this.client = null;
    this.previewClient = null;
  }

  isConnected(): boolean {
    return this.client !== null;
  }

  private getActiveClient(): ContentfulClient {
    if (!this.client) throw new Error('Contentful client not connected');
    return this._isPreviewEnabled && this.previewClient ? this.previewClient : this.client;
  }

  // Transform Contentful asset to CMS image
  private transformImage(asset: unknown): CMSImage | undefined {
    if (!asset) return undefined;
    const a = asset as { fields?: { file?: { url?: string }; title?: string; description?: string } };
    if (!a.fields?.file?.url) return undefined;

    return {
      url: `https:${a.fields.file.url}`,
      alt: a.fields.title,
      caption: a.fields.description,
    };
  }

  // Transform Contentful rich text to CMS rich text
  private transformRichText(document: unknown): CMSRichText | undefined {
    if (!document) return undefined;
    return {
      raw: document,
      // HTML rendering would be done with @contentful/rich-text-html-renderer
    };
  }

  // Transform Contentful entry to CMS property
  private transformProperty(entry: unknown): CMSProperty {
    const e = entry as { sys: { id: string; createdAt: string; updatedAt: string }; fields: Record<string, unknown> };
    const f = e.fields;

    return {
      _id: e.sys.id,
      _type: 'property',
      _createdAt: e.sys.createdAt,
      _updatedAt: e.sys.updatedAt,
      trackId: f.trackId as string,
      name: f.name as string,
      slug: f.slug as string,
      headline: f.headline as string,
      description: this.transformRichText(f.description),
      highlights: f.highlights as string[],
      images: (f.images as unknown[])?.map(img => this.transformImage(img)).filter(Boolean) as CMSImage[],
      virtualTourUrl: f.virtualTourUrl as string,
      videoUrl: f.videoUrl as string,
      village: f.village ? this.transformVillage(f.village) : undefined,
      featured: f.featured as boolean,
      seo: f.seo as { title?: string; description?: string },
    };
  }

  // Transform Contentful entry to CMS village
  private transformVillage(entry: unknown): CMSVillage {
    const e = entry as { sys: { id: string }; fields: Record<string, unknown> };
    const f = e.fields;

    return {
      _id: e.sys.id,
      _type: 'village',
      name: f.name as string,
      slug: f.slug as string,
      description: f.description as string,
      shortDescription: f.shortDescription as string,
      image: this.transformImage(f.image),
      highlights: f.highlights as string[],
    };
  }

  // Transform Contentful entry to CMS amenity
  private transformAmenity(entry: unknown): CMSAmenity {
    const e = entry as { sys: { id: string }; fields: Record<string, unknown> };
    const f = e.fields;

    return {
      _id: e.sys.id,
      _type: 'amenity',
      name: f.name as string,
      slug: f.slug as string,
      category: f.category as string,
      icon: f.icon as string,
    };
  }

  // Transform Contentful entry to CMS blog post
  private transformBlogPost(entry: unknown): CMSBlogPost {
    const e = entry as { sys: { id: string; createdAt: string }; fields: Record<string, unknown> };
    const f = e.fields;

    return {
      _id: e.sys.id,
      _type: 'blogPost',
      _createdAt: e.sys.createdAt,
      title: f.title as string,
      slug: f.slug as string,
      excerpt: f.excerpt as string,
      body: this.transformRichText(f.body),
      featuredImage: this.transformImage(f.featuredImage),
      publishedAt: f.publishedAt as string,
      categories: f.categories as string[],
      tags: f.tags as string[],
    };
  }

  // Transform Contentful entry to CMS page
  private transformPage(entry: unknown): CMSPage {
    const e = entry as { sys: { id: string }; fields: Record<string, unknown> };
    const f = e.fields;

    return {
      _id: e.sys.id,
      _type: 'page',
      title: f.title as string,
      slug: f.slug as string,
      body: this.transformRichText(f.body),
      seo: f.seo as { title?: string; description?: string },
    };
  }

  // Properties
  async getProperty(slug: string): Promise<CMSProperty | null> {
    const client = this.getActiveClient();
    const result = await client.getEntries({
      content_type: 'property',
      'fields.slug': slug,
      include: 2,
      limit: 1,
    });
    return result.items[0] ? this.transformProperty(result.items[0]) : null;
  }

  async getProperties(options?: CMSQueryOptions): Promise<CMSPaginatedResponse<CMSProperty>> {
    const client = this.getActiveClient();
    const limit = options?.limit || 20;
    const skip = options?.offset || 0;

    const result = await client.getEntries({
      content_type: 'property',
      include: 2,
      limit,
      skip,
      order: options?.order === 'asc' ? `fields.${options.orderBy}` : `-fields.${options?.orderBy || 'sys.createdAt'}`,
    });

    return {
      items: result.items.map(item => this.transformProperty(item)),
      total: result.total,
      limit,
      offset: skip,
      hasMore: skip + limit < result.total,
    };
  }

  async getFeaturedProperties(limit = 6): Promise<CMSProperty[]> {
    const client = this.getActiveClient();
    const result = await client.getEntries({
      content_type: 'property',
      'fields.featured': true,
      include: 2,
      limit,
    });
    return result.items.map(item => this.transformProperty(item));
  }

  async getPropertiesByVillage(villageSlug: string, options?: CMSQueryOptions): Promise<CMSPaginatedResponse<CMSProperty>> {
    const client = this.getActiveClient();
    const limit = options?.limit || 20;
    const skip = options?.offset || 0;

    // First get the village ID
    const villageResult = await client.getEntries({
      content_type: 'village',
      'fields.slug': villageSlug,
      limit: 1,
    });

    if (!villageResult.items[0]) {
      return { items: [], total: 0, limit, offset: skip, hasMore: false };
    }

    const villageId = (villageResult.items[0] as { sys: { id: string } }).sys.id;

    const result = await client.getEntries({
      content_type: 'property',
      'fields.village.sys.id': villageId,
      include: 2,
      limit,
      skip,
    });

    return {
      items: result.items.map(item => this.transformProperty(item)),
      total: result.total,
      limit,
      offset: skip,
      hasMore: skip + limit < result.total,
    };
  }

  // Villages
  async getVillage(slug: string): Promise<CMSVillage | null> {
    const client = this.getActiveClient();
    const result = await client.getEntries({
      content_type: 'village',
      'fields.slug': slug,
      limit: 1,
    });
    return result.items[0] ? this.transformVillage(result.items[0]) : null;
  }

  async getVillages(): Promise<CMSVillage[]> {
    const client = this.getActiveClient();
    const result = await client.getEntries({
      content_type: 'village',
      order: 'fields.name',
    });
    return result.items.map(item => this.transformVillage(item));
  }

  // Amenities
  async getAmenity(slug: string): Promise<CMSAmenity | null> {
    const client = this.getActiveClient();
    const result = await client.getEntries({
      content_type: 'amenity',
      'fields.slug': slug,
      limit: 1,
    });
    return result.items[0] ? this.transformAmenity(result.items[0]) : null;
  }

  async getAmenities(): Promise<CMSAmenity[]> {
    const client = this.getActiveClient();
    const result = await client.getEntries({
      content_type: 'amenity',
      order: 'fields.category,fields.name',
    });
    return result.items.map(item => this.transformAmenity(item));
  }

  async getAmenitiesByCategory(category: string): Promise<CMSAmenity[]> {
    const client = this.getActiveClient();
    const result = await client.getEntries({
      content_type: 'amenity',
      'fields.category': category,
      order: 'fields.name',
    });
    return result.items.map(item => this.transformAmenity(item));
  }

  // Blog
  async getBlogPost(slug: string): Promise<CMSBlogPost | null> {
    const client = this.getActiveClient();
    const result = await client.getEntries({
      content_type: 'blogPost',
      'fields.slug': slug,
      limit: 1,
    });
    return result.items[0] ? this.transformBlogPost(result.items[0]) : null;
  }

  async getBlogPosts(options?: CMSQueryOptions): Promise<CMSPaginatedResponse<CMSBlogPost>> {
    const client = this.getActiveClient();
    const limit = options?.limit || 10;
    const skip = options?.offset || 0;

    const result = await client.getEntries({
      content_type: 'blogPost',
      order: '-fields.publishedAt',
      limit,
      skip,
    });

    return {
      items: result.items.map(item => this.transformBlogPost(item)),
      total: result.total,
      limit,
      offset: skip,
      hasMore: skip + limit < result.total,
    };
  }

  async getBlogPostsByCategory(category: string, options?: CMSQueryOptions): Promise<CMSPaginatedResponse<CMSBlogPost>> {
    const client = this.getActiveClient();
    const limit = options?.limit || 10;
    const skip = options?.offset || 0;

    const result = await client.getEntries({
      content_type: 'blogPost',
      'fields.categories[in]': category,
      order: '-fields.publishedAt',
      limit,
      skip,
    });

    return {
      items: result.items.map(item => this.transformBlogPost(item)),
      total: result.total,
      limit,
      offset: skip,
      hasMore: skip + limit < result.total,
    };
  }

  // Pages
  async getPage(slug: string): Promise<CMSPage | null> {
    const client = this.getActiveClient();
    const result = await client.getEntries({
      content_type: 'page',
      'fields.slug': slug,
      limit: 1,
    });
    return result.items[0] ? this.transformPage(result.items[0]) : null;
  }

  // Search
  async search(query: string, types?: string[]): Promise<Array<CMSProperty | CMSBlogPost | CMSPage>> {
    const client = this.getActiveClient();
    const contentTypes = types || ['property', 'blogPost', 'page'];
    const results: Array<CMSProperty | CMSBlogPost | CMSPage> = [];

    for (const contentType of contentTypes) {
      const result = await client.getEntries({
        content_type: contentType,
        query,
        limit: 10,
      });

      for (const item of result.items) {
        switch (contentType) {
          case 'property':
            results.push(this.transformProperty(item));
            break;
          case 'blogPost':
            results.push(this.transformBlogPost(item));
            break;
          case 'page':
            results.push(this.transformPage(item));
            break;
        }
      }
    }

    return results;
  }

  // Preview mode
  enablePreview(_token: string): void {
    this._isPreviewEnabled = true;
  }

  disablePreview(): void {
    this._isPreviewEnabled = false;
  }

  isPreviewEnabled(): boolean {
    return this._isPreviewEnabled;
  }

  // Cache control
  async invalidateCache(_type?: string, _id?: string): Promise<void> {
    // Contentful uses webhooks for cache invalidation
    // Implement Next.js revalidation here if needed
  }
}
