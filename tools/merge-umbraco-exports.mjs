/**
 * Merge Umbraco Exports
 *
 * Combines property data and rate data into a single file
 * for use in the Sanity migration.
 *
 * Usage: node tools/merge-umbraco-exports.mjs
 */

import fs from 'fs';

const propertiesPath = './tools/umbraco-properties-export.json';
const ratesPath = './tools/umbraco-rates.json';
const outputPath = './tools/umbraco-combined.json';

console.log('Loading exports...');

const properties = JSON.parse(fs.readFileSync(propertiesPath, 'utf-8'));
const rates = JSON.parse(fs.readFileSync(ratesPath, 'utf-8'));

console.log(`  Properties: ${properties.length}`);
console.log(`  Rates: ${rates.length}`);

// Create rate lookup by contentNodeId
const rateMap = new Map();
for (const rate of rates) {
  rateMap.set(String(rate.contentNodeId), rate);
}

// Merge data
const combined = [];
let withRates = 0;
let featured = 0;

for (const prop of properties) {
  const rateData = rateMap.get(String(prop.contentNodeId));

  const merged = {
    contentNodeId: String(prop.contentNodeId),
    propertyName: prop.propertyName,
    houseNumber: prop.houseNumber || '',
    isActive: prop.isActive === 1 || prop.isActive === '1',
    isFeatured: prop.isFeatured === 1 || prop.isFeatured === '1',
    isNew: prop.isNew === 1 || prop.isNew === '1',
    mainImage: prop.mainImage || '',
    galleryImages: prop.galleryImages || '',
    youtubeKey: prop.youtubeKey || '',
    village: prop.village || '',
    minWeeklyRate: rateData?.minWeeklyRate || 0,
    maxWeeklyRate: rateData?.maxWeeklyRate || 0,
    rateSchedule: rateData?.rateSchedule || [],
  };

  if (merged.minWeeklyRate > 0) withRates++;
  if (merged.isFeatured) featured++;

  combined.push(merged);
}

// Sort by name
combined.sort((a, b) => a.propertyName.localeCompare(b.propertyName));

// Write output
fs.writeFileSync(outputPath, JSON.stringify(combined, null, 2));

console.log('\nMerged data:');
console.log(`  Total properties: ${combined.length}`);
console.log(`  With rates: ${withRates}`);
console.log(`  Featured: ${featured}`);
console.log(`  With house numbers: ${combined.filter(p => p.houseNumber).length}`);

console.log('\nFeatured properties with rates:');
const featuredWithRates = combined.filter(p => p.isFeatured && p.minWeeklyRate > 0).slice(0, 10);
for (const p of featuredWithRates) {
  console.log(`  ${p.propertyName} (${p.houseNumber || 'no house#'}): $${p.minWeeklyRate} - $${p.maxWeeklyRate}/week`);
}

console.log(`\nOutput written to: ${outputPath}`);
