import React from 'react';
import { getAboutData } from '@/actions/adminAbout';
import { getPublicLinks } from '@/actions/adminLinks';
import AboutClient from './AboutClient';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const [content, { socialMap }] = await Promise.all([
    getAboutData(),
    getPublicLinks()
  ]);

  return <AboutClient content={content} socialMap={socialMap} />;
}
