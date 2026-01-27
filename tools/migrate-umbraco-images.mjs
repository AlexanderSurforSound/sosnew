/**
 * Umbraco Image Migration Script
 * Fetches images from Umbraco CMS and uploads to Sanity CDN
 */

import { createClient } from '@sanity/client';
import fs from 'fs';
import fetch from 'node-fetch';

const UMBRACO_BASE_URL = 'https://cms.surforsound.com';

// Sanity configuration
const sanityClient = createClient({
  projectId: 'wymhjmyo',
  dataset: 'production',
  token: 'skfZ8baM7LcdpNEXiakAQBzaNUYGEmAQ89PTpOpYCsXliSduj3eDjGI8A6dPn5EPkIDTRP9ywwTlKCIAvAjjRQ37ToZF6pTRRNO3bLdrko9nk0BQz5ZhfLD9QAHmJSy54pru8E7VxPn2Sw7p3MudmCUZhLD7Vt4s6cimGNvMRUMxuEbsVkF7',
  apiVersion: '2023-05-03',
  useCdn: false,
});

// Load Umbraco exports
const mediaPathsRaw = JSON.parse(fs.readFileSync('./tools/umbraco-media-paths.json', 'utf-8'));
const propertyImages = JSON.parse(fs.readFileSync('./tools/umbraco-property-images.json', 'utf-8'));
const combinedData = JSON.parse(fs.readFileSync('./tools/umbraco-combined.json', 'utf-8'));

// Build media lookup (prefer largest/original images)
const mediaLookup = new Map();
for (const m of mediaPathsRaw) {
  const id = String(m.mediaId);
  const path = m.filePath;

  // Skip thumbnails, prefer originals
  if (path.includes('_80x60') || path.includes('_240x180') || path.includes('_640x450')) {
    if (!mediaLookup.has(id)) {
      mediaLookup.set(id, path);
    }
    continue;
  }

  // Original/full size - always prefer
  mediaLookup.set(id, path);
}

console.log(`Loaded ${mediaLookup.size} unique media items`);

// Build property image lookup by name
const propertyImageLookup = new Map();
for (const p of propertyImages) {
  propertyImageLookup.set(p.propertyName, {
    mainImageId: p.mainImageId,
    galleryIds: p.galleryImageIds ? p.galleryImageIds.split(',').map(id => id.trim()) : []
  });
}

// Upload image to Sanity
async function uploadImageToSanity(imageUrl, filename) {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return null;
    }

    const buffer = await response.buffer();
    if (buffer.length < 1000) { // Skip tiny/broken images
      return null;
    }

    const asset = await sanityClient.assets.upload('image', buffer, {
      filename: filename,
    });

    return asset._id;
  } catch (e) {
    return null;
  }
}

// Main migration
async function migrateImages() {
  console.log('='.repeat(60));
  console.log('Umbraco to Sanity Image Migration');
  console.log('='.repeat(60));

  // Get properties from Sanity
  console.log('\nFetching properties from Sanity...');
  const sanityProperties = await sanityClient.fetch(`
    *[_type == "property"]{
      _id,
      name,
      "hasImages": defined(images) && count(images) > 0
    }
  `);

  const propsWithoutImages = sanityProperties.filter(p => !p.hasImages);
  console.log(`Found ${propsWithoutImages.length} properties without images`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const maxImages = 12; // Limit per property

  for (let i = 0; i < propsWithoutImages.length; i++) {
    const prop = propsWithoutImages[i];

    // Find matching Umbraco property
    const umbracoImages = propertyImageLookup.get(prop.name);

    if (!umbracoImages || umbracoImages.galleryIds.length === 0) {
      skipped++;
      continue;
    }

    process.stdout.write(`\r[${i + 1}/${propsWithoutImages.length}] ${prop.name.substring(0, 35).padEnd(35)} `);

    // Get image URLs
    const imageIds = umbracoImages.galleryIds.slice(0, maxImages);
    const sanityImages = [];

    for (let j = 0; j < imageIds.length; j++) {
      const mediaPath = mediaLookup.get(imageIds[j]);
      if (!mediaPath) continue;

      const imageUrl = `${UMBRACO_BASE_URL}${mediaPath}`;
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

      // Small delay
      await new Promise(r => setTimeout(r, 50));
    }

    if (sanityImages.length > 0) {
      try {
        await sanityClient.patch(prop._id)
          .set({ images: sanityImages })
          .commit();
        updated++;
        process.stdout.write(`✓ ${sanityImages.length} images`);
      } catch (e) {
        failed++;
        process.stdout.write(`✗ Failed to save`);
      }
    } else {
      failed++;
      process.stdout.write(`✗ No valid images`);
    }

    // Delay between properties
    await new Promise(r => setTimeout(r, 100));
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('Migration Complete!');
  console.log(`  Updated: ${updated} properties`);
  console.log(`  Skipped (no Umbraco match): ${skipped}`);
  console.log(`  Failed: ${failed}`);
  console.log('='.repeat(60));
}

migrateImages().catch(console.error);
