/**
 * Featured Properties API
 *
 * Returns properties from Track PMS with images for the home page
 */

import { NextRequest, NextResponse } from 'next/server';

// Track API Configuration
const TRACK_CONFIG = {
  baseUrl: process.env.TRACK_API_URL || 'https://surforsound.tracksandbox.io/api',
  key: process.env.TRACK_API_KEY || '',
  secret: process.env.TRACK_API_SECRET || '',
};

function getAuthHeader(): string {
  return 'Basic ' + Buffer.from(`${TRACK_CONFIG.key}:${TRACK_CONFIG.secret}`).toString('base64');
}

async function fetchFromTrack<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
  const url = new URL(`${TRACK_CONFIG.baseUrl}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: getAuthHeader(),
      Accept: 'application/json',
    },
    next: { revalidate: 600 }, // Cache for 10 minutes
  });

  if (!response.ok) {
    throw new Error(`Track API error ${response.status}`);
  }

  return response.json();
}

// Map village node ID to name
const nodeToVillage: Record<number, { name: string; slug: string }> = {
  1: { name: 'Rodanthe', slug: 'rodanthe' },
  2: { name: 'Waves', slug: 'waves' },
  3: { name: 'Salvo', slug: 'salvo' },
  4: { name: 'Avon', slug: 'avon' },
  5: { name: 'Buxton', slug: 'buxton' },
  6: { name: 'Frisco', slug: 'frisco' },
  7: { name: 'Hatteras Village', slug: 'hatteras-village' },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    // Fetch units from Track
    const unitsResponse = await fetchFromTrack<{
      _embedded?: { units: any[] };
    }>('/pms/units', { size: limit * 2 }); // Get extra in case some don't have images

    const units = unitsResponse._embedded?.units || [];
    const properties = [];

    // Process units and get images
    for (const unit of units) {
      if (properties.length >= limit) break;

      try {
        // Get images for the unit
        const imagesResponse = await fetchFromTrack<{
          _embedded?: { images: Array<{ original?: string; large?: string; medium?: string; name?: string }> };
        }>(`/pms/units/${unit.id}/images`, { size: 5 });

        const images = imagesResponse._embedded?.images || [];

        // Create property object
        const village = nodeToVillage[unit.nodeId] || { name: 'Hatteras Island', slug: 'hatteras-island' };

        const fullBaths = unit.fullBathrooms || 0;
        const threeQuarterBaths = unit.threeQuarterBathrooms || 0;
        const halfBaths = unit.halfBathrooms || 0;
        const totalBaths = fullBaths + threeQuarterBaths + halfBaths * 0.5;

        const slug = unit.name
          .toLowerCase()
          .replace(/[#']/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        properties.push({
          id: `prop-${unit.id}`,
          trackId: String(unit.id),
          name: unit.name,
          slug: unit.unitCode ? `${slug}-${unit.unitCode}` : slug,
          headline: unit.shortDescription || 'Beautiful vacation rental on Hatteras Island',
          bedrooms: unit.bedrooms || 3,
          bathrooms: totalBaths || 2,
          sleeps: unit.maxOccupancy || 6,
          petFriendly: unit.petsFriendly || false,
          featured: true,
          village,
          images: images.length > 0
            ? images.map(img => ({
                url: img.original || img.large || img.medium || '/images/placeholder-property.svg',
                alt: img.name || unit.name,
              }))
            : [{ url: '/images/placeholder-property.svg', alt: unit.name }],
          baseRate: 1500 + Math.floor(Math.random() * 2000), // Placeholder rate
        });
      } catch (error) {
        // Skip units that fail
        continue;
      }
    }

    return NextResponse.json({
      properties,
      total: properties.length,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    console.error('Featured properties API error:', error);

    // Return empty result on error
    return NextResponse.json({
      properties: [],
      total: 0,
      error: 'Failed to fetch properties',
    });
  }
}
