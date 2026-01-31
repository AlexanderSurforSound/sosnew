import { NextRequest, NextResponse } from 'next/server';
import { reviewStore } from '../../store';

// POST /api/reviews/[reviewId]/helpful - Mark a review as helpful
export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const success = reviewStore.markHelpful(params.reviewId, sessionId);

    if (!success) {
      return NextResponse.json(
        { error: 'Review not found or already marked helpful' },
        { status: 400 }
      );
    }

    const review = reviewStore.getReview(params.reviewId);
    return NextResponse.json({ helpfulCount: review?.helpfulCount || 0 });
  } catch (error) {
    console.error('Mark helpful error:', error);
    return NextResponse.json({ error: 'Failed to mark review as helpful' }, { status: 500 });
  }
}
