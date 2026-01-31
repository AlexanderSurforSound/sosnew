import { NextRequest, NextResponse } from 'next/server';

// In-memory bookings store for development
// In production, this would query from database

export interface Booking {
  id: string;
  userId: string;
  propertyId: string;
  propertyName: string;
  propertySlug: string;
  propertyImage: string;
  village: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  total: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  confirmationCode: string;
  createdAt: Date;
}

// Sample bookings for development
const sampleBookings: Booking[] = [
  {
    id: 'bk-1',
    userId: 'user-demo',
    propertyId: 'prop-1',
    propertyName: 'Oceanfront Paradise',
    propertySlug: 'oceanfront-paradise',
    propertyImage: '/images/properties/oceanfront-1.jpg',
    village: 'Rodanthe',
    checkIn: '2024-07-15',
    checkOut: '2024-07-22',
    guests: 6,
    total: 3150,
    status: 'upcoming',
    confirmationCode: 'SOS-2024-1234',
    createdAt: new Date('2024-05-01'),
  },
  {
    id: 'bk-2',
    userId: 'user-demo',
    propertyId: 'prop-2',
    propertyName: 'Sunset Retreat',
    propertySlug: 'sunset-retreat',
    propertyImage: '/images/properties/sunset-1.jpg',
    village: 'Avon',
    checkIn: '2024-03-10',
    checkOut: '2024-03-17',
    guests: 4,
    total: 2275,
    status: 'completed',
    confirmationCode: 'SOS-2024-0892',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'bk-3',
    userId: 'user-demo',
    propertyId: 'prop-3',
    propertyName: 'Beach Haven',
    propertySlug: 'beach-haven',
    propertyImage: '/images/properties/beach-1.jpg',
    village: 'Buxton',
    checkIn: '2023-08-05',
    checkOut: '2023-08-12',
    guests: 8,
    total: 3675,
    status: 'completed',
    confirmationCode: 'SOS-2023-4521',
    createdAt: new Date('2023-06-20'),
  },
  {
    id: 'bk-4',
    userId: 'user-demo',
    propertyId: 'prop-4',
    propertyName: 'Dunes Edge Cottage',
    propertySlug: 'dunes-edge-cottage',
    propertyImage: '/images/properties/dunes-1.jpg',
    village: 'Waves',
    checkIn: '2024-09-01',
    checkOut: '2024-09-08',
    guests: 5,
    total: 2850,
    status: 'upcoming',
    confirmationCode: 'SOS-2024-2567',
    createdAt: new Date('2024-06-10'),
  },
  {
    id: 'bk-5',
    userId: 'user-demo',
    propertyId: 'prop-5',
    propertyName: 'Lighthouse View',
    propertySlug: 'lighthouse-view',
    propertyImage: '/images/properties/lighthouse-1.jpg',
    village: 'Hatteras Village',
    checkIn: '2024-02-14',
    checkOut: '2024-02-21',
    guests: 2,
    total: 1890,
    status: 'cancelled',
    confirmationCode: 'SOS-2024-0456',
    createdAt: new Date('2023-12-05'),
  },
];

// GET /api/bookings - Get user's bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'upcoming', 'completed', 'cancelled', or null for all
    const userId = searchParams.get('userId') || 'user-demo'; // In production, get from session

    // Filter bookings
    let bookings = sampleBookings.filter((b) => b.userId === userId);

    if (status && status !== 'all') {
      bookings = bookings.filter((b) => b.status === status);
    }

    // Sort by check-in date (upcoming first, then by date)
    bookings.sort((a, b) => {
      if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
      if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
      return new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime();
    });

    return NextResponse.json({
      bookings: bookings.map((b) => ({
        id: b.id,
        propertyName: b.propertyName,
        propertySlug: b.propertySlug,
        propertyImage: b.propertyImage,
        village: b.village,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        guests: b.guests,
        total: b.total,
        status: b.status,
        confirmationCode: b.confirmationCode,
      })),
      total: bookings.length,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// POST /api/bookings - Create a new booking (placeholder)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, checkIn, checkOut, guests, paymentDetails } = body;

    // Validate required fields
    if (!propertyId || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { error: 'Property ID, check-in, check-out, and guests are required' },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Validate availability
    // 2. Process payment
    // 3. Create booking in database
    // 4. Send confirmation email
    // 5. Update Track PMS

    const confirmationCode = `SOS-${new Date().getFullYear()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    return NextResponse.json({
      success: true,
      booking: {
        id: `bk-${Date.now()}`,
        confirmationCode,
        status: 'upcoming',
        checkIn,
        checkOut,
        guests,
      },
      message: 'Booking created successfully',
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
