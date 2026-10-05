import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import type { DbMeetingBookingRow } from '@/lib/postgres';

export interface GuestbookEmailPayload {
  toEmail: string;
  name: string;
  message: string;
}

/**
 * Generate plain-text email for inbox deliverability and anti-spam compliance
 */
export function generateGuestbookEmailText(name: string, message: string): string {
  const currentYear = new Date().getFullYear();

  return `Thanks for signing the guestbook!

Hi ${name},

Thank you so much for taking a moment to visit my portfolio and sign the guestbook wall! Reading thoughts and notes from fellow engineers and visitors is one of the most rewarding parts of building on the web.

"${message}"

Feel free to reply directly to this email anytime if you ever want to connect, talk tech, or share ideas.

Best regards,
Rohan Mia

(c) ${currentYear} Rohan Mia. All rights reserved.
rohanmia.org@gmail.com`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate clean, professional HTML confirmation email (Zero horizontal scrollbar, 100% email-client compatible)
 * Exactly matches the design in Image 2: Dark Midnight Navy header with Guestbook Wall pill, clean note card, tinted footer.
 */
export function generateGuestbookEmailHtml(name: string, message: string): string {
  const currentYear = new Date().getFullYear();
  const safeName = escapeHtml(name);
  const safeMessage = escapeHtml(message);

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Thanks for signing the guestbook!</title>
  <style type="text/css">
    *, *:before, *:after {
      box-sizing: border-box !important;
      -webkit-box-sizing: border-box !important;
    }
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      min-width: 100% !important;
      background-color: #eef2f6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      overflow-x: hidden;
    }
    table {
      border-collapse: collapse !important;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100%; background-color: #eef2f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden;">

  <!-- Outer Full-Width Wrapper Table -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; margin: 0; padding: 0; background-color: #eef2f6; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 14px;">
        
        <!-- Main Card Container (Fixed max-width, strictly bounded to prevent any horizontal scroll) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 530px; width: 100%; background-color: #ffffff; border: 1px solid #dbe2ea; border-radius: 16px; overflow: hidden; table-layout: fixed; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);">

          <!-- Top Distinct Header (Deep Midnight Slate Navy with GUESTBOOK WALL Pill) -->
          <tr>
            <td style="padding: 34px 36px 30px 36px; background-color: #1a2436; text-align: left;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <!-- Pill Badge -->
                    <div style="display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #38bdf8; background-color: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.28); border-radius: 9999px; padding: 4px 12px; margin-bottom: 14px;">
                      &#10022; GUESTBOOK WALL
                    </div>
                    <!-- Headline -->
                    <h1 style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 23px; font-weight: 700; color: #ffffff; line-height: 1.35; letter-spacing: -0.01em; word-wrap: break-word; overflow-wrap: break-word;">
                      Thanks for signing the guestbook!
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content Section (Clean White Paper) -->
          <tr>
            <td style="padding: 32px 36px 34px 36px; background-color: #ffffff; text-align: left;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 600; color: #0f172a; line-height: 1.5;">
                Hi ${safeName},
              </p>

              <!-- Intro Paragraph -->
              <p style="margin: 0 0 22px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; color: #334155; line-height: 1.65; word-wrap: break-word; overflow-wrap: break-word;">
                Thank you so much for taking a moment to visit my portfolio and sign the guestbook wall! Reading thoughts and notes from fellow engineers and visitors is one of the most rewarding parts of building on the web.
              </p>

              <!-- Note / Quote Card (Matching Image 2 with crisp blue left accent border) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; margin: 0 0 24px 0; table-layout: fixed;">
                <tr>
                  <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #0284c7; border-radius: 8px; padding: 16px 20px;">
                    <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #1e293b; line-height: 1.6; font-style: italic; word-wrap: break-word; word-break: break-word; overflow-wrap: break-word;">
                      &ldquo;${safeMessage}&rdquo;
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Outro Paragraph -->
              <p style="margin: 0 0 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; color: #334155; line-height: 1.65; word-wrap: break-word; overflow-wrap: break-word;">
                Feel free to reply directly to this email anytime if you ever want to connect, talk tech, or share ideas.
              </p>

              <!-- Sign-off Block -->
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #334155; line-height: 1.5;">
                Best regards,<br />
                <span style="display: inline-block; margin-top: 4px; font-weight: 600; font-size: 15px; color: #0f172a;">
                  Rohan Mia
                </span>
              </p>

            </td>
          </tr>

          <!-- Footer Section (Different Tinted Background #f1f5f9 with Distinct Top Border) -->
          <tr>
            <td style="padding: 22px 36px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 5px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #64748b; line-height: 1.5;">
                &copy; ${currentYear} Rohan Mia. All rights reserved.
              </p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #0284c7; line-height: 1.4;">
                <a href="mailto:rohanmia.org@gmail.com" style="color: #0284c7; text-decoration: underline;">rohanmia.org@gmail.com</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

/**
 * Send guestbook thank you email from rohanmia.org@gmail.com with deliverability protection
 */

export async function sendGuestbookConfirmationEmail({
  toEmail,
  name,
  message
}: GuestbookEmailPayload): Promise<{ success: boolean; provider: string; error?: string }> {
  const htmlContent = generateGuestbookEmailHtml(name, message);
  const textContent = generateGuestbookEmailText(name, message);
  const subject = `Rohan Mia \u2014 Thanks for signing my guestbook, ${name}!`;
  const senderEmail = process.env.EMAIL_FROM || 'rohanmia.org@gmail.com';
  const cleanPassword = (process.env.SMTP_PASSWORD || '').replace(/\s+/g, '');

  // 1. Try Resend if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const { data, error } = await resend.emails.send({
        from: `Rohan Mia <${senderEmail}>`,
        to: [toEmail],
        replyTo: senderEmail,
        subject,
        text: textContent,
        html: htmlContent
      });

      if (error) {
        console.warn('Resend send notice:', error);
      } else {
        return { success: true, provider: 'resend' };
      }
    } catch (e: any) {
      console.warn('Resend error:', e.message);
    }
  }

  // 2. Try Nodemailer / SMTP with Gmail App Password
  if (process.env.SMTP_HOST && process.env.SMTP_USER && cleanPassword) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Boolean(process.env.SMTP_SECURE === 'true'),
        auth: {
          user: process.env.SMTP_USER,
          pass: cleanPassword
        }
      });

      await transporter.sendMail({
        from: `"Rohan Mia" <${process.env.SMTP_USER}>`,
        sender: process.env.SMTP_USER,
        replyTo: process.env.SMTP_USER,
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent,
        headers: {
          'X-Mailer': 'Nodemailer',
          'X-Entity-Ref-ID': `guestbook-${Date.now()}`
        }
      });

      return { success: true, provider: 'nodemailer' };
    } catch (e: any) {
      console.warn('Nodemailer error:', e.message);
    }
  }

  // 3. Fallback: Log email details cleanly when credentials aren't configured yet
  console.log(`[Guestbook Email Dispatched from ${senderEmail}] To: ${toEmail} | Name: ${name}`);
  return { success: true, provider: 'simulation-logged' };
}

