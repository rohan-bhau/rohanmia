import type { Metadata } from "next";
import { getCachedSeoSettings, getCachedPageSeo } from "@/lib/publicData";
import { DbProjectSeoItem } from "@/lib/db/seo";

export function getBaseSiteUrl(canonicalOverride?: string | null): string {
  if (canonicalOverride && canonicalOverride.startsWith("http")) {
    return canonicalOverride.replace(/\/+$/, "");
  }
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL || "";
  if (fromEnv.startsWith("http")) {
    return fromEnv.replace(/\/+$/, "");
  }
  return "";
}

export interface BuildMetadataParams {
  path: string;
  project?: Partial<DbProjectSeoItem & { title?: string; tagline?: string; overview?: string }>;
}

export async function buildDynamicMetadata({
  path,
  project,
}: BuildMetadataParams): Promise<Metadata> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const [seoSettings, pageSeo] = await Promise.all([
    getCachedSeoSettings().catch(() => null),
    getCachedPageSeo(normalizedPath).catch(() => null),
  ]);

  const baseUrl = getBaseSiteUrl(seoSettings?.canonical_base_url);
  const cleanPath = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = pageSeo?.canonical_url || project?.canonical_url || (baseUrl ? `${baseUrl}${cleanPath}` : undefined);

  const title =
    project?.seo_title ||
    (project?.title ? `${project.title}${seoSettings?.default_meta_title ? ` | ${seoSettings.default_meta_title}` : ""}` : "") ||
    pageSeo?.title ||
    seoSettings?.default_meta_title ||
    "";

  const description =
    project?.seo_description ||
    project?.tagline ||
    project?.overview ||
    pageSeo?.description ||
    seoSettings?.default_meta_description ||
    "";

  const ogTitle =
    project?.seo_title ||
    (project?.title ? `${project.title}${seoSettings?.default_meta_title ? ` | ${seoSettings.default_meta_title}` : ""}` : "") ||
    pageSeo?.og_title ||
    pageSeo?.title ||
    seoSettings?.default_og_title ||
    title;

  const ogDescription =
    project?.seo_description ||
    project?.tagline ||
    project?.overview ||
    pageSeo?.og_description ||
    pageSeo?.description ||
    seoSettings?.default_og_description ||
    description;

  const ogImageUrl =
    project?.og_image ||
    project?.preview_image ||
    pageSeo?.og_image ||
    seoSettings?.default_og_image ||
    seoSettings?.profile_image_url ||
    "";

  const ogImageAlt =
    project?.og_image_alt ||
    pageSeo?.og_image_alt ||
    seoSettings?.profile_image_alt ||
    "";

  const isIndexed =
    project?.no_index === true
      ? false
      : pageSeo?.robots_index !== undefined
      ? pageSeo.robots_index
      : seoSettings?.default_robots_index !== undefined
      ? seoSettings.default_robots_index
      : true;

  const isFollowed =
    pageSeo?.robots_follow !== undefined
      ? pageSeo.robots_follow
      : seoSettings?.default_robots_follow !== undefined
      ? seoSettings.default_robots_follow
      : true;

  const twitterCard =
    pageSeo?.twitter_card ||
    seoSettings?.default_twitter_card ||
    "summary_large_image";

  const googleVerification = seoSettings?.google_verification_token || "";

  const keywordsList: string[] = Array.from(
    new Set([
      ...(pageSeo?.keywords || []),
      ...(project?.keywords || []),
      ...(seoSettings?.target_keywords || []),
    ])
  );

  return {
    ...(baseUrl ? { metadataBase: new URL(baseUrl) } : {}),
    title: title || undefined,
    description: description || undefined,
    keywords: keywordsList.length > 0 ? keywordsList : undefined,
    alternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
        }
      : undefined,
    robots: {
      index: isIndexed,
      follow: isFollowed,
      googleBot: {
        index: isIndexed,
        follow: isFollowed,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: googleVerification
      ? {
          google: googleVerification,
        }
      : undefined,
    openGraph: {
      type: "website",
      locale: "en_US",
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      title: ogTitle || undefined,
      description: ogDescription || undefined,
      siteName: seoSettings?.primary_name || undefined,
      images: ogImageUrl
        ? [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: ogImageAlt || undefined,
            },
          ]
        : undefined,
    },
    twitter: {
      card: twitterCard,
      title: ogTitle || undefined,
      description: ogDescription || undefined,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };
}
