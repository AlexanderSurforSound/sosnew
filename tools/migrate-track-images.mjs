/**
 * Track PMS to Sanity Image Migration Script
 * Fetches images from Track PMS and uploads to Sanity CDN
 */

import { createClient } from '@sanity/client';

// Track API Configuration
const TRACK_CONFIG = {
  baseUrl: 'https://surforsound.tracksandbox.io/api',
  key: '252d8c5ff0ec18d967efe51902e823c6',
  secret: 'e148c23fea976b7c3d37ee634b07da04',
};

const authHeader = 'Basic ' + Buffer.from(`${TRACK_CONFIG.key}:${TRACK_CONFIG.secret}`).toString('base64');

// Sanity configuration
const sanityClient = createClient({
  projectId: 'wymhjmyo',
  dataset: 'production',
  token: process.env.SANITY_API_TOKEN || 'skP3BvUvS8tFTvurNjgOLeyzZRvLSgCnNvTVoW1WTHCIKE8BF1D4IioeSc56EZuaNbvqAf455bJ97AKRBuC5c10j8YjBBtdGCg9B449Z0tMp3eMRuDZWAm6NYmzOgJWbUO7bbJbMfDpuG4TgrsngmtzYNLWoUlWuv8ksidTtckMfrF5xRPzD',
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Fetch images from Track PMS
async function fetchTrackImages(unitId, maxImages = 20) {
  try {
    const response = await fetch(
      `${TRACK_CONFIG.baseUrl}/pms/units/${unitId}/images?size=${maxImages}`,
      {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data._embedded?.images || [];
  } catch (e) {
    return [];
  }
}

// Upload image to Sanity from URL
async function uploadImageToSanity(imageUrl, filename) {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 1000) {
      // Skip tiny/broken images
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
  console.log('Track PMS to Sanity Image Migration');
  console.log('='.repeat(60));

  // Get properties from Sanity without images
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

  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const maxImagesPerProperty = 20;
  const startTime = Date.now();

  for (let i = 0; i < sanityProperties.length; i++) {
    const prop = sanityProperties[i];
    const progress = `[${i + 1}/${sanityProperties.length}]`;

    if (!prop.trackId) {
      console.log(`${progress} ${prop.name} - No Track ID, skipping`);
      skipped++;
      continue;
    }

    process.stdout.write(`${progress} ${prop.name.substring(0, 40).padEnd(40)} `);

    // Fetch images from Track
    const trackImages = await fetchTrackImages(prop.trackId, maxImagesPerProperty);

    if (trackImages.length === 0) {
      console.log('- No images in Track');
      skipped++;
      continue;
    }

    // Upload each image to Sanity
    const sanityImages = [];

    for (let j = 0; j < trackImages.length; j++) {
      const img = trackImages[j];
      const imageUrl = img.original || img.large || img.medium || img.url;

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
          alt: img.name || `${prop.name} - Image ${j + 1}`,
        });
      }

      // Small delay between images
      await new Promise((r) => setTimeout(r, 50));
    }

    if (sanityImages.length > 0) {
      try {
        await sanityClient.patch(prop._id).set({ images: sanityImages }).commit();
        updated++;
        console.log(`- ${sanityImages.length} images uploaded`);
      } catch (e) {
        failed++;
        console.log(`- Failed to save: ${e.message}`);
      }
    } else {
      failed++;
      console.log('- No valid images');
    }

    // Progress update every 50 properties
    if ((i + 1) % 50 === 0) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const rate = (i + 1) / elapsed;
      const remaining = Math.round((sanityProperties.length - i - 1) / rate);
      console.log(`\n--- Progress: ${i + 1}/${sanityProperties.length} | Elapsed: ${elapsed}s | ETA: ${remaining}s ---\n`);
    }

    // Delay between properties to avoid rate limiting
    await new Promise((r) => setTimeout(r, 100));
  }

  const totalTime = Math.round((Date.now() - startTime) / 1000);

  console.log('\n' + '='.repeat(60));
  console.log('Migration Complete!');
  console.log(`  Updated: ${updated} properties`);
  console.log(`  Skipped: ${skipped} (no Track ID or no images)`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total time: ${totalTime} seconds`);
  console.log('='.repeat(60));
}

migrateImages().catch(console.error);
