import { NextRequest, NextResponse } from 'next/server';

// In-memory check-in store for development
// In production, this would be replaced with a database

interface CheckinRecord {
  id: string;
  bookingId: string;
  propertyId: string;
  guestInfo: {
    name: string;
    email: string;
    phone: string;
    guests: number;
    arrivalTime?: string;
    licensePlate?: string;
  };
  checkinTime: Date;
  rulesAccepted: boolean;
  accessCodeSent: boolean;
}

const checkinRecords: Map<string, CheckinRecord> = new Map();

// Sample check-in records
checkinRecords.set('chk-demo-1', {
  id: 'chk-demo-1',
  bookingId: 'bk-123',
  propertyId: 'prop-oceanfront-paradise',
  guestInfo: {
    name: 'John Smith',
    email: 'john@example.com',
    phone: '555-123-4567',
    guests: 4,
    arrivalTime: '15:00',
    licensePlate: 'ABC-1234',
  },
  checkinTime: new Date('2024-07-15T14:30:00'),
  rulesAccepted: true,
  accessCodeSent: true,
});

// POST /api/checkin - Submit check-in information
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, propertyId, guestInfo, rulesAccepted } = body;

    // Validate required fields
    if (!bookingId || !propertyId) {
      return NextResponse.json(
        { error: 'Booking ID and Property ID are required' },
        { status: 400 }
      );
    }

    if (!guestInfo?.name || !guestInfo?.phone) {
      return NextResponse.json(
        { error: 'Guest name and phone are required' },
        { status: 400 }
      );
    }

    if (!rulesAccepted) {
      return NextResponse.json(
        { error: 'House rules must be accepted' },
        { status: 400 }
      );
    }

    // Create check-in record
    const checkinId = `chk-${Date.now()}`;
    const record: CheckinRecord = {
      id: checkinId,
      bookingId,
      propertyId,
      guestInfo: {
        name: guestInfo.name,
        email: guestInfo.email || '',
        phone: guestInfo.phone,
        guests: guestInfo.guests || 1,
        arrivalTime: guestInfo.arrivalTime,
        licensePlate: guestInfo.licensePlate,
      },
      checkinTime: new Date(),
      rulesAccepted: true,
      accessCodeSent: false,
    };

    checkinRecords.set(checkinId, record);

    // In production, this would:
    // 1. Save to database
    // 2. Send confirmation email with access codes
    // 3. Notify property manager
    // 4. Update booking status in Track PMS
    // 5. Generate/send digital key if using smart locks

    // Simulate sending access code (in production would be real)
    record.accessCodeSent = true;

    // Return success with property access info
    // In production, this would come from the actual booking/property data
    return NextResponse.json({
      success: true,
      checkinId,
      message: 'Check-in completed successfully',
      accessInfo: {
        lockCode: '1234', // Would come from property data
        wifiName: 'BeachHouse_Guest',
        wifiPassword: 'welcome2024',
        checkInTime: '4:00 PM',
        checkOutTime: '10:00 AM',
        emergencyContact: '(252) 555-0123',
        parkingInfo: 'Parking available in driveway. Additional street parking available.',
      },
      confirmationSent: true,
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Failed to complete check-in' },
      { status: 500 }
    );
  }
}

// GET /api/checkin?bookingId=xxx - Get check-in status for a booking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Find check-in record for this booking
    let checkinRecord: CheckinRecord | null = null;
    for (const record of checkinRecords.values()) {
      if (record.bookingId === bookingId) {
        checkinRecord = record;
        break;
      }
    }

    if (!checkinRecord) {
      return NextResponse.json({
        checkedIn: false,
        message: 'No check-in found for this booking',
      });
    }

    return NextResponse.json({
      checkedIn: true,
      checkinId: checkinRecord.id,
      checkinTime: checkinRecord.checkinTime,
      guestName: checkinRecord.guestInfo.name,
      guestCount: checkinRecord.guestInfo.guests,
    });
  } catch (error) {
    console.error('Get check-in error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve check-in status' },
      { status: 500 }
    );
  }
}
