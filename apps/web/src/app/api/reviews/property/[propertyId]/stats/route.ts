import { NextRequest, NextResponse } from 'next/server';
import { reviewStore } from '../../../store';

// GET /api/reviews/property/[propertyId]/stats - Get review stats for a property
export async function GET(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const stats = reviewStore.getStatsForProperty(params.propertyId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Get review stats error:', error);
    return NextResponse.json({ error: 'Failed to get review stats' }, { status: 500 });
  }
}
