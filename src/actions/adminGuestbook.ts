"use server";

import { assertAdmin } from "@/lib/admin";
import {
  fetchAllEntries,
  deleteEntryById,
  insertEntry,
  updateEntry,
  DbGuestbookRow,
} from "@/lib/db/guestbook";
import { revalidatePath, updateTag } from "next/cache";
import { PUBLIC_DATA_TAGS } from "@/lib/publicData";

export async function fetchAdminGuestbook(): Promise<{
  success: boolean;
  entries?: DbGuestbookRow[];
  error?: string;
}> {
  try {
    await assertAdmin();
    const entries = await fetchAllEntries();
    return { success: true, entries };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createAdminGuestbookEntry(data: {
  message: string;
  theme?: string;
  avatar?: string;
}): Promise<{ success: boolean; entry?: DbGuestbookRow; error?: string }> {
  try {
    const session = await assertAdmin();
    const adminEmail =
      process.env.ADMIN_EMAIL?.trim() ||
      (session?.user as any)?.email ||
      "rohanmia.org@gmail.com";
    const cleanMessage = data.message?.trim();
    if (!cleanMessage) {
      return { success: false, error: "Message cannot be empty." };
    }

    const newEntry = await insertEntry({
      id: `gb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: "Rohan Mia",
      email: adminEmail,
      message: cleanMessage,
      avatar: data.avatar?.trim() || "/images/about/hero-profile.png",
      provider: "admin",
      theme: data.theme || "violet",
    });

    updateTag(PUBLIC_DATA_TAGS.guestbook);
    revalidatePath("/guestbook");
    revalidatePath("/");
    return { success: true, entry: newEntry };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateAdminGuestbookEntry(data: {
  id: string;
  message: string;
  theme?: string;
  avatar?: string;
}): Promise<{ success: boolean; entry?: DbGuestbookRow; error?: string }> {
  try {
    await assertAdmin();
    const cleanMessage = data.message?.trim();
    if (!cleanMessage) {
      return { success: false, error: "Message cannot be empty." };
    }

    const updated = await updateEntry(data.id, {
      message: cleanMessage,
      theme: data.theme,
      avatar: data.avatar,
    });

    if (!updated) {
      return { success: false, error: "Failed to update guestbook entry." };
    }

    updateTag(PUBLIC_DATA_TAGS.guestbook);
    revalidatePath("/guestbook");
    revalidatePath("/");
    return { success: true, entry: updated };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function removeAdminGuestbookEntry(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await assertAdmin();
    const adminEmail =
      process.env.ADMIN_EMAIL?.trim().toLowerCase() ||
      (session?.user as any)?.email ||
      "";
    const deleted = await deleteEntryById(id, adminEmail);
    if (!deleted) {
      return { success: false, error: "Failed to delete guestbook entry." };
    }

    updateTag(PUBLIC_DATA_TAGS.guestbook);
    revalidatePath("/guestbook");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
