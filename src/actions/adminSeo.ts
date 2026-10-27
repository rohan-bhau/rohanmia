"use server";

import { assertAdmin } from "@/lib/admin";
import {
  getSeoSettingsDb,
  updateSeoSettingsDb,
  getAllPageSeoDb,
  upsertPageSeoDb,
  getProjectSeoListDb,
  updateProjectSeoDb,
  DbSeoSettingsRow,
  DbPageSeoRow,
  DbProjectSeoItem,
} from "@/lib/db/seo";
import { getPublicLinks } from "@/actions/adminLinks";
import { updateTag, revalidatePath } from "next/cache";
import { PUBLIC_DATA_TAGS } from "@/lib/publicData";
import { v2 as cloudinary } from "cloudinary";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Constructs responsive 1:1, 4:3, and 16:9 high-resolution variant URLs
 * using Cloudinary's deterministic face-gravity crop transformations.
 */
export async function generatePhotoVariants(url: string) {
  if (!url || !url.includes("cloudinary.com") || !url.includes("/upload/")) {
    return {
      square_1x1: url,
      photo_4x3: url,
      landscape_16x9: url,
    };
  }

  const parts = url.split("/upload/");
  const prefix = parts[0] + "/upload/";
  const suffix = parts[1];

  return {
    square_1x1: `${prefix}c_fill,ar_1:1,g_face,w_1200,q_auto:best,f_auto/${suffix}`,
    photo_4x3: `${prefix}c_fill,ar_4:3,g_face,w_1200,q_auto:best,f_auto/${suffix}`,
    landscape_16x9: `${prefix}c_fill,ar_16:9,g_face,w_1200,q_auto:best,f_auto/${suffix}`,
  };
}

/**
 * Fetch all SEO management data for the admin panel
 */
export async function fetchSeoDashboardData(): Promise<{
  success: boolean;
  globalSeo?: DbSeoSettingsRow;
  pages?: DbPageSeoRow[];
  projects?: DbProjectSeoItem[];
  verifiedSocials?: string[];
  error?: string;
}> {
  try {
    await assertAdmin();

    const [globalSeo, pages, projects, { links }] = await Promise.all([
      getSeoSettingsDb(),
      getAllPageSeoDb(),
      getProjectSeoListDb(),
      getPublicLinks().catch(() => ({ links: [] })),
    ]);

    const verifiedSocials = (links || [])
      .filter((l) => l.active && l.href?.startsWith("http"))
      .map((l) => l.href);

    return {
      success: true,
      globalSeo: globalSeo || undefined,
      pages,
      projects,
      verifiedSocials,
    };
  } catch (err: any) {
    console.error("fetchSeoDashboardData error:", err);
    return {
      success: false,
      error: err?.message || "Failed to load SEO settings",
    };
  }
}

/**
 * Save Global SEO & Identity Settings
 */
export async function saveGlobalSeoSettings(
  data: Partial<DbSeoSettingsRow>
): Promise<{
  success: boolean;
  globalSeo?: DbSeoSettingsRow;
  error?: string;
}> {
  try {
    await assertAdmin();

    // If profile image changed, re-generate variants
    let variants = data.profile_image_variants;
    if (data.profile_image_url && (!variants || Object.keys(variants).length === 0)) {
      variants = await generatePhotoVariants(data.profile_image_url);
      data.profile_image_variants = variants;
    }

    const updated = await updateSeoSettingsDb(data);

    // Keep hero_content and site_settings synchronized
    if (data.profile_image_url || data.default_meta_title || data.default_meta_description) {
      const { executeSql, escapeSqlString } = await import("@/lib/postgres");

      if (data.profile_image_url) {
        await executeSql(`
          UPDATE hero_content 
          SET profile_image = ${escapeSqlString(data.profile_image_url)}, updated_at = CURRENT_TIMESTAMP
          WHERE id = 'primary';
        `);
      }

      const siteSettingsUpdates: string[] = [];
      if (data.default_meta_title) {
        siteSettingsUpdates.push(`site_title = ${escapeSqlString(data.default_meta_title)}`);
      }
      if (data.default_meta_description) {
        siteSettingsUpdates.push(`meta_description = ${escapeSqlString(data.default_meta_description)}`);
      }
      if (siteSettingsUpdates.length > 0) {
        await executeSql(`
          UPDATE site_settings
          SET ${siteSettingsUpdates.join(", ")}, updated_at = CURRENT_TIMESTAMP
          WHERE id = 'primary';
        `);
      }
    }

    updateTag(PUBLIC_DATA_TAGS.seo);
    updateTag(PUBLIC_DATA_TAGS.settings);
    updateTag(PUBLIC_DATA_TAGS.hero);
    revalidatePath("/", "layout");
    revalidatePath("/sitemap.xml");

    return { success: true, globalSeo: updated };
  } catch (err: any) {
    console.error("saveGlobalSeoSettings error:", err);
    return {
      success: false,
      error: err?.message || "Failed to save global SEO settings",
    };
  }
}

