import React from 'react';
import { getPublicLinks } from '@/actions/adminLinks';
import { getHeroData } from '@/actions/adminHero';
import { getSettings } from '@/actions/adminSettings';
import LinksClient from './LinksClient';

export const dynamic = 'force-dynamic';

export default async function LinksPage() {
  const [{ links, socialMap }, heroData, settings] = await Promise.all([
    getPublicLinks(),
    getHeroData(),
    getSettings()
  ]);

  const profileData = {
    name: heroData?.name ? `${heroData.name} ${heroData.surname || ''}`.trim() : 'MD Rohan Mia',
    roles: ['Developer', 'Freelancer'],
    avatar: heroData?.profile_image || 'https://res.cloudinary.com/dzni0yyle/image/upload/v1778155735/portfolio_cms/fcprc2kqkcmxitdibzcn.png',
    location: 'Dhaka, Bangladesh',
    email: socialMap?.email || settings?.contact_email || ''
  };

  return <LinksClient links={links} profileData={profileData} />;
}
