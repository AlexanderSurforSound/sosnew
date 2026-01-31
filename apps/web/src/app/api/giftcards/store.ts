// In-memory gift card store for development
// In production, this would be replaced with a database

export interface GiftCard {
  id: string;
  code: string;
  initialAmount: number;
  balance: number;
  design: string;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  message?: string;
  purchaseDate: Date;
  deliveryDate: Date;
  delivered: boolean;
  redeemed: boolean;
  redemptions: Array<{
    bookingId: string;
    amount: number;
    date: Date;
  }>;
}

export interface CreateGiftCardRequest {
  amount: number;
  design: string;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  message?: string;
  deliveryDate?: Date;
}

// Generate a unique gift card code
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars like 0, O, I, 1
  const segment = () => {
    let s = '';
    for (let i = 0; i < 4; i++) {
      s += chars[Math.floor(Math.random() * chars.length)];
    }
    return s;
  };
  return `SOS-${segment()}-${segment()}`;
}

// Sample gift cards for development
const sampleGiftCards: GiftCard[] = [
  {
    id: 'gc-1',
    code: 'SOS-DEMO-CARD',
    initialAmount: 500,
    balance: 350,
    design: 'ocean',
    recipientName: 'John Doe',
    recipientEmail: 'john@example.com',
    senderName: 'Jane Smith',
    message: 'Enjoy your beach vacation!',
    purchaseDate: new Date('2024-06-01'),
    deliveryDate: new Date('2024-06-01'),
    delivered: true,
    redeemed: false,
    redemptions: [
      {
        bookingId: 'bk-123',
        amount: 150,
        date: new Date('2024-07-15'),
      },
    ],
  },
  {
    id: 'gc-2',
    code: 'SOS-TEST-GIFT',
    initialAmount: 250,
    balance: 250,
    design: 'sunset',
    recipientName: 'Sarah Johnson',
    recipientEmail: 'sarah@example.com',
    senderName: 'Mike Chen',
    message: 'Happy Birthday! Treat yourself to a beach getaway.',
    purchaseDate: new Date('2024-08-10'),
    deliveryDate: new Date('2024-08-15'),
    delivered: true,
    redeemed: false,
    redemptions: [],
  },
  {
    id: 'gc-3',
    code: 'SOS-FULL-CARD',
    initialAmount: 1000,
    balance: 1000,
    design: 'tropical',
    recipientName: 'Test User',
    recipientEmail: 'test@example.com',
    senderName: 'Demo Sender',
    purchaseDate: new Date('2024-09-01'),
    deliveryDate: new Date('2024-09-01'),
    delivered: true,
    redeemed: false,
    redemptions: [],
  },
];

class GiftCardStore {
  private giftCards: Map<string, GiftCard> = new Map();

  constructor() {
    // Initialize with sample data
    sampleGiftCards.forEach((gc) => {
      this.giftCards.set(gc.code, gc);
    });
  }

  // Create a new gift card
  createGiftCard(request: CreateGiftCardRequest): GiftCard {
    const code = generateCode();
    const now = new Date();

    const giftCard: GiftCard = {
      id: `gc-${Date.now()}`,
      code,
      initialAmount: request.amount,
      balance: request.amount,
      design: request.design,
      recipientName: request.recipientName,
      recipientEmail: request.recipientEmail,
      senderName: request.senderName,
      message: request.message,
      purchaseDate: now,
      deliveryDate: request.deliveryDate || now,
      delivered: !request.deliveryDate || request.deliveryDate <= now,
      redeemed: false,
      redemptions: [],
    };

    this.giftCards.set(code, giftCard);
    return giftCard;
  }

  // Get gift card by code
  getByCode(code: string): GiftCard | null {
    return this.giftCards.get(code.toUpperCase()) || null;
  }

  // Redeem gift card (apply to booking)
  redeemGiftCard(
    code: string,
    amount: number,
    bookingId: string
  ): { success: boolean; error?: string; newBalance?: number } {
    const giftCard = this.giftCards.get(code.toUpperCase());

    if (!giftCard) {
      return { success: false, error: 'Gift card not found' };
    }

    if (giftCard.balance <= 0) {
      return { success: false, error: 'Gift card has no remaining balance' };
    }

    if (amount > giftCard.balance) {
      return {
        success: false,
        error: `Requested amount exceeds balance. Available: $${giftCard.balance}`,
      };
    }

    // Apply redemption
    giftCard.balance -= amount;
    giftCard.redemptions.push({
      bookingId,
      amount,
      date: new Date(),
    });

    if (giftCard.balance === 0) {
      giftCard.redeemed = true;
    }

    return { success: true, newBalance: giftCard.balance };
  }

  // Check if code exists (for validation)
  isValidCode(code: string): boolean {
    return this.giftCards.has(code.toUpperCase());
  }
}

export const giftCardStore = new GiftCardStore();
