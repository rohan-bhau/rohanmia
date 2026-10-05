import { executeSql, escapeSqlString } from '@/lib/postgres';
import { ensurePortfolioTables } from './schema';

export interface DbTechCategoryRow {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  philosophy: string;
  badge: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  items?: DbTechItemRow[];
}

export interface DbTechItemRow {
  id: string;
  category_id: string;
  category_name: string;
  name: string;
  version?: string;
  description: string;
  proficiency: number;
  is_core: boolean;
  use_case: string;
  production_project?: string;
  docs_url?: string;
  brand_color?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function getTechStackDb(): Promise<DbTechCategoryRow[]> {
  await ensurePortfolioTables();
  const catsRes = await executeSql<DbTechCategoryRow>(
    `SELECT * FROM tech_categories ORDER BY sort_order ASC, created_at ASC;`
  );
  const itemsRes = await executeSql<DbTechItemRow>(
    `SELECT * FROM tech_items ORDER BY sort_order ASC, created_at ASC;`
  );

  const categories = catsRes.rows;
  const items = itemsRes.rows;

  return categories.map((cat) => ({
    ...cat,
    items: items.filter((it) => it.category_id === cat.id)
  }));
}

export async function upsertTechCategoryDb(cat: Partial<DbTechCategoryRow> & { id: string; title: string }): Promise<DbTechCategoryRow> {
  await ensurePortfolioTables();
  const query = `
    INSERT INTO tech_categories (
      id, number, title, subtitle, description, philosophy, badge, sort_order, updated_at
    ) VALUES (
      ${escapeSqlString(cat.id)},
      ${escapeSqlString(cat.number || '01')},
      ${escapeSqlString(cat.title)},
      ${escapeSqlString(cat.subtitle || '')},
      ${escapeSqlString(cat.description || '')},
      ${escapeSqlString(cat.philosophy || '')},
      ${escapeSqlString(cat.badge || '')},
      ${cat.sort_order ?? 0},
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
      number = EXCLUDED.number,
      title = EXCLUDED.title,
      subtitle = EXCLUDED.subtitle,
      description = EXCLUDED.description,
      philosophy = EXCLUDED.philosophy,
      badge = EXCLUDED.badge,
      sort_order = EXCLUDED.sort_order,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const res = await executeSql<DbTechCategoryRow>(query);
  return res.rows[0];
}

export async function deleteTechCategoryDb(id: string): Promise<boolean> {
  await ensurePortfolioTables();
  const res = await executeSql<{ id: string }>(
    `DELETE FROM tech_categories WHERE id = ${escapeSqlString(id)} RETURNING id;`
  );
  return res.rows.length > 0;
}

export async function upsertTechItemDb(item: Partial<DbTechItemRow> & { id: string; category_id: string; name: string }): Promise<DbTechItemRow> {
  await ensurePortfolioTables();
  const query = `
    INSERT INTO tech_items (
      id, category_id, category_name, name, version, description,
      proficiency, is_core, use_case, production_project, docs_url, brand_color, sort_order, updated_at
    ) VALUES (
      ${escapeSqlString(item.id)},
      ${escapeSqlString(item.category_id)},
      ${escapeSqlString(item.category_name || '')},
      ${escapeSqlString(item.name)},
      ${escapeSqlString(item.version || '')},
      ${escapeSqlString(item.description || '')},
      ${item.proficiency ?? 90},
      ${item.is_core ? 'TRUE' : 'FALSE'},
      ${escapeSqlString(item.use_case || '')},
      ${escapeSqlString(item.production_project || '')},
      ${escapeSqlString(item.docs_url || '')},
      ${escapeSqlString(item.brand_color || '')},
      ${item.sort_order ?? 0},
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
      category_id = EXCLUDED.category_id,
      category_name = EXCLUDED.category_name,
      name = EXCLUDED.name,
      version = EXCLUDED.version,
      description = EXCLUDED.description,
      proficiency = EXCLUDED.proficiency,
      is_core = EXCLUDED.is_core,
      use_case = EXCLUDED.use_case,
      production_project = EXCLUDED.production_project,
      docs_url = EXCLUDED.docs_url,
      brand_color = EXCLUDED.brand_color,
      sort_order = EXCLUDED.sort_order,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const res = await executeSql<DbTechItemRow>(query);
  return res.rows[0];
}

export async function deleteTechItemDb(id: string): Promise<boolean> {
  await ensurePortfolioTables();
  const res = await executeSql<{ id: string }>(
    `DELETE FROM tech_items WHERE id = ${escapeSqlString(id)} RETURNING id;`
  );
  return res.rows.length > 0;
}
