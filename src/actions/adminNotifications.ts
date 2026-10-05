'use server';

import { assertAdmin } from '@/lib/admin';
import { executeSql, escapeSqlString } from '@/lib/postgres';
import { ensureContactAndBookingTables, ensureGuestbookTable } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';

export interface AdminNotificationItem {
  id: string;
  sourceId: string;
  type: 'contact' | 'booking' | 'guestbook';
  title: string;
  subtitle: string;
  avatar?: string;
  createdAt: string;
  isRead: boolean;
  link: string;
}

export async function fetchAdminNotifications(): Promise<{
  success: boolean;
  notifications: AdminNotificationItem[];
  unreadCount: number;
  error?: string;
}> {
  try {
    await assertAdmin();
    await ensureContactAndBookingTables();
    await ensureGuestbookTable();

    const [msgRes, bookRes, gbRes] = await Promise.all([
      executeSql<{
        id: string;
        name: string;
        email: string;
        topic: string;
        message: string;
        is_read: boolean;
        created_at: string;
      }>(`
        SELECT id, name, email, topic, message, is_read, created_at 
        FROM contact_messages 
        ORDER BY created_at DESC 
        LIMIT 15;
      `),
      executeSql<{
        id: string;
        name: string;
        email: string;
        topic: string;
        date: string;
        time_slot: string;
        is_read: boolean;
        created_at: string;
      }>(`
        SELECT id, name, email, topic, date, time_slot, is_read, created_at 
        FROM meeting_bookings 
        ORDER BY created_at DESC 
        LIMIT 15;
      `),
      executeSql<{
        id: string;
        name: string;
        email: string;
        message: string;
        avatar: string;
        provider: string;
        is_read: boolean;
        created_at: string;
      }>(`
        SELECT id, name, email, message, avatar, provider, is_read, created_at 
        FROM guestbook_entries 
        WHERE provider != 'admin'
        ORDER BY created_at DESC 
        LIMIT 15;
      `),
    ]);

    const notifications: AdminNotificationItem[] = [];

    // 1. Contact Messages
    for (const msg of msgRes.rows) {
      notifications.push({
        id: `notif_msg_${msg.id}`,
        sourceId: msg.id,
        type: 'contact',
        title: `Message from ${msg.name || 'Client'}`,
        subtitle: `${msg.topic ? `[${msg.topic}] ` : ''}${msg.message?.slice(0, 70)}${msg.message?.length > 70 ? '...' : ''}`,
        createdAt: msg.created_at,
        isRead: Boolean(msg.is_read),
        link: '/control-room-internal/contact',
      });
    }

    // 2. Meeting Bookings
    for (const book of bookRes.rows) {
      notifications.push({
        id: `notif_book_${book.id}`,
        sourceId: book.id,
        type: 'booking',
        title: `Meeting: ${book.name || 'Client'}`,
        subtitle: `${book.topic || 'Discovery Call'} on ${book.date} at ${book.time_slot}`,
        createdAt: book.created_at,
        isRead: Boolean(book.is_read),
        link: '/control-room-internal/contact',
      });
    }

    // 3. Guestbook Signatures
    for (const gb of gbRes.rows) {
      notifications.push({
        id: `notif_gb_${gb.id}`,
        sourceId: gb.id,
        type: 'guestbook',
        title: `${gb.name || 'Visitor'} signed the Guestbook`,
        subtitle: `"${gb.message?.slice(0, 65)}${gb.message?.length > 65 ? '...' : ''}"`,
        avatar: gb.avatar,
        createdAt: gb.created_at,
        isRead: Boolean(gb.is_read),
        link: '/control-room-internal/guestbook',
      });
    }

    // Sort all descending by timestamp
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return {
      success: true,
      notifications,
      unreadCount,
    };
  } catch (err: any) {
    return {
      success: false,
      notifications: [],
      unreadCount: 0,
      error: err.message,
    };
  }
}

export async function markAdminNotificationRead(
  type: 'contact' | 'booking' | 'guestbook',
  sourceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    if (type === 'contact') {
      await executeSql(`UPDATE contact_messages SET is_read = true WHERE id = ${escapeSqlString(sourceId)};`);
    } else if (type === 'booking') {
      await executeSql(`UPDATE meeting_bookings SET is_read = true WHERE id = ${escapeSqlString(sourceId)};`);
    } else if (type === 'guestbook') {
      await executeSql(`UPDATE guestbook_entries SET is_read = true WHERE id = ${escapeSqlString(sourceId)};`);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function markAllAdminNotificationsRead(): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    await Promise.all([
      executeSql(`UPDATE contact_messages SET is_read = true WHERE is_read = false;`),
      executeSql(`UPDATE meeting_bookings SET is_read = true WHERE is_read = false;`),
      executeSql(`UPDATE guestbook_entries SET is_read = true WHERE is_read = false;`),
    ]);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