/**
 * Save Page-Level SEO Settings
 */
export async function savePageSeoSettings(
  data: Partial<DbPageSeoRow> & { page_path: string }
): Promise<{
  success: boolean;
  pageSeo?: DbPageSeoRow;
  error?: string;
}> {
  try {
    await assertAdmin();
    const updated = await upsertPageSeoDb(data);

    updateTag(PUBLIC_DATA_TAGS.seo);
    revalidatePath(data.page_path);
    revalidatePath("/sitemap.xml");

    return { success: true, pageSeo: updated };
  } catch (err: any) {
    console.error("savePageSeoSettings error:", err);
    return {
      success: false,
      error: err?.message || "Failed to save page SEO settings",
    };
  }
}

/**
 * Save Individual Project SEO Overrides
 */
export async function saveProjectSeoOverrides(
  projectId: string,
  data: {
    seo_title?: string | null;
    seo_description?: string | null;
    canonical_url?: string | null;
    og_image?: string | null;
    og_image_alt?: string | null;
    no_index?: boolean;
    keywords?: string[];
  }
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await assertAdmin();
    await updateProjectSeoDb(projectId, data);

    updateTag(PUBLIC_DATA_TAGS.projects);
    updateTag(PUBLIC_DATA_TAGS.seo);
    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/sitemap.xml");

    return { success: true };
  } catch (err: any) {
    console.error("saveProjectSeoOverrides error:", err);
    return {
      success: false,
      error: err?.message || "Failed to save project SEO settings",
    };
  }
}

/**
 * Upload SEO Profile Photo to Cloudinary with automatic variant generation
 */
export async function uploadSeoProfilePhoto(formData: FormData): Promise<{
  success: boolean;
  url?: string;
  variants?: Record<string, string>;
  error?: string;
}> {
  try {
    await assertAdmin();
    const file = formData.get("file") as File | null;
    if (!file) throw new Error("No image file provided");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadRes = await new Promise<{ url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "portfolio_cms",
              transformation: [
                { width: 1200, height: 1200, crop: "fill", gravity: "face" },
                { quality: "auto:best", fetch_format: "auto" },
              ],
            },
            (error, result) => {
              if (error || !result) {
                reject(error || new Error("Cloudinary upload failed"));
              } else {
                resolve({
                  url: result.secure_url,
                  public_id: result.public_id,
                });
              }
            }
          )
          .end(buffer);
      }
    );

    const variants = await generatePhotoVariants(uploadRes.url);

    // Save to seo_settings and hero_content
    await saveGlobalSeoSettings({
      profile_image_url: uploadRes.url,
      profile_image_variants: variants,
    });

    return {
      success: true,
      url: uploadRes.url,
      variants,
    };
  } catch (err: any) {
    console.error("uploadSeoProfilePhoto error:", err);
    return {
      success: false,
      error: err?.message || "Failed to upload profile photo",
    };
  }
}

/**
 * Upload Open Graph social sharing image to Cloudinary (1200x630 landscape)
 */
export async function uploadSeoOgImage(formData: FormData): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    await assertAdmin();
    const file = formData.get("file") as File | null;
    if (!file) throw new Error("No image file provided");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadRes = await new Promise<{ url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "portfolio_cms/seo",
              transformation: [
                { width: 1200, height: 630, crop: "fill", gravity: "auto" },
                { quality: "auto:best", fetch_format: "auto" },
              ],
            },
            (error, result) => {
              if (error || !result) {
                reject(error || new Error("Cloudinary upload failed"));
              } else {
                resolve({
                  url: result.secure_url,
                  public_id: result.public_id,
                });
              }
            }
          )
          .end(buffer);
      }
    );

    return {
      success: true,
      url: uploadRes.url,
    };
  } catch (err: any) {
    console.error("uploadSeoOgImage error:", err);
    return {
      success: false,
      error: err?.message || "Failed to upload OG image",
    };
  }
}