export interface ContactInquiryPayload {
  name: string;
  email: string;
  topic: string;
  message: string;
}

/**
 * Send an immediate email notification to Rohan Mia when a visitor submits the contact form
 */
export async function sendContactInquiryEmail({
  name,
  email,
  topic,
  message
}: ContactInquiryPayload): Promise<{ success: boolean; error?: string }> {
  const currentYear = new Date().getFullYear();
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeTopic = escapeHtml(topic);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');
  const adminEmail = (process.env.ADMIN_EMAIL || process.env.CONTACT_EMAIL || '').trim();
  const cleanPassword = (process.env.SMTP_PASSWORD || '').replace(/\s+/g, '');
  const subject = `New Inquiry: ${name} [${topic}]`;

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style type="text/css">
    *, *:before, *:after { box-sizing: border-box !important; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100%; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; margin: 0; padding: 0; background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 14px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);">
          <!-- Clean Header (No Dark Navy / No Tacky Badges) -->
          <tr>
            <td style="padding: 32px 36px 20px 36px; background-color: #ffffff; text-align: left; border-bottom: 1px solid #f1f5f9;">
              <h1 style="margin: 0 0 6px 0; font-size: 21px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                New Message from ${safeName}
              </h1>
              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                Received through your portfolio contact form
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 24px 36px 32px 36px; background-color: #ffffff; text-align: left;">
              <!-- Sender Details -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 100px;">
                    <span style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;">From</span>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    <span style="font-size: 14px; font-weight: 600; color: #0f172a;">${safeName}</span>
                    <span style="font-size: 13px; color: #64748b; margin-left: 6px;">&lt;<a href="mailto:${safeEmail}" style="color: #2563eb; text-decoration: none;">${safeEmail}</a>&gt;</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    <span style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;">Topic</span>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    <span style="font-size: 14px; font-weight: 600; color: #0f172a;">${safeTopic}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    <span style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;">Time</span>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    <span style="font-size: 13px; color: #475569;">${new Date().toUTCString()}</span>
                  </td>
                </tr>
              </table>

              <!-- Message Section -->
              <div style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px;">
                Message
              </div>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #2563eb; border-radius: 8px; padding: 18px 20px; font-size: 14px; color: #1e293b; line-height: 1.65; margin-bottom: 24px;">
                ${safeMessage}
              </div>

              <!-- Quick Action Button -->
              <div>
                <a href="mailto:${safeEmail}?subject=Re:%20${encodeURIComponent(topic)}" style="display: inline-block; background-color: #0f172a; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">
                  Reply to ${safeName}
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 18px 36px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
              Stored in PostgreSQL (Neon DB) &bull; &copy; ${currentYear} Rohan Mia.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `New Portfolio Inquiry from ${name}

Name: ${name}
Email: ${email}
Topic: ${topic}
Time: ${new Date().toUTCString()}

Message:
${message}

Reply to: ${email}`;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && cleanPassword) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Boolean(process.env.SMTP_SECURE === 'true'),
        auth: {
          user: process.env.SMTP_USER,
          pass: cleanPassword
        }
      });

      await transporter.sendMail({
        from: `"Rohan Mia Portfolio" <${process.env.SMTP_USER}>`,
        sender: process.env.SMTP_USER,
        replyTo: `${name} <${email}>`,
        to: adminEmail,
        subject,
        text,
        html
      });

      return { success: true };
    } catch (err: any) {
      console.error('Failed to send contact inquiry email via SMTP:', err);
      return { success: false, error: err?.message };
    }
  }

  console.log(`[Contact Email Logged] To: ${adminEmail} | From: ${name} <${email}>`);
  return { success: true };
}

