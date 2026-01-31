import { NextRequest, NextResponse } from 'next/server';

// In-memory referral store for development
// In production, this would be replaced with a database

interface Referral {
  id: string;
  referrerId: string;
  name: string;
  email: string;
  status: 'pending' | 'signed_up' | 'booked' | 'completed';
  dateReferred: Date;
  rewardAmount?: number;
}

interface UserReferralData {
  userId: string;
  referralCode: string;
  rewardAmount: number;
  friendReward: number;
  totalEarned: number;
  referrals: Referral[];
}

// Generate a unique referral code
function generateReferralCode(userId: string): string {
  const prefix = 'BEACH';
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${suffix}`;
}

// Sample referral data for development
const userReferralData: Map<string, UserReferralData> = new Map([
  [
    'user-demo',
    {
      userId: 'user-demo',
      referralCode: 'BEACH2024',
      rewardAmount: 75,
      friendReward: 50,
      totalEarned: 225,
      referrals: [
        {
          id: 'ref-1',
          referrerId: 'user-demo',
          name: 'Sarah Johnson',
          email: 'sarah@email.com',
          status: 'completed',
          dateReferred: new Date(Date.now() - 86400000 * 30),
          rewardAmount: 75,
        },
        {
          id: 'ref-2',
          referrerId: 'user-demo',
          name: 'Mike Chen',
          email: 'mike@email.com',
          status: 'completed',
          dateReferred: new Date(Date.now() - 86400000 * 20),
          rewardAmount: 75,
        },
        {
          id: 'ref-3',
          referrerId: 'user-demo',
          name: 'Emily Davis',
          email: 'emily@email.com',
          status: 'completed',
          dateReferred: new Date(Date.now() - 86400000 * 10),
          rewardAmount: 75,
        },
        {
          id: 'ref-4',
          referrerId: 'user-demo',
          name: 'Alex Wilson',
          email: 'alex@email.com',
          status: 'booked',
          dateReferred: new Date(Date.now() - 86400000 * 5),
        },
        {
          id: 'ref-5',
          referrerId: 'user-demo',
          name: 'Jessica Brown',
          email: 'jessica@email.com',
          status: 'signed_up',
          dateReferred: new Date(Date.now() - 86400000 * 2),
        },
      ],
    },
  ],
]);

// GET /api/referrals - Get user's referral data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-demo'; // In production, get from session

    let userData = userReferralData.get(userId);

    // Create new referral data for user if doesn't exist
    if (!userData) {
      userData = {
        userId,
        referralCode: generateReferralCode(userId),
        rewardAmount: 75,
        friendReward: 50,
        totalEarned: 0,
        referrals: [],
      };
      userReferralData.set(userId, userData);
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://surforsound.com';

    return NextResponse.json({
      referralCode: userData.referralCode,
      referralLink: `${baseUrl}/ref/${userData.referralCode}`,
      rewardAmount: userData.rewardAmount,
      friendReward: userData.friendReward,
      totalEarned: userData.totalEarned,
      referrals: userData.referrals.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email
        status: r.status,
        dateReferred: r.dateReferred.toISOString(),
        rewardAmount: r.rewardAmount,
      })),
      stats: {
        totalReferrals: userData.referrals.length,
        completedReferrals: userData.referrals.filter((r) => r.status === 'completed').length,
        pendingRewards:
          userData.referrals.filter((r) => r.status === 'booked' || r.status === 'signed_up')
            .length * userData.rewardAmount,
      },
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    return NextResponse.json({ error: 'Failed to fetch referral data' }, { status: 500 });
  }
}

// POST /api/referrals - Create/validate a referral code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    // Find referrer by code
    let referrer: UserReferralData | undefined;
    for (const userData of userReferralData.values()) {
      if (userData.referralCode === code.toUpperCase()) {
        referrer = userData;
        break;
      }
    }

    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code', valid: false }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      discount: referrer.friendReward,
      message: `You'll get $${referrer.friendReward} off your first booking!`,
    });
  } catch (error) {
    console.error('Validate referral error:', error);
    return NextResponse.json({ error: 'Failed to validate referral' }, { status: 500 });
  }
}
