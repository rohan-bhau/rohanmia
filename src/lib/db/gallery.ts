import { executeSql, escapeSqlString } from '@/lib/postgres';
import { ensurePortfolioTables } from './schema';

export interface DbGalleryPhotoRow {
  id: string;
  src: string;
  title: string;
  category: string;
  caption?: string;
  date?: string;
  position: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function getGalleryPhotosDb(): Promise<DbGalleryPhotoRow[]> {
  await ensurePortfolioTables();
  const res = await executeSql<DbGalleryPhotoRow>(
    `SELECT * FROM gallery_photos ORDER BY sort_order ASC, created_at ASC;`
  );
  return res.rows;
}

export async function insertGalleryPhotoDb(photo: {
  id?: string;
  src: string;
  title: string;
  category: string;
  caption?: string;
  date?: string;
  position?: string;
  sort_order?: number;
}): Promise<DbGalleryPhotoRow> {
  await ensurePortfolioTables();
  const id = photo.id || `gal_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const query = `
    INSERT INTO gallery_photos (
      id, src, title, category, caption, date, position, sort_order
    ) VALUES (
      ${escapeSqlString(id)},
      ${escapeSqlString(photo.src)},
      ${escapeSqlString(photo.title)},
      ${escapeSqlString(photo.category)},
      ${escapeSqlString(photo.caption || '')},
      ${escapeSqlString(photo.date || '')},
      ${escapeSqlString(photo.position || 'center')},
      ${photo.sort_order ?? 0}
    )
    RETURNING *;
  `;
  const res = await executeSql<DbGalleryPhotoRow>(query);
  return res.rows[0];
}

export async function updateGalleryPhotoDb(id: string, photo: Partial<DbGalleryPhotoRow>): Promise<DbGalleryPhotoRow | null> {
  await ensurePortfolioTables();
  const updates: string[] = ['updated_at = CURRENT_TIMESTAMP'];
  if (photo.src !== undefined) updates.push(`src = ${escapeSqlString(photo.src)}`);
  if (photo.title !== undefined) updates.push(`title = ${escapeSqlString(photo.title)}`);
  if (photo.category !== undefined) updates.push(`category = ${escapeSqlString(photo.category)}`);
  if (photo.caption !== undefined) updates.push(`caption = ${escapeSqlString(photo.caption)}`);
  if (photo.date !== undefined) updates.push(`date = ${escapeSqlString(photo.date)}`);
  if (photo.position !== undefined) updates.push(`position = ${escapeSqlString(photo.position)}`);
  if (photo.sort_order !== undefined) updates.push(`sort_order = ${photo.sort_order}`);

  const query = `
    UPDATE gallery_photos
    SET ${updates.join(', ')}
    WHERE id = ${escapeSqlString(id)}
    RETURNING *;
  `;
  const res = await executeSql<DbGalleryPhotoRow>(query);
  return res.rows[0] || null;
}

export async function deleteGalleryPhotoDb(id: string): Promise<boolean> {
  await ensurePortfolioTables();
  const res = await executeSql<{ id: string }>(
    `DELETE FROM gallery_photos WHERE id = ${escapeSqlString(id)} RETURNING id;`
  );
  return res.rows.length > 0;
}

export async function updateGalleryPhotosOrderDb(orderedIds: string[]): Promise<void> {
  await ensurePortfolioTables();
  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i];
    await executeSql(
      `UPDATE gallery_photos SET sort_order = ${i + 1} WHERE id = ${escapeSqlString(id)};`
    );
  }
}

export interface DbGalleryCategoryRow {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export async function getGalleryCategoriesDb(): Promise<string[]> {
  await ensurePortfolioTables();
  const res = await executeSql<DbGalleryCategoryRow>(
    `SELECT * FROM gallery_categories ORDER BY sort_order ASC, created_at ASC;`
  );
  if (res.rows.length === 0) {
    // Seed default categories
    const defaults = ['Personal', 'Travel', 'Work', 'Moments'];
    for (let i = 0; i < defaults.length; i++) {
      const name = defaults[i];
      const id = `cat_${name.toLowerCase()}`;
      await executeSql(`
        INSERT INTO gallery_categories (id, name, sort_order) 
        VALUES (${escapeSqlString(id)}, ${escapeSqlString(name)}, ${i + 1})
        ON CONFLICT (name) DO NOTHING;
      `);
    }
    return defaults;
  }
  return res.rows.map(r => r.name);
}

export async function insertGalleryCategoryDb(name: string): Promise<string> {
  await ensurePortfolioTables();
  const cleanName = name.trim();
  const id = `cat_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;
  await executeSql(`
    INSERT INTO gallery_categories (id, name, sort_order) 
    VALUES (${escapeSqlString(id)}, ${escapeSqlString(cleanName)}, 99)
    ON CONFLICT (name) DO NOTHING;
  `);
  return cleanName;
}


