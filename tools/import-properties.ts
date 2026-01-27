/**
 * Property Import Tool
 *
 * This script converts property data from various formats into
 * the format used by the new Surf or Sound website.
 *
 * Usage:
 *   1. Export your properties to CSV or JSON
 *   2. Run: npx ts-node tools/import-properties.ts <input-file>
 *   3. Copy the output to apps/web/src/lib/realProperties.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Village mapping
const villageMap: Record<string, { name: string; slug: string }> = {
  'rodanthe': { name: 'Rodanthe', slug: 'rodanthe' },
  'waves': { name: 'Waves', slug: 'waves' },
  'salvo': { name: 'Salvo', slug: 'salvo' },
  'avon': { name: 'Avon', slug: 'avon' },
  'buxton': { name: 'Buxton', slug: 'buxton' },
  'frisco': { name: 'Frisco', slug: 'frisco' },
  'hatteras': { name: 'Hatteras Village', slug: 'hatteras-village' },
  'hatteras village': { name: 'Hatteras Village', slug: 'hatteras-village' },
};

interface RawProperty {
  houseNumber?: string | number;
  name?: string;
  propertyName?: string;
  village?: string;
  villageName?: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  sleeps?: number | string;
  maxOccupancy?: number | string;
  description?: string;
  shortDescription?: string;
  petFriendly?: boolean | string | number;
  maxPets?: number | string;
  minRate?: number | string;
  maxRate?: number | string;
  weeklyRate?: number | string;
  [key: string]: any;
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

function normalizeVillage(village?: string): { name: string; slug: string } {
  if (!village) return { name: 'Avon', slug: 'avon' };
  const key = village.toLowerCase().trim();
  return villageMap[key] || { name: village, slug: village.toLowerCase().replace(/\s+/g, '-') };
}

function createSlug(name: string, houseNumber?: string | number): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return houseNumber ? `${base}-${houseNumber}` : base;
}

function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'string') {
    return ['true', 'yes', '1', 'y'].includes(value.toLowerCase());
  }
  return false;
}

function parseNumber(value: any, defaultValue: number = 0): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

function convertProperty(raw: RawProperty, index: number): Property {
  const houseNumber = raw.houseNumber?.toString() || raw.HouseNumber?.toString() || `${1000 + index}`;
  const name = raw.name || raw.propertyName || raw.PropertyName || `Property ${houseNumber}`;
  const village = normalizeVillage(raw.village || raw.villageName || raw.VillageName);

  // Calculate nightly rate from weekly if needed
  let baseRate = parseNumber(raw.minRate || raw.weeklyRate || raw.MinWeeklyRate);
  if (baseRate > 1000) {
    // Likely a weekly rate, convert to nightly estimate
    baseRate = Math.round(baseRate / 7);
  }
  if (baseRate === 0) {
    baseRate = 250 + (index * 25); // Default pricing
  }

  return {
    id: `prop-${houseNumber}`,
    trackId: houseNumber,
    slug: createSlug(name, houseNumber),
    name: name,
    headline: raw.shortDescription || raw.ShortDescription || `Beautiful vacation rental in ${village.name}`,
    bedrooms: parseNumber(raw.bedrooms || raw.Bedrooms, 3),
    bathrooms: parseNumber(raw.bathrooms || raw.Bathrooms, 2),
    sleeps: parseNumber(raw.sleeps || raw.maxOccupancy || raw.MaxOccupancy || raw.Sleeps, 8),
    village: village,
    petFriendly: parseBoolean(raw.petFriendly || raw.PetFriendly || (parseNumber(raw.maxPets || raw.MaxPets) > 0)),
    baseRate: baseRate,
    images: [
      { url: `https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80`, alt: name },
      { url: `https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80`, alt: `${name} interior` },
    ],
    amenities: [
      { id: 'wifi', name: 'WiFi', icon: 'wifi' },
      { id: 'ac', name: 'Air Conditioning', icon: 'snowflake' },
      { id: 'parking', name: 'Parking', icon: 'car' },
    ],
    featured: index < 6, // First 6 are featured
  };
}

function parseCSV(content: string): RawProperty[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const properties: RawProperty[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const property: RawProperty = {};
    headers.forEach((header, index) => {
      property[header] = values[index];
    });
    properties.push(property);
  }

  return properties;
}

function generateOutput(properties: Property[]): string {
  return `/**
 * Real Property Data
 *
 * Exported from Surf or Sound database
 * Generated: ${new Date().toISOString()}
 * Total properties: ${properties.length}
 */

