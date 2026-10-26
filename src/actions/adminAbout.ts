"use server";

import { assertAdmin } from "@/lib/admin";
import { updateAboutContentDb, DbAboutContentRow } from "@/lib/db/content";
import { revalidatePath, updateTag } from "next/cache";
import { getCachedAboutContent, PUBLIC_DATA_TAGS } from "@/lib/publicData";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";

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

    // If carousel items are updated, clean up any removed carousel slide images from Cloudinary
    if (data.carousel_items && Array.isArray(data.carousel_items)) {
      const prevContent = await getAboutData();
      const prevUrls = new Set<string>(
        (prevContent.carousel_items || [])
          .map((item: any) => item?.image)
          .filter(Boolean)
      );
      const newUrls = new Set<string>(
        data.carousel_items
          .map((item: any) => item?.image)
          .filter(Boolean)
      );

      for (const oldUrl of prevUrls) {
        if (!newUrls.has(oldUrl)) {
          await deleteCloudinaryAsset(oldUrl);
        }
      }
    }

    const updated = await updateAboutContentDb(data);
    updateTag(PUBLIC_DATA_TAGS.about);
    updateTag(PUBLIC_DATA_TAGS.seo);
    revalidatePath("/about");
    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    revalidatePath("/control-room-internal/about");
    return { success: true, content: updated };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to save about content",
    };
  }
}