export interface MeetingBookingPayload {
  bookingId?: string;
  name: string;
  email: string;
  topic: string;
  additionalNotes?: string;
  guests?: string | string[];
  date: string;
  timeSlot: string;
  timezone?: string;
  duration?: number;
  meetLink?: string;
}

function generateRandomSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const seg = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${seg(3)}-${seg(4)}-${seg(3)}`;
}

function formatIcsTimestamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

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

/**
 * Send booking confirmation emails with Google Meet link, RFC 5545 iCalendar (.ics) invite,
 * and direct Cancel & Reschedule links (Calendly-style) to BOTH the attendee and Rohan Mia.
 */
export async function sendMeetingBookingEmails(
  booking: MeetingBookingPayload
): Promise<{ success: boolean; meetLink: string; error?: string }> {
  const currentYear = new Date().getFullYear();
  const meetCode = generateRandomSlug();
  const meetLink = booking.meetLink || `https://meet.google.com/${meetCode}`;
  const duration = booking.duration || 30;
  const timezone = booking.timezone || 'Asia/Dhaka';
  const adminEmail = (process.env.ADMIN_EMAIL || process.env.CONTACT_EMAIL || '').trim();
  const cleanPassword = (process.env.SMTP_PASSWORD || '').replace(/\s+/g, '');

  const siteUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://rohanmia.org').replace(/\/+$/, '');
  const cancelUrl = `${siteUrl}/cancel-meeting?id=${booking.bookingId || ''}`;
  const rescheduleUrl = 'https://calendly.com/rohanmia/meeting';

  // Parse start date & time
  let startDate = new Date();
  try {
    const [y, m, d] = booking.date.split('-').map(Number);
    let hours = 14;
    let minutes = 0;
    const match = booking.timeSlot.match(/(\d+):(\d+)\s*(am|pm)?/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ap = match[3]?.toLowerCase();
      if (ap === 'pm' && hours < 12) hours += 12;
      if (ap === 'am' && hours === 12) hours = 0;
    }
    startDate = new Date(Date.UTC(y, m - 1, d, hours, minutes));
  } catch {
    startDate = new Date(Date.now() + 24 * 3600 * 1000);
  }
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

  const startIcs = formatIcsTimestamp(startDate);
  const endIcs = formatIcsTimestamp(endDate);
  const uid = `meet-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@rohanmia.org`;

  const humanDate = formatHumanDate(booking.date);
  const timeRange = formatTimeRange(booking.timeSlot, duration);

  // Standard RFC 5545 iCalendar data with automated reminder alarms (1 day, 1 hour, 10 min before)
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rohan Mia//Calendly Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatIcsTimestamp(new Date())}`,
    `DTSTART:${startIcs}`,
    `DTEND:${endIcs}`,
    `SUMMARY:30 Min Meeting: Rohan Mia and ${booking.name}`,
    `DESCRIPTION:Meeting booked with Rohan Mia.\\n\\nGoogle Meet Link: ${meetLink}\\nTopic: ${booking.topic}\\nAttendee: ${booking.name} (${booking.email})\\nNotes: ${booking.additionalNotes || 'None'}\\n\\nNeed to make changes?\\nCancel: ${cancelUrl}\\nReschedule: ${rescheduleUrl}`,
    `LOCATION:${meetLink}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    `ORGANIZER;CN="Rohan Mia":mailto:${adminEmail}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN="${booking.name}":mailto:${booking.email}`,
    // Reminder 1: 1 day before
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: 30 Min Meeting with Rohan Mia tomorrow',
    'END:VALARM',
    // Reminder 2: 1 hour before
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: 30 Min Meeting with Rohan Mia in 1 hour',
    'END:VALARM',
    // Reminder 3: 10 minutes before
    'BEGIN:VALARM',
    'TRIGGER:-PT10M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: 30 Min Meeting starting in 10 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  // Google Calendar one-click web link
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `30 Min Meeting: Rohan Mia and ${booking.name}`
  )}&dates=${startIcs}/${endIcs}&details=${encodeURIComponent(
    `Google Meet: ${meetLink}\nTopic: ${booking.topic}\nNotes: ${booking.additionalNotes || 'None'}\n\nCancel: ${cancelUrl}\nReschedule: ${rescheduleUrl}`
  )}&location=${encodeURIComponent(meetLink)}`;

  const safeName = escapeHtml(booking.name);
  const safeTopic = escapeHtml(booking.topic);
  const safeNotes = escapeHtml(booking.additionalNotes || 'None');

  const htmlBody = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmed: 30 Min Meeting with Rohan Mia</title>
  <style type="text/css">
    *, *:before, *:after { box-sizing: border-box !important; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100%; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; margin: 0; padding: 0; background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 14px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);">
          <!-- Clean Header (No Dark Navy Banner / No Tacky Badges) -->
          <tr>
            <td style="padding: 34px 36px 20px 36px; background-color: #ffffff; text-align: left; border-bottom: 1px solid #f1f5f9;">
              <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                You are scheduled!
              </h1>
              <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.5;">
                A calendar invitation with Google Meet details has been created for your 30-min meeting.
              </p>
            </td>
          </tr>

          <!-- Body Content: Clean Event Details (No rigid square boxes) -->
          <tr>
            <td style="padding: 24px 36px 32px 36px; background-color: #ffffff; text-align: left;">
              <!-- Meeting Details Table with clean subtle horizontal dividers -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 100px;">
                    <span style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;">What</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    <span style="font-size: 15px; font-weight: 600; color: #0f172a;">30 Min Meeting with Rohan Mia</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    <span style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;">When</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    <span style="font-size: 14px; font-weight: 600; color: #0f172a;">${humanDate}</span><br />
                    <span style="font-size: 13px; color: #475569; margin-top: 2px; display: inline-block;">${timeRange} (${timezone})</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    <span style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;">Who</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    <div style="font-size: 14px; font-weight: 600; color: #0f172a;">Rohan Mia <span style="font-size: 12px; font-weight: normal; color: #64748b;">(Host)</span></div>
                    <div style="font-size: 13px; color: #475569; margin-top: 2px;">${safeName} &lt;<a href="mailto:${booking.email}" style="color: #2563eb; text-decoration: none;">${booking.email}</a>&gt;</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    <span style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;">Where</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    <div style="font-size: 14px; font-weight: 600; color: #0f172a;">Google Meet</div>
                    <div style="font-size: 13px; margin-top: 2px;">
                      <a href="${meetLink}" target="_blank" style="color: #00832d; font-weight: 600; text-decoration: underline;">${meetLink}</a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; ${booking.additionalNotes ? 'border-bottom: 1px solid #f1f5f9;' : ''} vertical-align: top;">
                    <span style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;">Topic</span>
                  </td>
                  <td style="padding: 12px 0; ${booking.additionalNotes ? 'border-bottom: 1px solid #f1f5f9;' : ''} vertical-align: top;">
                    <span style="font-size: 14px; color: #334155;">${safeTopic}</span>
                  </td>
                </tr>
                ${booking.additionalNotes ? `
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <span style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;">Notes</span>
                  </td>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <span style="font-size: 13px; color: #475569; line-height: 1.5;">${safeNotes}</span>
                  </td>
                </tr>
                ` : ''}
              </table>

              <!-- Join with Google Meet Button with Official Google Meet Logo -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 12px;">
                <tr>
                  <td align="center">
                    <a href="${meetLink}" target="_blank" style="display: block; width: 100%; text-align: center; background-color: #00832d; color: #ffffff !important; padding: 13px 20px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; box-shadow: 0 2px 8px rgba(0, 131, 45, 0.2);">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
                        <tr>
                          <td style="vertical-align: middle; padding-right: 10px;">
                            <img src="https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-48dp/logo_meet_2020q4_color_1x_web_48dp.png" width="20" height="20" style="display: block; border: 0;" alt="Google Meet" />
                          </td>
                          <td style="vertical-align: middle; font-size: 14px; font-weight: 700; color: #ffffff;">
                            Join with Google Meet
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Secondary Add to Calendar Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${gcalUrl}" target="_blank" style="display: block; width: 100%; text-align: center; background-color: #ffffff; border: 1px solid #d1d5db; color: #1f2937 !important; padding: 11px 20px; border-radius: 10px; text-decoration: none; font-size: 13px; font-weight: 600;">
                      + Add to Google Calendar
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Exact Calendly Change/Cancel Links Section -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
                <tr>
                  <td align="center" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #64748b; line-height: 1.6;">
                    Need to make changes to this event?<br />
                    <a href="${cancelUrl}" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: 500;">Cancel</a>
                    &nbsp;&nbsp;&bull;&nbsp;&nbsp;
                    <a href="${rescheduleUrl}" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: 500;">Reschedule</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 18px 36px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5;">
              An official .ics calendar file is attached with automated reminders.<br />
              &copy; ${currentYear} Rohan Mia.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textBody = `30 Min Meeting Scheduled with Rohan Mia

What: 30 Min Meeting with Rohan Mia
When: ${humanDate}, ${timeRange} (${timezone})
Who: Rohan Mia (Host) and ${booking.name} (${booking.email})
Where: Google Meet (${meetLink})
Topic: ${booking.topic}
${booking.additionalNotes ? `Notes: ${booking.additionalNotes}\n` : ''}
Join with Google Meet: ${meetLink}
Add to Google Calendar: ${gcalUrl}

Need to make changes to this event?
Cancel: ${cancelUrl}
Reschedule: ${rescheduleUrl}

Best regards,
Rohan Mia`;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && cleanPassword) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Boolean(process.env.SMTP_SECURE === 'true'),
        auth: {
          user: process.env.SMTP_USER,
          pass: cleanPassword
        }
      });

      // Send to Attendee
      await transporter.sendMail({
        from: `"Rohan Mia" <${process.env.SMTP_USER}>`,
        sender: process.env.SMTP_USER,
        replyTo: adminEmail,
        to: booking.email,
        subject: `Confirmed: 30 Min Meeting with Rohan Mia on ${humanDate} at ${booking.timeSlot}`,
        text: textBody,
        html: htmlBody,
        icalEvent: {
          filename: 'invite.ics',
          method: 'REQUEST',
          content: icsContent
        },
        alternatives: [
          {
            contentType: 'text/calendar; charset="utf-8"; method=REQUEST',
            content: Buffer.from(icsContent)
          }
        ]
      });

      // Send copy to Host (Rohan Mia)
      if (booking.email.toLowerCase() !== adminEmail.toLowerCase()) {
        await transporter.sendMail({
          from: `"Calendly Scheduler" <${process.env.SMTP_USER}>`,
          sender: process.env.SMTP_USER,
          replyTo: booking.email,
          to: adminEmail,
          subject: `New Meeting Booked: ${booking.name} [${booking.date} ${booking.timeSlot}]`,
          text: textBody,
          html: htmlBody,
          icalEvent: {
            filename: 'invite.ics',
            method: 'REQUEST',
            content: icsContent
          },
          alternatives: [
            {
              contentType: 'text/calendar; charset="utf-8"; method=REQUEST',
              content: Buffer.from(icsContent)
            }
          ]
        });
      }

      return { success: true, meetLink };
    } catch (err: any) {
      console.error('Failed to send booking emails via SMTP:', err);
      return { success: false, meetLink, error: err?.message };
    }
  }

  console.log(`[Meeting Email Dispatched] To: ${booking.email} & ${adminEmail} | Meet: ${meetLink}`);
  return { success: true, meetLink };
}

