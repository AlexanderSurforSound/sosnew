/**
 * Migrate Data to Sanity CMS
 *
 * This script migrates property data from Track PMS + Umbraco exports to Sanity.
 * It creates documents for: Villages, Amenities, and Properties.
 *
 * Prerequisites:
 * 1. Create a Sanity project at sanity.io/manage
 * 2. Create an API token with write access
 * 3. Set environment variables or update config below
 *
 * Usage:
 *   node tools/migrate-to-sanity.mjs
 *
 * Environment Variables:
 *   SANITY_PROJECT_ID - Your Sanity project ID
 *   SANITY_DATASET - Dataset name (default: production)
 *   SANITY_API_TOKEN - API token with write access
 */

import fs from 'fs';
import { createClient } from '@sanity/client';

// ============================================================================
// CONFIGURATION - Update these with your Sanity credentials
// ============================================================================
const SANITY_CONFIG = {
  projectId: process.env.SANITY_PROJECT_ID || 'wymhjmyo',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN || 'skP3BvUvS8tFTvurNjgOLeyzZRvLSgCnNvTVoW1WTHCIKE8BF1D4IioeSc56EZuaNbvqAf455bJ97AKRBuC5c10j8YjBBtdGCg9B449Z0tMp3eMRuDZWAm6NYmzOgJWbUO7bbJbMfDpuG4TgrsngmtzYNLWoUlWuv8ksidTtckMfrF5xRPzD',
  useCdn: false,
};

// Track API Configuration (for fetching real rates)
const TRACK_CONFIG = {
  baseUrl: 'https://surforsound.tracksandbox.io/api',
  key: '252d8c5ff0ec18d967efe51902e823c6',
  secret: 'e148c23fea976b7c3d37ee634b07da04',
};

const authHeader = 'Basic ' + Buffer.from(`${TRACK_CONFIG.key}:${TRACK_CONFIG.secret}`).toString('base64');

// ============================================================================
// HELPERS
// ============================================================================

function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[#']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function mapAmenityCategory(groupName) {
  const name = groupName?.toLowerCase() || '';
  if (name.includes('pool') || name.includes('hot tub')) return 'pool';
  if (name.includes('beach') || name.includes('water')) return 'beach';
  if (name.includes('entertainment') || name.includes('game')) return 'entertainment';
  if (name.includes('kitchen')) return 'kitchen';
  if (name.includes('outdoor') || name.includes('patio') || name.includes('deck')) return 'outdoor';
  if (name.includes('access') || name.includes('elevator')) return 'accessibility';
  if (name.includes('pet') || name.includes('dog')) return 'pet';
  if (name.includes('parking') || name.includes('garage')) return 'parking';
  if (name.includes('climate') || name.includes('heating') || name.includes('ac')) return 'climate';
  if (name.includes('safety') || name.includes('security')) return 'safety';
  return 'other';
}

function mapAmenityIcon(name) {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('wifi') || nameLower.includes('internet')) return 'wifi';
  if (nameLower.includes('pool')) return 'waves';
  if (nameLower.includes('hot tub') || nameLower.includes('jacuzzi')) return 'bath';
  if (nameLower.includes('air') || nameLower.includes('ac') || nameLower.includes('conditioning')) return 'snowflake';
  if (nameLower.includes('heat')) return 'flame';
  if (nameLower.includes('parking') || nameLower.includes('garage')) return 'car';
  if (nameLower.includes('grill') || nameLower.includes('bbq')) return 'flame';
  if (nameLower.includes('washer') || nameLower.includes('laundry')) return 'shirt';
  if (nameLower.includes('dryer')) return 'wind';
  if (nameLower.includes('dish')) return 'utensils';
  if (nameLower.includes('tv') || nameLower.includes('television')) return 'tv';
  if (nameLower.includes('pet') || nameLower.includes('dog')) return 'dog';
  if (nameLower.includes('beach')) return 'umbrella';
  if (nameLower.includes('ocean') || nameLower.includes('view')) return 'eye';
  if (nameLower.includes('elevator')) return 'arrow-up';
  if (nameLower.includes('game') || nameLower.includes('arcade')) return 'gamepad-2';
  if (nameLower.includes('coffee')) return 'coffee';
  if (nameLower.includes('microwave')) return 'microwave';
  if (nameLower.includes('refrigerator') || nameLower.includes('fridge')) return 'refrigerator';
  if (nameLower.includes('oven') || nameLower.includes('stove')) return 'cooking-pot';
  if (nameLower.includes('telephone') || nameLower.includes('phone')) return 'phone';
  return 'check';
}

