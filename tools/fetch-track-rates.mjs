/**
 * Fetch Real Rates from Track PMS API
 *
 * This script fetches actual rates for all properties from Track PMS
 * and updates the realProperties.ts file with real pricing data.
 *
 * Usage:
 *   node tools/fetch-track-rates.mjs
 */

import fs from 'fs';

// Track API Configuration
const TRACK_CONFIG = {
  baseUrl: 'https://surforsound.tracksandbox.io/api',
  key: '252d8c5ff0ec18d967efe51902e823c6',
  secret: 'e148c23fea976b7c3d37ee634b07da04',
};

const authHeader = 'Basic ' + Buffer.from(`${TRACK_CONFIG.key}:${TRACK_CONFIG.secret}`).toString('base64');

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
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const futureDate = new Date(today);
    futureDate.setMonth(futureDate.getMonth() + 12);
    const endDate = futureDate.toISOString().split('T')[0];

    const data = await fetchFromTrack(`/pms/units/${unitId}/rates`, {
      startDate,
      endDate,
    });

    const rates = data._embedded?.rates || [];

    if (rates.length === 0) return null;

    // Calculate min, max, and average rates
    const dailyRates = rates.map(r => r.rate || r.baseRate || 0).filter(r => r > 0);

    if (dailyRates.length === 0) return null;

    return {
      minRate: Math.min(...dailyRates),
      maxRate: Math.max(...dailyRates),
      avgRate: Math.round(dailyRates.reduce((a, b) => a + b, 0) / dailyRates.length),
    };
  } catch (e) {
    return null;
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

    if (units.length < pageSize) break;
    page++;
  }

  return allUnits;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Track PMS Rate Fetcher');
  console.log('='.repeat(60));
  console.log(`\nAPI: ${TRACK_CONFIG.baseUrl}\n`);

  try {
    // Fetch all units
    console.log('Fetching units from Track...');
    const units = await fetchAllUnits();
    console.log(`Found ${units.length} units\n`);

    // Fetch rates for each unit
    console.log('Fetching rates for each unit (this may take a while)...');
    const ratesMap = new Map();
    let fetched = 0;
    let withRates = 0;

    for (const unit of units) {
      const rates = await fetchUnitRates(unit.id);
      if (rates) {
        ratesMap.set(unit.id, rates);
        withRates++;
      }
      fetched++;

      if (fetched % 50 === 0) {
        console.log(`  Progress: ${fetched}/${units.length} (${withRates} with rates)`);
      }

      // Rate limiting delay
      await new Promise(r => setTimeout(r, 100));
    }

    console.log(`\nFetched rates for ${withRates}/${units.length} units`);

    // Load existing properties
    const propsPath = 'apps/web/src/lib/realProperties.ts';
    if (!fs.existsSync(propsPath)) {
      console.error('realProperties.ts not found. Run fetch-track-data.mjs first.');
      process.exit(1);
    }

    console.log('\nUpdating realProperties.ts with real rates...');

    const content = fs.readFileSync(propsPath, 'utf-8');

    // Parse the existing properties
    const match = content.match(/export const REAL_PROPERTIES: Property\[\] = (\[[\s\S]*?\]);/);
    if (!match) {
      console.error('Could not parse existing properties');
      process.exit(1);
    }

    let properties;
    try {
      properties = JSON.parse(match[1]);
    } catch (e) {
      console.error('Error parsing properties JSON:', e.message);
      process.exit(1);
    }

    // Update rates
    let updated = 0;
    for (const prop of properties) {
      const trackId = parseInt(prop.trackId);
      const rates = ratesMap.get(trackId);
      if (rates) {
        prop.baseRate = rates.avgRate;
        prop.minRate = rates.minRate;
        prop.maxRate = rates.maxRate;
        updated++;
      }
    }

    console.log(`Updated ${updated} properties with real rates`);

    // Generate new output
    const featuredCount = properties.filter(p => p.featured).length;
    const newCount = properties.filter(p => p.isNew).length;

    const output = `/**
 * Real Property Data
 *
 * Fetched from Track PMS API (with real rates)
 * Generated: ${new Date().toISOString()}
 * Total properties: ${properties.length}
 * Featured properties: ${featuredCount}
 * New properties: ${newCount}
 * Properties with real rates: ${updated}
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

    fs.writeFileSync(propsPath, output);
    console.log(`\nSaved to: ${propsPath}`);

    // Show rate distribution
    console.log('\nRate Distribution:');
    const rateRanges = {
      'Under $200': 0,
      '$200-$300': 0,
      '$300-$500': 0,
      '$500-$750': 0,
      '$750-$1000': 0,
      'Over $1000': 0,
    };

    for (const prop of properties) {
      const rate = prop.baseRate;
      if (rate < 200) rateRanges['Under $200']++;
      else if (rate < 300) rateRanges['$200-$300']++;
      else if (rate < 500) rateRanges['$300-$500']++;
      else if (rate < 750) rateRanges['$500-$750']++;
      else if (rate < 1000) rateRanges['$750-$1000']++;
      else rateRanges['Over $1000']++;
    }

    Object.entries(rateRanges).forEach(([range, count]) => {
      console.log(`  ${range}: ${count}`);
    });

  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();
