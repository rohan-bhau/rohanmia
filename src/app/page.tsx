import React from 'react';
import Hero from '@/components/home/Hero';
import BentoGrid from '@/components/home/BentoGrid';
import FeaturedCaseStudies from '@/components/home/FeaturedCaseStudies';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import PinnedSocials from '@/components/layout/PinnedSocials';

export const metadata = {
  title: 'MD Rohan Mia | Full Stack Software Engineer',
  description: 'Specializing in Next.js 16 architectures, type-safe full-stack platforms, and cinematic UI/UX.',
};

export default function Home() {
  return (
    <div className="flex flex-col gap-8 pb-12 relative">
      {/* Pinned Left Floating Social Bar for Homepage */}
      <PinnedSocials />

      <Hero />
      <BentoGrid />
      <FeaturedCaseStudies />
      <TestimonialsSection />
    </div>
  );
}
