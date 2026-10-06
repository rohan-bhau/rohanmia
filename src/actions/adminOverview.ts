'use server';

import { executeSql } from '@/lib/postgres';
import { ensurePortfolioTables, ensureContactAndBookingTables, ensureGuestbookTable } from '@/lib/db/schema';

export interface OverviewAnalyticsData {
  visitorStats: {
    totalViews: number;
    uniqueVisitors: number;
    viewsToday: number;
    topPaths: Array<{ path: string; count: number }>;
    devices: Array<{ device: string; count: number }>;
    recentVisitors: Array<{ path: string; device: string; browser: string; created_at: string }>;
  };
  resourceCounts: {
    projects: number;
    featuredProjects: number;
    stackItems: number;
    gallery: number;
    guestbook: number;
    inquiries: number;
    unreadInquiries: number;
    bookings: number;
    links: number;
  };
  recentActivity: {
    guestbook: Array<{ id: string; user_name: string; message: string; created_at: string }>;
    inquiries: Array<{ id: string; sender_name: string; sender_email: string; topic: string; message: string; is_read: boolean; created_at: string }>;
    bookings: Array<{ id: string; name: string; email: string; topic: string; date: string; time_slot: string; status: string; created_at: string }>;
  };
}

export async function getOverviewAnalytics(): Promise<OverviewAnalyticsData> {
  await Promise.all([
    ensurePortfolioTables(),
    ensureContactAndBookingTables(),
    ensureGuestbookTable(),
  ]);

  const adminSecretPath = (process.env.ADMIN_ENTRY_PATH || '').trim();
  const secretFilter = adminSecretPath ? `AND path NOT LIKE '${adminSecretPath}%'` : '';
  const filterClause = `WHERE path NOT LIKE '/control-room%' ${secretFilter}`;

  const [
    totalViewsRes,
    uniqueVisitorsRes,
    viewsTodayRes,
    topPathsRes,
    devicesRes,
    recentVisitorsRes,
    projectsRes,
    featuredRes,
    stackRes,
    galleryRes,
    guestbookRes,
    inquiriesRes,
    unreadInquiriesRes,
    bookingsRes,
    linksRes,
    recentGuestbookRes,
    recentInquiriesRes,
    recentBookingsRes,
  ] = await Promise.all([
    executeSql(`SELECT count(*) as cnt FROM analytics_events ${filterClause}`),
    executeSql(`SELECT count(DISTINCT visitor_id) as cnt FROM analytics_events ${filterClause}`),
    executeSql(`SELECT count(*) as cnt FROM analytics_events ${filterClause} AND created_at >= CURRENT_DATE`),
    executeSql(`SELECT path, count(*) as cnt FROM analytics_events ${filterClause} GROUP BY path ORDER BY cnt DESC LIMIT 6`),
    executeSql(`SELECT device, count(*) as cnt FROM analytics_events ${filterClause} GROUP BY device ORDER BY cnt DESC`),
    executeSql(`SELECT path, device, browser, created_at FROM analytics_events ${filterClause} ORDER BY created_at DESC LIMIT 5`),
    executeSql("SELECT count(*) as cnt FROM projects"),
    executeSql("SELECT count(*) as cnt FROM featured_case_studies"),
    executeSql("SELECT count(*) as cnt FROM tech_items"),
    executeSql("SELECT count(*) as cnt FROM gallery_photos"),
    executeSql("SELECT count(*) as cnt FROM guestbook_entries"),
    executeSql("SELECT count(*) as cnt FROM contact_messages"),
    executeSql("SELECT count(*) as cnt FROM contact_messages WHERE is_read = false"),
    executeSql("SELECT count(*) as cnt FROM meeting_bookings"),
    executeSql("SELECT count(*) as cnt FROM links"),
    executeSql("SELECT id, name as user_name, message, created_at FROM guestbook_entries ORDER BY created_at DESC LIMIT 4"),
    executeSql("SELECT id, name as sender_name, email as sender_email, topic, message, is_read, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 4"),
    executeSql("SELECT id, name, email, topic, date, time_slot, status, created_at FROM meeting_bookings ORDER BY created_at DESC LIMIT 4"),
  ]);

  return {
    visitorStats: {
      totalViews: parseInt(totalViewsRes.rows[0]?.cnt || '0', 10),
      uniqueVisitors: parseInt(uniqueVisitorsRes.rows[0]?.cnt || '0', 10),
      viewsToday: parseInt(viewsTodayRes.rows[0]?.cnt || '0', 10),
      topPaths: topPathsRes.rows.map((r: any) => ({
        path: r.path,
        count: parseInt(r.cnt || '0', 10),
      })),
      devices: devicesRes.rows.map((r: any) => ({
        device: r.device || 'Desktop',
        count: parseInt(r.cnt || '0', 10),
      })),
      recentVisitors: recentVisitorsRes.rows.map((r: any) => ({
        path: r.path,
        device: r.device,
        browser: r.browser,
        created_at: r.created_at,
      })),
    },
    resourceCounts: {
      projects: parseInt(projectsRes.rows[0]?.cnt || '0', 10),
      featuredProjects: parseInt(featuredRes.rows[0]?.cnt || '0', 10),
      stackItems: parseInt(stackRes.rows[0]?.cnt || '0', 10),
      gallery: parseInt(galleryRes.rows[0]?.cnt || '0', 10),
      guestbook: parseInt(guestbookRes.rows[0]?.cnt || '0', 10),
      inquiries: parseInt(inquiriesRes.rows[0]?.cnt || '0', 10),
      unreadInquiries: parseInt(unreadInquiriesRes.rows[0]?.cnt || '0', 10),
      bookings: parseInt(bookingsRes.rows[0]?.cnt || '0', 10),
      links: parseInt(linksRes.rows[0]?.cnt || '0', 10),
    },
    recentActivity: {
      guestbook: recentGuestbookRes.rows || [],
      inquiries: recentInquiriesRes.rows || [],
      bookings: recentBookingsRes.rows || [],
    },
  };
}
