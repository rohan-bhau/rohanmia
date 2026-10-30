import React from "react";
import { getCachedProjects } from "@/lib/publicData";
import ProjectsClientView from "@/components/projects/ProjectsClientView";
import { CaseStudy } from "@/data/projects";

import { buildDynamicMetadata, getBaseSiteUrl } from "@/lib/seo/metadata";
import { getCachedSeoSettings } from "@/lib/publicData";
import { generateProjectsCollectionJsonLd, serializeJsonLd } from "@/lib/seo/jsonLd";

export const revalidate = 60; // 0ms instantaneous visitor load with background revalidation

export async function generateMetadata() {
  return await buildDynamicMetadata({ path: "/projects" });
}

export default async function ProjectsPage() {
  const dbProjects = await getCachedProjects();

  const projects: CaseStudy[] = dbProjects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    tagline: p.tagline,
    category: p.category as any,
    featured: p.featured,
    role: p.role || "",
    year: p.year || "",
    targetAudience: p.target_audience || "",
    overview: p.overview || "",
    problem: p.problem || "",
    solution: p.solution || "",
    gradient: p.gradient || "",
    accentColor: p.accent_color || "",
    previewImage: p.preview_image,
    hoverImage: p.hover_image,
    githubUrl: p.github_url,
    clientUrl: p.client_url,
    serverUrl: p.server_url,
    liveUrl: p.live_url,
    techStack: p.tech_stack || [],
    architecture: {
      frontend: p.architecture?.frontend || [],
      backend: p.architecture?.backend || [],
      database: p.architecture?.database || [],
      infrastructure: p.architecture?.infrastructure || [],
    },
    systemBreakdown: p.system_breakdown || [],
    challenges: p.challenges || [],
    technicalDecisions: p.technical_decisions || [],
    keyFeatures: p.key_features || [],
    metrics: p.metrics || [],
    directoryTree: p.directory_tree,
    codeSnippet: p.code_snippet,
    backendArchitecture: p.backend_architecture,
    whatILearned: p.what_i_learned,
  }));

  const seoSettings = await getCachedSeoSettings().catch(() => null);
  const baseUrl = getBaseSiteUrl(seoSettings?.canonical_base_url);
  const collectionJsonLd = seoSettings
    ? generateProjectsCollectionJsonLd(dbProjects, seoSettings, baseUrl)
    : null;

  return (
    <>
      {collectionJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(collectionJsonLd),
          }}
        />
      )}
      <ProjectsClientView initialProjects={projects} />
    </>
  );
}
