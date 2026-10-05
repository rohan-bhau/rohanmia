'use server';

import { assertAdmin } from '@/lib/admin';
import { fetchAllEntries, deleteEntryById, DbGuestbookRow } from '@/lib/db/guestbook';
import { revalidatePath } from 'next/cache';

export async function fetchAdminGuestbook(): Promise<{ success: boolean; entries?: DbGuestbookRow[]; error?: string }> {
  try {
    await assertAdmin();
    const entries = await fetchAllEntries();
    return { success: true, entries };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function removeAdminGuestbookEntry(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await assertAdmin();
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || (session?.user as any)?.email || '';
    const deleted = await deleteEntryById(id, adminEmail);
    if (!deleted) {
      return { success: false, error: 'Failed to delete guestbook entry.' };
    }

    revalidatePath('/guestbook');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
