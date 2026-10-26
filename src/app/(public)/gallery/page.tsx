import { getGalleryImages } from "@/actions/adminGallery";
import GalleryClient from "@/components/gallery/GalleryClient";

import { buildDynamicMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return await buildDynamicMetadata({ path: "/gallery" });
}

export default async function GalleryPage() {
  const images = await getGalleryImages();
  return <GalleryClient initialImages={images || []} />;
}
