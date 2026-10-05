import { NextRequest, NextResponse } from 'next/server';
import { executeSql, escapeSqlString } from '@/lib/postgres';
import { ensurePortfolioTables } from '@/lib/db/schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await ensurePortfolioTables();

    const id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const path = escapeSqlString(body.path || '/');
    const visitorId = escapeSqlString(body.visitorId || 'anonymous');
    const device = escapeSqlString(body.device || 'desktop');
    const browser = escapeSqlString(body.browser || 'unknown');
    const location = escapeSqlString(body.location || '');
    const duration = Number(body.duration) || 0;

    if (body.type === 'duration') {
      await executeSql(`
        UPDATE analytics_events 
        SET duration = duration + ${duration}
        WHERE id = (
          SELECT id FROM analytics_events 
          WHERE visitor_id = ${visitorId} AND path = ${path} 
          ORDER BY created_at DESC LIMIT 1
        );
      `);
      return NextResponse.json({ success: true });
    }

    // Default: page view tracking
    await executeSql(`
      INSERT INTO analytics_events (id, path, visitor_id, device, browser, location, duration)
      VALUES ('${id}', ${path}, ${visitorId}, ${device}, ${browser}, ${location}, ${duration});
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    // Non-blocking fail-safe: analytics errors should never break user experience
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
