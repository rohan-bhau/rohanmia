import React from 'react';
import { getProjectsDb, getFeaturedCaseStudiesDb } from '@/lib/db/projects';
import AdminProjectsManager from '@/components/admin/AdminProjectsManager';

export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage() {
  const [projects, featuredList] = await Promise.all([
    getProjectsDb(),
    getFeaturedCaseStudiesDb()
  ]);

  return (
    <AdminProjectsManager
      initialProjects={projects}
      initialFeatured={featuredList}
    />
  );
}
