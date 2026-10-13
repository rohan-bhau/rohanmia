import { notFound } from "next/navigation";
import type { CaseStudy } from "@/data/projects";
import {
  DbProjectRow,
  getProjectBySlugDb,
  getProjectsDb,
} from "@/lib/db/projects";
import CaseStudyClient from "./CaseStudyClient";

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const dbProjects = await getProjectsDb();
  return dbProjects.map((project) => ({ slug: project.slug }));
}

function mapDbProject(project: DbProjectRow): CaseStudy {
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    tagline: project.tagline || "",
    category: project.category as CaseStudy["category"],
    featured: project.featured,
    role: project.role || "",
    year: project.year || "",
    targetAudience: project.target_audience || "",
    whyIBuiltThis: project.why_i_built_this || "",
    overview: project.overview || "",
    problem: project.problem || "",
    solution: project.solution || "",
    gradient: project.gradient || "",
    accentColor: project.accent_color || "",
    previewImage: project.preview_image || "",
    hoverImage: project.hover_image,
    githubUrl: project.github_url,
    clientUrl: project.client_url,
    serverUrl: project.server_url,
    liveUrl: project.live_url,
    techStack: project.tech_stack || [],
    architecture: {
      frontend: project.architecture?.frontend || [],
      backend: project.architecture?.backend || [],
      database: project.architecture?.database || [],
      infrastructure: project.architecture?.infrastructure || [],
    },
    systemBreakdown: project.system_breakdown || [],
    challenges: project.challenges || [],
    technicalDecisions: project.technical_decisions || [],
    keyFeatures: project.key_features || [],
    metrics: project.metrics || [],
    directoryTree: project.directory_tree,
    codeSnippet: project.code_snippet,
    backendArchitecture: project.backend_architecture,
    whatILearned: project.what_i_learned,
  };
}

export async function generateMetadata({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const dbP = await getProjectBySlugDb(slug);
  if (!dbP) notFound();
  const project = mapDbProject(dbP);

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
          alt: project.title,
        },
      ],
    },
  };
}

export default async function ProjectCaseStudyPage({
  params,
}: CaseStudyPageProps) {
  const { slug } = await params;
  const dbProjects = await getProjectsDb();
  const projectIndex = dbProjects.findIndex((entry) => entry.slug === slug);
  if (projectIndex === -1) notFound();

  const project = mapDbProject(dbProjects[projectIndex]);
  const prev =
    dbProjects.length > 1
      ? mapDbProject(
          dbProjects[
            (projectIndex - 1 + dbProjects.length) % dbProjects.length
          ],
        )
      : null;
  const next =
    dbProjects.length > 1
      ? mapDbProject(dbProjects[(projectIndex + 1) % dbProjects.length])
      : null;

  return (
    <CaseStudyClient project={project} prevProject={prev} nextProject={next} />
  );
}
