/**
 * BeaconOS Pricing API
 *
 * Edge-optimized pricing calculations for maximum speed
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBeacon } from '@/lib/beacon';

// Use Edge Runtime for fastest possible response
export const runtime = 'nodejs'; // Switch to 'edge' when BeaconOS is edge-compatible

// Revalidate every 5 minutes for dynamic pricing
export const revalidate = 300;

/**
 * GET /api/beacon/pricing
 * Calculate pricing for a property
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const propertyId = searchParams.get('propertyId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = searchParams.get('guests');
  const promoCode = searchParams.get('promoCode');

  if (!propertyId || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: 'Missing required parameters: propertyId, checkIn, checkOut' },
      { status: 400 }
    );
  }

  try {
    const beacon = await getBeacon();
    const pricing = await beacon.pricing.calculatePricing({
      propertyId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests: guests ? parseInt(guests) : undefined,
      promoCode: promoCode || undefined,
    });

    return NextResponse.json(pricing, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error('Pricing calculation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate pricing' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/beacon/pricing/recommend
 * Get AI-powered price recommendations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, date } = body;

    if (!propertyId || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters: propertyId, date' },
        { status: 400 }
      );
    }

    const beacon = await getBeacon();
    const recommendation = await beacon.pricing.getRecommendedPrice(
      propertyId,
      new Date(date)
    );

    return NextResponse.json(recommendation);
  } catch (error: any) {
    console.error('Price recommendation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get price recommendation' },
      { status: 500 }
    );
  }
}
