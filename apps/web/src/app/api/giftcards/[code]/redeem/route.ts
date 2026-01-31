import { NextRequest, NextResponse } from 'next/server';
import { giftCardStore } from '../../store';

// POST /api/giftcards/[code]/redeem - Redeem gift card for a booking
export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const body = await request.json();
    const { amount, bookingId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const result = giftCardStore.redeemGiftCard(params.code, amount, bookingId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, success: false },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      amountRedeemed: amount,
      newBalance: result.newBalance,
      message: `Successfully redeemed $${amount} from gift card`,
    });
  } catch (error) {
    console.error('Redeem gift card error:', error);
    return NextResponse.json(
      { error: 'Failed to redeem gift card' },
      { status: 500 }
    );
  }
}
