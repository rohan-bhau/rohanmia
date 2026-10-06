import { notFound } from 'next/navigation';
import { getProjectBySlug, getAllProjectSlugs, getAdjacentProjects, CaseStudy } from '@/data/projects';
import { getProjectBySlugDb, getProjectsDb } from '@/lib/db/projects';
import CaseStudyClient from './CaseStudyClient';

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const dbProjects = await getProjectsDb();
    if (dbProjects.length > 0) {
      return dbProjects.map((p) => ({ slug: p.slug }));
    }
  } catch (e) {
    // fallback
  }
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  let project: CaseStudy | null = null;
  const dbP = await getProjectBySlugDb(slug);
  if (dbP) {
    project = {
      id: dbP.id,
      slug: dbP.slug,
      title: dbP.title,
      tagline: dbP.tagline,
      category: dbP.category as any,
      featured: dbP.featured,
      role: dbP.role || 'Lead Engineer',
      year: dbP.year || '2026',
      targetAudience: dbP.target_audience || '',
      overview: dbP.overview || '',
      problem: dbP.problem || '',
      solution: dbP.solution || '',
      gradient: dbP.gradient || 'linear-gradient(135deg, #182848 0%, #4b6cb7 100%)',
      accentColor: dbP.accent_color || '#6366f1',
      previewImage: dbP.preview_image,
      hoverImage: dbP.hover_image,
      githubUrl: dbP.github_url,
      clientUrl: dbP.client_url,
      serverUrl: dbP.server_url,
      liveUrl: dbP.live_url,
      techStack: dbP.tech_stack || [],
      architecture: dbP.architecture as any || { frontend: [], backend: [], database: [], infrastructure: [] },
      systemBreakdown: dbP.system_breakdown || [],
      challenges: dbP.challenges || [],
      technicalDecisions: dbP.technical_decisions || [],
      keyFeatures: dbP.key_features || [],
      metrics: dbP.metrics || [],
    };
  } else {
    project = getProjectBySlug(slug) || null;
  }
  
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
  let project: CaseStudy | null = null;
  
  const dbP = await getProjectBySlugDb(slug);
  if (dbP) {
    project = {
      id: dbP.id,
      slug: dbP.slug,
      title: dbP.title,
      tagline: dbP.tagline,
      category: dbP.category as any,
      featured: dbP.featured,
      role: dbP.role || 'Lead Engineer',
      year: dbP.year || '2026',
      targetAudience: dbP.target_audience || '',
      overview: dbP.overview || '',
      problem: dbP.problem || '',
      solution: dbP.solution || '',
      gradient: dbP.gradient || 'linear-gradient(135deg, #182848 0%, #4b6cb7 100%)',
      accentColor: dbP.accent_color || '#6366f1',
      previewImage: dbP.preview_image,
      hoverImage: dbP.hover_image,
      githubUrl: dbP.github_url,
      clientUrl: dbP.client_url,
      serverUrl: dbP.server_url,
      liveUrl: dbP.live_url,
      techStack: dbP.tech_stack || [],
      architecture: dbP.architecture as any || { frontend: [], backend: [], database: [], infrastructure: [] },
      systemBreakdown: dbP.system_breakdown || [],
      challenges: dbP.challenges || [],
      technicalDecisions: dbP.technical_decisions || [],
      keyFeatures: dbP.key_features || [],
      metrics: dbP.metrics || [],
      directoryTree: dbP.directory_tree,
      codeSnippet: dbP.code_snippet,
      backendArchitecture: dbP.backend_architecture,
      whatILearned: dbP.what_i_learned,
    };
  } else {
    project = getProjectBySlug(slug) || null;
  }

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
