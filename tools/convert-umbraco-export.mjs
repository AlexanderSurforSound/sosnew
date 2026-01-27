/**
 * Convert Umbraco Export to Real Properties
 *
 * Usage:
 *   node tools/convert-umbraco-export.mjs "C:\Users\alexander\Downloads\Query 1 (1).json"
 */

import fs from 'fs';
import path from 'path';

// Your Umbraco media base URL
const MEDIA_BASE_URL = 'https://www.surforsound.com';

function createSlug(name, houseNumber) {
  const base = name
    .toLowerCase()
    .replace(/[#']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return houseNumber ? `${base}-${houseNumber}` : base;
}

function convertProperty(raw, index) {
  const mainImageUrl = raw.mainImage
    ? `${MEDIA_BASE_URL}${raw.mainImage}`
    : `https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80`;

  const houseNumber = raw.houseNumber || '';
  const securityDeposit = parseFloat(raw.securityDeposit) || 0;

  // Estimate base rate from security deposit (rough approximation)
  // $600 deposit = ~$150/night, $2000 deposit = ~$350/night, $3000 deposit = ~$500/night
  let baseRate = 250;
  if (securityDeposit >= 3000) baseRate = 500;
  else if (securityDeposit >= 2000) baseRate = 350;
  else if (securityDeposit >= 1200) baseRate = 275;
  else if (securityDeposit >= 600) baseRate = 200;
  else if (securityDeposit > 0) baseRate = 150;

  return {
    id: `prop-${raw.id}`,
    trackId: raw.id,
    houseNumber: houseNumber,
    slug: raw.urlAlias || createSlug(raw.name, houseNumber),
    name: raw.name,
    headline: `Beautiful vacation rental on the Outer Banks`,
    bedrooms: 3 + (index % 4), // Placeholder until Track data available
    bathrooms: 2 + (index % 3),
    sleeps: 6 + (index % 8),
    village: { name: 'Hatteras Island', slug: 'hatteras-island' }, // Placeholder
    petFriendly: raw.dogFriendly === 'true' || raw.dogFriendly === '1',
    baseRate: baseRate,
    securityDeposit: securityDeposit,
    images: [
      { url: mainImageUrl, alt: raw.name },
    ],
    amenities: [
      { id: 'wifi', name: 'WiFi', icon: 'wifi' },
      { id: 'ac', name: 'Air Conditioning', icon: 'snowflake' },
      { id: 'parking', name: 'Parking', icon: 'car' },
    ],
    featured: raw.featured === '1',
    isNew: raw.isNew === '1',
    youtubeKey: raw.youtubeKey || null,
  };
}

function generateOutput(properties) {
  const featuredCount = properties.filter(p => p.featured).length;
  const newCount = properties.filter(p => p.isNew).length;
  return `/**
 * Real Property Data
 *
 * Exported from Surf or Sound Umbraco database
 * Generated: ${new Date().toISOString()}
 * Total properties: ${properties.length}
 * Featured properties: ${featuredCount}
 * New properties: ${newCount}
 */

import type { Property } from '@/types';

export const REAL_PROPERTIES: Property[] = ${JSON.stringify(properties, null, 2)};

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

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
Umbraco Export Converter for Surf or Sound
===========================================

Usage:
  node tools/convert-umbraco-export.mjs <input-json-file>
  `);
  process.exit(0);
}

const inputFile = args[0];

if (!fs.existsSync(inputFile)) {
  console.error(`Error: File not found: ${inputFile}`);
  process.exit(1);
}

console.log(`Reading: ${inputFile}`);
const content = fs.readFileSync(inputFile, 'utf-8');
const rawProperties = JSON.parse(content);

console.log(`Found ${rawProperties.length} rows (including duplicates)`);

// Remove duplicates by ID
const uniqueMap = new Map();
for (const prop of rawProperties) {
  if (!uniqueMap.has(prop.id)) {
    uniqueMap.set(prop.id, prop);
  }
}

const uniqueProperties = Array.from(uniqueMap.values());
console.log(`Unique properties: ${uniqueProperties.length}`);

// Convert to our format
const properties = uniqueProperties.map((raw, index) => convertProperty(raw, index));

// Generate output
const output = generateOutput(properties);
const outputPath = 'apps/web/src/lib/realProperties.ts';

// Ensure directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, output);
console.log(`\nExported ${properties.length} properties to: ${outputPath}`);

// Show summary
console.log('\nProperty Summary:');
console.log('----------------');
console.log(`  Total: ${properties.length}`);
console.log(`  Featured: ${properties.filter(p => p.featured).length}`);
console.log(`  New: ${properties.filter(p => p.isNew).length}`);
console.log(`  With house numbers: ${properties.filter(p => p.houseNumber).length}`);

console.log('\nFirst 5 properties:');
properties.slice(0, 5).forEach(p => {
  const badges = [
    p.featured ? 'Featured' : '',
    p.isNew ? 'New' : '',
  ].filter(Boolean).join(', ');
  console.log(`  - ${p.name} (#${p.houseNumber || 'N/A'}) ${badges ? `[${badges}]` : ''}`);
});
