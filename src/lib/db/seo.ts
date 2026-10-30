import { executeSql, escapeSqlString, escapeSqlJson } from "@/lib/postgres";
import { ensurePortfolioTables } from "./schema";

export interface DbSeoSettingsRow {
  id: string;
  // Personal Identity
  primary_name: string;
  alternate_names: string[];
  nickname: string;
  professional_title: string;
  location_locality: string;
  location_country: string;
  short_bio: string;
  detailed_bio: string;
  skills: string[];
  canonical_base_url: string;

  // Global Metadata
  default_meta_title: string;
  default_meta_description: string;
  default_og_title: string;
  default_og_description: string;
  default_og_image: string;
  google_verification_token: string;
  google_tag_id: string;
  default_robots_index: boolean;
  default_robots_follow: boolean;
  default_twitter_card: "summary_large_image" | "summary";

  // Profile Image SEO
  profile_image_url: string;
  profile_image_alt: string;
  profile_image_title: string;
  profile_image_caption: string;
  profile_image_variants: {
    square_1x1?: string;
    photo_4x3?: string;
    landscape_16x9?: string;
  };

  // Social Identity (Verified URLs for sameAs JSON-LD)
  social_profiles: string[];

  // Target Keywords (Internal planning)
  target_keywords: string[];

  updated_at: string;
}

export interface DbPageSeoRow {
  page_path: string;
  title: string | null;
  description: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  og_image_alt: string | null;
  twitter_card: "summary_large_image" | "summary" | null;
  robots_index: boolean;
  robots_follow: boolean;
  keywords: string[];
  updated_at: string;
}

export interface DbProjectSeoItem {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  category: string;
  preview_image: string | null;
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  og_image: string | null;
  og_image_alt: string | null;
  no_index: boolean;
  keywords: string[];
  updated_at: string;
}

export async function getSeoSettingsDb(): Promise<DbSeoSettingsRow | null> {
  await ensurePortfolioTables();
  const res = await executeSql<DbSeoSettingsRow>(
    `SELECT * FROM seo_settings WHERE id = 'primary' LIMIT 1;`
  );
  return res.rows[0] || null;
}

export async function updateSeoSettingsDb(
  data: Partial<DbSeoSettingsRow>
): Promise<DbSeoSettingsRow> {
  await ensurePortfolioTables();

  const allowed: { name: keyof DbSeoSettingsRow; json: boolean }[] = [
    { name: "primary_name", json: false },
    { name: "alternate_names", json: true },
    { name: "nickname", json: false },
    { name: "professional_title", json: false },
    { name: "location_locality", json: false },
    { name: "location_country", json: false },
    { name: "short_bio", json: false },
    { name: "detailed_bio", json: false },
    { name: "skills", json: true },
    { name: "canonical_base_url", json: false },
    { name: "default_meta_title", json: false },
    { name: "default_meta_description", json: false },
    { name: "default_og_title", json: false },
    { name: "default_og_description", json: false },
    { name: "default_og_image", json: false },
    { name: "google_verification_token", json: false },
    { name: "google_tag_id", json: false },
    { name: "default_robots_index", json: false },
    { name: "default_robots_follow", json: false },
    { name: "default_twitter_card", json: false },
    { name: "profile_image_url", json: false },
    { name: "profile_image_alt", json: false },
    { name: "profile_image_title", json: false },
    { name: "profile_image_caption", json: false },
    { name: "profile_image_variants", json: true },
    { name: "social_profiles", json: true },
    { name: "target_keywords", json: true },
  ];

  await executeSql(
    `INSERT INTO seo_settings (id, updated_at) VALUES ('primary', CURRENT_TIMESTAMP) ON CONFLICT (id) DO NOTHING;`
  );

  const cols = allowed.filter((c) => (data as any)[c.name] !== undefined);
  if (cols.length === 0) {
    const res = await executeSql<DbSeoSettingsRow>(
      `SELECT * FROM seo_settings WHERE id = 'primary' LIMIT 1;`
    );
    return res.rows[0];
  }

  const setClause = [
    ...cols.map((c) => {
      const val = (data as any)[c.name];
      if (typeof val === "boolean") {
        return `${c.name} = ${val ? "true" : "false"}`;
      }
      return `${c.name} = ${c.json ? escapeSqlJson(val) : escapeSqlString(val)}`;
    }),
    "updated_at = CURRENT_TIMESTAMP",
  ].join(", ");

  const res = await executeSql<DbSeoSettingsRow>(
    `UPDATE seo_settings SET ${setClause} WHERE id = 'primary' RETURNING *;`
  );

  return res.rows[0];
}

export async function getAllPageSeoDb(): Promise<DbPageSeoRow[]> {
  await ensurePortfolioTables();
  const res = await executeSql<DbPageSeoRow>(
    `SELECT * FROM page_seo ORDER BY page_path ASC;`
  );
  return res.rows;
}

export async function getPageSeoDb(
  pagePath: string
): Promise<DbPageSeoRow | null> {
  await ensurePortfolioTables();
  const res = await executeSql<DbPageSeoRow>(
    `SELECT * FROM page_seo WHERE page_path = ${escapeSqlString(pagePath)} LIMIT 1;`
  );
  return res.rows[0] || null;
}

