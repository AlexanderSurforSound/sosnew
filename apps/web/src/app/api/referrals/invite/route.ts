import { NextRequest, NextResponse } from 'next/server';

// POST /api/referrals/invite - Send referral invites via email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emails, referralCode, senderName } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'At least one email address is required' }, { status: 400 });
    }

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    // Validate emails
    const validEmails: string[] = [];
    const invalidEmails: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const email of emails) {
      const trimmed = email.trim().toLowerCase();
      if (emailRegex.test(trimmed)) {
        validEmails.push(trimmed);
      } else {
        invalidEmails.push(email);
      }
    }

    if (validEmails.length === 0) {
      return NextResponse.json({ error: 'No valid email addresses provided' }, { status: 400 });
    }

    // In production, this would:
    // 1. Check if emails are already registered users
    // 2. Queue emails for sending via email service (SendGrid, AWS SES, etc.)
    // 3. Track pending referrals in database
    // 4. Apply rate limiting

    // Simulate sending invites
    const sentCount = validEmails.length;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://surforsound.com';

    // Log for development
    console.log('Referral invites sent:', {
      referralCode,
      senderName,
      emails: validEmails,
      referralLink: `${baseUrl}/ref/${referralCode}`,
    });

    return NextResponse.json({
      success: true,
      sent: sentCount,
      message: `Invitations sent to ${sentCount} friend${sentCount > 1 ? 's' : ''}`,
      invalidEmails: invalidEmails.length > 0 ? invalidEmails : undefined,
    });
  } catch (error) {
    console.error('Send invites error:', error);
    return NextResponse.json({ error: 'Failed to send invitations' }, { status: 500 });
  }
}
