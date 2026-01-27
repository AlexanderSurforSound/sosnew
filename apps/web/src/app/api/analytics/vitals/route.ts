import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to receive Web Vitals metrics
 * POST /api/analytics/vitals
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      value,
      rating,
      delta,
      id,
      page,
      navigationType,
    } = body;

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${name}: ${Math.round(value)}ms (${rating})`);
    }

    // In production, send to your analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to your analytics database
      // await db.webVitals.create({
      //   data: {
      //     name,
      //     value,
      //     rating,
      //     delta,
      //     metricId: id,
      //     page,
      //     navigationType,
      //     timestamp: new Date(),
      //     userAgent: request.headers.get('user-agent'),
      //   },
      // });

      // Or send to external analytics (Google Analytics, etc.)
      // await sendToGoogleAnalytics(body);
    }

    // Return minimal response for performance
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[Web Vitals API Error]', error);
    return NextResponse.json({ error: 'Failed to process metrics' }, { status: 500 });
  }
}

/**
 * Health check for the vitals endpoint
 */
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