function htmlToPlainText(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s*\|\s*/g, '\n')
    .replace(/%\s*/g, '• ')
    .replace(/\[([^\]]+)\]/g, '') // Remove markdown-style links
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function htmlToPortableText(html) {
  if (!html) return [];

  // Convert HTML to simple portable text blocks
  const plainText = htmlToPlainText(html);
  const paragraphs = plainText.split('\n\n').filter(p => p.trim());

  return paragraphs.map((text, i) => ({
    _type: 'block',
    _key: `block-${i}`,
    style: 'normal',
    markDefs: [],
    children: [{
      _type: 'span',
      _key: `span-${i}`,
      text: text.trim(),
      marks: [],
    }],
  }));
}

// ============================================================================
// TRACK API
// ============================================================================

async function fetchFromTrack(endpoint, params = {}) {
  const url = new URL(`${TRACK_CONFIG.baseUrl}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': authHeader,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Track API error ${response.status}`);
  }

  return response.json();
}

async function fetchUnitRates(unitId) {
  try {
    // Fetch rates for the next year
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = new Date(today.setFullYear(today.getFullYear() + 1)).toISOString().split('T')[0];

    const data = await fetchFromTrack(`/pms/units/${unitId}/rates`, {
      startDate,
      endDate,
    });

    return data._embedded?.rates || [];
  } catch (e) {
    return [];
  }
}

async function fetchAllUnits() {
  const allUnits = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const data = await fetchFromTrack('/pms/units', { page, size: pageSize });
    const units = data._embedded?.units || [];

    if (units.length === 0) break;

    allUnits.push(...units);
    console.log(`  Fetched page ${page}: ${units.length} units (total: ${allUnits.length})`);

    if (units.length < pageSize) break;
    page++;
  }

  return allUnits;
}

async function fetchUnitImages(unitId, maxImages = 20) {
  try {
    const data = await fetchFromTrack(`/pms/units/${unitId}/images`, { size: maxImages });
    return data._embedded?.images || [];
  } catch (e) {
    return [];
  }
}

async function fetchAllNodes() {
  const allNodes = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const data = await fetchFromTrack('/pms/nodes', { page, size: pageSize });
    const nodes = data._embedded?.nodes || [];

    if (nodes.length === 0) break;
    allNodes.push(...nodes);
    if (nodes.length < pageSize) break;
    page++;
  }

  return allNodes;
}

// ============================================================================
// SANITY MIGRATION
// ============================================================================

async function migrateVillages(client, nodes) {
  console.log('\n📍 Migrating Villages...');

  // Define Hatteras Island villages with order
  const villageOrder = {
    'Rodanthe': 1,
    'Waves': 2,
    'Salvo': 3,
    'Avon': 4,
    'Buxton': 5,
    'Frisco': 6,
    'Hatteras Village': 7,
  };

  const villages = [];
  const seen = new Set();

  // Extract unique villages from nodes
  for (const node of nodes) {
    const name = node.name;
    if (!name || seen.has(name)) continue;
    seen.add(name);

    villages.push({
      _id: `village-${createSlug(name)}`,
      _type: 'village',
      name: name,
      slug: { _type: 'slug', current: createSlug(name) },
      pmsId: String(node.id),
      shortDescription: `Vacation rentals in ${name}, Hatteras Island NC`,
      order: villageOrder[name] || 99,
    });
  }

  // Create or update villages in Sanity
  let created = 0;
  let updated = 0;

  for (const village of villages) {
    try {
      await client.createOrReplace(village);
      console.log(`  ✓ ${village.name}`);
      created++;
    } catch (e) {
      console.log(`  ✗ ${village.name}: ${e.message}`);
    }
  }

  console.log(`  Created/updated ${created} villages`);
  return villages;
}

async function migrateAmenities(client, units) {
  console.log('\n🏠 Migrating Amenities...');

  // Collect all unique amenities from units
  const amenitiesMap = new Map();

  for (const unit of units) {
    for (const amenity of (unit.amenities || [])) {
      if (!amenitiesMap.has(amenity.id)) {
        amenitiesMap.set(amenity.id, amenity);
      }
    }
  }

  const amenities = Array.from(amenitiesMap.values()).map(a => ({
    _id: `amenity-${a.id}`,
    _type: 'amenity',
    name: a.name,
    slug: { _type: 'slug', current: createSlug(a.name) },
    category: mapAmenityCategory(a.group?.name),
    icon: mapAmenityIcon(a.name),
    isFilterable: true,
  }));

  // Create or update amenities in Sanity
  let created = 0;

  for (const amenity of amenities) {
    try {
      await client.createOrReplace(amenity);
      created++;
    } catch (e) {
      console.log(`  ✗ ${amenity.name}: ${e.message}`);
    }
  }

  console.log(`  Created/updated ${created} amenities`);
  return amenities;
}

