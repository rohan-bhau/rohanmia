import React from 'react';
import { getAboutData } from '@/actions/adminAbout';
import { getPublicLinks } from '@/actions/adminLinks';
import AboutClient from './AboutClient';

import { buildDynamicMetadata, getBaseSiteUrl } from '@/lib/seo/metadata';
import { getCachedSeoSettings } from '@/lib/publicData';
import { generateProfilePageJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return await buildDynamicMetadata({ path: "/about" });
}

export default async function AboutPage() {
  const [content, { socialMap }, seoSettings] = await Promise.all([
    getAboutData(),
    getPublicLinks(),
    getCachedSeoSettings().catch(() => null),
  ]);

  const baseUrl = getBaseSiteUrl(seoSettings?.canonical_base_url);
  const profilePageJsonLd = seoSettings
    ? generateProfilePageJsonLd(seoSettings, baseUrl, content?.updated_at)
    : null;

  return (
    <>
      {profilePageJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(profilePageJsonLd),
          }}
        />
      )}
      <AboutClient content={content} socialMap={socialMap} />
    </>
  );
}