export async function upsertPageSeoDb(
  data: Partial<DbPageSeoRow> & { page_path: string }
): Promise<DbPageSeoRow> {
  await ensurePortfolioTables();
  const pagePath = data.page_path.trim();

  // 1. Ensure the row exists
  await executeSql(`
    INSERT INTO page_seo (page_path, updated_at)
    VALUES (${escapeSqlString(pagePath)}, CURRENT_TIMESTAMP)
    ON CONFLICT (page_path) DO NOTHING;
  `);

  // 2. Build partial update SET clause ONLY for fields that are defined
  const setClauses: string[] = [];

  if (data.title !== undefined) {
    const val = typeof data.title === "string" ? data.title.trim() : data.title;
    setClauses.push(val ? `title = ${escapeSqlString(val)}` : `title = NULL`);
  }
  if (data.description !== undefined) {
    const val = typeof data.description === "string" ? data.description.trim() : data.description;
    setClauses.push(val ? `description = ${escapeSqlString(val)}` : `description = NULL`);
  }
  if (data.canonical_url !== undefined) {
    const val = typeof data.canonical_url === "string" ? data.canonical_url.trim() : data.canonical_url;
    setClauses.push(val ? `canonical_url = ${escapeSqlString(val)}` : `canonical_url = NULL`);
  }
  if (data.og_title !== undefined) {
    const val = typeof data.og_title === "string" ? data.og_title.trim() : data.og_title;
    setClauses.push(val ? `og_title = ${escapeSqlString(val)}` : `og_title = NULL`);
  }
  if (data.og_description !== undefined) {
    const val = typeof data.og_description === "string" ? data.og_description.trim() : data.og_description;
    setClauses.push(val ? `og_description = ${escapeSqlString(val)}` : `og_description = NULL`);
  }
  if (data.og_image !== undefined) {
    const val = typeof data.og_image === "string" ? data.og_image.trim() : data.og_image;
    setClauses.push(val ? `og_image = ${escapeSqlString(val)}` : `og_image = NULL`);
  }
  if (data.og_image_alt !== undefined) {
    const val = typeof data.og_image_alt === "string" ? data.og_image_alt.trim() : data.og_image_alt;
    setClauses.push(val ? `og_image_alt = ${escapeSqlString(val)}` : `og_image_alt = NULL`);
  }
  if (data.twitter_card !== undefined) {
    setClauses.push(`twitter_card = ${escapeSqlString(data.twitter_card || "summary_large_image")}`);
  }
  if (data.robots_index !== undefined) {
    setClauses.push(`robots_index = ${data.robots_index ? "true" : "false"}`);
  }
  if (data.robots_follow !== undefined) {
    setClauses.push(`robots_follow = ${data.robots_follow ? "true" : "false"}`);
  }
  if (data.keywords !== undefined) {
    setClauses.push(`keywords = ${escapeSqlJson(data.keywords || [])}`);
  }

  setClauses.push("updated_at = CURRENT_TIMESTAMP");

  const query = `
    UPDATE page_seo
    SET ${setClauses.join(", ")}
    WHERE page_path = ${escapeSqlString(pagePath)}
    RETURNING *;
  `;

  const res = await executeSql<DbPageSeoRow>(query);
  return res.rows[0];
}

export async function getProjectSeoListDb(): Promise<DbProjectSeoItem[]> {
  await ensurePortfolioTables();
  const res = await executeSql<DbProjectSeoItem>(`
    SELECT 
      id, slug, title, tagline, category, preview_image, featured,
      seo_title, seo_description, canonical_url, og_image, og_image_alt,
      COALESCE(no_index, false) as no_index,
      COALESCE(keywords, '[]'::jsonb) as keywords,
      updated_at
    FROM projects
    ORDER BY sort_order ASC, created_at DESC;
  `);
  return res.rows;
}

export async function updateProjectSeoDb(
  id: string,
  data: {
    seo_title?: string | null;
    seo_description?: string | null;
    canonical_url?: string | null;
    og_image?: string | null;
    og_image_alt?: string | null;
    no_index?: boolean;
    keywords?: string[];
  }
): Promise<void> {
  await ensurePortfolioTables();

  const updates: string[] = [];
  if (data.seo_title !== undefined) {
    const val = typeof data.seo_title === "string" ? data.seo_title.trim() : data.seo_title;
    updates.push(val ? `seo_title = ${escapeSqlString(val)}` : `seo_title = NULL`);
  }
  if (data.seo_description !== undefined) {
    const val = typeof data.seo_description === "string" ? data.seo_description.trim() : data.seo_description;
    updates.push(val ? `seo_description = ${escapeSqlString(val)}` : `seo_description = NULL`);
  }
  if (data.canonical_url !== undefined) {
    const val = typeof data.canonical_url === "string" ? data.canonical_url.trim() : data.canonical_url;
    updates.push(val ? `canonical_url = ${escapeSqlString(val)}` : `canonical_url = NULL`);
  }
  if (data.og_image !== undefined) {
    const val = typeof data.og_image === "string" ? data.og_image.trim() : data.og_image;
    updates.push(val ? `og_image = ${escapeSqlString(val)}` : `og_image = NULL`);
  }
  if (data.og_image_alt !== undefined) {
    const val = typeof data.og_image_alt === "string" ? data.og_image_alt.trim() : data.og_image_alt;
    updates.push(val ? `og_image_alt = ${escapeSqlString(val)}` : `og_image_alt = NULL`);
  }
  if (data.no_index !== undefined) updates.push(`no_index = ${data.no_index ? "true" : "false"}`);
  if (data.keywords !== undefined) updates.push(`keywords = ${escapeSqlJson(data.keywords)}`);

  if (updates.length === 0) return;
  updates.push("updated_at = CURRENT_TIMESTAMP");

  await executeSql(`
    UPDATE projects 
    SET ${updates.join(", ")}
    WHERE id = ${escapeSqlString(id)} OR slug = ${escapeSqlString(id)};
  `);
}
