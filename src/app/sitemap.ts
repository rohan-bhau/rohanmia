import type { MetadataRoute } from 'next';
import { getProjectsDb } from '@/lib/db/projects';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/+$/, '');

  const projects = await getProjectsDb().catch(() => []);
  const projectUrls: MetadataRoute.Sitemap = (projects || []).map((project) => ({
    url: `${baseUrl}/projects/${project.slug || project.title.toLowerCase().replace(/ /g, '-')}`,
    lastModified: new Date(),
  }));

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/projects`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/tech-stack`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/gallery`, lastModified: new Date() },
    { url: `${baseUrl}/guestbook`, lastModified: new Date() },
    { url: `${baseUrl}/links`, lastModified: new Date() },
    ...projectUrls,
  ];
}
