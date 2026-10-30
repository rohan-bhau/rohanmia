import type { MetadataRoute } from "next";
import { getProjectSeoListDb, getAllPageSeoDb, getSeoSettingsDb } from "@/lib/db/seo";
import { getBaseSiteUrl } from "@/lib/seo/metadata";
import { getCachedAboutContent, getCachedGalleryPhotos } from "@/lib/publicData";

function toAbsoluteUrl(url: string | null | undefined, baseUrl: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${baseUrl}${cleanPath}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [seoSettings, pageSeoList, projects, galleryPhotos, aboutContent] = await Promise.all([
    getSeoSettingsDb().catch(() => null),
    getAllPageSeoDb().catch(() => []),
    getProjectSeoListDb().catch(() => []),
    getCachedGalleryPhotos().catch(() => []),
    getCachedAboutContent().catch(() => null),
  ]);

  const baseUrl = getBaseSiteUrl(seoSettings?.canonical_base_url);
  const profileImage = toAbsoluteUrl(seoSettings?.profile_image_url, baseUrl);

  // Collect about carousel images
  const aboutCarouselImages: string[] = [];
  if (profileImage) aboutCarouselImages.push(profileImage);
  if (aboutContent?.carousel_items && Array.isArray(aboutContent.carousel_items)) {
    for (const item of aboutContent.carousel_items) {
      const abs = toAbsoluteUrl(item?.image, baseUrl);
      if (abs && !aboutCarouselImages.includes(abs)) {
        aboutCarouselImages.push(abs);
      }
    }
  }

  // Collect published gallery images
  const galleryImages: string[] = [];
  if (Array.isArray(galleryPhotos)) {
    for (const photo of galleryPhotos) {
      const abs = toAbsoluteUrl(photo?.src, baseUrl);
      if (abs && !galleryImages.includes(abs)) {
        galleryImages.push(abs);
      }
    }
  }

  // Collect all projects preview images
  const projectPreviewImages: string[] = [];
  if (Array.isArray(projects)) {
    for (const project of projects) {
      if (project.no_index) continue;
      const abs = toAbsoluteUrl(project.preview_image || project.og_image, baseUrl);
      if (abs && !projectPreviewImages.includes(abs)) {
        projectPreviewImages.push(abs);
      }
    }
  }

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
      images: aboutCarouselImages.length > 0 ? aboutCarouselImages : undefined,
    },
    {
      path: "/projects",
      priority: 0.9,
      changeFrequency: "weekly",
      images: projectPreviewImages.length > 0 ? projectPreviewImages : undefined,
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
      images: galleryImages.length > 0 ? galleryImages : undefined,
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

      const projectImg = toAbsoluteUrl(project.preview_image || project.og_image, baseUrl);

      return {
        url: projectCanonical,
        lastModified: lastModDate,
        changeFrequency: "monthly",
        priority: project.featured ? 0.85 : 0.75,
        images: projectImg ? [projectImg] : undefined,
      };
    });

  return [...publicPageUrls, ...projectUrls];
}
