import type { MetadataRoute } from "next";
import { getProjectSeoListDb, getAllPageSeoDb, getSeoSettingsDb } from "@/lib/db/seo";
import { getBaseSiteUrl } from "@/lib/seo/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [seoSettings, pageSeoList, projects] = await Promise.all([
    getSeoSettingsDb().catch(() => null),
    getAllPageSeoDb().catch(() => []),
    getProjectSeoListDb().catch(() => []),
  ]);

  const baseUrl = getBaseSiteUrl(seoSettings?.canonical_base_url);
  const profileImage = seoSettings?.profile_image_url || undefined;

  // Build a lookup map of page SEO overrides
  const pageSeoMap = new Map((pageSeoList || []).map((p) => [p.page_path, p]));

  // Standard public pages with their route paths and priority
  const standardPages: Array<{
    path: string;
    priority: number;
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    images?: string[];
  }> = [
    {
      path: "/",
      priority: 1.0,
      changeFrequency: "weekly",
      images: profileImage ? [profileImage] : undefined,
    },
    {
      path: "/about",
      priority: 0.9,
      changeFrequency: "monthly",
      images: profileImage ? [profileImage] : undefined,
    },
    {
      path: "/projects",
      priority: 0.9,
      changeFrequency: "weekly",
    },
    {
      path: "/tech-stack",
      priority: 0.8,
      changeFrequency: "monthly",
    },
    {
      path: "/contact",
      priority: 0.8,
      changeFrequency: "monthly",
    },
    {
      path: "/gallery",
      priority: 0.7,
      changeFrequency: "monthly",
    },
    {
      path: "/guestbook",
      priority: 0.7,
      changeFrequency: "weekly",
    },
    {
      path: "/links",
      priority: 0.8,
      changeFrequency: "monthly",
      images: profileImage ? [profileImage] : undefined,
    },
  ];

  // Filter out pages that admin explicitly marked noindex
  const publicPageUrls: MetadataRoute.Sitemap = standardPages
    .filter((page) => {
      const override = pageSeoMap.get(page.path);
      if (override && override.robots_index === false) {
        return false;
      }
      return true;
    })
    .map((page) => {
      const override = pageSeoMap.get(page.path);
      const lastModDate = override?.updated_at
        ? new Date(override.updated_at)
        : seoSettings?.updated_at
        ? new Date(seoSettings.updated_at)
        : undefined;

      const pageCanonical = override?.canonical_url || `${baseUrl}${page.path === "/" ? "" : page.path}`;

      return {
        url: pageCanonical,
        lastModified: lastModDate,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        images: page.images,
      };
    });

  // Dynamic projects (filter out unindexed ones, use real updated_at date)
  const projectUrls: MetadataRoute.Sitemap = (projects || [])
    .filter((project) => project.no_index !== true)
    .map((project) => {
      const lastModDate = project.updated_at
        ? new Date(project.updated_at)
        : undefined;

      const projectCanonical =
        project.canonical_url || `${baseUrl}/projects/${project.slug}`;

      return {
        url: projectCanonical,
        lastModified: lastModDate,
        changeFrequency: "monthly",
        priority: project.featured ? 0.85 : 0.75,
        images: project.preview_image ? [project.preview_image] : undefined,
      };
    });

  return [...publicPageUrls, ...projectUrls];
}
