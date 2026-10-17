import { executeSql, escapeSqlString, escapeSqlJson } from "@/lib/postgres";
import { ensurePortfolioTables } from "./schema";

export interface DbProjectRow {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: string;
  featured: boolean;
  featured_sort_order: number;
  role: string;
  year: string;
  target_audience: string;
  why_i_built_this?: string;
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
    `SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC;`,
  );
  return res.rows;
}

export async function getProjectBySlugDb(
  slug: string,
): Promise<DbProjectRow | null> {
  await ensurePortfolioTables();
  const res = await executeSql<DbProjectRow>(
    `SELECT * FROM projects WHERE slug = ${escapeSqlString(slug)} LIMIT 1;`,
  );
  return res.rows[0] || null;
}

export async function upsertProjectDb(
  p: Partial<DbProjectRow> & { id: string; slug: string; title: string },
): Promise<DbProjectRow> {
  await ensurePortfolioTables();
  const query = `
    INSERT INTO projects (
      id, slug, title, tagline, category, featured, featured_sort_order, role, year,
      target_audience, why_i_built_this, overview, problem, solution, gradient, accent_color,
      preview_image, hover_image, github_url, client_url, server_url, live_url,
      tech_stack, architecture, system_breakdown, challenges, technical_decisions,
      key_features, metrics, directory_tree, code_snippet, backend_architecture,
      what_i_learned, sort_order, updated_at
    ) VALUES (
      ${escapeSqlString(p.id)},
      ${escapeSqlString(p.slug)},
      ${escapeSqlString(p.title)},
      ${escapeSqlString(p.tagline || "")},
      ${escapeSqlString(p.category || "Full Stack")},
      ${p.featured ? "TRUE" : "FALSE"},
      ${p.featured_sort_order ?? 0},
      ${escapeSqlString(p.role || "")},
      ${escapeSqlString(p.year || "")},
      ${escapeSqlString(p.target_audience || "")},
      ${escapeSqlString(p.why_i_built_this || "")},
      ${escapeSqlString(p.overview || "")},
      ${escapeSqlString(p.problem || "")},
      ${escapeSqlString(p.solution || "")},
      ${escapeSqlString(p.gradient || "")},
      ${escapeSqlString(p.accent_color || "")},
      ${escapeSqlString(p.preview_image || "")},
      ${escapeSqlString(p.hover_image || "")},
      ${escapeSqlString(p.github_url || "")},
      ${escapeSqlString(p.client_url || "")},
      ${escapeSqlString(p.server_url || "")},
      ${escapeSqlString(p.live_url || "")},
      ${escapeSqlJson(p.tech_stack || [])},
      ${escapeSqlJson(p.architecture || {})},
      ${escapeSqlJson(p.system_breakdown || [])},
      ${escapeSqlJson(p.challenges || [])},
      ${escapeSqlJson(p.technical_decisions || [])},
      ${escapeSqlJson(p.key_features || [])},
      ${escapeSqlJson(p.metrics || [])},
      ${escapeSqlString(p.directory_tree || "")},
      ${escapeSqlJson(p.code_snippet || {})},
      ${escapeSqlJson(p.backend_architecture || {})},
      ${escapeSqlJson(p.what_i_learned || [])},
      ${p.sort_order ?? 0},
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
      slug = COALESCE(NULLIF(EXCLUDED.slug, ''), projects.slug),
      title = COALESCE(NULLIF(EXCLUDED.title, ''), projects.title),
      tagline = CASE WHEN EXCLUDED.tagline != '' THEN EXCLUDED.tagline ELSE projects.tagline END,
      category = COALESCE(NULLIF(EXCLUDED.category, ''), projects.category),
      featured = EXCLUDED.featured,
      featured_sort_order = EXCLUDED.featured_sort_order,
      role = CASE WHEN EXCLUDED.role != '' THEN EXCLUDED.role ELSE projects.role END,
      year = CASE WHEN EXCLUDED.year != '' THEN EXCLUDED.year ELSE projects.year END,
      target_audience = CASE WHEN EXCLUDED.target_audience != '' THEN EXCLUDED.target_audience ELSE projects.target_audience END,
      why_i_built_this = CASE WHEN EXCLUDED.why_i_built_this != '' THEN EXCLUDED.why_i_built_this ELSE projects.why_i_built_this END,
      overview = CASE WHEN EXCLUDED.overview != '' THEN EXCLUDED.overview ELSE projects.overview END,
      problem = CASE WHEN EXCLUDED.problem != '' THEN EXCLUDED.problem ELSE projects.problem END,
      solution = CASE WHEN EXCLUDED.solution != '' THEN EXCLUDED.solution ELSE projects.solution END,
      gradient = CASE WHEN EXCLUDED.gradient != '' THEN EXCLUDED.gradient ELSE projects.gradient END,
      accent_color = CASE WHEN EXCLUDED.accent_color != '' THEN EXCLUDED.accent_color ELSE projects.accent_color END,
      preview_image = CASE WHEN EXCLUDED.preview_image != '' THEN EXCLUDED.preview_image ELSE projects.preview_image END,
      hover_image = CASE WHEN EXCLUDED.hover_image != '' THEN EXCLUDED.hover_image ELSE projects.hover_image END,
      github_url = CASE WHEN EXCLUDED.github_url != '' THEN EXCLUDED.github_url ELSE projects.github_url END,
      client_url = CASE WHEN EXCLUDED.client_url != '' THEN EXCLUDED.client_url ELSE projects.client_url END,
      server_url = CASE WHEN EXCLUDED.server_url != '' THEN EXCLUDED.server_url ELSE projects.server_url END,
      live_url = CASE WHEN EXCLUDED.live_url != '' THEN EXCLUDED.live_url ELSE projects.live_url END,
      tech_stack = CASE WHEN EXCLUDED.tech_stack != '[]'::jsonb THEN EXCLUDED.tech_stack ELSE projects.tech_stack END,
      architecture = CASE WHEN EXCLUDED.architecture != '{}'::jsonb THEN EXCLUDED.architecture ELSE projects.architecture END,
      system_breakdown = CASE WHEN EXCLUDED.system_breakdown != '[]'::jsonb THEN EXCLUDED.system_breakdown ELSE projects.system_breakdown END,
      challenges = CASE WHEN EXCLUDED.challenges != '[]'::jsonb THEN EXCLUDED.challenges ELSE projects.challenges END,
      technical_decisions = CASE WHEN EXCLUDED.technical_decisions != '[]'::jsonb THEN EXCLUDED.technical_decisions ELSE projects.technical_decisions END,
      key_features = CASE WHEN EXCLUDED.key_features != '[]'::jsonb THEN EXCLUDED.key_features ELSE projects.key_features END,
      metrics = CASE WHEN EXCLUDED.metrics != '[]'::jsonb THEN EXCLUDED.metrics ELSE projects.metrics END,
      directory_tree = CASE WHEN EXCLUDED.directory_tree != '' THEN EXCLUDED.directory_tree ELSE projects.directory_tree END,
      code_snippet = CASE WHEN EXCLUDED.code_snippet != '{}'::jsonb THEN EXCLUDED.code_snippet ELSE projects.code_snippet END,
      backend_architecture = CASE WHEN EXCLUDED.backend_architecture != '{}'::jsonb THEN EXCLUDED.backend_architecture ELSE projects.backend_architecture END,
      what_i_learned = CASE WHEN EXCLUDED.what_i_learned != '[]'::jsonb THEN EXCLUDED.what_i_learned ELSE projects.what_i_learned END,
      sort_order = COALESCE(EXCLUDED.sort_order, projects.sort_order),
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const res = await executeSql<DbProjectRow>(query);
  return res.rows[0];
}

export async function deleteProjectDb(idOrSlug: string): Promise<DbProjectRow | null> {
  await ensurePortfolioTables();
  const escaped = escapeSqlString(idOrSlug);
  const res = await executeSql<DbProjectRow>(
    `DELETE FROM projects WHERE id = ${escaped} OR slug = ${escaped} RETURNING *;`,
  );
  return res.rows[0] || null;
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

export async function getFeaturedCaseStudiesDb(): Promise<
  DbFeaturedCaseStudyRow[]
> {
  await ensurePortfolioTables();
  const res = await executeSql<DbFeaturedCaseStudyRow>(
    `SELECT * FROM featured_case_studies ORDER BY sort_order ASC, created_at ASC;`,
  );
  return res.rows.map((row) => ({
    ...row,
    key_features: Array.isArray(row.key_features)
      ? row.key_features
      : typeof row.key_features === "string"
        ? JSON.parse(row.key_features)
        : [],
    tech_stack: Array.isArray(row.tech_stack)
      ? row.tech_stack
      : typeof row.tech_stack === "string"
        ? JSON.parse(row.tech_stack)
        : [],
  }));
}

export async function upsertFeaturedCaseStudyDb(
  f: Partial<DbFeaturedCaseStudyRow> & {
    id: string;
    title: string;
    tagline: string;
    overview: string;
  },
): Promise<DbFeaturedCaseStudyRow> {
  await ensurePortfolioTables();
  const query = `
    INSERT INTO featured_case_studies (
      id, slug, title, tagline, category, year, preview_image, hover_image,
      gradient, accent_color, overview, key_features, tech_stack, live_url,
      github_url, client_url, server_url, sort_order, updated_at
    ) VALUES (
      ${escapeSqlString(f.id)},
      ${escapeSqlString(f.slug || f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"))},
      ${escapeSqlString(f.title)},
      ${escapeSqlString(f.tagline)},
      ${escapeSqlString(f.category || "Full Stack")},
      ${escapeSqlString(f.year || "2026")},
      ${escapeSqlString(f.preview_image || "")},
      ${escapeSqlString(f.hover_image || "")},
      ${escapeSqlString(f.gradient || "linear-gradient(135deg, #182848 0%, #4b6cb7 100%)")},
      ${escapeSqlString(f.accent_color || "#6366f1")},
      ${escapeSqlString(f.overview)},
      ${escapeSqlJson(f.key_features || [])},
      ${escapeSqlJson(f.tech_stack || [])},
      ${escapeSqlString(f.live_url || "")},
      ${escapeSqlString(f.github_url || "")},
      ${escapeSqlString(f.client_url || "")},
      ${escapeSqlString(f.server_url || "")},
      ${f.sort_order ?? 0},
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
      slug = COALESCE(NULLIF(EXCLUDED.slug, ''), featured_case_studies.slug),
      title = COALESCE(NULLIF(EXCLUDED.title, ''), featured_case_studies.title),
      tagline = CASE WHEN EXCLUDED.tagline != '' THEN EXCLUDED.tagline ELSE featured_case_studies.tagline END,
      category = COALESCE(NULLIF(EXCLUDED.category, ''), featured_case_studies.category),
      year = CASE WHEN EXCLUDED.year != '' THEN EXCLUDED.year ELSE featured_case_studies.year END,
      preview_image = CASE WHEN EXCLUDED.preview_image != '' THEN EXCLUDED.preview_image ELSE featured_case_studies.preview_image END,
      hover_image = CASE WHEN EXCLUDED.hover_image != '' THEN EXCLUDED.hover_image ELSE featured_case_studies.hover_image END,
      gradient = CASE WHEN EXCLUDED.gradient != '' THEN EXCLUDED.gradient ELSE featured_case_studies.gradient END,
      accent_color = CASE WHEN EXCLUDED.accent_color != '' THEN EXCLUDED.accent_color ELSE featured_case_studies.accent_color END,
      overview = CASE WHEN EXCLUDED.overview != '' THEN EXCLUDED.overview ELSE featured_case_studies.overview END,
      key_features = CASE WHEN EXCLUDED.key_features != '[]'::jsonb THEN EXCLUDED.key_features ELSE featured_case_studies.key_features END,
      tech_stack = CASE WHEN EXCLUDED.tech_stack != '[]'::jsonb THEN EXCLUDED.tech_stack ELSE featured_case_studies.tech_stack END,
      live_url = CASE WHEN EXCLUDED.live_url != '' THEN EXCLUDED.live_url ELSE featured_case_studies.live_url END,
      github_url = CASE WHEN EXCLUDED.github_url != '' THEN EXCLUDED.github_url ELSE featured_case_studies.github_url END,
      client_url = CASE WHEN EXCLUDED.client_url != '' THEN EXCLUDED.client_url ELSE featured_case_studies.client_url END,
      server_url = CASE WHEN EXCLUDED.server_url != '' THEN EXCLUDED.server_url ELSE featured_case_studies.server_url END,
      sort_order = COALESCE(EXCLUDED.sort_order, featured_case_studies.sort_order),
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const res = await executeSql<DbFeaturedCaseStudyRow>(query);
  return res.rows[0];
}

export async function deleteFeaturedCaseStudyDb(idOrSlug: string): Promise<DbFeaturedCaseStudyRow | null> {
  await ensurePortfolioTables();
  const escaped = escapeSqlString(idOrSlug);
  const res = await executeSql<DbFeaturedCaseStudyRow>(
    `DELETE FROM featured_case_studies WHERE id = ${escaped} OR slug = ${escaped} RETURNING *;`,
  );
  return res.rows[0] || null;
}

export async function updateFeaturedProjectsOrderDb(
  orderedProjects: Array<
    Pick<DbProjectRow, "id" | "gradient" | "accent_color">
  >,
): Promise<void> {
  await ensurePortfolioTables();
  await executeSql(
    `UPDATE projects SET featured = false, featured_sort_order = 0 WHERE featured = true;`,
  );
  for (let i = 0; i < orderedProjects.length; i++) {
    const project = orderedProjects[i];
    await executeSql(
      `UPDATE projects SET featured = true, featured_sort_order = ${i + 1}, gradient = ${escapeSqlString(project.gradient)}, accent_color = ${escapeSqlString(project.accent_color)} WHERE id = ${escapeSqlString(project.id)};`,
    );
  }
}

export async function updateProjectsOrderDb(
  orderedIds: string[],
): Promise<void> {
  await ensurePortfolioTables();
  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i];
    await executeSql(
      `UPDATE projects SET sort_order = ${i + 1} WHERE id = ${escapeSqlString(id)};`,
    );
  }
}

/**
 * Fetch featured projects directly from PostgreSQL for Homepage
 */
export async function getFeaturedProjectsDb(): Promise<any[]> {
  const rows = (await getProjectsDb())
    .filter((project) => project.featured)
    .sort(
      (left, right) => left.featured_sort_order - right.featured_sort_order,
    );
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
    role: row.role || "",
    targetAudience: row.target_audience || "",
    problem: row.problem || "",
    solution: row.solution || "",
    architecture: row.architecture || {},
    systemBreakdown: row.system_breakdown || [],
    technicalDecisions: row.technical_decisions || [],
    metrics: row.metrics || [],
    directoryTree: row.directory_tree,
    codeSnippet: row.code_snippet,
    backendArchitecture: row.backend_architecture,
    whatILearned: row.what_i_learned,
  }));
}
