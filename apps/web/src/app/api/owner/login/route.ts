import { NextRequest, NextResponse } from 'next/server';

// In-memory owner store for development
// In production, this would be replaced with a database and proper auth

interface Owner {
  id: string;
  email: string;
  passwordHash: string; // In production, use proper hashing
  name: string;
  phone: string;
  properties: Array<{
    id: string;
    name: string;
    address: string;
  }>;
}

// Sample owners for development
const owners: Map<string, Owner> = new Map([
  [
    'owner@example.com',
    {
      id: 'owner-1',
      email: 'owner@example.com',
      passwordHash: 'demo123', // In production, use bcrypt or similar
      name: 'John Owner',
      phone: '(252) 555-0100',
      properties: [
        {
          id: 'prop-oceanfront-paradise',
          name: 'Oceanfront Paradise',
          address: '123 Beach Road, Avon, NC 27915',
        },
        {
          id: 'prop-sunset-retreat',
          name: 'Sunset Retreat',
          address: '456 Dune Way, Buxton, NC 27920',
        },
      ],
    },
  ],
  [
    'demo@surforsound.com',
    {
      id: 'owner-demo',
      email: 'demo@surforsound.com',
      passwordHash: 'password', // In production, use bcrypt or similar
      name: 'Demo Owner',
      phone: '(252) 555-0200',
      properties: [
        {
          id: 'prop-beach-haven',
          name: 'Beach Haven',
          address: '789 Ocean Drive, Rodanthe, NC 27968',
        },
      ],
    },
  ],
]);

// Simple session store (in production, use proper session management)
const sessions: Map<string, { ownerId: string; email: string; expiresAt: Date }> = new Map();

function generateSessionToken(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// POST /api/owner/login - Authenticate owner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find owner by email
    const owner = owners.get(email.toLowerCase());

    if (!owner) {
      // Don't reveal whether email exists
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password (in production, use bcrypt.compare)
    if (owner.passwordHash !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 1)); // 30 days or 1 day

    sessions.set(sessionToken, {
      ownerId: owner.id,
      email: owner.email,
      expiresAt,
    });

    // Return success with session token
    const response = NextResponse.json({
      success: true,
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        propertyCount: owner.properties.length,
      },
      redirectTo: '/owner-portal/dashboard',
    });

    // Set session cookie
    response.cookies.set('owner_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Owner login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
