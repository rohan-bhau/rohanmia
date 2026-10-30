import React from 'react';
import { getSettings } from '@/actions/adminSettings';
import { getPublicLinks } from '@/actions/adminLinks';
import ContactClientView from './ContactClientView';

import { buildDynamicMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return await buildDynamicMetadata({ path: "/contact" });
}

export default async function ContactPage() {
  const [settings, { socialMap }] = await Promise.all([
    getSettings(),
    getPublicLinks(),
  ]);

  return (
    <ContactClientView
      contactEmail={settings?.contact_email || socialMap?.email || ''}
      socialMap={socialMap || {}}
    />
  );
}
