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
