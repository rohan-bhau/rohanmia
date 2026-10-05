import { Metadata } from 'next';
import { getMeetingBookingById } from '@/lib/postgres';
import CancelMeetingClient from './CancelMeetingClient';

export const metadata: Metadata = {
  title: 'Cancel Meeting — Rohan Mia',
  description: 'Manage or cancel your scheduled session with Rohan Mia.',
};

function formatHumanDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      const dateObj = new Date(Date.UTC(y, m - 1, d));
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });
    }
  } catch {
    // fallback
  }
  return dateStr;
}

function formatTimeRange(timeSlot: string, durationMinutes: number = 30): string {
  try {
    const match = timeSlot.match(/(\d+):(\d+)\s*(am|pm)?/i);
    if (!match) return timeSlot;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ap = match[3]?.toLowerCase();

    let startMinutes = (hours % 12) * 60 + minutes;
    if (ap === 'pm') {
      startMinutes += 12 * 60;
    }

    const endMinutes = (startMinutes + durationMinutes) % (24 * 60);

    const formatMins = (totalMins: number) => {
      let h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      const period = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      if (h === 0) h = 12;
      return `${h}:${m.toString().padStart(2, '0')} ${period}`;
    };

    return `${formatMins(startMinutes)} \u2013 ${formatMins(endMinutes)}`;
  } catch {
    return timeSlot;
  }
}

export default async function CancelMeetingPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  if (!id) {
    return <CancelMeetingClient booking={null} formattedDate="" timeRange="" />;
  }

  const booking = await getMeetingBookingById(id);

  if (!booking) {
    return <CancelMeetingClient booking={null} formattedDate="" timeRange="" />;
  }

  const formattedDate = formatHumanDate(booking.date);
  const timeRange = formatTimeRange(booking.time_slot, booking.duration || 30);

  return (
    <CancelMeetingClient
      booking={{
        id: booking.id,
        name: booking.name,
        email: booking.email,
        topic: booking.topic,
        date: booking.date,
        timeSlot: booking.time_slot,
        timezone: booking.timezone || 'Asia/Dhaka',
        status: booking.status,
        cancellationReason: booking.cancellation_reason,
      }}
      formattedDate={formattedDate}
      timeRange={timeRange}
    />
  );
}
