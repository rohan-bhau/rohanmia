'use server';

import { assertAdmin } from '@/lib/admin';
import { getLinksDb, saveLinksDb } from '@/lib/db/links';
import { getSiteSettingsDb, updateSiteSettingsDb, DbSiteSettingsRow } from '@/lib/db/content';
import { revalidatePath } from 'next/cache';
import type { AdminCustomLink } from '@/lib/constants/defaults';

export async function getPublicLinks(): Promise<{
  links: AdminCustomLink[];
  socialMap: Record<string, string>;
}> {
  try {
    const links = await getLinksDb();
    const socialMap: Record<string, string> = {};

    for (const l of links) {
      if (!l.active) continue;
      const key = (l.iconName || l.title || '').toLowerCase();
      if (key.includes('github')) socialMap.github = l.href;
      else if (key.includes('linkedin')) socialMap.linkedin = l.href;
      else if (key.includes('twitter') || key.includes('/ x') || key === 'x') socialMap.twitter = l.href;
      else if (key.includes('facebook')) socialMap.facebook = l.href;
      else if (key.includes('instagram')) socialMap.instagram = l.href;
      else if (key.includes('mail') || l.href.startsWith('mailto:')) socialMap.email = l.href;
    }

    return { links, socialMap };
  } catch (err: any) {
    console.error('getPublicLinks error:', err);
    return {
      links: [],
      socialMap: {}
    };
  }
}

export async function fetchAdminLinks(): Promise<{
  success: boolean;
  links?: AdminCustomLink[];
  settings?: DbSiteSettingsRow;
  error?: string;
}> {
  try {
    await assertAdmin();
    const [links, settings] = await Promise.all([
      getLinksDb(),
      getSiteSettingsDb()
    ]);
    return { success: true, links, settings: settings || undefined };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch links' };
  }
}

export async function saveAdminLinks(links: AdminCustomLink[]): Promise<{
  success: boolean;
  links?: AdminCustomLink[];
  error?: string;
}> {
  try {
    await assertAdmin();
    const saved = await saveLinksDb(links);

    // Keep site_settings in sync
    try {
      const current = await getSiteSettingsDb();
      const socialLinks = { ...(current?.social_links || {}), custom_links: saved };
      await updateSiteSettingsDb({ social_links: socialLinks });
    } catch (syncErr) {
      console.warn('Sync to site_settings warning:', syncErr);
    }

    revalidatePath('/links');
    revalidatePath('/about');
    revalidatePath('/');
    revalidatePath('/contact');
    revalidatePath('/control-room-internal/links');
    return { success: true, links: saved };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save links' };
  }
}
