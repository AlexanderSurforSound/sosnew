/**
 * Track PMS to Sanity Image Migration - FAST VERSION
 * Parallel processing for speed
 */

import { createClient } from '@sanity/client';

const TRACK_CONFIG = {
  baseUrl: 'https://surforsound.tracksandbox.io/api',
  key: '252d8c5ff0ec18d967efe51902e823c6',
  secret: 'e148c23fea976b7c3d37ee634b07da04',
};

const authHeader = 'Basic ' + Buffer.from(`${TRACK_CONFIG.key}:${TRACK_CONFIG.secret}`).toString('base64');

const sanityClient = createClient({
  projectId: 'wymhjmyo',
  dataset: 'production',
  token: process.env.SANITY_API_TOKEN || 'skP3BvUvS8tFTvurNjgOLeyzZRvLSgCnNvTVoW1WTHCIKE8BF1D4IioeSc56EZuaNbvqAf455bJ97AKRBuC5c10j8YjBBtdGCg9B449Z0tMp3eMRuDZWAm6NYmzOgJWbUO7bbJbMfDpuG4TgrsngmtzYNLWoUlWuv8ksidTtckMfrF5xRPzD',
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Concurrency settings
const CONCURRENT_PROPERTIES = 5;
const CONCURRENT_IMAGES = 10;
const MAX_IMAGES_PER_PROPERTY = 20;

async function fetchTrackImages(unitId) {
  try {
    const response = await fetch(
      `${TRACK_CONFIG.baseUrl}/pms/units/${unitId}/images?size=${MAX_IMAGES_PER_PROPERTY}`,
      { headers: { 'Authorization': authHeader, 'Accept': 'application/json' } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data._embedded?.images || [];
  } catch {
    return [];
  }
}

async function uploadImageToSanity(imageUrl, filename) {
  try {
    const response = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!response.ok) return null;

    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) return null;

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length < 1000) return null;

    const asset = await sanityClient.assets.upload('image', buffer, { filename });
    return asset._id;
  } catch {
    return null;
  }
}

// Process images in parallel batches
async function processImagesParallel(images, propertyName) {
  const results = [];

  for (let i = 0; i < images.length; i += CONCURRENT_IMAGES) {
    const batch = images.slice(i, i + CONCURRENT_IMAGES);
    const batchResults = await Promise.all(
      batch.map(async (img, idx) => {
        const imageUrl = img.original || img.large || img.medium || img.url;
        if (!imageUrl) return null;

        const filename = `${propertyName.replace(/[^a-zA-Z0-9]/g, '-')}-${i + idx + 1}.jpg`;
        const assetId = await uploadImageToSanity(imageUrl, filename);

        if (assetId) {
          return {
            _type: 'image',
            _key: `img-${i + idx}`,
            asset: { _type: 'reference', _ref: assetId },
            alt: img.name || `${propertyName} - Image ${i + idx + 1}`,
          };
        }
        return null;
      })
    );
    results.push(...batchResults.filter(Boolean));
  }

  return results;
}

async function processProperty(prop, index, total) {
  if (!prop.trackId) {
    return { status: 'skipped', reason: 'no trackId' };
  }

  const trackImages = await fetchTrackImages(prop.trackId);
  if (trackImages.length === 0) {
    return { status: 'skipped', reason: 'no images' };
  }

  const sanityImages = await processImagesParallel(trackImages, prop.name);

  if (sanityImages.length > 0) {
    try {
      await sanityClient.patch(prop._id).set({ images: sanityImages }).commit();
      console.log(`[${index}/${total}] ${prop.name.substring(0, 40).padEnd(40)} - ${sanityImages.length} images`);
      return { status: 'updated', count: sanityImages.length };
    } catch (e) {
      return { status: 'failed', reason: e.message };
    }
  }

  return { status: 'failed', reason: 'no valid images' };
}

// Process properties in parallel batches
async function processPropertiesBatch(properties, startIdx, total) {
  return Promise.all(
    properties.map((prop, idx) => processProperty(prop, startIdx + idx + 1, total))
  );
}

async function migrateImages() {
  console.log('='.repeat(60));
  console.log('Track PMS to Sanity Image Migration (FAST)');
  console.log(`Concurrent properties: ${CONCURRENT_PROPERTIES}, images: ${CONCURRENT_IMAGES}`);
  console.log('='.repeat(60));

  console.log('\nFetching properties from Sanity...');
  const sanityProperties = await sanityClient.fetch(`
    *[_type == "property" && (!defined(images) || count(images) == 0)]{
      _id,
      name,
      trackId
    } | order(name asc)
  `);

  console.log(`Found ${sanityProperties.length} properties without images\n`);

  if (sanityProperties.length === 0) {
    console.log('All properties already have images!');
    return;
  }

  const startTime = Date.now();
  let updated = 0, skipped = 0, failed = 0;

  // Process in batches
  for (let i = 0; i < sanityProperties.length; i += CONCURRENT_PROPERTIES) {
    const batch = sanityProperties.slice(i, i + CONCURRENT_PROPERTIES);
    const results = await processPropertiesBatch(batch, i, sanityProperties.length);

    for (const result of results) {
      if (result.status === 'updated') updated++;
      else if (result.status === 'skipped') skipped++;
      else failed++;
    }

    // Progress every 50
    if ((i + CONCURRENT_PROPERTIES) % 50 < CONCURRENT_PROPERTIES) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const done = Math.min(i + CONCURRENT_PROPERTIES, sanityProperties.length);
      const rate = done / elapsed;
      const remaining = Math.round((sanityProperties.length - done) / rate);
      console.log(`\n--- ${done}/${sanityProperties.length} | ${elapsed}s elapsed | ~${remaining}s remaining ---\n`);
    }
  }

  const totalTime = Math.round((Date.now() - startTime) / 1000);

  console.log('\n' + '='.repeat(60));
  console.log('Migration Complete!');
  console.log(`  Updated: ${updated} properties`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total time: ${totalTime} seconds`);
  console.log('='.repeat(60));
}

migrateImages().catch(console.error);
