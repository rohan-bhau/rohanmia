"use server";

import { v2 as cloudinary } from "cloudinary";
import { assertAdmin } from "@/lib/admin";
import {
  extractCloudinaryPublicId,
  deleteCloudinaryAsset,
} from "@/lib/cloudinary";

export { extractCloudinaryPublicId };

export interface UploadImageResult {
  success: boolean;
  url?: string;
  public_id?: string;
  error?: string;
}

export async function uploadImage(formData: FormData): Promise<UploadImageResult> {
  try {
    await assertAdmin();
    const file = formData.get("file") as File | null;
    if (!file) throw new Error("No file provided");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "portfolio_cms",
            resource_type: "auto",
          },
          (error, result) => {
            if (error || !result) {
              resolve({ success: false, error: error?.message || "Upload failed" });
            } else {
              resolve({
                success: true,
                url: result.secure_url,
                public_id: result.public_id,
              });
            }
          }
        )
        .end(buffer);
    });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return { success: false, error: error?.message || "Upload failed" };
  }
}

export async function deleteImage(urlOrPublicId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    return await deleteCloudinaryAsset(urlOrPublicId);
  } catch (error: any) {
    console.error("Cloudinary Delete Error:", error);
    return { success: false, error: error?.message || "Delete failed" };
  }
}

export const deleteCloudinaryImage = deleteImage;
