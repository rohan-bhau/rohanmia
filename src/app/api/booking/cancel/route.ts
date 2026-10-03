import { NextRequest, NextResponse } from 'next/server';
import { cancelMeetingBooking, getMeetingBookingById } from '@/lib/postgres';
import { sendMeetingCancellationEmails } from '@/lib/email';
import { pusherServer } from '@/lib/pusher';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const id = searchParams.get('id');

  // Instead of instantly cancelling on GET, redirect to the interactive cancellation page
  const targetUrl = new URL('/cancel-meeting', origin);
  if (id) {
    targetUrl.searchParams.set('id', id);
  }
  return NextResponse.redirect(targetUrl);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, reason } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Booking ID is required' }, { status: 400 });
    }

    const booking = await getMeetingBookingById(id);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json({ success: true, message: 'Already cancelled', alreadyCancelled: true });
    }

    // 1. Mark as cancelled in database with reason
    await cancelMeetingBooking(id, reason);

    // 2. Dispatch official cancellation emails to attendee and host with RFC 5545 CANCEL event
    try {
      await sendMeetingCancellationEmails({ booking, reason });
    } catch (emailErr) {
      console.warn('Failed to send cancellation emails:', emailErr);
    }

    // 3. Trigger Real-time Admin Notification via Pusher
    if (pusherServer) {
      try {
        await pusherServer.trigger('admin-notifications', 'booking-cancelled', {
          message: `Meeting on ${booking.date} at ${booking.time_slot} was cancelled by ${booking.name}`,
          bookingId: id,
          reason: reason || 'No reason provided',
        });
      } catch (pusherErr) {
        console.warn('Pusher trigger failed:', pusherErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cancellation error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to cancel meeting' }, { status: 500 });
  }
}
