import https from 'https';

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

function escapeSqlString(val: string): string {
  if (val === null || val === undefined) return "''";
  return "'" + String(val).replace(/'/g, "''") + "'";
}

/**
 * Execute raw SQL queries against Neon PostgreSQL via HTTPS (Port 443)
 * Guarantees zero port 5432 timeouts across all ISPs and deployment environments.
 */
export async function executeSql<T = any>(query: string): Promise<{ rows: T[]; rowCount: number }> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured in environment variables');
  }

  const u = new URL(databaseUrl);
  const postData = JSON.stringify({ query });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: u.hostname,
      port: 443,
      path: '/sql',
      method: 'POST',
      headers: {
        'Neon-Connection-String': databaseUrl,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      family: 4 // Enforce IPv4 to avoid dual-stack OS timeout
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.message) {
            reject(new Error(parsed.message));
          } else {
            resolve({
              rows: parsed.rows || [],
              rowCount: parsed.rowCount || (parsed.rows ? parsed.rows.length : 0)
            });
          }
        } catch (err) {
          reject(new Error(`Failed to parse PostgreSQL response: ${body}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Initialize guestbook_entries table if it does not already exist
 */
export async function ensureGuestbookTable(): Promise<void> {
  const ddl = `
    CREATE TABLE IF NOT EXISTS guestbook_entries (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      avatar TEXT,
      provider VARCHAR(32) DEFAULT 'google',
      theme VARCHAR(32) NOT NULL DEFAULT 'violet',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      likes INT DEFAULT 0
    );
  `;
  await executeSql(ddl);
}

/**
 * Fetch all entries sorted by newest first
 */
export async function fetchAllEntries(): Promise<DbGuestbookRow[]> {
  await ensureGuestbookTable();
  const res = await executeSql<DbGuestbookRow>(
    `SELECT * FROM guestbook_entries ORDER BY created_at DESC;`
  );
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
  return res.rowCount > 0;
}
