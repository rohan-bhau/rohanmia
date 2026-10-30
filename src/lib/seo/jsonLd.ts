import { DbSeoSettingsRow } from "@/lib/db/seo";

/**
 * Escapes HTML opening characters to prevent XSS injection inside <script type="application/ld+json">
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function generatePersonJsonLd(
  seo: DbSeoSettingsRow,
  baseUrl: string
) {
  const cleanBase = baseUrl ? baseUrl.replace(/\/+$/, "") : "";
  let baseHostname = "";
  if (cleanBase) {
    try {
      baseHostname = new URL(cleanBase).hostname.toLowerCase();
    } catch {
      // Ignore parse failure on base URL
    }
  }

  // Generate sameAs exclusively from explicitly configured social profiles in SEO dashboard
  const validSocials = Array.from(new Set(seo.social_profiles || []))
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter((url): url is string => {
      if (!url) return false;
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          return false;
        }
        const host = parsed.hostname.toLowerCase();
        // Exclude self-referential internal domain URLs
        if (baseHostname && host === baseHostname) {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    });

  const profileImageUrl = seo.profile_image_url || undefined;
  const primaryTitle = seo.professional_title?.trim() || undefined;
  const locationParts = [seo.location_locality, seo.location_country].filter(Boolean).join(", ");
  const disambiguation = seo.primary_name
    ? `${seo.primary_name}${seo.nickname ? ` (${seo.nickname})` : ""}${primaryTitle ? `, ${primaryTitle}` : ""}${
        locationParts ? ` based in ${locationParts}` : ""
      }.`
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    ...(cleanBase ? { "@id": `${cleanBase}#person` } : {}),
    name: seo.primary_name || undefined,
    alternateName: seo.alternate_names?.length ? seo.alternate_names : undefined,
    nickname: seo.nickname || undefined,
    ...(cleanBase ? { url: cleanBase } : {}),
    image: profileImageUrl
      ? {
          "@type": "ImageObject",
          ...(cleanBase ? { "@id": `${cleanBase}#profile-image` } : {}),
          url: profileImageUrl,
          contentUrl: profileImageUrl,
          caption: seo.profile_image_caption || seo.profile_image_alt || undefined,
          description: seo.profile_image_alt || undefined,
        }
      : undefined,
    jobTitle: primaryTitle,
    disambiguatingDescription: disambiguation,
    hasOccupation: primaryTitle
      ? {
          "@type": "Occupation",
          name: primaryTitle,
          skills: seo.skills?.length ? seo.skills.join(", ") : undefined,
        }
      : undefined,
    description: seo.detailed_bio || seo.short_bio || seo.default_meta_description || undefined,
    address:
      seo.location_locality || seo.location_country
        ? {
            "@type": "PostalAddress",
            addressLocality: seo.location_locality || undefined,
            addressCountry: seo.location_country || undefined,
          }
        : undefined,
    knowsAbout: seo.skills?.length ? seo.skills : undefined,
    sameAs: validSocials.length > 0 ? validSocials : undefined,
  };
}

export function generateWebSiteJsonLd(seo: DbSeoSettingsRow, baseUrl: string) {
  const cleanBase = baseUrl ? baseUrl.replace(/\/+$/, "") : "";

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    ...(cleanBase ? { "@id": `${cleanBase}#website`, url: cleanBase } : {}),
    name: seo.default_meta_title || seo.primary_name || undefined,
    alternateName: seo.alternate_names?.length ? seo.alternate_names : undefined,
    description: seo.default_meta_description || undefined,
    publisher: cleanBase
      ? {
          "@id": `${cleanBase}#person`,
        }
      : undefined,
    inLanguage: "en-US",
  };
}

export function generateProfilePageJsonLd(
  seo: DbSeoSettingsRow,
  baseUrl: string,
  dateModified?: string,
  pageImages: string[] = []
) {
  const cleanBase = baseUrl ? baseUrl.replace(/\/+$/, "") : "";
  let baseHostname = "";
  if (cleanBase) {
    try {
      baseHostname = new URL(cleanBase).hostname.toLowerCase();
    } catch {
      // Ignore parse failure
    }
  }

  const validSocials = Array.from(new Set(seo.social_profiles || []))
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter((url): url is string => {
      if (!url) return false;
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
        if (baseHostname && parsed.hostname.toLowerCase() === baseHostname) return false;
        return true;
      } catch {
        return false;
      }
    });

  const allImages = Array.from(
    new Set([
      ...(seo.profile_image_url ? [seo.profile_image_url] : []),
      ...pageImages,
    ])
  ).filter(Boolean);

  const primaryTitle = seo.professional_title?.trim() || undefined;
  const locationParts = [seo.location_locality, seo.location_country].filter(Boolean).join(", ");
  const disambiguation = seo.primary_name
    ? `${seo.primary_name}${seo.nickname ? ` (${seo.nickname})` : ""}${primaryTitle ? `, ${primaryTitle}` : ""}${
        locationParts ? ` based in ${locationParts}` : ""
      }.`
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    ...(cleanBase
      ? {
          "@id": `${cleanBase}/about#profilepage`,
          url: `${cleanBase}/about`,
        }
      : {}),
    name: seo.primary_name
      ? `About ${seo.primary_name}${seo.nickname ? ` (${seo.nickname})` : ""}`
      : undefined,
    description: seo.detailed_bio || seo.short_bio || undefined,
    dateModified: dateModified || seo.updated_at || undefined,
    mainEntity: {
      "@type": "Person",
      ...(cleanBase ? { "@id": `${cleanBase}#person`, url: cleanBase } : {}),
      name: seo.primary_name || undefined,
      alternateName: seo.alternate_names?.length ? seo.alternate_names : undefined,
      jobTitle: primaryTitle,
      disambiguatingDescription: disambiguation,
      description: seo.detailed_bio || seo.short_bio || undefined,
      image: seo.profile_image_url || undefined,
      sameAs: validSocials.length > 0 ? validSocials : undefined,
    },
    primaryImageOfPage:
      cleanBase && seo.profile_image_url
        ? {
            "@id": `${cleanBase}#profile-image`,
          }
        : undefined,
    image: allImages.length > 0 ? allImages : undefined,
  };
}

export function generateImageGalleryJsonLd(
  photos: Array<{ src: string; title: string; category?: string; caption?: string }>,
  baseUrl: string,
  authorName?: string
) {
  const cleanBase = baseUrl ? baseUrl.replace(/\/+$/, "") : "";
  const galleryUrl = cleanBase ? `${cleanBase}/gallery` : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    ...(galleryUrl ? { "@id": `${galleryUrl}#gallery`, url: galleryUrl } : {}),
    name: authorName ? `Visual Archive & Moments — ${authorName}` : "Visual Archive & Moments",
    description: authorName
      ? `Curated visual chronicle of personal milestones, travels, and workspaces by ${authorName}.`
      : "Curated visual chronicle of personal milestones, travels, and workspaces.",
    author: cleanBase
      ? {
          "@id": `${cleanBase}#person`,
        }
      : undefined,
    image: photos.map((photo, index) => {
      const fullSrc = photo.src.startsWith("http")
        ? photo.src
        : cleanBase
        ? `${cleanBase}${photo.src}`
        : photo.src;

      return {
        "@type": "ImageObject",
        position: index + 1,
        contentUrl: fullSrc,
        url: fullSrc,
        name: photo.title,
        caption: photo.caption || photo.title,
        description: photo.caption || `${photo.title} (${photo.category || "Moment"})`,
        ...(cleanBase
          ? {
              author: {
                "@id": `${cleanBase}#person`,
              },
            }
          : {}),
      };
    }),
  };
}

export function generateProjectJsonLd(
  project: {
    slug: string;
    title: string;
    tagline?: string | null;
    overview?: string | null;
    preview_image?: string | null;
    live_url?: string | null;
    github_url?: string | null;
    tech_stack?: string[] | null;
    created_at?: string;
    updated_at?: string;
  },
  seo: DbSeoSettingsRow,
  baseUrl: string
) {
  const cleanBase = baseUrl ? baseUrl.replace(/\/+$/, "") : "";
  const projectUrl = cleanBase ? `${cleanBase}/projects/${project.slug}` : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    ...(projectUrl ? { "@id": `${projectUrl}#software`, url: projectUrl } : {}),
    name: project.title,
    headline: project.tagline || project.title,
    description: project.overview || project.tagline || project.title,
    applicationCategory: "WebApplication",
    operatingSystem: "Web Browser",
    image: project.preview_image || seo.profile_image_url || undefined,
    author: cleanBase
      ? {
          "@id": `${cleanBase}#person`,
        }
      : undefined,
    creator: cleanBase
      ? {
          "@id": `${cleanBase}#person`,
        }
      : undefined,
    publisher: cleanBase
      ? {
          "@id": `${cleanBase}#person`,
        }
      : undefined,
    keywords: project.tech_stack?.join(", ") || undefined,
    datePublished: project.created_at,
    dateModified: project.updated_at,
  };
}

export function generateProjectsCollectionJsonLd(
  projects: Array<{ slug: string; title: string; tagline?: string | null }>,
  seo: DbSeoSettingsRow,
  baseUrl: string
) {
  const cleanBase = baseUrl ? baseUrl.replace(/\/+$/, "") : "";

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    ...(cleanBase
      ? {
          "@id": `${cleanBase}/projects#collection`,
          url: `${cleanBase}/projects`,
        }
      : {}),
    name: seo.primary_name
      ? `Engineering Projects & Architecture Case Studies by ${seo.primary_name}`
      : undefined,
    description: seo.short_bio || undefined,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projects.map((p, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: p.title,
        ...(cleanBase ? { url: `${cleanBase}/projects/${p.slug}` } : {}),
        description: p.tagline || undefined,
      })),
    },
  };
}
