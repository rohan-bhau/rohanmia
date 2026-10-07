"use server";

import { assertAdmin } from "@/lib/admin";
import { updateAboutContentDb, DbAboutContentRow } from "@/lib/db/content";
import { revalidatePath, updateTag } from "next/cache";
import { getCachedAboutContent, PUBLIC_DATA_TAGS } from "@/lib/publicData";

export async function getAboutData(): Promise<DbAboutContentRow> {
  try {
    const content = await getCachedAboutContent();
    if (content) {
      return content;
    }

    return {
      id: "primary",
      eyebrow: "",
      heading_title: "",
      heading_highlight: "",
      bio_paragraphs: [],
      career_experiences: [],
      engineering_principles: [],
      education: [],
      core_competencies: [],
      carousel_items: [],
      updated_at: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error("getAboutData error:", err);
    return {
      id: "primary",
      eyebrow: "",
      heading_title: "",
      heading_highlight: "",
      bio_paragraphs: [],
      career_experiences: [],
      engineering_principles: [],
      education: [],
      core_competencies: [],
      carousel_items: [],
      updated_at: new Date().toISOString(),
    };
  }
}

export async function fetchAdminAbout(): Promise<{
  success: boolean;
  content?: DbAboutContentRow;
  error?: string;
}> {
  try {
    await assertAdmin();
    const content = await getAboutData();
    return { success: true, content };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to fetch about content",
    };
  }
}

export async function saveAdminAbout(
  data: Partial<DbAboutContentRow>,
): Promise<{
  success: boolean;
  content?: DbAboutContentRow;
  error?: string;
}> {
  try {
    await assertAdmin();
    const updated = await updateAboutContentDb(data);
    updateTag(PUBLIC_DATA_TAGS.about);
    revalidatePath("/about");
    revalidatePath("/");
    revalidatePath("/control-room-internal/about");
    return { success: true, content: updated };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to save about content",
    };
  }
}