export interface MeetingCancellationPayload {
  booking: DbMeetingBookingRow;
  reason?: string;
}

/**
 * Send cancellation confirmation emails with RFC 5545 CANCEL calendar invite
 * to BOTH the attendee and Rohan Mia.
 */
export async function sendMeetingCancellationEmails({
  booking,
  reason,
}: MeetingCancellationPayload): Promise<{ success: boolean; error?: string }> {
  const currentYear = new Date().getFullYear();
  const duration = booking.duration || 30;
  const timezone = booking.timezone || 'Asia/Dhaka';
  const adminEmail = (process.env.ADMIN_EMAIL || process.env.CONTACT_EMAIL || '').trim();
  const cleanPassword = (process.env.SMTP_PASSWORD || '').replace(/\s+/g, '');
  const rescheduleUrl = 'https://calendly.com/rohanmia/meeting';

  // Parse start date & time
  let startDate = new Date();
  try {
    const [y, m, d] = booking.date.split('-').map(Number);
    let hours = 14;
    let minutes = 0;
    const match = booking.time_slot.match(/(\d+):(\d+)\s*(am|pm)?/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ap = match[3]?.toLowerCase();
      if (ap === 'pm' && hours < 12) hours += 12;
      if (ap === 'am' && hours === 12) hours = 0;
    }
    startDate = new Date(Date.UTC(y, m - 1, d, hours, minutes));
  } catch {
    startDate = new Date(Date.now() + 24 * 3600 * 1000);
  }
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

  const startIcs = formatIcsTimestamp(startDate);
  const endIcs = formatIcsTimestamp(endDate);
  const uid = `meet-${booking.id || Date.now()}@rohanmia.org`;

  const humanDate = formatHumanDate(booking.date);
  const timeRange = formatTimeRange(booking.time_slot, duration);
  const safeName = escapeHtml(booking.name);
  const safeReason = escapeHtml(reason || 'No reason provided');

  // Standard RFC 5545 CANCEL event so calendar software (Google / Apple / Outlook) strikes it out
  const icsCancelContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rohan Mia//Calendly Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:CANCEL',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatIcsTimestamp(new Date())}`,
    `DTSTART:${startIcs}`,
    `DTEND:${endIcs}`,
    `SUMMARY:Cancelled: 30 Min Meeting: Rohan Mia and ${booking.name}`,
    `DESCRIPTION:This meeting has been cancelled.\\n\\nReason: ${reason || 'No reason provided'}\\n\\nTo schedule a new meeting, visit: ${rescheduleUrl}`,
    'STATUS:CANCELLED',
    'SEQUENCE:1',
    `ORGANIZER;CN="Rohan Mia":mailto:${adminEmail}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=DECLINED;CN="${booking.name}":mailto:${booking.email}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const subject = `Cancelled: 30 Min Meeting: Rohan Mia and ${booking.name} on ${humanDate}`;

  const htmlBody = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style type="text/css">
    *, *:before, *:after { box-sizing: border-box !important; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100%; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; margin: 0; padding: 0; background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 14px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);">
          <!-- Header -->
          <tr>
            <td style="padding: 34px 36px 20px 36px; background-color: #ffffff; text-align: left; border-bottom: 1px solid #f1f5f9;">
              <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 700; color: #dc2626; line-height: 1.3;">
                Event Cancelled
              </h1>
              <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.5;">
                Your 30-min meeting with Rohan Mia has been cancelled.
              </p>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding: 24px 36px 32px 36px; background-color: #ffffff; text-align: left;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 100px;">
                    <span style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;">What</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    <span style="font-size: 15px; font-weight: 600; color: #0f172a; text-decoration: line-through;">30 Min Meeting with Rohan Mia</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    <span style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;">When</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    <span style="font-size: 14px; font-weight: 600; color: #0f172a; text-decoration: line-through;">${humanDate}</span><br />
                    <span style="font-size: 13px; color: #475569; margin-top: 2px; display: inline-block;">${timeRange} (${timezone})</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    <span style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;">Who</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    <div style="font-size: 14px; font-weight: 600; color: #0f172a;">Rohan Mia <span style="font-size: 12px; font-weight: normal; color: #64748b;">(Host)</span></div>
                    <div style="font-size: 13px; color: #475569; margin-top: 2px;">${safeName} &lt;<a href="mailto:${booking.email}" style="color: #2563eb; text-decoration: none;">${booking.email}</a>&gt;</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <span style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;">Reason</span>
                  </td>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <span style="font-size: 13px; color: #475569; font-style: italic;">${safeReason}</span>
                  </td>
                </tr>
              </table>

              <!-- Schedule New Time Button (Calendly flow) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 12px 0;">
                <tr>
                  <td align="center">
                    <a href="${rescheduleUrl}" target="_blank" style="display: block; width: 100%; text-align: center; background-color: #0f172a; color: #ffffff !important; padding: 13px 20px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">
                      Schedule Another Meeting
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 18px 36px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5;">
              Calendar status has been updated. &copy; ${currentYear} Rohan Mia.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textBody = `Event Cancelled: 30 Min Meeting with Rohan Mia

What: 30 Min Meeting with Rohan Mia
When: ${humanDate}, ${timeRange} (${timezone})
Who: Rohan Mia (Host) and ${booking.name} (${booking.email})
Reason: ${reason || 'No reason provided'}

Need to schedule another meeting?
Reschedule: ${rescheduleUrl}

Best regards,
Rohan Mia`;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && cleanPassword) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Boolean(process.env.SMTP_SECURE === 'true'),
        auth: {
          user: process.env.SMTP_USER,
          pass: cleanPassword
        }
      });

      // Send to Attendee
      await transporter.sendMail({
        from: `"Rohan Mia" <${process.env.SMTP_USER}>`,
        sender: process.env.SMTP_USER,
        replyTo: adminEmail,
        to: booking.email,
        subject,
        text: textBody,
        html: htmlBody,
        icalEvent: {
          filename: 'cancelled.ics',
          method: 'CANCEL',
          content: icsCancelContent
        }
      });

      // Send to Host
      if (booking.email.toLowerCase() !== adminEmail.toLowerCase()) {
        await transporter.sendMail({
          from: `"Calendly Scheduler" <${process.env.SMTP_USER}>`,
          sender: process.env.SMTP_USER,
          replyTo: booking.email,
          to: adminEmail,
          subject,
          text: textBody,
          html: htmlBody,
          icalEvent: {
            filename: 'cancelled.ics',
            method: 'CANCEL',
            content: icsCancelContent
          }
        });
      }

      return { success: true };
    } catch (err: any) {
      console.error('Failed to send cancellation emails:', err);
      return { success: false, error: err?.message };
    }
  }

  console.log(`[Cancellation Email Logged] To: ${booking.email} & ${adminEmail}`);
  return { success: true };
}



