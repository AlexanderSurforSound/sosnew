// Lightweight semantic intent extraction for property search
// Heuristic/NLP-lite approach to bootstrap AI search without external calls

export interface ExtractedIntent {
  amenities: string[];
  petFriendly?: boolean;
  minBedrooms?: number;
  maxBedrooms?: number;
  capacityHint?: 'small' | 'family' | 'large-group';
  occasion?: string;
  vibe?: string[];
  locationHints?: string[]; // e.g. ["oceanfront", "beach", "soundfront"]
}

const AMENITY_SYNONYMS: Record<string, string[]> = {
  pool: ['pool', 'swim', 'swimming pool', 'private pool', 'heated pool'],
  hotTub: ['hot tub', 'spa', 'jacuzzi'],
  petFriendly: ['pet friendly', 'pet-friendly', 'dog friendly', 'pets allowed'],
  beachAccess: ['beach', 'ocean', 'oceanfront', 'beachfront', 'steps to beach', 'near beach'],
  elevator: ['elevator', 'lift'],
  accessibility: ['accessible', 'wheelchair', 'ada'],
  gameRoom: ['game room', 'arcade', 'pool table', 'billiards'],
  theater: ['theater', 'cinema', 'media room'],
};

const LOCATION_HINTS = ['oceanfront', 'semi-oceanfront', 'soundfront', 'canal', 'beach', 'waterfront'];

export function extractIntent(query: string): ExtractedIntent {
  const q = (query || '').toLowerCase();
  const intent: ExtractedIntent = { amenities: [], vibe: [], locationHints: [] };

  // Pet friendly
  if (AMENITY_SYNONYMS.petFriendly.some((k) => q.includes(k))) {
    intent.petFriendly = true;
    intent.amenities.push('petFriendly');
  }

  // Amenities
  for (const [slug, words] of Object.entries(AMENITY_SYNONYMS)) {
    if (slug === 'petFriendly') continue;
    if (words.some((w) => q.includes(w))) intent.amenities.push(slug);
  }

  // Capacity hints
  if (q.match(/(reunion|wedding|retreat|corporate|large group|multi[- ]family|big group)/)) {
    intent.capacityHint = 'large-group';
    intent.minBedrooms = 6; // heuristic default
  } else if (q.match(/(family|kids|grandparents|multi[- ]gen)/)) {
    intent.capacityHint = 'family';
    intent.minBedrooms = Math.max(intent.minBedrooms || 0, 3);
  } else if (q.match(/(couple|romantic|honeymoon|anniversary)/)) {
    intent.capacityHint = 'small';
    intent.maxBedrooms = 2;
  }

  // Location hints
  for (const hint of LOCATION_HINTS) {
    if (q.includes(hint)) intent.locationHints!.push(hint);
  }

  // Occasion
  const occ = q.match(/(reunion|birthday|anniversary|honeymoon|retreat|workation|remote work)/);
  if (occ) intent.occasion = occ[1];

  // Vibe
  if (q.match(/(luxury|high[- ]end|premium)/)) intent.vibe!.push('luxury');
  if (q.match(/(casual|relaxed|laid back)/)) intent.vibe!.push('casual');
  if (q.match(/(fun|party)/)) intent.vibe!.push('fun');
  if (q.match(/(quiet|peaceful|secluded|private)/)) intent.vibe!.push('quiet');

  // Bedrooms explicit
  const beds = q.match(/(\d+)\s*(bed|bedroom|br)s?/);
  if (beds) intent.minBedrooms = Math.max(intent.minBedrooms || 0, parseInt(beds[1], 10));

  return intent;
}

export function mapIntentToFilters(intent: ExtractedIntent) {
  const filters: Record<string, any> = {};
  if (intent.minBedrooms) filters.minBedrooms = intent.minBedrooms;
  if (intent.maxBedrooms) filters.maxBedrooms = intent.maxBedrooms;
  if (intent.petFriendly) filters.petFriendly = true;

  const amenities: string[] = [];
  for (const a of intent.amenities) amenities.push(a);
  if (intent.locationHints?.includes('oceanfront')) amenities.push('oceanfront');
  if (amenities.length) filters.amenities = amenities;

  return filters;
}

export function explainIntent(intent: ExtractedIntent) {
  const criteria: string[] = [];
  if (intent.petFriendly) criteria.push('Pet friendly');
  if (intent.amenities.includes('pool')) criteria.push('Pool');
  if (intent.amenities.includes('hotTub')) criteria.push('Hot tub');
  if (intent.locationHints?.length) criteria.push(`Location: ${intent.locationHints.join(', ')}`);
  if (intent.minBedrooms) criteria.push(`${intent.minBedrooms}+ bedrooms`);
  if (intent.capacityHint) criteria.push(`Capacity: ${intent.capacityHint}`);
  if (intent.vibe?.length) criteria.push(`Vibe: ${intent.vibe.join(', ')}`);
  if (intent.occasion) criteria.push(`Occasion: ${intent.occasion}`);
  return criteria;
}

