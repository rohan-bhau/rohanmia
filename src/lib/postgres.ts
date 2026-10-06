import https from 'https';
import dns from 'dns';

/**
 * SQL Escaping Utilities
 */
export function escapeSqlString(val: any): string {
  if (val === null || val === undefined) return "''";
  return "'" + String(val).replace(/'/g, "''") + "'";
}

export function escapeSqlJson(val: any): string {
  if (val === null || val === undefined) return "'{}'::jsonb";
  const jsonStr = typeof val === 'string' ? val : JSON.stringify(val);
  return "'" + jsonStr.replace(/'/g, "''") + "'::jsonb";
}

/**
 * Execute raw SQL queries against Neon PostgreSQL via HTTPS (Port 443)
 * Guarantees zero port 5432 timeouts across all ISPs and deployment environments.
 */
async function runQuery<T>(query: string, useFamily4: boolean = true): Promise<{ rows: T[]; rowCount: number }> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured in environment variables');
  }

  const u = new URL(databaseUrl);
  const postData = JSON.stringify({ query });

  return new Promise((resolve, reject) => {
    const opts: https.RequestOptions = {
      hostname: u.hostname,
      port: 443,
      path: '/sql',
      method: 'POST',
      headers: {
        'Neon-Connection-String': databaseUrl,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 6000,
      family: 4,
      lookup: (hostname, options, callback) => {
        dns.lookup(hostname, { family: 4 }, callback);
      }
    };

    const req = https.request(opts, (res) => {
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

    req.on('timeout', () => {
      req.destroy(new Error('Neon HTTPS query timed out'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

export async function executeSql<T = any>(query: string): Promise<{ rows: T[]; rowCount: number }> {
  try {
    return await runQuery<T>(query, true);
  } catch (err: any) {
    if (err?.code === 'EAI_AGAIN' || err?.message?.includes('timed out')) {
      return await runQuery<T>(query, false);
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Re-export modular database models and queries for clean architecture
// ---------------------------------------------------------------------------
export * from './db/schema';
export * from './db/projects';
export * from './db/stack';
export * from './db/content';
export * from './db/gallery';
export * from './db/guestbook';
export * from './db/contact';
export * from './db/links';
