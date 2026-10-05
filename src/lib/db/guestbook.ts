import { executeSql, escapeSqlString } from '@/lib/postgres';
import { ensureGuestbookTable } from './schema';

export interface DbGuestbookRow {
  id: string;
  name: string;
  email: string;
  message: string;
  avatar: string;
  provider: string;
  theme: string;
  created_at: string;
  likes: number;
}

// Short-lived in-memory read cache (invalidated on every insert/delete)
const READ_CACHE_TTL_MS = 10_000;
let entriesCache: { rows: DbGuestbookRow[]; at: number } | null = null;

function invalidateEntriesCache() {
  entriesCache = null;
}

/**
 * Fetch all entries sorted by newest first
 */
export async function fetchAllEntries(): Promise<DbGuestbookRow[]> {
  if (entriesCache && Date.now() - entriesCache.at < READ_CACHE_TTL_MS) {
    return entriesCache.rows;
  }
  await ensureGuestbookTable();
  const res = await executeSql<DbGuestbookRow>(
    `SELECT * FROM guestbook_entries ORDER BY created_at DESC;`
  );
  entriesCache = { rows: res.rows, at: Date.now() };
  return res.rows;
}

/**
 * Insert a new verified entry
 */
export async function insertEntry(entry: {
  id: string;
  name: string;
  email: string;
  message: string;
  avatar: string;
  provider: string;
  theme: string;
}): Promise<DbGuestbookRow> {
  await ensureGuestbookTable();
  const query = `
    INSERT INTO guestbook_entries (id, name, email, message, avatar, provider, theme)
    VALUES (
      ${escapeSqlString(entry.id)},
      ${escapeSqlString(entry.name)},
      ${escapeSqlString(entry.email)},
      ${escapeSqlString(entry.message)},
      ${escapeSqlString(entry.avatar)},
      ${escapeSqlString(entry.provider)},
      ${escapeSqlString(entry.theme)}
    )
    RETURNING *;
  `;
  const res = await executeSql<DbGuestbookRow>(query);
  invalidateEntriesCache();
  return res.rows[0];
}

/**
 * Delete an entry by ID (verifying the author's email or admin)
 */
export async function deleteEntryById(id: string, requesterEmail: string): Promise<boolean> {
  await ensureGuestbookTable();
  const adminEmail = (process.env.ADMIN_EMAIL || 'rohanmia.org@gmail.com').trim().toLowerCase();
  const cleanEmail = requesterEmail.trim().toLowerCase();
  
  let query = '';
  if (cleanEmail === adminEmail) {
    query = `DELETE FROM guestbook_entries WHERE id = ${escapeSqlString(id)};`;
  } else {
    query = `DELETE FROM guestbook_entries WHERE id = ${escapeSqlString(id)} AND LOWER(TRIM(email)) = ${escapeSqlString(cleanEmail)};`;
  }

  const res = await executeSql(query);
  invalidateEntriesCache();
  return res.rowCount > 0;
}
