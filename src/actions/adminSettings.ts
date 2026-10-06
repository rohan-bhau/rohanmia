"use server";

import { assertAdmin } from "@/lib/admin";
import {
  getSiteSettingsDb,
  updateSiteSettingsDb,
  DbSiteSettingsRow,
} from "@/lib/db/content";
import { updateTag } from "next/cache";
import { getCachedSiteSettings, PUBLIC_DATA_TAGS } from "@/lib/publicData";

/**
 * Public Server Action to fetch site settings from PostgreSQL
 */
export async function getSettings(): Promise<Pick<
  DbSiteSettingsRow,
  "site_title" | "meta_description" | "contact_email" | "resume_url"
> | null> {
  try {
    let settings = await getCachedSiteSettings();
    if (!settings) {
      settings = await updateSiteSettingsDb({
        site_title: "MD Rohan Mia | Full-Stack Software Engineer",
        meta_description:
          "Portfolio of MD Rohan Mia (Bhau) - Full-Stack Developer specializing in Next.js 16, TypeScript, high-performance UI and distributed backends.",
        contact_email: "rohanmia.org@gmail.com",
        resume_url: "/resume.pdf",
      });
      updateTag(PUBLIC_DATA_TAGS.settings);
    }
    if (!settings) return null;
    return {
      site_title: settings.site_title,
      meta_description: settings.meta_description,
      contact_email: settings.contact_email,
      resume_url: settings.resume_url,
    };
  } catch (err) {
    console.error("getSettings error:", err);
    return null;
  }
}

export async function fetchAdminSettings(): Promise<{
  success: boolean;
  settings?: DbSiteSettingsRow;
  error?: string;
}> {
  try {
    await assertAdmin();
    let settings = await getSiteSettingsDb();
    if (!settings) {
      settings = await updateSiteSettingsDb({
        site_title: "MD Rohan Mia | Full-Stack Software Engineer",
        meta_description:
          "Portfolio of MD Rohan Mia (Bhau) - Full-Stack Developer specializing in Next.js 16, TypeScript, high-performance UI and distributed backends.",
        contact_email: "rohanmia.org@gmail.com",
        resume_url: "/resume.pdf",
      });
    }
    return { success: true, settings };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to fetch settings",
    };
  }
}

export async function saveAdminSettings(
  data: Partial<DbSiteSettingsRow>,
): Promise<{
  success: boolean;
  settings?: DbSiteSettingsRow;
  error?: string;
}> {
  try {
    await assertAdmin();
    const updated = await updateSiteSettingsDb(data);
    updateTag(PUBLIC_DATA_TAGS.settings);

    if (data.resume_url) {
      const { executeSql, escapeSqlString } = await import("@/lib/postgres");
      await executeSql(`
        UPDATE hero_content 
        SET resume_url = ${escapeSqlString(data.resume_url.trim())}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = 'primary';
      `);
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    return { success: true, settings: updated };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save settings" };
  }
}
