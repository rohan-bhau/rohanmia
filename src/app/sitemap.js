import { getProjects } from '@/actions/projects';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rohanmia.com';

  const projects = await getProjects();
  const projectUrls = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.title.toLowerCase().replace(/ /g, '-')}`,
    lastModified: new Date(),
  }));

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/projects`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/tech-stack`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    ...projectUrls,
  ];
}
