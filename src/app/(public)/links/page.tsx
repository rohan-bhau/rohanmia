import React from 'react';
import { getPublicLinks } from '@/actions/adminLinks';
import { getHeroData } from '@/actions/adminHero';
import { getSettings } from '@/actions/adminSettings';
import LinksClient from './LinksClient';

import { buildDynamicMetadata } from '@/lib/seo/metadata';
import { getCachedSeoSettings } from '@/lib/publicData';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return await buildDynamicMetadata({ path: "/links" });
}

export default async function LinksPage() {
  const [{ links, socialMap }, heroData, settings, seoSettings] = await Promise.all([
    getPublicLinks(),
    getHeroData(),
    getSettings(),
    getCachedSeoSettings().catch(() => null),
  ]);

  const primaryName = seoSettings?.primary_name || (heroData?.name ? `${heroData.name} ${heroData.surname || ''}`.trim() : 'MD Rohan Mia');
  const avatarUrl = seoSettings?.profile_image_url || heroData?.profile_image || '';
  const location = seoSettings ? `${seoSettings.location_locality}, ${seoSettings.location_country}` : 'Dhaka, Bangladesh';

  const profileData = {
    name: primaryName,
    roles: [seoSettings?.professional_title || 'Full Stack Developer', 'Freelancer'],
    avatar: avatarUrl,
    location: location,
    email: socialMap?.email || settings?.contact_email || ''
  };

  return <LinksClient links={links} profileData={profileData} />;
}
