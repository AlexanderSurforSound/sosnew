/**
 * Last Minute Availability API
 *
 * Returns properties with availability in the next 7 days
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
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Track API error ${response.status}`);
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    // Get date range for this week
    const today = new Date();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    const startDate = today.toISOString().split('T')[0];
    const endDate = endOfWeek.toISOString().split('T')[0];

    // Fetch units from Track
    const unitsResponse = await fetchFromTrack<{
      _embedded?: { units: any[] };
      page?: { totalElements: number };
    }>('/pms/units', { size: 50 });

    const units = unitsResponse._embedded?.units || [];

    // For each unit, check availability this week
    const availableProperties = [];

    for (const unit of units.slice(0, 20)) {
      try {
        // Get availability for this unit
        const availabilityResponse = await fetchFromTrack<{
          _embedded?: { availability: Array<{ date: string; available: boolean; rate?: number }> };
        }>(`/pms/units/${unit.id}/availability`, { startDate, endDate });

        const availability = availabilityResponse._embedded?.availability || [];

        // Check if there's any availability this week
        const hasAvailability = availability.some(day => day.available);

        if (hasAvailability) {
          // Get images for the unit
          const imagesResponse = await fetchFromTrack<{
            _embedded?: { images: Array<{ original?: string; large?: string; medium?: string; name?: string }> };
          }>(`/pms/units/${unit.id}/images`, { size: 5 });

          const images = imagesResponse._embedded?.images || [];

          // Find the first available date and rate
          const firstAvailable = availability.find(day => day.available);

          availableProperties.push({
            id: `prop-${unit.id}`,
            trackId: String(unit.id),
            name: unit.name,
            slug: unit.name
              .toLowerCase()
              .replace(/[#']/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, ''),
            bedrooms: unit.bedrooms || 3,
            bathrooms: (unit.fullBathrooms || 0) + (unit.threeQuarterBathrooms || 0) + (unit.halfBathrooms || 0) * 0.5,
            sleeps: unit.maxOccupancy || 6,
            petFriendly: unit.petsFriendly || false,
            village: { name: 'Hatteras Island', slug: 'hatteras-island' },
            images: images.length > 0
              ? images.map(img => ({
                  url: img.original || img.large || img.medium || '/images/placeholder-property.svg',
                  alt: img.name || unit.name,
                }))
              : [{ url: '/images/placeholder-property.svg', alt: unit.name }],
            firstAvailableDate: firstAvailable?.date,
            rate: firstAvailable?.rate,
            availableDays: availability.filter(day => day.available).length,
          });
        }
      } catch (error) {
        // Skip units that fail availability check
        continue;
      }
    }

    return NextResponse.json({
      properties: availableProperties,
      dateRange: { start: startDate, end: endDate },
      total: availableProperties.length,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    console.error('Last minute API error:', error);

    // Return empty result on error
    return NextResponse.json({
      properties: [],
      dateRange: { start: '', end: '' },
      total: 0,
      error: 'Failed to fetch availability',
    });
  }
}
