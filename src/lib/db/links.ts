import { executeSql, escapeSqlString } from '@/lib/postgres';
import { ensurePortfolioTables } from './schema';
import type { AdminCustomLink } from '@/lib/constants/defaults';

export interface DbLinkRow {
  id: string;
  title: string;
  handle: string;
  href: string;
  icon_name: string;
  category: 'code' | 'connect' | 'direct';
  is_external: boolean;
  color: string;
  sort_order: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getLinksDb(): Promise<AdminCustomLink[]> {
  await ensurePortfolioTables();
  const res = await executeSql<DbLinkRow>(`
    SELECT * FROM links 
    ORDER BY sort_order ASC, created_at ASC
  `);

  return (res.rows || []).map((r) => ({
    id: r.id,
    title: r.title,
    handle: r.handle || '',
    href: r.href,
    iconName: r.icon_name || '',
    category: (r.category || 'connect') as 'code' | 'connect' | 'direct',
    isExternal: Boolean(r.is_external),
    color: r.color || undefined,
    active: Boolean(r.active),
  }));
}

export async function saveLinksDb(links: AdminCustomLink[]): Promise<AdminCustomLink[]> {
  await ensurePortfolioTables();

  // Clear and rewrite with new order in a single transaction
  await executeSql(`BEGIN;`);
  try {
    await executeSql(`DELETE FROM links;`);
    for (let i = 0; i < links.length; i++) {
      const l = links[i];
      const id = l.id || `link-${Date.now()}-${i}`;
      await executeSql(`
        INSERT INTO links (
          id, title, handle, href, icon_name, category, is_external, color, sort_order, active
        ) VALUES (
          ${escapeSqlString(id)},
          ${escapeSqlString(l.title)},
          ${escapeSqlString(l.handle || '')},
          ${escapeSqlString(l.href)},
          ${escapeSqlString(l.iconName || '')},
          ${escapeSqlString(l.category || 'connect')},
          ${l.isExternal !== false ? 'true' : 'false'},
          ${escapeSqlString(l.color || '')},
          ${i},
          ${l.active !== false ? 'true' : 'false'}
        );
      `);
    }
    await executeSql(`COMMIT;`);
  } catch (err) {
    await executeSql(`ROLLBACK;`);
    throw err;
  }

  return await getLinksDb();
}
