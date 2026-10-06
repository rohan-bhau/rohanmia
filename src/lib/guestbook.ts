import { auth } from '@/auth';
import { fetchAllEntries } from '@/lib/postgres';
import type { GuestbookEntry, GuestbookTheme } from '@/data/guestbook';

export interface OAuthStatus {
  google: boolean;
  github: boolean;
}

export function getOAuthStatus(): OAuthStatus {
  return {
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    github: Boolean(
      (process.env.GITHUB_CLIENT_ID || process.env.GITHUB_ID) &&
        (process.env.GITHUB_CLIENT_SECRET || process.env.GITHUB_SECRET)
    ),
  };
}

/** True when no OAuth provider is configured (local dev fallback identity is allowed) */
export function isDevIdentityMode(): boolean {
  const status = getOAuthStatus();
  return !status.google && !status.github;
}

// Format relative date (e.g. "Just now", "2h ago", "Sep 12, 2026")
export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const diffMins = Math.floor((Date.now() - d.getTime()) / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Recently';
  }
}

/**
 * Load entries for the current viewer.
 * Visitor emails are never sent to the browser; ownership is resolved server-side
 * from the verified session (`isOwner`).
 */
export async function getGuestbookData(): Promise<{
  entries: GuestbookEntry[];
  oauthConfigured: OAuthStatus;
}> {
  const [rows, session] = await Promise.all([
    fetchAllEntries(),
    auth().catch(() => null),
  ]);

  const devMode = isDevIdentityMode();
  const viewerEmail = (session?.user?.email || '').trim().toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const viewerIsAdmin = Boolean(viewerEmail && adminEmail && viewerEmail === adminEmail);

  const entries: GuestbookEntry[] = rows.map((r) => {
    const authorEmail = (r.email || '').trim().toLowerCase();
    return {
      id: r.id,
      name: r.name,
      // Only expose emails in local dev-identity mode (needed for client-side ownership there)
      email: devMode ? r.email : '',
      message: r.message,
      avatar: r.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.name)}`,
      provider: r.provider,
      theme: r.theme as GuestbookTheme,
      createdAt: formatDate(r.created_at),
      verified: true,
      isOwner: Boolean(viewerEmail && (viewerIsAdmin || viewerEmail === authorEmail)),
    };
  });

  return { entries, oauthConfigured: getOAuthStatus() };
}
