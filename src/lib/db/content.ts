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
  social_links: Record<string, any>;
  resume_url: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Safe partial upsert helper
// Only the keys present in `data` are written. Untouched columns are NEVER
// overwritten, so saving one section can never wipe another section's data.
// ---------------------------------------------------------------------------
async function safePartialUpsert<T>(
  table: string,
  data: Record<string, any>,
  allowed: { name: string; json: boolean }[]
): Promise<T> {
  const cols = allowed.filter((c) => data[c.name] !== undefined);
  const toSql = (c: { name: string; json: boolean }) =>
    c.json ? escapeSqlJson(data[c.name]) : escapeSqlString(data[c.name]);

  // Ensure the row exists without touching any column values
  await executeSql(
    `INSERT INTO ${table} (id, updated_at) VALUES ('primary', CURRENT_TIMESTAMP) ON CONFLICT (id) DO NOTHING;`
  );

  const setClause = [
    ...cols.map((c) => `${c.name} = ${toSql(c)}`),
    'updated_at = CURRENT_TIMESTAMP',
  ].join(', ');

  const res = await executeSql<T>(
    `UPDATE ${table} SET ${setClause} WHERE id = 'primary' RETURNING *;`
  );
  return res.rows[0];
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
  return safePartialUpsert<DbHeroContentRow>('hero_content', data, [
    { name: 'greeting', json: false },
    { name: 'name', json: false },
    { name: 'surname', json: false },
    { name: 'bio', json: false },
    { name: 'profile_image', json: false },
    { name: 'resume_url', json: false },
    { name: 'rotating_roles', json: true },
    { name: 'stats', json: true },
  ]);
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
  return safePartialUpsert<DbBentoContentRow>('bento_content', data, [
    { name: 'badge', json: false },
    { name: 'title', json: false },
    { name: 'cards', json: true },
    { name: 'tech_radar', json: true },
  ]);
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
  return safePartialUpsert<DbAboutContentRow>('about_content', data, [
    { name: 'eyebrow', json: false },
    { name: 'heading_title', json: false },
    { name: 'heading_highlight', json: false },
    { name: 'bio_paragraphs', json: true },
    { name: 'career_experiences', json: true },
    { name: 'engineering_principles', json: true },
    { name: 'education', json: true },
    { name: 'core_competencies', json: true },
    { name: 'carousel_items', json: true },
  ]);
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
  return safePartialUpsert<DbSiteSettingsRow>('site_settings', data, [
    { name: 'site_title', json: false },
    { name: 'meta_description', json: false },
    { name: 'contact_email', json: false },
    { name: 'social_links', json: true },
    { name: 'resume_url', json: false },
  ]);
}
