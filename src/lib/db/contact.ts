import { executeSql, escapeSqlString } from '@/lib/postgres';
import { ensureContactAndBookingTables } from './schema';

export interface DbContactMessageRow {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: string;
  created_at: string;
}

export interface DbMeetingBookingRow {
  id: string;
  name: string;
  email: string;
  topic: string;
  additional_notes: string;
  guests: string;
  date: string;
  time_slot: string;
  timezone: string;
  duration: number;
  status: string;
  meet_link?: string;
  cancellation_reason?: string;
  created_at: string;
}

export async function insertContactMessage(data: {
  id?: string;
  name: string;
  email: string;
  topic: string;
  message: string;
}): Promise<DbContactMessageRow> {
  await ensureContactAndBookingTables();
  const id = data.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const query = `
    INSERT INTO contact_messages (id, name, email, topic, message, status)
    VALUES (
      ${escapeSqlString(id)},
      ${escapeSqlString(data.name)},
      ${escapeSqlString(data.email)},
      ${escapeSqlString(data.topic || 'General')},
      ${escapeSqlString(data.message)},
      'unread'
    )
    RETURNING *;
  `;
  const res = await executeSql<DbContactMessageRow>(query);
  return res.rows[0];
}

export async function insertMeetingBooking(data: {
  id?: string;
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
}): Promise<DbMeetingBookingRow> {
  await ensureContactAndBookingTables();
  const id = data.id || `book_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const guestsStr = Array.isArray(data.guests) ? data.guests.join(', ') : (data.guests || '');
  const query = `
    INSERT INTO meeting_bookings (
      id, name, email, topic, additional_notes, guests, date, time_slot, timezone, duration, status, meet_link
    )
    VALUES (
      ${escapeSqlString(id)},
      ${escapeSqlString(data.name)},
      ${escapeSqlString(data.email)},
      ${escapeSqlString(data.topic)},
      ${escapeSqlString(data.additionalNotes || '')},
      ${escapeSqlString(guestsStr)},
      ${escapeSqlString(data.date)},
      ${escapeSqlString(data.timeSlot)},
      ${escapeSqlString(data.timezone || 'Asia/Dhaka')},
      ${data.duration || 30},
      'confirmed',
      ${escapeSqlString(data.meetLink || '')}
    )
    RETURNING *;
  `;
  const res = await executeSql<DbMeetingBookingRow>(query);
  return res.rows[0];
}

export async function getMeetingBookingById(id: string): Promise<DbMeetingBookingRow | null> {
  await ensureContactAndBookingTables();
  const res = await executeSql<DbMeetingBookingRow>(
    `SELECT * FROM meeting_bookings WHERE id = ${escapeSqlString(id)} LIMIT 1;`
  );
  return res.rows[0] || null;
}

export async function cancelMeetingBooking(id: string, reason?: string): Promise<boolean> {
  await ensureContactAndBookingTables();
  const reasonVal = reason ? escapeSqlString(reason) : "''";
  const query = `
    UPDATE meeting_bookings
    SET status = 'cancelled', cancellation_reason = ${reasonVal}
    WHERE id = ${escapeSqlString(id)}
    RETURNING id;
  `;
  const res = await executeSql<{ id: string }>(query);
  return res.rows.length > 0;
}