import type { Property } from '@/types';

export const REAL_PROPERTIES: Property[] = ${JSON.stringify(properties, null, 2)};

export const REAL_FEATURED_PROPERTIES = REAL_PROPERTIES.filter(p => p.featured);

export function getRealProperty(slug: string): Property | undefined {
  return REAL_PROPERTIES.find(p => p.slug === slug);
}

export function searchRealProperties(query: {
  village?: string;
  bedrooms?: number;
  petFriendly?: boolean;
}): Property[] {
  return REAL_PROPERTIES.filter(p => {
    if (query.village && p.village.slug !== query.village) return false;
    if (query.bedrooms && p.bedrooms < query.bedrooms) return false;
    if (query.petFriendly && !p.petFriendly) return false;
    return true;
  });
}
`;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Property Import Tool for Surf or Sound
=======================================

Usage:
  npx ts-node tools/import-properties.ts <input-file>

Input formats supported:
  - JSON file with array of properties
  - CSV file with headers

Example CSV format:
  houseNumber,name,village,bedrooms,bathrooms,sleeps,petFriendly,minRate
  881,Blue Ocean Views,Avon,5,4,12,true,2500
  882,Sunset Paradise,Rodanthe,4,3,10,false,1800

The output will be written to: apps/web/src/lib/realProperties.ts
    `);

    // If no file provided, create a sample template
    console.log('\nCreating sample template file...');
    const sampleCSV = `houseNumber,name,village,bedrooms,bathrooms,sleeps,petFriendly,minRate
881,Blue Ocean Views,Avon,5,4,12,true,2500
882,Sunset Paradise,Rodanthe,4,3,10,false,1800
883,Hatteras Haven,Hatteras Village,6,5,14,true,3200
884,Waves Retreat,Waves,3,2,8,true,1500
885,Salvo Shores,Salvo,4,3,10,false,2000`;

    fs.writeFileSync('tools/sample-properties.csv', sampleCSV);
    console.log('Created: tools/sample-properties.csv');
    console.log('\nEdit this file with your real properties, then run:');
    console.log('  npx ts-node tools/import-properties.ts tools/sample-properties.csv');
    return;
  }

  const inputFile = args[0];

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: File not found: ${inputFile}`);
    process.exit(1);
  }

  const content = fs.readFileSync(inputFile, 'utf-8');
  let rawProperties: RawProperty[];

  if (inputFile.endsWith('.json')) {
    rawProperties = JSON.parse(content);
    if (!Array.isArray(rawProperties)) {
      rawProperties = [rawProperties];
    }
  } else {
    rawProperties = parseCSV(content);
  }

  console.log(`Found ${rawProperties.length} properties to import`);

  const properties = rawProperties.map((raw, index) => convertProperty(raw, index));

  const output = generateOutput(properties);
  const outputPath = 'apps/web/src/lib/realProperties.ts';

  fs.writeFileSync(outputPath, output);
  console.log(`\nExported ${properties.length} properties to: ${outputPath}`);

  // Show summary
  console.log('\nProperty Summary:');
  console.log('----------------');
  const byVillage = properties.reduce((acc, p) => {
    acc[p.village.name] = (acc[p.village.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(byVillage).forEach(([village, count]) => {
    console.log(`  ${village}: ${count} properties`);
  });

  console.log(`\nFeatured: ${properties.filter(p => p.featured).length}`);
  console.log(`Pet-friendly: ${properties.filter(p => p.petFriendly).length}`);
}

main().catch(console.error);
