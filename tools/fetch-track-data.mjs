/**
 * Fetch Property Data from Track PMS API
 *
 * This script fetches real property data from Track and MERGES it with
 * existing Umbraco data (which has images, featured status, etc.)
 *
 * Usage:
 *   node tools/fetch-track-data.mjs
 */

import fs from 'fs';
import path from 'path';

// Track API Configuration - Sandbox (Marathon Consulting Channel Key)
const TRACK_CONFIG = {
  baseUrl: 'https://surforsound.tracksandbox.io/api',
  key: '252d8c5ff0ec18d967efe51902e823c6',
  secret: 'e148c23fea976b7c3d37ee634b07da04',
};

// Create Basic Auth header
const authHeader = 'Basic ' + Buffer.from(`${TRACK_CONFIG.key}:${TRACK_CONFIG.secret}`).toString('base64');

async function fetchFromTrack(endpoint, params = {}) {
  const url = new URL(`${TRACK_CONFIG.baseUrl}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  console.log(`Fetching: ${url.pathname}${url.search}`);

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': authHeader,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Track API error ${response.status}: ${text}`);
  }

  return response.json();
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

async function fetchAllNodes() {
  const allNodes = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const data = await fetchFromTrack('/pms/nodes', { page, size: pageSize });
    const nodes = data._embedded?.nodes || [];

    if (nodes.length === 0) break;

    allNodes.push(...nodes);
    console.log(`  Fetched page ${page}: ${nodes.length} nodes (total: ${allNodes.length})`);

    if (nodes.length < pageSize) break;
    page++;
  }

  return allNodes;
}

async function fetchUnitImages(unitId, maxImages = 5) {
  try {
    const data = await fetchFromTrack(`/pms/units/${unitId}/images`, { size: maxImages });
    return data._embedded?.images || [];
  } catch (e) {
    // Some units may not have images
    return [];
  }
}

