'use server';

import { insertContactMessage, insertMeetingBooking } from '@/lib/postgres';
import { sendContactInquiryEmail, sendMeetingBookingEmails } from '@/lib/email';
import { pusherServer } from '@/lib/pusher';
import { revalidatePath } from 'next/cache';

export interface SendMessageInput {
  name: string;
  email: string;
  topic?: string;
  message: string;
}

export async function sendMessage(data: SendMessageInput) {
  try {
    if (!data.name || !data.email || !data.message) {
      return { success: false, error: 'Name, email, and message are required.' };
    }

    const savedMessage = await insertContactMessage({
      name: data.name.trim(),
      email: data.email.trim(),
      topic: data.topic?.trim() || 'General Inquiry',
      message: data.message.trim(),
    });

    // Send instant email notification to Rohan Mia with template
    try {
      await sendContactInquiryEmail({
        name: data.name.trim(),
        email: data.email.trim(),
        topic: data.topic?.trim() || 'General Inquiry',
        message: data.message.trim(),
      });
    } catch (emailErr) {
      console.warn('Contact email dispatch notice:', emailErr);
    }

    // Trigger Real-time Notification
    if (pusherServer) {
      try {
        await pusherServer.trigger('admin-notifications', 'new-message', {
          message: `New message from ${data.name}: ${data.topic || 'General'}`,
          sender: data.name,
        });
      } catch (pusherErr) {
        console.warn('Pusher trigger failed:', pusherErr);
      }
    }

    return { success: true, messageId: savedMessage.id };
  } catch (error: any) {
    console.error('Send Message Error (PostgreSQL):', error);
    return { success: false, error: error?.message || 'Failed to send message.' };
  }
}

export interface CreateBookingInput {
  name: string;
  email: string;
  topic: string;
  additionalNotes?: string;
  guests?: string | string[];
  date: string;
  timeSlot: string;
  timezone?: string;
  duration?: number;
}

export async function createBooking(data: CreateBookingInput) {
  try {
    if (!data.name || !data.email || !data.date || !data.timeSlot) {
      return { success: false, error: 'Name, email, date, and time slot are required.' };
    }

    // 1. Generate booking ID and send Google Meet link & RFC 5545 iCalendar invites
    const bookingId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    let meetLink = '';
    try {
      const emailRes = await sendMeetingBookingEmails({
        bookingId,
        name: data.name.trim(),
        email: data.email.trim(),
        topic: data.topic.trim(),
        additionalNotes: data.additionalNotes?.trim() || '',
        guests: data.guests,
        date: data.date,
        timeSlot: data.timeSlot,
        timezone: data.timezone || 'Asia/Dhaka',
        duration: data.duration || 30,
      });
      meetLink = emailRes.meetLink;
    } catch (emailErr) {
      console.warn('Booking email dispatch notice:', emailErr);
    }

    // 2. Save booking to PostgreSQL with Google Meet URL
    const savedBooking = await insertMeetingBooking({
      id: bookingId,
      name: data.name.trim(),
      email: data.email.trim(),
      topic: data.topic.trim(),
      additionalNotes: data.additionalNotes?.trim() || '',
      guests: data.guests,
      date: data.date,
      timeSlot: data.timeSlot,
      timezone: data.timezone || 'Asia/Dhaka',
      duration: data.duration || 30,
      meetLink: meetLink || undefined,
    });

    // 3. Trigger Real-time Notification
    if (pusherServer) {
      try {
        await pusherServer.trigger('admin-notifications', 'new-booking', {
          message: `New 30 Min Meeting booked by ${data.name} for ${data.date} at ${data.timeSlot}`,
          sender: data.name,
        });
      } catch (pusherErr) {
        console.warn('Pusher trigger failed:', pusherErr);
      }
    }

    return { success: true, bookingId: savedBooking.id, meetLink };
  } catch (error: any) {
    console.error('Create Booking Error (PostgreSQL):', error);
    return { success: false, error: error?.message || 'Failed to save booking.' };
  }
}

export async function getCalendlyAvailability({
  rangeStart,
  rangeEnd,
  timezone = 'Asia/Dhaka',
}: {
  rangeStart: string;
  rangeEnd: string;
  timezone?: string;
}) {
  try {
    const url = `https://calendly.com/api/booking/event_types/27a4a709-db82-41c7-a40d-3a26f7695704/calendar/range?timezone=${encodeURIComponent(
      timezone
    )}&diagnostics=false&range_start=${rangeStart}&range_end=${rangeEnd}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        Accept: 'application/json',
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      console.warn('Calendly availability fetch failed with status:', res.status);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching Calendly availability:', err);
    return null;
  }
}

export async function getContactData() {
  try {
    return {
      email: 'rohanmia.org@gmail.com',
      phone: '+880 1234 567890',
      address: 'Dhaka, Bangladesh',
      socials: [
        { name: 'Github', url: 'https://github.com/rohan-bhau' },
        { name: 'Linkedin', url: 'https://linkedin.com' },
        { name: 'Twitter', url: 'https://twitter.com' },
      ],
    };
  } catch (error) {
    console.error('Get Contact Error:', error);
    return null;
  }
}

export async function updateContactData(data: any) {
  try {
    revalidatePath('/contact');
    revalidatePath('/');
    return { success: true, data };
  } catch (error: any) {
    console.error('Update Contact Error:', error);
    return { success: false, error: error?.message };
  }
}
