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

/**
 * Fetch featured projects directly from PostgreSQL for Homepage
 * If database table has no records, seed initial projects into PostgreSQL first.
 */
export async function getFeaturedProjectsDb(): Promise<any[]> {
  await ensurePortfolioTables();

  let res = await executeSql<DbProjectRow>(
    `SELECT * FROM projects WHERE featured = true ORDER BY sort_order ASC, created_at DESC;`
  );

  // If table is completely empty, seed it from initial data into PostgreSQL
  if (res.rows.length === 0) {
    const countRes = await executeSql<{ count: string }>(
      `SELECT COUNT(*) as count FROM projects;`
    );
    const count = parseInt(countRes.rows[0]?.count || '0', 10);

    if (count === 0) {
      try {
        const { FEATURED_CASE_STUDIES } = await import('@/data/projects');
        for (let i = 0; i < FEATURED_CASE_STUDIES.length; i++) {
          const p = FEATURED_CASE_STUDIES[i];
          await upsertProjectDb({
            id: p.id,
            slug: p.slug,
            title: p.title,
            tagline: p.tagline,
            category: p.category,
            featured: Boolean(p.featured),
            role: p.role || 'Lead Engineer',
            year: p.year || '2024',
            target_audience: p.targetAudience || '',
            overview: p.overview || '',
            problem: p.problem || '',
            solution: p.solution || '',
            gradient: p.gradient || 'linear-gradient(135deg, #182848 0%, #4b6cb7 100%)',
            accent_color: p.accentColor || '#6366f1',
            preview_image: p.previewImage || '',
            hover_image: p.hoverImage || '',
            github_url: p.githubUrl || '',
            client_url: p.clientUrl || '',
            server_url: p.serverUrl || '',
            live_url: p.liveUrl || '',
            tech_stack: p.techStack || [],
            architecture: p.architecture as any || {},
            system_breakdown: p.systemBreakdown || [],
            challenges: p.challenges || [],
            technical_decisions: p.technicalDecisions || [],
            key_features: p.keyFeatures || [],
            metrics: p.metrics || [],
            sort_order: i,
          });
        }
        res = await executeSql<DbProjectRow>(
          `SELECT * FROM projects WHERE featured = true ORDER BY sort_order ASC, created_at DESC;`
        );
      } catch (seedErr) {
        console.error('Error seeding projects to DB:', seedErr);
      }
    }
  }

  return res.rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    category: row.category,
    featured: row.featured,
    role: row.role,
    year: row.year,
    targetAudience: row.target_audience,
    overview: row.overview,
    problem: row.problem,
    solution: row.solution,
    gradient: row.gradient,
    accentColor: row.accent_color,
    previewImage: row.preview_image,
    hoverImage: row.hover_image,
    githubUrl: row.github_url,
    clientUrl: row.client_url,
    serverUrl: row.server_url,
    liveUrl: row.live_url,
    techStack: Array.isArray(row.tech_stack)
      ? row.tech_stack
      : (typeof row.tech_stack === 'string' ? JSON.parse(row.tech_stack) : []),
    architecture: (typeof row.architecture === 'string' ? JSON.parse(row.architecture) : row.architecture) || {
      frontend: [],
      backend: [],
      database: [],
      infrastructure: [],
    },
    systemBreakdown: (typeof row.system_breakdown === 'string' ? JSON.parse(row.system_breakdown) : row.system_breakdown) || [],
    challenges: (typeof row.challenges === 'string' ? JSON.parse(row.challenges) : row.challenges) || [],
    technicalDecisions: (typeof row.technical_decisions === 'string' ? JSON.parse(row.technical_decisions) : row.technical_decisions) || [],
    keyFeatures: (typeof row.key_features === 'string' ? JSON.parse(row.key_features) : row.key_features) || [],
    metrics: (typeof row.metrics === 'string' ? JSON.parse(row.metrics) : row.metrics) || [],
    directoryTree: row.directory_tree,
    codeSnippet: row.code_snippet,
    backendArchitecture: row.backend_architecture,
    whatILearned: Array.isArray(row.what_i_learned)
      ? row.what_i_learned
      : (typeof row.what_i_learned === 'string' ? JSON.parse(row.what_i_learned) : []),
  }));
}

