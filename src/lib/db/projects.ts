import { executeSql, escapeSqlString, escapeSqlJson } from '@/lib/postgres';
import { ensurePortfolioTables } from './schema';

export interface DbProjectRow {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: string;
  featured: boolean;
  role: string;
  year: string;
  target_audience: string;
  overview: string;
  problem: string;
  solution: string;
  gradient: string;
  accent_color: string;
  preview_image: string;
  hover_image?: string;
  github_url?: string;
  client_url?: string;
  server_url?: string;
  live_url?: string;
  tech_stack: string[];
  architecture: Record<string, string[]>;
  system_breakdown: any[];
  challenges: any[];
  technical_decisions: any[];
  key_features: any[];
  metrics: any[];
  directory_tree?: string;
  code_snippet?: any;
  backend_architecture?: any;
  what_i_learned?: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function getProjectsDb(): Promise<DbProjectRow[]> {
  await ensurePortfolioTables();
  const res = await executeSql<DbProjectRow>(
    `SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC;`
  );
  return res.rows;
}

export async function getProjectBySlugDb(slug: string): Promise<DbProjectRow | null> {
  await ensurePortfolioTables();
  const res = await executeSql<DbProjectRow>(
    `SELECT * FROM projects WHERE slug = ${escapeSqlString(slug)} LIMIT 1;`
  );
  return res.rows[0] || null;
}

export async function upsertProjectDb(p: Partial<DbProjectRow> & { id: string; slug: string; title: string }): Promise<DbProjectRow> {
  await ensurePortfolioTables();
  const query = `
    INSERT INTO projects (
      id, slug, title, tagline, category, featured, role, year,
      target_audience, overview, problem, solution, gradient, accent_color,
      preview_image, hover_image, github_url, client_url, server_url, live_url,
      tech_stack, architecture, system_breakdown, challenges, technical_decisions,
      key_features, metrics, directory_tree, code_snippet, backend_architecture,
      what_i_learned, sort_order, updated_at
    ) VALUES (
      ${escapeSqlString(p.id)},
      ${escapeSqlString(p.slug)},
      ${escapeSqlString(p.title)},
      ${escapeSqlString(p.tagline || '')},
      ${escapeSqlString(p.category || 'Full Stack')},
      ${p.featured ? 'TRUE' : 'FALSE'},
      ${escapeSqlString(p.role || '')},
      ${escapeSqlString(p.year || '')},
      ${escapeSqlString(p.target_audience || '')},
      ${escapeSqlString(p.overview || '')},
      ${escapeSqlString(p.problem || '')},
      ${escapeSqlString(p.solution || '')},
      ${escapeSqlString(p.gradient || '')},
      ${escapeSqlString(p.accent_color || '')},
      ${escapeSqlString(p.preview_image || '')},
      ${escapeSqlString(p.hover_image || '')},
      ${escapeSqlString(p.github_url || '')},
      ${escapeSqlString(p.client_url || '')},
      ${escapeSqlString(p.server_url || '')},
      ${escapeSqlString(p.live_url || '')},
      ${escapeSqlJson(p.tech_stack || [])},
      ${escapeSqlJson(p.architecture || {})},
      ${escapeSqlJson(p.system_breakdown || [])},
      ${escapeSqlJson(p.challenges || [])},
      ${escapeSqlJson(p.technical_decisions || [])},
      ${escapeSqlJson(p.key_features || [])},
      ${escapeSqlJson(p.metrics || [])},
      ${escapeSqlString(p.directory_tree || '')},
      ${escapeSqlJson(p.code_snippet || {})},
      ${escapeSqlJson(p.backend_architecture || {})},
      ${escapeSqlJson(p.what_i_learned || [])},
      ${p.sort_order ?? 0},
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
      slug = EXCLUDED.slug,
      title = EXCLUDED.title,
      tagline = EXCLUDED.tagline,
      category = EXCLUDED.category,
      featured = EXCLUDED.featured,
      role = EXCLUDED.role,
      year = EXCLUDED.year,
      target_audience = EXCLUDED.target_audience,
      overview = EXCLUDED.overview,
      problem = EXCLUDED.problem,
      solution = EXCLUDED.solution,
      gradient = EXCLUDED.gradient,
      accent_color = EXCLUDED.accent_color,
      preview_image = EXCLUDED.preview_image,
      hover_image = EXCLUDED.hover_image,
      github_url = EXCLUDED.github_url,
      client_url = EXCLUDED.client_url,
      server_url = EXCLUDED.server_url,
      live_url = EXCLUDED.live_url,
      tech_stack = EXCLUDED.tech_stack,
      architecture = EXCLUDED.architecture,
      system_breakdown = EXCLUDED.system_breakdown,
      challenges = EXCLUDED.challenges,
      technical_decisions = EXCLUDED.technical_decisions,
      key_features = EXCLUDED.key_features,
      metrics = EXCLUDED.metrics,
      directory_tree = EXCLUDED.directory_tree,
      code_snippet = EXCLUDED.code_snippet,
      backend_architecture = EXCLUDED.backend_architecture,
      what_i_learned = EXCLUDED.what_i_learned,
      sort_order = EXCLUDED.sort_order,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const res = await executeSql<DbProjectRow>(query);
  return res.rows[0];
}

export async function deleteProjectDb(id: string): Promise<boolean> {
  await ensurePortfolioTables();
  const res = await executeSql<{ id: string }>(
    `DELETE FROM projects WHERE id = ${escapeSqlString(id)} RETURNING id;`
  );
  return res.rows.length > 0;
}

export interface DbFeaturedCaseStudyRow {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: string;
  year: string;
  preview_image: string;
  hover_image?: string;
  gradient: string;
  accent_color: string;
  overview: string;
  key_features: { title: string; description: string }[];
  tech_stack: string[];
  live_url?: string;
  github_url?: string;
  client_url?: string;
  server_url?: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export async function getFeaturedCaseStudiesDb(): Promise<DbFeaturedCaseStudyRow[]> {
  await ensurePortfolioTables();
  const res = await executeSql<DbFeaturedCaseStudyRow>(
    `SELECT * FROM featured_case_studies ORDER BY sort_order ASC, created_at ASC;`
  );
  return res.rows.map((row) => ({
    ...row,
    key_features: Array.isArray(row.key_features)
      ? row.key_features
      : (typeof row.key_features === 'string' ? JSON.parse(row.key_features) : []),
    tech_stack: Array.isArray(row.tech_stack)
      ? row.tech_stack
      : (typeof row.tech_stack === 'string' ? JSON.parse(row.tech_stack) : []),
  }));
}

export async function upsertFeaturedCaseStudyDb(f: Partial<DbFeaturedCaseStudyRow> & { id: string; title: string; tagline: string; overview: string }): Promise<DbFeaturedCaseStudyRow> {
  await ensurePortfolioTables();
  const query = `
    INSERT INTO featured_case_studies (
      id, slug, title, tagline, category, year, preview_image, hover_image,
      gradient, accent_color, overview, key_features, tech_stack, live_url,
      github_url, client_url, server_url, sort_order, updated_at
    ) VALUES (
      ${escapeSqlString(f.id)},
      ${escapeSqlString(f.slug || f.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))},
      ${escapeSqlString(f.title)},
      ${escapeSqlString(f.tagline)},
      ${escapeSqlString(f.category || 'Full Stack')},
      ${escapeSqlString(f.year || '2026')},
      ${escapeSqlString(f.preview_image || '')},
      ${escapeSqlString(f.hover_image || '')},
      ${escapeSqlString(f.gradient || 'linear-gradient(135deg, #182848 0%, #4b6cb7 100%)')},
      ${escapeSqlString(f.accent_color || '#6366f1')},
      ${escapeSqlString(f.overview)},
      ${escapeSqlJson(f.key_features || [])},
      ${escapeSqlJson(f.tech_stack || [])},
      ${escapeSqlString(f.live_url || '')},
      ${escapeSqlString(f.github_url || '')},
      ${escapeSqlString(f.client_url || '')},
      ${escapeSqlString(f.server_url || '')},
      ${f.sort_order ?? 0},
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
      slug = EXCLUDED.slug,
      title = EXCLUDED.title,
      tagline = EXCLUDED.tagline,
      category = EXCLUDED.category,
      year = EXCLUDED.year,
      preview_image = EXCLUDED.preview_image,
      hover_image = EXCLUDED.hover_image,
      gradient = EXCLUDED.gradient,
      accent_color = EXCLUDED.accent_color,
      overview = EXCLUDED.overview,
      key_features = EXCLUDED.key_features,
      tech_stack = EXCLUDED.tech_stack,
      live_url = EXCLUDED.live_url,
      github_url = EXCLUDED.github_url,
      client_url = EXCLUDED.client_url,
      server_url = EXCLUDED.server_url,
      sort_order = EXCLUDED.sort_order,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const res = await executeSql<DbFeaturedCaseStudyRow>(query);
  return res.rows[0];
}

export async function deleteFeaturedCaseStudyDb(id: string): Promise<boolean> {
  await ensurePortfolioTables();
  const res = await executeSql<{ id: string }>(
    `DELETE FROM featured_case_studies WHERE id = ${escapeSqlString(id)} RETURNING id;`
  );
  return res.rows.length > 0;
}

export async function updateFeaturedCaseStudiesOrderDb(orderedIds: string[]): Promise<void> {
  await ensurePortfolioTables();
  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i];
    await executeSql(
      `UPDATE featured_case_studies SET sort_order = ${i + 1} WHERE id = ${escapeSqlString(id)};`
    );
  }
}

export async function updateProjectsOrderDb(orderedIds: string[]): Promise<void> {
  await ensurePortfolioTables();
  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i];
    await executeSql(
      `UPDATE projects SET sort_order = ${i + 1} WHERE id = ${escapeSqlString(id)};`
    );
  }
}

/**
 * Fetch featured projects directly from PostgreSQL for Homepage
 */
export async function getFeaturedProjectsDb(): Promise<any[]> {
  await ensurePortfolioTables();
  const rows = await getFeaturedCaseStudiesDb();
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    category: row.category,
    featured: true,
    year: row.year,
    overview: row.overview,
    gradient: row.gradient,
    accentColor: row.accent_color,
    previewImage: row.preview_image,
    hoverImage: row.hover_image,
    githubUrl: row.github_url,
    clientUrl: row.client_url,
    serverUrl: row.server_url,
    liveUrl: row.live_url,
    techStack: row.tech_stack || [],
    keyFeatures: row.key_features || [],
  }));
}


