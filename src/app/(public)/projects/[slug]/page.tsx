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
    keyFeatures: (project.key_features || []).map((feat: any, idx: number) => {
      if (typeof feat === "string") {
        return { title: feat, description: "" };
      }
      return {
        title: feat?.title || `Feature ${idx + 1}`,
        description: feat?.description || "",
      };
    }),
    metrics: project.metrics || [],
    directoryTree: project.directory_tree,
    codeSnippet: project.code_snippet,
    backendArchitecture: project.backend_architecture,
    whatILearned: project.what_i_learned,
  };
}

import { buildDynamicMetadata, getBaseSiteUrl } from "@/lib/seo/metadata";
import { getCachedSeoSettings } from "@/lib/publicData";
import { generateProjectJsonLd, serializeJsonLd } from "@/lib/seo/jsonLd";

export async function generateMetadata({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const dbP = await getProjectBySlugDb(slug);
  if (!dbP) notFound();

  return await buildDynamicMetadata({
    path: `/projects/${slug}`,
    project: {
      title: dbP.title,
      tagline: dbP.tagline || undefined,
      overview: dbP.overview || undefined,
      seo_title: (dbP as any).seo_title,
      seo_description: (dbP as any).seo_description,
      canonical_url: (dbP as any).canonical_url,
      og_image: (dbP as any).og_image || dbP.preview_image,
      og_image_alt: (dbP as any).og_image_alt || dbP.title,
      no_index: (dbP as any).no_index,
      keywords: (dbP as any).keywords,
      preview_image: dbP.preview_image,
    },
  });
}

export default async function ProjectCaseStudyPage({
  params,
}: CaseStudyPageProps) {
  const { slug } = await params;
  const [dbProjects, seoSettings] = await Promise.all([
    getProjectsDb(),
    getCachedSeoSettings().catch(() => null),
  ]);

  const projectIndex = dbProjects.findIndex((entry) => entry.slug === slug);
  if (projectIndex === -1) notFound();

  const rawProject = dbProjects[projectIndex];
  const project = mapDbProject(rawProject);
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

  const baseUrl = getBaseSiteUrl(seoSettings?.canonical_base_url);
  const projectJsonLd = seoSettings
    ? generateProjectJsonLd(
        {
          slug: rawProject.slug,
          title: rawProject.title,
          tagline: rawProject.tagline,
          overview: rawProject.overview,
          preview_image: rawProject.preview_image,
          live_url: rawProject.live_url,
          github_url: rawProject.github_url,
          tech_stack: rawProject.tech_stack,
          created_at: rawProject.created_at,
          updated_at: rawProject.updated_at,
        },
        seoSettings,
        baseUrl
      )
    : null;

  return (
    <>
      {projectJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(projectJsonLd),
          }}
        />
      )}
      <CaseStudyClient project={project} prevProject={prev} nextProject={next} />
    </>
  );
}
