import { NextRequest, NextResponse } from 'next/server';
import { reviewStore } from '../../store';

// GET /api/reviews/property/[propertyId] - Get reviews for a property
export async function GET(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const result = reviewStore.getReviewsForProperty(params.propertyId, page, pageSize);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json({ error: 'Failed to get reviews' }, { status: 500 });
  }
}
