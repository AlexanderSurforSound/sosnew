import { NextRequest, NextResponse } from 'next/server';
import { giftCardStore } from '../store';

// GET /api/giftcards/[code] - Get gift card details (for balance check)
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const giftCard = giftCardStore.getByCode(params.code);

    if (!giftCard) {
      return NextResponse.json(
        { error: 'Gift card not found', valid: false },
        { status: 404 }
      );
    }

    // Return gift card info (excluding sensitive data)
    return NextResponse.json({
      valid: true,
      code: giftCard.code,
      balance: giftCard.balance,
      initialAmount: giftCard.initialAmount,
      design: giftCard.design,
      recipientName: giftCard.recipientName,
      isFullyRedeemed: giftCard.redeemed,
      redemptionCount: giftCard.redemptions.length,
    });
  } catch (error) {
    console.error('Get gift card error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve gift card' },
      { status: 500 }
    );
  }
}
