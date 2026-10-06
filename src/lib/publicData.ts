import "server-only";

import { unstable_cache } from "next/cache";
import type { AdminCustomLink } from "@/lib/constants/defaults";
import {
  getAboutContentDb,
  getBentoContentDb,
  getHeroContentDb,
  getSiteSettingsDb,
} from "@/lib/db/content";
import { getGalleryPhotosDb } from "@/lib/db/gallery";
import { fetchAllEntries } from "@/lib/db/guestbook";
import { getLinksDb } from "@/lib/db/links";
import { getFeaturedProjectsDb, getProjectsDb } from "@/lib/db/projects";
import { getTechStackDb } from "@/lib/db/stack";

export const PUBLIC_DATA_TAGS = {
  about: "public-about",
  bento: "public-bento",
  gallery: "public-gallery",
  guestbook: "public-guestbook",
  hero: "public-hero",
  links: "public-links",
  projects: "public-projects",
  settings: "public-settings",
  stack: "public-stack",
} as const;

const cacheOptions = (tag: string) => ({
  revalidate: 60,
  tags: [tag],
});

export const getCachedAboutContent = unstable_cache(
  getAboutContentDb,
  ["public-about-content"],
  cacheOptions(PUBLIC_DATA_TAGS.about),
);

export const getCachedBentoContent = unstable_cache(
  getBentoContentDb,
  ["public-bento-content"],
  cacheOptions(PUBLIC_DATA_TAGS.bento),
);

export const getCachedGalleryPhotos = unstable_cache(
  getGalleryPhotosDb,
  ["public-gallery-photos"],
  cacheOptions(PUBLIC_DATA_TAGS.gallery),
);

export const getCachedGuestbookEntries = unstable_cache(
  fetchAllEntries,
  ["public-guestbook-entries"],
  cacheOptions(PUBLIC_DATA_TAGS.guestbook),
);

export const getCachedHeroContent = unstable_cache(
  getHeroContentDb,
  ["public-hero-content"],
  cacheOptions(PUBLIC_DATA_TAGS.hero),
);

export const getCachedPublicLinks = unstable_cache(
  async (): Promise<AdminCustomLink[]> =>
    (await getLinksDb()).filter((link) => link.active),
  ["public-active-links"],
  cacheOptions(PUBLIC_DATA_TAGS.links),
);

export const getCachedFeaturedProjects = unstable_cache(
  getFeaturedProjectsDb,
  ["public-featured-projects"],
  cacheOptions(PUBLIC_DATA_TAGS.projects),
);

export const getCachedProjects = unstable_cache(
  getProjectsDb,
  ["public-projects"],
  cacheOptions(PUBLIC_DATA_TAGS.projects),
);

export const getCachedSiteSettings = unstable_cache(
  getSiteSettingsDb,
  ["public-site-settings"],
  cacheOptions(PUBLIC_DATA_TAGS.settings),
);

export const getCachedTechStack = unstable_cache(
  getTechStackDb,
  ["public-tech-stack"],
  cacheOptions(PUBLIC_DATA_TAGS.stack),
);
