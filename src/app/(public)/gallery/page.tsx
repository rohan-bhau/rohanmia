import { getGalleryImages } from "@/actions/adminGallery";
import GalleryClient from "@/components/gallery/GalleryClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gallery & Visual Archive | MD Rohan Mia",
  description:
    "Curated visual chronicle of personal moments, travels, engineering work, and memories.",
};

export default async function GalleryPage() {
  const images = await getGalleryImages();
  return <GalleryClient initialImages={images || []} />;
}
