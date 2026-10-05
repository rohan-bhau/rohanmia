'use server';

import { assertAdmin } from '@/lib/admin';
import { executeSql, escapeSqlString } from '@/lib/postgres';
import { DbContactMessageRow, DbMeetingBookingRow, cancelMeetingBooking } from '@/lib/db/contact';
import { revalidatePath } from 'next/cache';

export async function fetchAdminContactData(): Promise<{
  success: boolean;
  messages?: DbContactMessageRow[];
  bookings?: DbMeetingBookingRow[];
  error?: string;
}> {
  try {
    await assertAdmin();
    const [msgRes, bookRes] = await Promise.all([
      executeSql<DbContactMessageRow>('SELECT * FROM contact_messages ORDER BY created_at DESC;'),
      executeSql<DbMeetingBookingRow>('SELECT * FROM meeting_bookings ORDER BY created_at DESC;'),
    ]);

    return {
      success: true,
      messages: msgRes.rows,
      bookings: bookRes.rows,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateMessageStatus(id: string, status: 'read' | 'unread' | 'replied'): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    await executeSql(
      `UPDATE contact_messages SET status = ${escapeSqlString(status)} WHERE id = ${escapeSqlString(id)};`
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function removeContactMessage(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    await executeSql(
      `DELETE FROM contact_messages WHERE id = ${escapeSqlString(id)};`
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function cancelBookingAdmin(id: string, reason: string): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    const ok = await cancelMeetingBooking(id, reason);
    if (!ok) return { success: false, error: 'Failed to cancel meeting.' };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
