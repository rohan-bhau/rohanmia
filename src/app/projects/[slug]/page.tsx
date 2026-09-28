import { notFound } from 'next/navigation';
import { getProjectBySlug, getAllProjectSlugs, getAdjacentProjects } from '@/data/projects';
import CaseStudyClient from './CaseStudyClient';

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  
  if (!project) {
    return {
      title: 'Project Case Study Not Found | Rohan Mia',
      description: 'The requested system architecture case study could not be located.'
    };
  }

  return {
    title: `${project.title} — System Architecture Case Study | Rohan Mia`,
    description: `${project.title}: ${project.tagline}. ${project.overview}`,
    openGraph: {
      title: `${project.title} — System Architecture Case Study`,
      description: project.tagline,
      images: [
        {
          url: project.previewImage,
          width: 1200,
          height: 630,
          alt: project.title
        }
      ]
    }
  };
}

export default async function ProjectCaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const { prev, next } = getAdjacentProjects(slug);

  return (
    <CaseStudyClient 
      project={project} 
      prevProject={prev} 
      nextProject={next} 
    />
  );
}