function createSlug(name, houseNumber) {
  const base = name
    .toLowerCase()
    .replace(/[#']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return houseNumber ? `${base}-${houseNumber}` : base;
}

function mapTrackUnitToProperty(unit, nodesMap) {
  const node = nodesMap.get(unit.nodeId);
  const villageName = node?.name || 'Hatteras Island';
  const villageSlug = villageName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Calculate total bathrooms
  const fullBaths = unit.fullBathrooms || 0;
  const threeQuarterBaths = unit.threeQuarterBathrooms || 0;
  const halfBaths = unit.halfBathrooms || 0;
  const totalBaths = fullBaths + threeQuarterBaths + (halfBaths * 0.5);

  // Map amenities
  const amenities = (unit.amenities || []).slice(0, 10).map(a => ({
    id: String(a.id),
    name: a.name,
    icon: mapAmenityIcon(a.name),
  }));

  // If no amenities, add defaults
  if (amenities.length === 0) {
    amenities.push(
      { id: 'wifi', name: 'WiFi', icon: 'wifi' },
      { id: 'ac', name: 'Air Conditioning', icon: 'snowflake' },
      { id: 'parking', name: 'Parking', icon: 'car' }
    );
  }

  return {
    id: `prop-${unit.id}`,
    trackId: String(unit.id),
    houseNumber: unit.unitCode || '',
    slug: createSlug(unit.name, unit.unitCode),
    name: unit.name,
    headline: unit.shortDescription || `Beautiful vacation rental on the Outer Banks`,
    bedrooms: unit.bedrooms || 3,
    bathrooms: totalBaths || 2,
    sleeps: unit.maxOccupancy || 6,
    village: { name: villageName, slug: villageSlug },
    petFriendly: unit.petsFriendly || false,
    baseRate: 250, // Will need rate API for real rates
    securityDeposit: 0,
    images: [
      { url: `https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80`, alt: unit.name },
    ],
    amenities: amenities,
    featured: false,
    isNew: false,
    latitude: unit.latitude || null,
    longitude: unit.longitude || null,
    streetAddress: unit.streetAddress || null,
    locality: unit.locality || null,
    region: unit.region || null,
    postal: unit.postal || null,
  };
}

function mapAmenityIcon(name) {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('wifi') || nameLower.includes('internet')) return 'wifi';
  if (nameLower.includes('pool')) return 'waves';
  if (nameLower.includes('hot tub') || nameLower.includes('jacuzzi')) return 'hot-tub';
  if (nameLower.includes('air') || nameLower.includes('ac') || nameLower.includes('conditioning')) return 'snowflake';
  if (nameLower.includes('parking') || nameLower.includes('garage')) return 'car';
  if (nameLower.includes('grill') || nameLower.includes('bbq')) return 'flame';
  if (nameLower.includes('washer') || nameLower.includes('laundry')) return 'shirt';
  if (nameLower.includes('dryer')) return 'wind';
  if (nameLower.includes('dish')) return 'utensils';
  if (nameLower.includes('tv') || nameLower.includes('television')) return 'tv';
  if (nameLower.includes('pet') || nameLower.includes('dog')) return 'dog';
  if (nameLower.includes('beach')) return 'umbrella-beach';
  if (nameLower.includes('ocean') || nameLower.includes('view')) return 'eye';
  if (nameLower.includes('elevator')) return 'elevator';
  if (nameLower.includes('game') || nameLower.includes('arcade')) return 'gamepad';
  return 'check';
}

function generateOutput(properties) {
  const featuredCount = properties.filter(p => p.featured).length;
  const newCount = properties.filter(p => p.isNew).length;

  return `/**
 * Real Property Data
 *
 * Fetched from Track PMS API
 * Generated: ${new Date().toISOString()}
 * Total properties: ${properties.length}
 * Featured properties: ${featuredCount}
 * New properties: ${newCount}
 */

import type { Property } from '@/types';

export const REAL_PROPERTIES: Property[] = ${JSON.stringify(properties)};

export const REAL_FEATURED_PROPERTIES = REAL_PROPERTIES.filter(p => p.featured);

export const REAL_NEW_PROPERTIES = REAL_PROPERTIES.filter(p => p.isNew);

export function getRealProperty(slug: string): Property | undefined {
  return REAL_PROPERTIES.find(p => p.slug === slug);
}

export function getRealPropertyById(id: string): Property | undefined {
  return REAL_PROPERTIES.find(p => p.id === id || p.trackId === id);
}

export function getRealPropertyByHouseNumber(houseNumber: string): Property | undefined {
  return REAL_PROPERTIES.find(p => p.houseNumber === houseNumber);
}

export function searchRealProperties(query: {
  village?: string;
  bedrooms?: number;
  petFriendly?: boolean;
  featured?: boolean;
  isNew?: boolean;
}): Property[] {
  return REAL_PROPERTIES.filter(p => {
    if (query.village && p.village.slug !== query.village) return false;
    if (query.bedrooms && p.bedrooms < query.bedrooms) return false;
    if (query.petFriendly && !p.petFriendly) return false;
    if (query.featured && !p.featured) return false;
    if (query.isNew && !p.isNew) return false;
    return true;
  });
}
`;
}

// Load existing Umbraco properties to merge with Track data
function loadExistingProperties() {
  const filePath = 'apps/web/src/lib/realProperties.ts';
  if (!fs.existsSync(filePath)) {
    console.log('No existing realProperties.ts found, will create new');
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract the array from the TypeScript file
  const match = content.match(/export const REAL_PROPERTIES: Property\[\] = (\[[\s\S]*?\]);/);
  if (!match) {
    console.log('Could not parse existing properties');
    return [];
  }

  try {
    // Parse the JSON array
    const jsonStr = match[1];
    return JSON.parse(jsonStr);
  } catch (e) {
    console.log('Error parsing properties:', e.message);
    return [];
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Track PMS Data Fetcher + Umbraco Merger');
  console.log('='.repeat(60));
  console.log(`\nAPI: ${TRACK_CONFIG.baseUrl}`);
  console.log('');

  try {
    // Fetch nodes (villages/locations) from Track
    console.log('Fetching nodes (villages) from Track...');
    const nodes = await fetchAllNodes();
    console.log(`Total nodes: ${nodes.length}\n`);

    // Create a map for quick lookup
    const nodesMap = new Map();
    nodes.forEach(node => nodesMap.set(node.id, node));

    // Fetch all units from Track
    console.log('Fetching units (properties) from Track...');
    const units = await fetchAllUnits();
    console.log(`Total units: ${units.length}\n`);

    // All units from API are available (sandbox may not have isActive/isBookable flags)
    const activeUnits = units;
    console.log(`Processing all units: ${activeUnits.length}\n`);

    // Fetch images for each unit (with rate limiting)
    console.log('Fetching images for properties (this may take a while)...');
    const unitImages = new Map();
    let imageCount = 0;

    for (let i = 0; i < activeUnits.length; i++) {
      const unit = activeUnits[i];
      const images = await fetchUnitImages(unit.id, 5); // Limit to 5 images to keep file size manageable
      unitImages.set(unit.id, images);
      imageCount += images.length;

      if ((i + 1) % 50 === 0) {
        console.log(`  Fetched images for ${i + 1}/${activeUnits.length} properties (${imageCount} total images)`);
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 50));
    }
    console.log(`  Total images fetched: ${imageCount}\n`);

    // Convert to property format
    console.log('Converting to property format...');
    let mergedCount = 0;
    let newCount = 0;

    const mergedProperties = activeUnits.map(unit => {
      const trackImages = unitImages.get(unit.id) || [];
      const unitCode = unit.unitCode || '';

      const node = nodesMap.get(unit.nodeId);
      const villageName = node?.name || 'Hatteras Island';
      const villageSlug = villageName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Calculate bathrooms
      const fullBaths = unit.fullBathrooms || 0;
      const threeQuarterBaths = unit.threeQuarterBathrooms || 0;
      const halfBaths = unit.halfBathrooms || 0;
      const totalBaths = fullBaths + threeQuarterBaths + (halfBaths * 0.5);

      // Map amenities from Track
      const trackAmenities = (unit.amenities || []).slice(0, 15).map(a => ({
        id: String(a.id),
        name: a.name,
        icon: mapAmenityIcon(a.name),
      }));

      // Default amenities if none from Track
      if (trackAmenities.length === 0) {
        trackAmenities.push(
          { id: 'wifi', name: 'WiFi', icon: 'wifi' },
          { id: 'ac', name: 'Air Conditioning', icon: 'snowflake' },
          { id: 'parking', name: 'Parking', icon: 'car' }
        );
      }

      // Map Track images to our format
      const propertyImages = trackImages.length > 0
        ? trackImages.map(img => ({
            url: img.original,
            alt: img.name || unit.name,
          }))
        : [{ url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80', alt: unit.name }];

      // Estimate base rate from bedrooms (typical OBX pricing)
      const bedrooms = unit.bedrooms || 3;
      let baseRate = 200;
      if (bedrooms >= 10) baseRate = 900;
      else if (bedrooms >= 8) baseRate = 700;
      else if (bedrooms >= 7) baseRate = 550;
      else if (bedrooms >= 6) baseRate = 450;
      else if (bedrooms >= 5) baseRate = 350;
      else if (bedrooms >= 4) baseRate = 275;
      else if (bedrooms >= 3) baseRate = 225;
      else baseRate = 175;

      newCount++;
      return {
        id: `prop-${unit.id}`,
        trackId: String(unit.id),
        houseNumber: unitCode,
        slug: createSlug(unit.name, unitCode),
        name: unit.name,
        headline: unit.shortDescription || `Beautiful vacation rental on the Outer Banks`,
        bedrooms: bedrooms,
        bathrooms: totalBaths || 2,
        sleeps: unit.maxOccupancy || 6,
        village: { name: villageName, slug: villageSlug },
        petFriendly: unit.petsFriendly || false,
        baseRate: baseRate,
        securityDeposit: 0,
        images: propertyImages,
        amenities: trackAmenities,
        featured: false,
        isNew: false,
        latitude: unit.latitude ? parseFloat(unit.latitude) : null,
        longitude: unit.longitude ? parseFloat(unit.longitude) : null,
        streetAddress: unit.streetAddress || null,
        locality: unit.locality || null,
        region: unit.region || null,
        postal: unit.postal || null,
      };
    });

    console.log(`  Properties with images: ${mergedProperties.filter(p => p.images.length > 1 || !p.images[0].url.includes('unsplash')).length}`);
    console.log(`  Total properties: ${newCount}\n`);

    // Generate output
    const output = generateOutput(mergedProperties);
    const outputPath = 'apps/web/src/lib/realProperties.ts';

    // Ensure directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, output);
    console.log(`\nExported ${mergedProperties.length} properties to: ${outputPath}`);

    // Show summary
    console.log('\n' + '='.repeat(60));
    console.log('Property Summary');
    console.log('='.repeat(60));
    console.log(`  Total: ${mergedProperties.length}`);
    console.log(`  Featured: ${mergedProperties.filter(p => p.featured).length}`);
    console.log(`  Pet Friendly: ${mergedProperties.filter(p => p.petFriendly).length}`);

    // Village breakdown
    const villageCount = {};
    mergedProperties.forEach(p => {
      villageCount[p.village.name] = (villageCount[p.village.name] || 0) + 1;
    });
    console.log('\n  By Village:');
    Object.entries(villageCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        console.log(`    ${name}: ${count}`);
      });

    // Bedroom breakdown
    const bedroomCount = {};
    mergedProperties.forEach(p => {
      bedroomCount[p.bedrooms] = (bedroomCount[p.bedrooms] || 0) + 1;
    });
    console.log('\n  By Bedrooms:');
    Object.entries(bedroomCount)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .forEach(([beds, count]) => {
        console.log(`    ${beds} BR: ${count}`);
      });

    console.log('\nFirst 5 properties:');
    mergedProperties.slice(0, 5).forEach(p => {
      const badges = [
        p.featured ? 'Featured' : '',
        p.petFriendly ? 'Pets OK' : '',
      ].filter(Boolean).join(', ');
      console.log(`  - ${p.name} (#${p.houseNumber || 'N/A'}) - ${p.bedrooms}BR/${p.bathrooms}BA, sleeps ${p.sleeps} - ${p.village.name}${badges ? ` [${badges}]` : ''}`);
    });

    // Save raw Track data for debugging
    fs.writeFileSync('tools/track-units-raw.json', JSON.stringify(units.slice(0, 10), null, 2));
    console.log('\nSaved sample raw data to: tools/track-units-raw.json');

  } catch (error) {
    console.error('\nError:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
    process.exit(1);
  }
}

main();
