/**
 * Redis Caching Layer
 *
 * Uses Upstash Redis for serverless-compatible caching.
 * Provides caching for properties, search results, and availability.
 */

import { Property, PropertyDetail, PagedResult } from '@/types';

// Cache TTLs in seconds
const CACHE_TTL = {
  PROPERTY_LIST: 60 * 60,        // 1 hour for property listings
  PROPERTY_DETAIL: 60 * 60,      // 1 hour for property details
  SEARCH_RESULTS: 60 * 5,        // 5 minutes for search results
  FEATURED: 60 * 30,             // 30 minutes for featured properties
  AVAILABILITY: 60 * 2,          // 2 minutes for availability (short, refreshed by SignalR)
  VILLAGES: 60 * 60 * 24,        // 24 hours for village data
};

// In-memory fallback cache for when Redis is unavailable
const memoryCache = new Map<string, { data: any; expiry: number }>();

// Redis client (Upstash) - optional, falls back to memory cache
// To enable Redis, install @upstash/redis and set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
let redis: any = null;
let redisInitAttempted = false;

async function getRedisClient(): Promise<any> {
  // Already initialized or attempted
  if (redisInitAttempted) return redis;
  redisInitAttempted = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // No Redis config = use memory cache
  if (!url || !token) {
    return null;
  }

  // Try to dynamically import Redis (only works if package is installed)
  try {
    // @ts-ignore - dynamic import may not exist
    const upstash = await import(/* webpackIgnore: true */ '@upstash/redis').catch(() => null);
    if (upstash?.Redis) {
      redis = new upstash.Redis({ url, token });
      console.log('[Cache] Redis connected');
    }
  } catch {
    // Package not available, use memory cache
  }

  return redis;
}

/**
 * Get item from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();

    if (client) {
      const data = await client.get(key);
      if (data) {
        return typeof data === 'string' ? JSON.parse(data) : data;
      }
    } else {
      // Fallback to memory cache
      const cached = memoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return cached.data;
      }
      memoryCache.delete(key);
    }
  } catch (err) {
    console.error('[Cache] Get error:', err);
  }
  return null;
}

/**
 * Set item in cache
 */
export async function cacheSet<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  try {
    const client = await getRedisClient();

    if (client) {
      await client.set(key, JSON.stringify(data), { ex: ttlSeconds });
    } else {
      // Fallback to memory cache
      memoryCache.set(key, {
        data,
        expiry: Date.now() + ttlSeconds * 1000,
      });
    }
  } catch (err) {
    console.error('[Cache] Set error:', err);
  }
}

/**
 * Delete item from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  try {
    const client = await getRedisClient();

    if (client) {
      await client.del(key);
    } else {
      memoryCache.delete(key);
    }
  } catch (err) {
    console.error('[Cache] Delete error:', err);
  }
}

/**
 * Delete multiple items by pattern
 */
export async function cacheDeletePattern(pattern: string): Promise<void> {
  try {
    const client = await getRedisClient();

    if (client) {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } else {
      // Memory cache fallback - delete matching keys
      const regex = new RegExp(pattern.replace('*', '.*'));
      for (const key of memoryCache.keys()) {
        if (regex.test(key)) {
          memoryCache.delete(key);
        }
      }
    }
  } catch (err) {
    console.error('[Cache] Delete pattern error:', err);
  }
}

// =============================================================================
// Specialized Cache Functions
// =============================================================================

/**
 * Cache key generators
 */
export const cacheKeys = {
  propertyList: (params: string) => `properties:list:${params}`,
  propertyDetail: (slug: string) => `properties:detail:${slug}`,
  propertyAvailability: (slug: string, start: string, end: string) =>
    `properties:availability:${slug}:${start}:${end}`,
  featuredProperties: () => 'properties:featured',
  searchResults: (query: string) => `search:${query}`,
  villages: () => 'villages:all',
};

/**
 * Get cached property list or fetch and cache
 */
export async function getCachedPropertyList(
  params: string,
  fetcher: () => Promise<PagedResult<Property>>
): Promise<PagedResult<Property>> {
  const key = cacheKeys.propertyList(params);

  const cached = await cacheGet<PagedResult<Property>>(key);
  if (cached) {
    return cached;
  }

  const data = await fetcher();
  await cacheSet(key, data, CACHE_TTL.PROPERTY_LIST);
  return data;
}

/**
 * Get cached property detail or fetch and cache
 */
export async function getCachedPropertyDetail(
  slug: string,
  fetcher: () => Promise<PropertyDetail>
): Promise<PropertyDetail> {
  const key = cacheKeys.propertyDetail(slug);

  const cached = await cacheGet<PropertyDetail>(key);
  if (cached) {
    return cached;
  }

  const data = await fetcher();
  await cacheSet(key, data, CACHE_TTL.PROPERTY_DETAIL);
  return data;
}

/**
 * Get cached featured properties or fetch and cache
 */
export async function getCachedFeaturedProperties(
  fetcher: () => Promise<Property[]>
): Promise<Property[]> {
  const key = cacheKeys.featuredProperties();

  const cached = await cacheGet<Property[]>(key);
  if (cached) {
    return cached;
  }

  const data = await fetcher();
  await cacheSet(key, data, CACHE_TTL.FEATURED);
  return data;
}

/**
 * Invalidate property cache (called when availability changes)
 */
export async function invalidatePropertyCache(slug?: string): Promise<void> {
  if (slug) {
    await cacheDelete(cacheKeys.propertyDetail(slug));
    await cacheDeletePattern(`properties:availability:${slug}:*`);
  } else {
    await cacheDeletePattern('properties:*');
  }
}

/**
 * Invalidate all caches (nuclear option)
 */
export async function invalidateAllCaches(): Promise<void> {
  await cacheDeletePattern('*');
}

export { CACHE_TTL };
