import { executeSql, escapeSqlString, escapeSqlJson } from '@/lib/postgres';
import { ensurePortfolioTables } from './schema';

export interface DbHeroContentRow {
  id: string;
  greeting: string;
  name: string;
  surname: string;
  bio: string;
  profile_image: string;
  resume_url: string;
  rotating_roles: string[];
  stats: any[];
  updated_at: string;
}

export interface DbBentoContentRow {
  id: string;
  badge: string;
  title: string;
  cards: any;
  tech_radar: any[];
  updated_at: string;
}

export interface DbAboutContentRow {
  id: string;
  eyebrow: string;
  heading_title: string;
  heading_highlight: string;
  bio_paragraphs: string[];
  career_experiences: any[];
  engineering_principles: any[];
  education: any[];
  core_competencies: any[];
  carousel_items: any[];
  updated_at: string;
}

export interface DbSiteSettingsRow {
  id: string;
  site_title: string;
  meta_description: string;
  contact_email: string;
  social_links: Record<string, string>;
  resume_url: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Hero Content
// ---------------------------------------------------------------------------
export async function getHeroContentDb(): Promise<DbHeroContentRow | null> {
  await ensurePortfolioTables();
  const res = await executeSql<DbHeroContentRow>(
    `SELECT * FROM hero_content WHERE id = 'primary' LIMIT 1;`
  );
  return res.rows[0] || null;
}

export async function updateHeroContentDb(data: Partial<DbHeroContentRow>): Promise<DbHeroContentRow> {
  await ensurePortfolioTables();
  const query = `
    INSERT INTO hero_content (
      id, greeting, name, surname, bio, profile_image, resume_url, rotating_roles, stats, updated_at
    ) VALUES (
      'primary',
      ${escapeSqlString(data.greeting ?? "Hi, I'm")},
      ${escapeSqlString(data.name ?? "Rohan")},
      ${escapeSqlString(data.surname ?? "Mia")},
      ${escapeSqlString(data.bio ?? "")},
      ${escapeSqlString(data.profile_image ?? "")},
      ${escapeSqlString(data.resume_url ?? "/resume.pdf")},
      ${escapeSqlJson(data.rotating_roles ?? [])},
      ${escapeSqlJson(data.stats ?? [])},
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
      greeting = EXCLUDED.greeting,
      name = EXCLUDED.name,
      surname = EXCLUDED.surname,
      bio = EXCLUDED.bio,
      profile_image = EXCLUDED.profile_image,
      resume_url = EXCLUDED.resume_url,
      rotating_roles = EXCLUDED.rotating_roles,
      stats = EXCLUDED.stats,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const res = await executeSql<DbHeroContentRow>(query);
  return res.rows[0];
}

// ---------------------------------------------------------------------------
// Bento Content
// ---------------------------------------------------------------------------
export async function getBentoContentDb(): Promise<DbBentoContentRow | null> {
  await ensurePortfolioTables();
  const res = await executeSql<DbBentoContentRow>(
    `SELECT * FROM bento_content WHERE id = 'primary' LIMIT 1;`
  );
  return res.rows[0] || null;
}

export async function updateBentoContentDb(data: Partial<DbBentoContentRow>): Promise<DbBentoContentRow> {
  await ensurePortfolioTables();
  const query = `
    INSERT INTO bento_content (
      id, badge, title, cards, tech_radar, updated_at
    ) VALUES (
      'primary',
      ${escapeSqlString(data.badge ?? "At A Glance")},
      ${escapeSqlString(data.title ?? "Overview & Work")},
      ${escapeSqlJson(data.cards ?? {})},
      ${escapeSqlJson(data.tech_radar ?? [])},
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
      badge = EXCLUDED.badge,
      title = EXCLUDED.title,
      cards = EXCLUDED.cards,
      tech_radar = EXCLUDED.tech_radar,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const res = await executeSql<DbBentoContentRow>(query);
  return res.rows[0];
}

// ---------------------------------------------------------------------------
// About Content
// ---------------------------------------------------------------------------
export async function getAboutContentDb(): Promise<DbAboutContentRow | null> {
  await ensurePortfolioTables();
  const res = await executeSql<DbAboutContentRow>(
    `SELECT * FROM about_content WHERE id = 'primary' LIMIT 1;`
  );
  return res.rows[0] || null;
}

export async function updateAboutContentDb(data: Partial<DbAboutContentRow>): Promise<DbAboutContentRow> {
  await ensurePortfolioTables();
  const query = `
    INSERT INTO about_content (
      id, eyebrow, heading_title, heading_highlight,
      bio_paragraphs, career_experiences, engineering_principles,
      education, core_competencies, carousel_items, updated_at
    ) VALUES (
      'primary',
      ${escapeSqlString(data.eyebrow ?? "MORE ABOUT ME")},
      ${escapeSqlString(data.heading_title ?? "I'm Rohan, a")},
      ${escapeSqlString(data.heading_highlight ?? "creative engineer")},
      ${escapeSqlJson(data.bio_paragraphs ?? [])},
      ${escapeSqlJson(data.career_experiences ?? [])},
      ${escapeSqlJson(data.engineering_principles ?? [])},
      ${escapeSqlJson(data.education ?? [])},
      ${escapeSqlJson(data.core_competencies ?? [])},
      ${escapeSqlJson(data.carousel_items ?? [])},
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
      eyebrow = EXCLUDED.eyebrow,
      heading_title = EXCLUDED.heading_title,
      heading_highlight = EXCLUDED.heading_highlight,
      bio_paragraphs = EXCLUDED.bio_paragraphs,
      career_experiences = EXCLUDED.career_experiences,
      engineering_principles = EXCLUDED.engineering_principles,
      education = EXCLUDED.education,
      core_competencies = EXCLUDED.core_competencies,
      carousel_items = EXCLUDED.carousel_items,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const res = await executeSql<DbAboutContentRow>(query);
  return res.rows[0];
}

// ---------------------------------------------------------------------------
// Site Settings
// ---------------------------------------------------------------------------
export async function getSiteSettingsDb(): Promise<DbSiteSettingsRow | null> {
  await ensurePortfolioTables();
  const res = await executeSql<DbSiteSettingsRow>(
    `SELECT * FROM site_settings WHERE id = 'primary' LIMIT 1;`
  );
  return res.rows[0] || null;
}

export async function updateSiteSettingsDb(data: Partial<DbSiteSettingsRow>): Promise<DbSiteSettingsRow> {
  await ensurePortfolioTables();
  const query = `
    INSERT INTO site_settings (
      id, site_title, meta_description, contact_email, social_links, resume_url, updated_at
    ) VALUES (
      'primary',
      ${escapeSqlString(data.site_title ?? "MD Rohan Mia | Full-Stack Software Engineer")},
      ${escapeSqlString(data.meta_description ?? "")},
      ${escapeSqlString(data.contact_email ?? "rohanmia.org@gmail.com")},
      ${escapeSqlJson(data.social_links ?? {})},
      ${escapeSqlString(data.resume_url ?? "/resume.pdf")},
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
      site_title = EXCLUDED.site_title,
      meta_description = EXCLUDED.meta_description,
      contact_email = EXCLUDED.contact_email,
      social_links = EXCLUDED.social_links,
      resume_url = EXCLUDED.resume_url,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const res = await executeSql<DbSiteSettingsRow>(query);
  return res.rows[0];
}
