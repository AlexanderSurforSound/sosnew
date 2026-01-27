/**
 * Image Migration Script
 * Fetches images from Track PMS and uploads to Sanity CDN
 */

import { createClient } from '@sanity/client';
import fetch from 'node-fetch';

// Track PMS configuration
const TRACK_API_URL = 'https://api.trackhs.com/v1';
const TRACK_API_KEY = process.env.TRACK_API_KEY || 'e903c5ea-c50a-4116-8856-ce75a94f5fa9';
const TRACK_API_SECRET = process.env.TRACK_API_SECRET || '56e75e27-3b4a-4e3c-b6fc-64db7a81cb30';

// Sanity configuration
const SANITY_PROJECT_ID = 'wymhjmyo';
const SANITY_DATASET = 'production';
const SANITY_TOKEN = 'skfZ8baM7LcdpNEXiakAQBzaNUYGEmAQ89PTpOpYCsXliSduj3eDjGI8A6dPn5EPkIDTRP9ywwTlKCIAvAjjRQ37ToZF6pTRRNO3bLdrko9nk0BQz5ZhfLD9QAHmJSy54pru8E7VxPn2Sw7p3MudmCUZhLD7Vt4s6cimGNvMRUMxuEbsVkF7';

// Create Sanity client
const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_TOKEN,
  apiVersion: '2023-05-03',
  useCdn: false,
});

// Fetch from Track PMS
async function fetchFromTrack(endpoint) {
  const url = `${TRACK_API_URL}${endpoint}`;
  const credentials = Buffer.from(`${TRACK_API_KEY}:${TRACK_API_SECRET}`).toString('base64');

  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Track API error: ${response.status}`);
  }

  return response.json();
}

// Fetch images for a unit from Track PMS
async function fetchUnitImages(unitId, maxImages = 15) {
  try {
    const data = await fetchFromTrack(`/pms/units/${unitId}/images?size=${maxImages}`);
    return data._embedded?.images || [];
  } catch (e) {
    console.error(`  Failed to fetch images for unit ${unitId}: ${e.message}`);
    return [];
  }
}

// Upload image to Sanity CDN
async function uploadImageToSanity(imageUrl, filename) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const buffer = await response.buffer();
    const asset = await sanityClient.assets.upload('image', buffer, {
      filename: filename,
    });

    return asset._id;
  } catch (e) {
    console.error(`  Failed to upload image ${filename}: ${e.message}`);
    return null;
  }
}

// Main migration function
async function migrateImages() {
  console.log('='.repeat(60));
  console.log('Image Migration - Track PMS to Sanity');
  console.log('='.repeat(60));

  // Get all properties from Sanity that don't have images
  console.log('\nFetching properties from Sanity...');
  const properties = await sanityClient.fetch(`
    *[_type == "property" && (images == null || count(images) == 0)]{
      _id,
      trackId,
      name
    }
  `);

  console.log(`Found ${properties.length} properties without images`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    const trackId = prop.trackId;

    process.stdout.write(`\r[${i + 1}/${properties.length}] ${prop.name.substring(0, 40).padEnd(40)}`);

    if (!trackId) {
      failed++;
      continue;
    }

    // Fetch images from Track
    const trackImages = await fetchUnitImages(trackId, 15);

    if (trackImages.length === 0) {
      failed++;
      continue;
    }

    // Upload images to Sanity CDN
    const sanityImages = [];
    for (let j = 0; j < Math.min(trackImages.length, 15); j++) {
      const img = trackImages[j];
      const imageUrl = img.original || img.large || img.medium;

      if (!imageUrl) continue;

      const filename = `${prop.name.replace(/[^a-zA-Z0-9]/g, '-')}-${j + 1}.jpg`;
      const assetId = await uploadImageToSanity(imageUrl, filename);

      if (assetId) {
        sanityImages.push({
          _type: 'image',
          _key: `img-${j}`,
          asset: {
            _type: 'reference',
            _ref: assetId,
          },
          alt: `${prop.name} - Image ${j + 1}`,
        });
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));
    }

    if (sanityImages.length > 0) {
      // Update property with images
      await sanityClient.patch(prop._id)
        .set({ images: sanityImages })
        .commit();
      updated++;
    } else {
      failed++;
    }

    // Delay between properties
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n');
  console.log('='.repeat(60));
  console.log(`Migration Complete!`);
  console.log(`  Updated: ${updated} properties`);
  console.log(`  Failed/Skipped: ${failed} properties`);
  console.log('='.repeat(60));
}

// Run migration
migrateImages().catch(console.error);
