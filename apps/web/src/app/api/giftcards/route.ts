import { NextRequest, NextResponse } from 'next/server';
import { giftCardStore } from './store';

// POST /api/giftcards - Create a new gift card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { amount, design, recipientName, recipientEmail, senderName, message, deliveryDate } =
      body;

    // Validate required fields
    if (!amount || amount < 25 || amount > 1000) {
      return NextResponse.json(
        { error: 'Amount must be between $25 and $1000' },
        { status: 400 }
      );
    }

    if (!recipientName || !recipientEmail || !senderName) {
      return NextResponse.json(
        { error: 'Recipient name, email, and sender name are required' },
        { status: 400 }
      );
    }

    // Create the gift card
    const giftCard = giftCardStore.createGiftCard({
      amount,
      design: design || 'ocean',
      recipientName,
      recipientEmail,
      senderName,
      message,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
    });

    // In production, this would:
    // 1. Process payment
    // 2. Store in database
    // 3. Queue email for delivery (immediate or scheduled)

    return NextResponse.json({
      success: true,
      giftCard: {
        code: giftCard.code,
        amount: giftCard.initialAmount,
        balance: giftCard.balance,
        design: giftCard.design,
        recipientName: giftCard.recipientName,
        recipientEmail: giftCard.recipientEmail,
        senderName: giftCard.senderName,
        message: giftCard.message,
        deliveryDate: giftCard.deliveryDate,
      },
    });
  } catch (error) {
    console.error('Create gift card error:', error);
    return NextResponse.json(
      { error: 'Failed to create gift card' },
      { status: 500 }
    );
  }
}
