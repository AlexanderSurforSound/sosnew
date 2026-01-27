/**
 * Parse Umbraco Rate Export
 *
 * Converts the XML rate data from Umbraco export to a clean JSON format
 * for use in the Sanity migration.
 *
 * Usage: node tools/parse-umbraco-rates.mjs
 */

import fs from 'fs';

// Read the export file
const exportPath = './tools/umbraco-rates-export.json';
const outputPath = './tools/umbraco-rates.json';

console.log('Reading Umbraco rate export...');
const data = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
console.log(`Found ${data.length} properties`);

/**
 * Parse the XML rate data and extract min/max weekly rates
 */
function parseRates(xmlString) {
  if (!xmlString || xmlString === '<data></data>' || xmlString.trim() === '') {
    return { minWeeklyRate: 0, maxWeeklyRate: 0, rateSchedule: [] };
  }

  const rates = [];

  // Extract all rate values using regex
  const rateMatches = xmlString.matchAll(/<rate[^>]*>(\d+)<\/rate>/g);
  for (const match of rateMatches) {
    const rate = parseInt(match[1], 10);
    if (rate > 0) {
      rates.push(rate);
    }
  }

  if (rates.length === 0) {
    return { minWeeklyRate: 0, maxWeeklyRate: 0, rateSchedule: [] };
  }

  // Extract full rate schedule with dates
  const rateSchedule = [];
  const itemMatches = xmlString.matchAll(/<item[^>]*>.*?<rate[^>]*>(\d+)<\/rate>.*?<startDate[^>]*>([^<]+)<\/startDate>.*?<endDate[^>]*>([^<]+)<\/endDate>.*?<\/item>/gs);

  for (const match of itemMatches) {
    rateSchedule.push({
      rate: parseInt(match[1], 10),
      startDate: match[2].trim(),
      endDate: match[3].trim(),
    });
  }

  return {
    minWeeklyRate: Math.min(...rates),
    maxWeeklyRate: Math.max(...rates),
    rateSchedule,
  };
}

// Process each property
const results = [];
let withRates = 0;
let withoutRates = 0;

for (const prop of data) {
  const rateData = parseRates(prop.referenceRates);

  if (rateData.minWeeklyRate > 0) {
    withRates++;
  } else {
    withoutRates++;
  }

  results.push({
    contentNodeId: prop.contentNodeId,
    propertyName: prop.propertyName,
    isActive: prop['Is Active'] === '1',
    minWeeklyRate: rateData.minWeeklyRate,
    maxWeeklyRate: rateData.maxWeeklyRate,
    rateSchedule: rateData.rateSchedule,
    ratesYear: prop.ratesYear,
  });
}

// Sort by property name
results.sort((a, b) => a.propertyName.localeCompare(b.propertyName));

// Write output
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

console.log('\nResults:');
console.log(`  Properties with rates: ${withRates}`);
console.log(`  Properties without rates: ${withoutRates}`);
console.log(`\nSample rates:`);

// Show some examples
const samples = results.filter(r => r.minWeeklyRate > 0).slice(0, 5);
for (const s of samples) {
  console.log(`  ${s.propertyName}: $${s.minWeeklyRate} - $${s.maxWeeklyRate}/week`);
}

console.log(`\nOutput written to: ${outputPath}`);
