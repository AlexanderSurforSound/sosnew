import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Sample owner data for development
// In production, this would query from database based on session

interface OwnerDashboardData {
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  properties: Array<{
    id: string;
    name: string;
    address: string;
    thumbnail: string;
    status: 'active' | 'inactive';
    currentBooking?: {
      guestName: string;
      checkIn: string;
      checkOut: string;
    };
    nextBooking?: {
      guestName: string;
      checkIn: string;
      checkOut: string;
    };
  }>;
  stats: {
    totalRevenue: number;
    revenueThisMonth: number;
    totalBookings: number;
    occupancyRate: number;
    upcomingBookings: number;
    averageRating: number;
  };
  recentBookings: Array<{
    id: string;
    propertyName: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    status: 'confirmed' | 'checked-in' | 'completed' | 'cancelled';
    revenue: number;
  }>;
}

// Mock dashboard data
const mockDashboardData: OwnerDashboardData = {
  owner: {
    id: 'owner-1',
    name: 'John Owner',
    email: 'owner@example.com',
    phone: '(252) 555-0100',
  },
  properties: [
    {
      id: 'prop-oceanfront-paradise',
      name: 'Oceanfront Paradise',
      address: '123 Beach Road, Avon, NC 27915',
      thumbnail: '/images/properties/oceanfront-paradise.jpg',
      status: 'active',
      currentBooking: {
        guestName: 'The Smith Family',
        checkIn: '2024-01-20',
        checkOut: '2024-01-27',
      },
      nextBooking: {
        guestName: 'Mike Johnson',
        checkIn: '2024-02-03',
        checkOut: '2024-02-10',
      },
    },
    {
      id: 'prop-sunset-retreat',
      name: 'Sunset Retreat',
      address: '456 Dune Way, Buxton, NC 27920',
      thumbnail: '/images/properties/sunset-retreat.jpg',
      status: 'active',
      nextBooking: {
        guestName: 'Sarah Williams',
        checkIn: '2024-01-28',
        checkOut: '2024-02-04',
      },
    },
  ],
  stats: {
    totalRevenue: 87500,
    revenueThisMonth: 12400,
    totalBookings: 47,
    occupancyRate: 72,
    upcomingBookings: 8,
    averageRating: 4.8,
  },
  recentBookings: [
    {
      id: 'bk-1001',
      propertyName: 'Oceanfront Paradise',
      guestName: 'The Smith Family',
      checkIn: '2024-01-20',
      checkOut: '2024-01-27',
      status: 'checked-in',
      revenue: 3200,
    },
    {
      id: 'bk-1002',
      propertyName: 'Sunset Retreat',
      guestName: 'David Chen',
      checkIn: '2024-01-13',
      checkOut: '2024-01-20',
      status: 'completed',
      revenue: 2800,
    },
    {
      id: 'bk-1003',
      propertyName: 'Oceanfront Paradise',
      guestName: 'Emily Davis',
      checkIn: '2024-01-06',
      checkOut: '2024-01-13',
      status: 'completed',
      revenue: 3200,
    },
    {
      id: 'bk-1004',
      propertyName: 'Sunset Retreat',
      guestName: 'Sarah Williams',
      checkIn: '2024-01-28',
      checkOut: '2024-02-04',
      status: 'confirmed',
      revenue: 2800,
    },
    {
      id: 'bk-1005',
      propertyName: 'Oceanfront Paradise',
      guestName: 'Mike Johnson',
      checkIn: '2024-02-03',
      checkOut: '2024-02-10',
      status: 'confirmed',
      revenue: 3200,
    },
  ],
};

// GET /api/owner/me - Get current owner's dashboard data
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('owner_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated', authenticated: false },
        { status: 401 }
      );
    }

    // In production, validate session token and fetch real data
    // For now, return mock data

    return NextResponse.json({
      authenticated: true,
      ...mockDashboardData,
    });
  } catch (error) {
    console.error('Get owner data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch owner data' },
      { status: 500 }
    );
  }
}
