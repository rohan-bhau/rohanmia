import type { MetadataRoute } from "next";
import { getSeoSettingsDb } from "@/lib/db/seo";
import { getBaseSiteUrl } from "@/lib/seo/metadata";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seoSettings = await getSeoSettingsDb().catch(() => null);
  const baseUrl = getBaseSiteUrl(seoSettings?.canonical_base_url);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: baseUrl ? `${baseUrl}/sitemap.xml` : "/sitemap.xml",
  };
}