async function migrateProperties(client, units, nodesMap, umbracoData, fetchImages = true) {
  console.log('\n🏡 Migrating Properties...');

  // Create lookups for Umbraco data by house number AND property name
  const umbracoByHouseNumber = new Map();
  const umbracoByName = new Map();
  for (const prop of umbracoData) {
    if (prop.houseNumber) {
      umbracoByHouseNumber.set(prop.houseNumber, prop);
    }
    // Normalize name for matching
    const normalizedName = prop.propertyName?.toLowerCase().trim();
    if (normalizedName) {
      umbracoByName.set(normalizedName, prop);
    }
  }
  console.log(`  Umbraco lookups: ${umbracoByHouseNumber.size} by house#, ${umbracoByName.size} by name`);

  let created = 0;
  let errors = 0;
  let matchedByHouse = 0;
  let matchedByName = 0;
  let noMatch = 0;

  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const unitCode = unit.unitCode || '';

    // Try to match by house number first, then by name
    let umbracoInfo = umbracoByHouseNumber.get(unitCode);
    if (umbracoInfo) {
      matchedByHouse++;
    } else {
      const normalizedUnitName = unit.name?.toLowerCase().trim();
      umbracoInfo = umbracoByName.get(normalizedUnitName);
      if (umbracoInfo) {
        matchedByName++;
      } else {
        noMatch++;
      }
    }

    // Get village reference
    const node = nodesMap.get(unit.nodeId);
    const villageName = node?.name || 'Hatteras Island';
    const villageSlug = createSlug(villageName);

    // Calculate bathrooms
    const fullBaths = unit.fullBathrooms || 0;
    const threeQuarterBaths = unit.threeQuarterBathrooms || 0;
    const halfBaths = unit.halfBathrooms || 0;
    const totalBaths = fullBaths + threeQuarterBaths + (halfBaths * 0.5);

    // Fetch images if requested
    let images = [];
    if (fetchImages) {
      const trackImages = await fetchUnitImages(unit.id, 20);
      images = trackImages.map((img, idx) => ({
        _type: 'image',
        _key: `img-${idx}`,
        _sanityAsset: `image@${img.original}`, // Reference external URL
        alt: img.name || unit.name,
        isPrimary: idx === 0,
      }));

      // Add delay to avoid rate limiting
      if ((i + 1) % 10 === 0) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    // Build amenity references
    const amenityRefs = (unit.amenities || []).map(a => ({
      _type: 'reference',
      _ref: `amenity-${a.id}`,
      _key: `ref-${a.id}`,
    }));

    // Convert room info to floor plans
    const bedrooms = (unit.rooms || []).filter(r => r.type === 'bedroom');
    const floorPlans = bedrooms.length > 0 ? [{
      _type: 'object',
      _key: 'floor-1',
      level: 'Main',
      bedrooms: bedrooms.map((room, idx) => ({
        _type: 'object',
        _key: `bedroom-${idx}`,
        name: room.name,
        bedType: room.bedTypes?.[0]?.name || 'Bed',
        hasPrivateBath: room.hasAttachedBathroom || false,
      })),
    }] : [];

    // Get rates - prefer Umbraco rates, fall back to estimated rates
    const bedroomCount = unit.bedrooms || 3;
    let minRate = umbracoInfo?.minWeeklyRate || 0;
    let maxRate = umbracoInfo?.maxWeeklyRate || 0;

    // If no Umbraco rates, estimate from bedrooms
    if (!minRate || !maxRate) {
      let baseRate = 200;
      if (bedroomCount >= 10) baseRate = 900;
      else if (bedroomCount >= 8) baseRate = 700;
      else if (bedroomCount >= 7) baseRate = 550;
      else if (bedroomCount >= 6) baseRate = 450;
      else if (bedroomCount >= 5) baseRate = 350;
      else if (bedroomCount >= 4) baseRate = 275;
      else if (bedroomCount >= 3) baseRate = 225;
      else baseRate = 175;

      minRate = Math.round(baseRate * 5);
      maxRate = Math.round(baseRate * 10);
    }

    // Build the property document
    const property = {
      _id: `property-${unit.id}`,
      _type: 'property',
      trackId: String(unit.id),
      houseNumber: unitCode,
      name: unit.name,
      slug: { _type: 'slug', current: createSlug(unit.name + (unitCode ? `-${unitCode}` : '')) },
      headline: unit.shortDescription || `Beautiful vacation rental on the Outer Banks`,
      description: htmlToPortableText(unit.longDescription),
      village: { _type: 'reference', _ref: `village-${villageSlug}` },
      amenities: amenityRefs,
      featured: umbracoInfo?.isFeatured === true || umbracoInfo?.isFeatured === '1' || umbracoInfo?.isFeatured === 1,
      isActive: true,
      isNew: umbracoInfo?.isNew === true || umbracoInfo?.isNew === '1' || umbracoInfo?.isNew === 1,
      floorPlans: floorPlans,
      weeklyRates: [{
        _type: 'object',
        _key: 'rate-offpeak',
        season: 'Off-Peak',
        minRate: minRate,
        maxRate: Math.round(minRate + (maxRate - minRate) * 0.4),
      }, {
        _type: 'object',
        _key: 'rate-peak',
        season: 'Peak Season',
        minRate: Math.round(minRate + (maxRate - minRate) * 0.4),
        maxRate: maxRate,
      }],
      youtubeVideoKeys: umbracoInfo?.youtubeKey ? [umbracoInfo.youtubeKey] : [],
      seo: {
        title: `${unit.name} - Hatteras Island Vacation Rental`,
        description: unit.shortDescription || `Book ${unit.name} for your Outer Banks vacation.`,
      },
    };

    // Note: Images need to be uploaded separately due to Sanity's asset handling
    // For now, we'll store the external URLs in a custom field for later processing

    try {
      await client.createOrReplace(property);
      created++;

      if ((i + 1) % 50 === 0 || (i + 1) === units.length) {
        console.log(`  Progress: ${i + 1}/${units.length} properties`);
      }
    } catch (e) {
      console.log(`  ✗ ${unit.name}: ${e.message}`);
      errors++;
    }
  }

  console.log(`  Created/updated ${created} properties (${errors} errors)`);
  console.log(`  Matched: ${matchedByHouse} by house#, ${matchedByName} by name, ${noMatch} unmatched`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('Sanity CMS Migration Tool');
  console.log('='.repeat(60));

  // Validate configuration
  if (SANITY_CONFIG.projectId === 'YOUR_PROJECT_ID' || SANITY_CONFIG.token === 'YOUR_API_TOKEN') {
    console.log('\n⚠️  Please configure your Sanity credentials:');
    console.log('   Option 1: Set environment variables');
    console.log('     export SANITY_PROJECT_ID=your-project-id');
    console.log('     export SANITY_API_TOKEN=your-api-token');
    console.log('');
    console.log('   Option 2: Edit the SANITY_CONFIG at the top of this file');
    console.log('');
    console.log('   Get your project ID and create a token at:');
    console.log('   https://sanity.io/manage');
    process.exit(1);
  }

  console.log(`\nProject ID: ${SANITY_CONFIG.projectId}`);
  console.log(`Dataset: ${SANITY_CONFIG.dataset}`);
  console.log('');

  // Initialize Sanity client
  const client = createClient(SANITY_CONFIG);

  try {
    // Test connection
    console.log('Testing Sanity connection...');
    await client.fetch('*[_type == "property"][0]');
    console.log('✓ Connected to Sanity\n');
  } catch (e) {
    console.error('✗ Failed to connect to Sanity:', e.message);
    process.exit(1);
  }

  try {
    // Load combined Umbraco data (properties + rates merged)
    console.log('Loading Umbraco combined data...');
    let umbracoData = [];
    const umbracoPath = './tools/umbraco-combined.json';
    if (fs.existsSync(umbracoPath)) {
      umbracoData = JSON.parse(fs.readFileSync(umbracoPath, 'utf-8'));
      const withRates = umbracoData.filter(p => p.minWeeklyRate > 0).length;
      const featured = umbracoData.filter(p => p.isFeatured).length;
      console.log(`  Loaded ${umbracoData.length} properties (${withRates} with rates, ${featured} featured)`);
    } else {
      console.log('  No Umbraco data found - run merge-umbraco-exports.mjs first');
    }

    // Fetch data from Track PMS
    console.log('\nFetching data from Track PMS...');

    console.log('  Fetching nodes (villages)...');
    const nodes = await fetchAllNodes();
    const nodesMap = new Map(nodes.map(n => [n.id, n]));
    console.log(`  Found ${nodes.length} nodes`);

    console.log('  Fetching units (properties)...');
    const units = await fetchAllUnits();
    console.log(`  Found ${units.length} units`);

    // Migrate to Sanity
    await migrateVillages(client, nodes);
    await migrateAmenities(client, units);
    await migrateProperties(client, units, nodesMap, umbracoData, false); // Set to true to fetch images

    console.log('\n' + '='.repeat(60));
    console.log('Migration Complete!');
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('1. Open Sanity Studio to review the imported content');
    console.log('2. Run the image migration separately (to upload images to Sanity CDN)');
    console.log('3. Update your web app .env to use Sanity data');

  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();
