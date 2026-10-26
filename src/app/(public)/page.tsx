import React from 'react';
import Hero from '@/components/home/Hero';
import BentoGrid from '@/components/home/BentoGrid';
import FeaturedCaseStudies from '@/components/home/FeaturedCaseStudies';
import PinnedSocials from '@/components/layout/PinnedSocials';
import { getHeroData } from '@/actions/adminHero';
import { getBentoData } from '@/actions/adminBento';
import { getFeaturedProjects } from '@/actions/adminProjects';
import { getPublicLinks } from '@/actions/adminLinks';

import { buildDynamicMetadata } from '@/lib/seo/metadata';

export const revalidate = 60; // 0ms instantaneous visitor load with background revalidation

export async function generateMetadata() {
  return await buildDynamicMetadata({ path: "/" });
}

export default async function Home() {
  const [{ socialMap }, heroData, bentoData, featuredProjects] = await Promise.all([
    getPublicLinks(),
    getHeroData(),
    getBentoData(),
    getFeaturedProjects(),
  ]);

  return (
    <div className="flex flex-col gap-8 pb-12 relative">
      {/* Pinned Left Floating Social Bar for Homepage */}
      <PinnedSocials socialMap={socialMap} />

      <Hero initialData={heroData} isAdmin={false} />
      <BentoGrid initialData={bentoData} isAdmin={false} />
      <FeaturedCaseStudies initialProjects={featuredProjects} isAdmin={false} />
    </div>
  );
}
