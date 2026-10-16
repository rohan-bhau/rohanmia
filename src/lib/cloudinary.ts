import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
export default cloudinary;

/**
 * Robust extractor for Cloudinary public_id from any URL or identifier string.
 * Handles:
 * - https://res.cloudinary.com/<cloud>/image/upload/v1792132544/portfolio_cms/mngcdd39w3m89hednaos.png
 * - https://res.cloudinary.com/<cloud>/image/upload/c_crop,w_500,h_500/v1792132544/portfolio_cms/test.webp
 * - https://res.cloudinary.com/<cloud>/image/upload/portfolio_cms/gallery/photo.jpg?v=123
 * - portfolio_cms/mngcdd39w3m89hednaos
 */
export function extractCloudinaryPublicId(urlOrPublicId?: string | null): string | null {
  if (!urlOrPublicId || typeof urlOrPublicId !== "string") return null;
  const trimmed = urlOrPublicId.trim();
  if (!trimmed) return null;

  // If it's already a public_id (no protocol or root slash)
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("//") && !trimmed.startsWith("/")) {
    return trimmed.split("?")[0].replace(/\.[^/.]+$/, "");
  }

  if (!trimmed.includes("cloudinary.com")) {
    return null; // External non-cloudinary URL (e.g. Unsplash, GitHub avatar)
  }

  try {
    const urlObj = new URL(trimmed.startsWith("//") ? `https:${trimmed}` : trimmed);
    const pathname = urlObj.pathname;

    const uploadIndex = pathname.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    const afterUpload = pathname.substring(uploadIndex + "/upload/".length);
    const segments = afterUpload.split("/").filter(Boolean);

    // Skip transformation segments and version segment (e.g. v1234567890)
    const nonTransformSegments: string[] = [];
    for (const seg of segments) {
      if (/^v\d+$/.test(seg)) {
        continue;
      }
      if (
        seg.includes(",") ||
        /^(c|w|h|q|f|b|e|g|r|a|co|dpr|fl|pg|l|u|t)_[a-zA-Z0-9_-]+/.test(seg)
      ) {
        continue;
      }
      nonTransformSegments.push(seg);
    }

    if (nonTransformSegments.length === 0) return null;

    // Strip extension from the last segment
    const last = nonTransformSegments[nonTransformSegments.length - 1];
    nonTransformSegments[nonTransformSegments.length - 1] = last.replace(/\.[a-zA-Z0-9]+$/, "");

    return decodeURIComponent(nonTransformSegments.join("/"));
  } catch (err) {
    console.error("Error extracting Cloudinary public_id:", err);
    return null;
  }
}

/**
 * Permanently destroys an asset from Cloudinary by URL or public_id.
 * Safe to call from anywhere on the server.
 */
export async function deleteCloudinaryAsset(
  urlOrPublicId?: string | null
): Promise<{ success: boolean; result?: string; error?: string }> {
  if (!urlOrPublicId || typeof urlOrPublicId !== "string") {
    return { success: true };
  }

  const publicId = extractCloudinaryPublicId(urlOrPublicId);
  if (!publicId) {
    return { success: true };
  }

  // Never destroy the default system fallback avatar
  if (publicId.includes("fcprc2kqkcmxitdibzcn")) {
    return { success: true };
  }

  try {
    const res = await cloudinary.uploader.destroy(publicId);
    console.log(`[Cloudinary Destroy] Asset "${publicId}" destroyed with result:`, res?.result);
    return {
      success: res?.result === "ok" || res?.result === "not found",
      result: res?.result,
    };
  } catch (error: any) {
    console.error(`[Cloudinary Destroy Error] Failed to delete "${publicId}":`, error);
    return { success: false, error: error?.message || "Cloudinary destroy failed" };
  }
}
