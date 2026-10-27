import { getGalleryImages } from "@/actions/adminGallery";
import GalleryClient from "@/components/gallery/GalleryClient";

import { buildDynamicMetadata, getBaseSiteUrl } from "@/lib/seo/metadata";
import { getCachedSeoSettings } from "@/lib/publicData";
import { generateImageGalleryJsonLd, serializeJsonLd } from "@/lib/seo/jsonLd";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return await buildDynamicMetadata({ path: "/gallery" });
}

export default async function GalleryPage() {
  const [images, seoSettings] = await Promise.all([
    getGalleryImages(),
    getCachedSeoSettings().catch(() => null),
  ]);

  const baseUrl = getBaseSiteUrl(seoSettings?.canonical_base_url);
  const galleryJsonLd = generateImageGalleryJsonLd(
    images || [],
    baseUrl,
    seoSettings?.primary_name
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(galleryJsonLd),
        }}
      />
      <GalleryClient initialImages={images || []} />
    </>
  );
}
