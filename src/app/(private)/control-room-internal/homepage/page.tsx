import React from 'react';
import { getHeroData } from '@/actions/adminHero';
import { getBentoData } from '@/actions/adminBento';
import { getFeaturedProjects } from '@/actions/adminProjects';
import AdminHomepageManager from '@/components/admin/AdminHomepageManager';

export const dynamic = 'force-dynamic';

export default async function ControlRoomHomepagePage() {
  const [heroData, bentoData, featuredProjects] = await Promise.all([
    getHeroData(),
    getBentoData(),
    getFeaturedProjects(),
  ]);

  return (
    <AdminHomepageManager
      heroData={heroData}
      bentoData={bentoData}
      featuredProjects={featuredProjects}
    />
  );
}
