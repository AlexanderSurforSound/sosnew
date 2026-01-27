/**
 * BeaconOS AI Concierge API
 *
 * 24/7 AI-powered guest support
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBeacon } from '@/lib/beacon';

export const runtime = 'nodejs';

/**
 * POST /api/beacon/concierge
 * Chat with AI Concierge
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, guestId, propertyId, reservationId, conversationHistory } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const beacon = await getBeacon();
    const response = await beacon.messaging.processWithConcierge({
      message,
      guestId,
      propertyId,
      reservationId,
      conversationHistory,
    });

    return NextResponse.json({
      success: true,
      ...response,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Concierge error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/beacon/concierge/recommendations
 * Get local recommendations
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const location = searchParams.get('location') || 'Hatteras Island, NC';
  const type = (searchParams.get('type') as 'restaurant' | 'activity' | 'attraction') || 'restaurant';

  try {
    const beacon = await getBeacon();
    const recommendations = await beacon.messaging.getLocalRecommendations(location, type);

    return NextResponse.json({
      success: true,
      recommendations,
      location,
      type,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
