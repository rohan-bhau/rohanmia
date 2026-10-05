import React from 'react';
import Hero from '@/components/home/Hero';
import BentoGrid from '@/components/home/BentoGrid';
import FeaturedCaseStudies from '@/components/home/FeaturedCaseStudies';
import PinnedSocials from '@/components/layout/PinnedSocials';
import { getHeroData } from '@/actions/adminHero';
import { getBentoData } from '@/actions/adminBento';
import { getFeaturedProjects } from '@/actions/adminProjects';
import AdminHomepageManager from '@/components/admin/AdminHomepageManager';

export const dynamic = 'force-dynamic';

export default async function ControlRoomHomepage() {
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
