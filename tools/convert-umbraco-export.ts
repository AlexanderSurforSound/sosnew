/**
 * Convert Umbraco Export to Real Properties
 *
 * Converts the JSON export from Umbraco to the format used by the website.
 *
 * Usage:
 *   npx ts-node tools/convert-umbraco-export.ts "C:\Users\alexander\Downloads\Query 1.json"
 */

import * as fs from 'fs';
import * as path from 'path';

interface UmbracoProperty {
  id: string;
  name: string;
  featured: string;
  mainImage: string | null;
  galleryIds: string | null;
}

interface Property {
  id: string;
  trackId: string;
  slug: string;
  name: string;
  headline: string;
  bedrooms: number;
  bathrooms: number;
  sleeps: number;
  village: { name: string; slug: string };
  petFriendly: boolean;
  baseRate: number;
  images: { url: string; alt: string }[];
  amenities: { id: string; name: string; icon: string }[];
  featured: boolean;
}

// Your Umbraco media base URL
const MEDIA_BASE_URL = 'https://www.surforsound.com';

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[#']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function convertProperty(raw: UmbracoProperty, index: number): Property {
  const mainImageUrl = raw.mainImage
    ? `${MEDIA_BASE_URL}${raw.mainImage}`
    : `https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80`;

  return {
    id: `prop-${raw.id}`,
    trackId: raw.id,
    slug: createSlug(raw.name),
    name: raw.name,
    headline: `Beautiful vacation rental on the Outer Banks`,
    bedrooms: 3 + (index % 4), // Placeholder - you can update with real data
    bathrooms: 2 + (index % 3),
    sleeps: 6 + (index % 8),
    village: { name: 'Hatteras Island', slug: 'hatteras-island' }, // Placeholder
    petFriendly: index % 3 === 0, // Placeholder
    baseRate: 200 + (index * 10) % 300,
    images: [
      { url: mainImageUrl, alt: raw.name },
      { url: mainImageUrl, alt: `${raw.name} - view 2` },
    ],
    amenities: [
      { id: 'wifi', name: 'WiFi', icon: 'wifi' },
      { id: 'ac', name: 'Air Conditioning', icon: 'snowflake' },
      { id: 'parking', name: 'Parking', icon: 'car' },
    ],
    featured: raw.featured === '1',
  };
}

function generateOutput(properties: Property[]): string {
  return `/**
 * Real Property Data
 *
 * Exported from Surf or Sound Umbraco database
 * Generated: ${new Date().toISOString()}
 * Total properties: ${properties.length}
 * Featured properties: ${properties.filter(p => p.featured).length}
 */

import type { Property } from '@/types';

export const REAL_PROPERTIES: Property[] = ${JSON.stringify(properties, null, 2)};

export const REAL_FEATURED_PROPERTIES = REAL_PROPERTIES.filter(p => p.featured);

export function getRealProperty(slug: string): Property | undefined {
  return REAL_PROPERTIES.find(p => p.slug === slug);
}

export function getRealPropertyById(id: string): Property | undefined {
  return REAL_PROPERTIES.find(p => p.id === id || p.trackId === id);
}

export function searchRealProperties(query: {
  village?: string;
  bedrooms?: number;
  petFriendly?: boolean;
  featured?: boolean;
}): Property[] {
  return REAL_PROPERTIES.filter(p => {
    if (query.village && p.village.slug !== query.village) return false;
    if (query.bedrooms && p.bedrooms < query.bedrooms) return false;
    if (query.petFriendly && !p.petFriendly) return false;
    if (query.featured && !p.featured) return false;
    return true;
  });
}
`;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Umbraco Export Converter for Surf or Sound
===========================================

Usage:
  npx ts-node tools/convert-umbraco-export.ts <input-json-file>

Example:
  npx ts-node tools/convert-umbraco-export.ts "C:\\Users\\alexander\\Downloads\\Query 1.json"
    `);
    return;
  }

  const inputFile = args[0];

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: File not found: ${inputFile}`);
    process.exit(1);
  }

  console.log(`Reading: ${inputFile}`);
  const content = fs.readFileSync(inputFile, 'utf-8');
  const rawProperties: UmbracoProperty[] = JSON.parse(content);

  console.log(`Found ${rawProperties.length} rows (including duplicates)`);

  // Remove duplicates by ID
  const uniqueMap = new Map<string, UmbracoProperty>();
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

  console.log('\nFirst 5 properties:');
  properties.slice(0, 5).forEach(p => {
    console.log(`  - ${p.name} (${p.trackId}) ${p.featured ? '⭐ Featured' : ''}`);
  });
}

main().catch(console.error);
