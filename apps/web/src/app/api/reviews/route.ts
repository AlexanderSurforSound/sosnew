import { NextRequest, NextResponse } from 'next/server';
import { reviewStore, Review, CreateReviewRequest } from './store';

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body: CreateReviewRequest = await request.json();

    // Validate required fields
    if (!body.propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }
    if (!body.overallRating || body.overallRating < 1 || body.overallRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }
    if (!body.content || body.content.trim().length < 20) {
      return NextResponse.json({ error: 'Review must be at least 20 characters' }, { status: 400 });
    }

    const review = reviewStore.createReview(body);

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
