"use server";

import { assertAdmin } from "@/lib/admin";
import { executeSql, escapeSqlString } from "@/lib/postgres";
import { ensurePortfolioTables } from "@/lib/db/schema";
import { upsertProjectDb, getProjectsDb, deleteProjectDb, DbProjectRow } from "@/lib/db/projects";
import { getAboutContentDb, updateAboutContentDb } from "@/lib/db/content";
import { getAiConfigDb, updateAiConfigDb, DbAiConfigRow } from "@/lib/db/aiConfig";
import { saveHeroData, getHeroData } from "@/actions/adminHero";
import { autonomouslyAddSkill, autonomouslyDeleteSkill } from "@/lib/ai/skills";
import { parseGitHubUrl, fetchGitHubRepoDetails, synthesizeCaseStudyFromRepo } from "@/lib/ai/github";
import { SynthesizedCaseStudy, DailyBriefingData, GitHubRepoMetadata } from "@/types/ai";
import { revalidatePath, updateTag } from "next/cache";
import { PUBLIC_DATA_TAGS } from "@/lib/publicData";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";

/**
 * Analyzes a public GitHub repository and generates a staged Case Study draft.
 */
export async function stageProjectFromGitHub(
  repoUrl: string,
  liveUrl?: string,
  serverRepoUrl?: string
): Promise<{ success: boolean; project?: SynthesizedCaseStudy; message: string }> {
  await assertAdmin();
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return {
      success: false,
      message: "Invalid GitHub repository URL. Expected format: github.com/owner/repo",
    };
  }

  try {
    const meta = await fetchGitHubRepoDetails(parsed.owner, parsed.repo);
    let serverMeta: GitHubRepoMetadata | null = null;
    let finalServerUrl = serverRepoUrl;

    if (serverRepoUrl) {
      const parsedServer = parseGitHubUrl(serverRepoUrl);
      if (parsedServer) {
        serverMeta = await fetchGitHubRepoDetails(parsedServer.owner, parsedServer.repo).catch(() => null);
      }
    } else if (parsed.repo.toLowerCase().endsWith("-client")) {
      // Auto-detect sibling server repo if available
      const potentialServerRepo = parsed.repo.replace(/-client$/i, "-server");
      const autoServerMeta = await fetchGitHubRepoDetails(parsed.owner, potentialServerRepo).catch(() => null);
      if (autoServerMeta && autoServerMeta.fullName) {
        serverMeta = autoServerMeta;
        finalServerUrl = `https://github.com/${autoServerMeta.fullName}`;
      }
    }

    const synthesized = await synthesizeCaseStudyFromRepo(meta, liveUrl, finalServerUrl, serverMeta);
    return {
      success: true,
      project: synthesized,
      message: `Repository ${meta.fullName} successfully analyzed! Ready for preview & hover image upload.`,
    };
  } catch (error: any) {
    console.error("stageProjectFromGitHub error:", error);
    return {
      success: false,
      message: `Failed to analyze GitHub repo: ${error?.message || "Unknown error"}`,
    };
  }
}

/**
 * Commits a staged Case Study with its uploaded preview image and hover image into PostgreSQL.
 */
export async function commitProjectWithImage(
  projectData: SynthesizedCaseStudy,
  previewImageUrl: string,
  hoverImageUrl?: string
): Promise<{ success: boolean; slug?: string; message: string }> {
  await assertAdmin();
  if (!previewImageUrl) {
    return { success: false, message: "Preview image URL is required to publish project." };
  }

  try {
    const existing = await getProjectsDb();
    const existingMatch = existing.find(
      (p) => p.slug.toLowerCase() === projectData.slug.toLowerCase()
    );
    const sortOrder = existingMatch ? existingMatch.sort_order : existing.length + 1;
    const projectId = existingMatch?.id || `proj-${projectData.slug}-${Date.now().toString(36)}`;

    // Normalize key features to { title, description }[]
    const normalizedKeyFeatures = (
      projectData.keyFeatures && projectData.keyFeatures.length > 0
        ? projectData.keyFeatures
        : (projectData.highlights || []).map((h, i) => ({
            title: `Key Architectural Feature 0${i + 1}`,
            description: typeof h === "string" ? h : (h as any).description || "",
          }))
    ).map((f: any, idx: number) => {
      if (typeof f === "string") return { title: f, description: "" };
      return {
        title: f?.title || `Feature 0${idx + 1}`,
        description: f?.description || "",
      };
    });

    const clientUrl = projectData.clientUrl || projectData.githubUrl || "";
    const serverUrl = projectData.serverUrl || "";
    const hoverImage = hoverImageUrl || previewImageUrl;

    const dbRow: Partial<DbProjectRow> & { id: string; title: string; slug: string } = {
      id: projectId,
      title: projectData.title,
      slug: projectData.slug,
      tagline: projectData.tagline,
      category: projectData.category || "Full Stack",
      year: projectData.year || new Date().getFullYear().toString(),
      role: projectData.role || "Lead Full-Stack Architect",
      target_audience: projectData.targetAudience || "Production Users & Engineering Leaders",
      why_i_built_this: projectData.whyIBuiltThis || projectData.tagline,
      overview: projectData.overview || projectData.highlights?.join(" ") || projectData.tagline,
      problem: projectData.problem || projectData.challenges?.[0]?.problem || "Building high-throughput, fault-tolerant web architecture.",
      solution: projectData.solution || projectData.challenges?.[0]?.solution || "Engineered scalable modern Next.js and PostgreSQL system.",
      gradient: projectData.gradient || "linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(3,7,18,0.95) 100%)",
      accent_color: projectData.accentColor || "#0ea5e9",
      preview_image: previewImageUrl,
      hover_image: hoverImage,
      live_url: projectData.liveUrl || "",
      github_url: clientUrl || serverUrl,
      client_url: clientUrl,
      server_url: serverUrl,
      tech_stack: projectData.techStack || ["Next.js", "TypeScript", "PostgreSQL"],
      architecture: {
        frontend: (projectData.techStack || []).filter(t => !["PostgreSQL", "MongoDB", "Redis", "Docker"].includes(t)),
        backend: (projectData.techStack || []).filter(t => ["Node.js", "Express", "FastAPI", "Go", "Kafka", "Redis"].includes(t)),
        database: (projectData.techStack || []).filter(t => ["PostgreSQL", "MongoDB", "Redis", "Prisma", "Drizzle"].includes(t)),
        infrastructure: ["Docker", "Vercel", "AWS"],
      },
      challenges: projectData.challenges || [],
      technical_decisions: projectData.technicalDecisions || (projectData.highlights || []).map((h, i) => ({
        decision: `Architecture Decision 0${i + 1}`,
        rationale: typeof h === "string" ? h : (h as any).title || "",
        tradeoff: "Optimized for latency and maintainability",
      })),
      key_features: normalizedKeyFeatures,
      metrics: projectData.metrics || [
        { label: "Performance", value: "99 Lighthouse" },
        { label: "Latency", value: "<45ms TTFB" },
      ],
      system_breakdown: projectData.systemBreakdown || [
        {
          layer: "Presentation & Edge Delivery",
          description: "Server-side rendering, streaming client components, and responsive mobile interfaces.",
          technologies: (projectData.techStack || []).slice(0, 3),
        },
        {
          layer: "Business Logic & State Services",
          description: "Type-safe server actions, authentication middleware, and domain logic validation.",
          technologies: (projectData.techStack || []).slice(2, 5),
        },
      ],
      what_i_learned: projectData.whatILearned || [
        "Architecting resilient systems requires strict contract validation at all boundary layers.",
        "Server Components dramatically reduce client-side bundle weight while preserving instant interactivity.",
      ],
      directory_tree: projectData.architectureTree || "",
      code_snippet: projectData.codeSnippet || null,
      backend_architecture: projectData.backendArchitecture || null,
      featured: Boolean(projectData.isFeatured ?? false),
      featured_sort_order: projectData.isFeatured ? sortOrder : 0,
      sort_order: sortOrder,
    };

    await upsertProjectDb(dbRow);

    // Delete old Cloudinary images if project was re-committed with new images
    if (existingMatch) {
      if (
        existingMatch.preview_image &&
        existingMatch.preview_image !== previewImageUrl
      ) {
        await deleteCloudinaryAsset(existingMatch.preview_image);
      }
      if (
        existingMatch.hover_image &&
        existingMatch.hover_image !== hoverImage &&
        existingMatch.hover_image !== previewImageUrl
      ) {
        await deleteCloudinaryAsset(existingMatch.hover_image);
      }
    }
    updateTag(PUBLIC_DATA_TAGS.projects);
    revalidatePath("/projects");
    revalidatePath(`/projects/${projectData.slug}`);
    revalidatePath("/");
    revalidatePath("/control-room-internal/projects");

    return {
      success: true,
      slug: projectData.slug,
      message: `Project "${projectData.title}" was successfully committed to PostgreSQL and published!`,
    };
  } catch (error: any) {
    console.error("commitProjectWithImage error:", error);
    return {
      success: false,
      message: `Failed to commit project: ${error?.message || "Unknown error"}`,
    };
  }
}

/**
 * Autonomously adds or deletes a technology skill in the database.
 */
export async function manageSkillAutonomous(
  action: "add" | "delete",
  skillName: string,
  preferredCategory?: string
) {
  await assertAdmin();
  if (action === "add") {
    const res = await autonomouslyAddSkill(skillName, preferredCategory);
    if (res.success) {
      updateTag(PUBLIC_DATA_TAGS.stack);
      revalidatePath("/tech-stack");
      revalidatePath("/control-room-internal/tech-stack");
    }
    return res;
  } else {
    const res = await autonomouslyDeleteSkill(skillName);
    if (res.success) {
      updateTag(PUBLIC_DATA_TAGS.stack);
      revalidatePath("/tech-stack");
      revalidatePath("/control-room-internal/tech-stack");
    }
    return res;
  }
}

/**
 * Updates hero section bio and rotating titles.
 */
export async function updateHeroBioAutonomous(bio: string, roles?: string[]) {
  await assertAdmin();
  const current = await getHeroData();
  const updatedRoles = roles && roles.length > 0 ? roles : current.rotating_roles;
  const res = await saveHeroData({
    bio: bio.trim(),
    rotating_roles: updatedRoles,
  });
  return res;
}

/**
 * Aggregates visitor, lead, and guestbook statistics for the executive briefing.
 */
export async function getDailyBriefingAutonomous(): Promise<DailyBriefingData> {
  await assertAdmin();
  try {
    await ensurePortfolioTables();

    const [chatCountRes, leadsRes, guestbookRes, visitorRes] = await Promise.all([
      executeSql<{ count: string }>(
        `SELECT COUNT(*) as count FROM ai_chat_logs WHERE last_interaction > NOW() - INTERVAL '24 hours';`
      ).catch(() => ({ rows: [{ count: "0" }] })),
      executeSql<{ name: string; email: string; company?: string; created_at: string }>(
        `SELECT name, email, company, created_at FROM leads WHERE created_at > NOW() - INTERVAL '24 hours' ORDER BY created_at DESC LIMIT 5;`
      ).catch(() => ({ rows: [] })),
      executeSql<{ name: string; message: string; badge: string; created_at: string }>(
        `SELECT name, message, badge, created_at FROM guestbook WHERE created_at > NOW() - INTERVAL '24 hours' ORDER BY created_at DESC LIMIT 5;`
      ).catch(() => ({ rows: [] })),
      executeSql<{ count: string }>(
        `SELECT COUNT(DISTINCT visitor_id) as count FROM analytics_events WHERE created_at > NOW() - INTERVAL '24 hours';`
      ).catch(() => ({ rows: [{ count: "0" }] })),
    ]);

    const chatSessionsCount = Number(chatCountRes.rows[0]?.count || 0);
    const visitorsCount = Number(visitorRes.rows[0]?.count || 0);

    return {
      visitorsCount,
      chatSessionsCount,
      recentLeads: leadsRes.rows,
      recentGuestbook: guestbookRes.rows,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error("getDailyBriefingAutonomous error:", err);
    return {
      visitorsCount: 0,
      chatSessionsCount: 0,
      recentLeads: [],
      recentGuestbook: [],
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Audits case studies in PostgreSQL for missing images, snippets, or trees.
 */
export async function auditPortfolioAutonomous(): Promise<{
  totalProjects: number;
  completeCount: number;
  issues: Array<{ slug: string; title: string; missing: string[] }>;
}> {
  await assertAdmin();
  try {
    const projects = await getProjectsDb().catch(() => []);
    const issues: Array<{ slug: string; title: string; missing: string[] }> = [];

    for (const p of projects) {
      const missing: string[] = [];
      if (!p.preview_image) missing.push("Preview Image");
      if (!p.directory_tree) missing.push("Architecture Tree");
      if (!p.code_snippet || !p.code_snippet.code) missing.push("Code Snippet");
      if (!p.live_url) missing.push("Live URL");
      if (!p.github_url) missing.push("GitHub Repository URL");

      if (missing.length > 0) {
        issues.push({ slug: p.slug, title: p.title, missing });
      }
    }

    return {
      totalProjects: projects.length,
      completeCount: projects.length - issues.length,
      issues,
    };
  } catch (err) {
    console.error("auditPortfolioAutonomous error:", err);
    return {
      totalProjects: 0,
      completeCount: 0,
      issues: [],
    };
  }
}

/**
 * Updates About section bio, education or details autonomously in PostgreSQL.
 */
export async function updateAboutContentAutonomous(updates: {
  bioParagraphs?: string[];
  educationInstitution?: string;
  educationDegree?: string;
  educationPeriod?: string;
  educationLocation?: string;
}): Promise<{ success: boolean; message: string }> {
  await assertAdmin();
  try {
    const current = await getAboutContentDb();
    const currentEdu = Array.isArray(current?.education) ? [...current.education] : [];

    if (updates.educationInstitution || updates.educationDegree) {
      if (currentEdu.length > 0) {
        currentEdu[0] = {
          ...currentEdu[0],
          institution: updates.educationInstitution || currentEdu[0].institution,
          degree: updates.educationDegree || currentEdu[0].degree,
          period: updates.educationPeriod || currentEdu[0].period,
          location: updates.educationLocation || currentEdu[0].location,
        };
      } else {
        currentEdu.push({
          tag: "Undergraduate Degree",
          institution: updates.educationInstitution || "Southeast University",
          degree: updates.educationDegree || "Bachelor of Business Administration(BBA)",
          period: updates.educationPeriod || "2026-Present",
          location: updates.educationLocation || "Dhaka, Bangladesh",
        });
      }
    }

    const newBio = updates.bioParagraphs && updates.bioParagraphs.length > 0
      ? updates.bioParagraphs
      : current?.bio_paragraphs;

    await updateAboutContentDb({
      bio_paragraphs: newBio,
      education: currentEdu,
    });

    updateTag(PUBLIC_DATA_TAGS.about);
    revalidatePath("/about");
    revalidatePath("/control-room-internal/about");
    return { success: true, message: "About section content successfully updated in PostgreSQL." };
  } catch (err: any) {
    console.error("updateAboutContentAutonomous error:", err);
    return { success: false, message: `Failed to update about content: ${err?.message || "Unknown error"}` };
  }
}

/**
 * Updates an existing project's metadata in PostgreSQL without wiping other fields.
 */
export async function updateProjectAutonomous(
  slug: string,
  updates: {
    title?: string;
    tagline?: string;
    liveUrl?: string;
    githubUrl?: string;
    clientUrl?: string;
    serverUrl?: string;
    featured?: boolean;
    isFeatured?: boolean;
    featuredSortOrder?: number;
  }
): Promise<{ success: boolean; message: string }> {
  await assertAdmin();
  try {
    const projects = await getProjectsDb();
    const target = projects.find(
      (p) => p.slug.toLowerCase() === slug.toLowerCase() || p.id === slug
    );
    if (!target) {
      return { success: false, message: `Project with identifier "${slug}" not found in database.` };
    }

    const nextFeatured =
      updates.featured !== undefined
        ? Boolean(updates.featured)
        : updates.isFeatured !== undefined
          ? Boolean(updates.isFeatured)
          : target.featured;

    const nextFeaturedSortOrder =
      updates.featuredSortOrder !== undefined
        ? Number(updates.featuredSortOrder)
        : nextFeatured
          ? target.featured_sort_order || target.sort_order || 1
          : 0;

    await upsertProjectDb({
      ...target,
      title: updates.title !== undefined ? updates.title : target.title,
      slug: target.slug,
      tagline: updates.tagline !== undefined ? updates.tagline : target.tagline,
      live_url: updates.liveUrl !== undefined ? updates.liveUrl : target.live_url,
      github_url: updates.githubUrl !== undefined ? updates.githubUrl : target.github_url,
      client_url: updates.clientUrl !== undefined ? updates.clientUrl : target.client_url,
      server_url: updates.serverUrl !== undefined ? updates.serverUrl : target.server_url,
      featured: nextFeatured,
      featured_sort_order: nextFeaturedSortOrder,
    });

    updateTag(PUBLIC_DATA_TAGS.projects);
    revalidatePath("/projects");
    revalidatePath(`/projects/${target.slug}`);
    revalidatePath("/");
    revalidatePath("/control-room-internal/projects");
    return { success: true, message: `Project "${target.title}" successfully updated in PostgreSQL.` };
  } catch (err: any) {
    console.error("updateProjectAutonomous error:", err);
    return { success: false, message: `Failed to update project: ${err?.message || "Unknown error"}` };
  }
}

/**
 * Autonomously stars or unstars a project from featured case studies.
 */
export async function toggleProjectFeaturedAutonomous(
  slugOrId: string,
  featured?: boolean
): Promise<{ success: boolean; message: string }> {
  await assertAdmin();
  try {
    const projects = await getProjectsDb();
    const target = projects.find(
      (p) => p.slug.toLowerCase() === slugOrId.toLowerCase() || p.id === slugOrId
    );
    if (!target) {
      return { success: false, message: `Project with identifier "${slugOrId}" not found in database.` };
    }

    const nextFeatured = featured !== undefined ? Boolean(featured) : !target.featured;
    const nextFeaturedSortOrder = nextFeatured
      ? target.featured_sort_order || target.sort_order || 1
      : 0;

    await upsertProjectDb({
      ...target,
      featured: nextFeatured,
      featured_sort_order: nextFeaturedSortOrder,
    });

    updateTag(PUBLIC_DATA_TAGS.projects);
    revalidatePath("/projects");
    revalidatePath(`/projects/${target.slug}`);
    revalidatePath("/");
    revalidatePath("/control-room-internal/projects");
    return {
      success: true,
      message: `Project "${target.title}" is now ${nextFeatured ? "marked as featured" : "unstarred (regular project)"} in PostgreSQL.`,
    };
  } catch (err: any) {
    console.error("toggleProjectFeaturedAutonomous error:", err);
    return { success: false, message: `Failed to toggle project featured status: ${err?.message || "Unknown error"}` };
  }
}

/**
 * Autonomously deletes a project from PostgreSQL by slug or ID.
 */
export async function deleteProjectAutonomous(slugOrId: string): Promise<{ success: boolean; message: string }> {
  await assertAdmin();
  try {
    const deleted = await deleteProjectDb(slugOrId);
    if (deleted) {
      if (deleted.preview_image) {
        await deleteCloudinaryAsset(deleted.preview_image);
      }
      if (deleted.hover_image && deleted.hover_image !== deleted.preview_image) {
        await deleteCloudinaryAsset(deleted.hover_image);
      }

      updateTag(PUBLIC_DATA_TAGS.projects);
      revalidatePath("/projects");
      revalidatePath("/");
      revalidatePath("/control-room-internal/projects");
      return { success: true, message: `Project "${deleted.title}" was permanently deleted from PostgreSQL and Cloudinary.` };
    }
    return { success: false, message: `Project with identifier "${slugOrId}" not found in database.` };
  } catch (err: any) {
    console.error("deleteProjectAutonomous error:", err);
    return { success: false, message: `Failed to delete project: ${err?.message || "Unknown error"}` };
  }
}

/**
 * Autonomously creates a new project case study directly in PostgreSQL.
 */
export async function createProjectAutonomous(data: {
  title: string;
  tagline: string;
  category?: string;
  techStack?: string[];
  liveUrl?: string;
  githubUrl?: string;
  clientUrl?: string;
  serverUrl?: string;
  previewImage?: string;
  hoverImage?: string;
  whyIBuiltThis?: string;
  overview?: string;
  problem?: string;
  solution?: string;
  keyFeatures?: Array<{ title: string; description: string }>;
}): Promise<{ success: boolean; slug?: string; message: string }> {
  await assertAdmin();
  try {
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const existing = await getProjectsDb();
    const sortOrder = existing.length + 1;
    const projectId = `proj-${slug}-${Date.now().toString(36)}`;

    const preview = data.previewImage || "";
    const hover = data.hoverImage || preview || "";
    const clientUrl = data.clientUrl || data.githubUrl || "";
    const serverUrl = data.serverUrl || "";

    const keyFeatures = (data.keyFeatures && data.keyFeatures.length > 0)
      ? data.keyFeatures
      : [
          {
            title: "Core System Architecture",
            description: data.tagline,
          },
          {
            title: "Type Safety & Resilient Engineering",
            description: "Engineered with production-grade type safety, scalable data pipelines, and responsive UX.",
          },
        ];

    const dbRow: Partial<DbProjectRow> & { id: string; title: string; slug: string } = {
      id: projectId,
      title: data.title,
      slug,
      tagline: data.tagline,
      category: data.category || "Full Stack",
      year: new Date().getFullYear().toString(),
      role: "Lead Full-Stack Architect",
      target_audience: "Production Users & Engineering Leaders",
      why_i_built_this: data.whyIBuiltThis || data.tagline,
      overview: data.overview || data.tagline,
      problem: data.problem || "Architecting high-throughput, fault-tolerant web system.",
      solution: data.solution || "Engineered scalable modern Next.js and PostgreSQL architecture.",
      gradient: "linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(3,7,18,0.95) 100%)",
      accent_color: "#0ea5e9",
      preview_image: preview,
      hover_image: hover,
      live_url: data.liveUrl || "",
      github_url: clientUrl || serverUrl,
      client_url: clientUrl,
      server_url: serverUrl,
      tech_stack: data.techStack || ["Next.js", "TypeScript", "PostgreSQL"],
      architecture: {
        frontend: (data.techStack || []).filter(t => !["PostgreSQL", "MongoDB", "Redis", "Docker"].includes(t)),
        backend: (data.techStack || []).filter(t => ["Node.js", "Express", "FastAPI", "Go", "Kafka", "Redis"].includes(t)),
        database: (data.techStack || []).filter(t => ["PostgreSQL", "MongoDB", "Redis", "Prisma", "Drizzle"].includes(t)),
        infrastructure: ["Docker", "Vercel", "AWS"],
      },
      challenges: [],
      technical_decisions: [],
      key_features: keyFeatures,
      metrics: [
        { label: "Performance", value: "99 Lighthouse" },
        { label: "TTFB", value: "<50ms" },
      ],
      system_breakdown: [
        {
          layer: "Presentation & Edge Delivery",
          description: "Server-side rendering, streaming client components, and responsive mobile interfaces.",
          technologies: (data.techStack || []).slice(0, 3),
        },
        {
          layer: "Business Logic & State Services",
          description: "Type-safe server actions, authentication middleware, and domain logic validation.",
          technologies: (data.techStack || []).slice(2, 5),
        },
      ],
      what_i_learned: [
        "Architecting resilient systems requires strict contract validation at all boundary layers.",
        "Server Components dramatically reduce client-side bundle weight while preserving instant interactivity."
      ],
      featured: false,
      featured_sort_order: 0,
      sort_order: sortOrder,
    };

    await upsertProjectDb(dbRow);
    updateTag(PUBLIC_DATA_TAGS.projects);
    revalidatePath("/projects");
    revalidatePath(`/projects/${slug}`);
    revalidatePath("/");
    revalidatePath("/control-room-internal/projects");

    return {
      success: true,
      slug,
      message: `Project "${data.title}" successfully added to PostgreSQL!`,
    };
  } catch (err: any) {
    console.error("createProjectAutonomous error:", err);
    return { success: false, message: `Failed to create project: ${err?.message || "Unknown error"}` };
  }
}

/**
 * Executes a human-approved staged update into PostgreSQL.
 * Part of Option B (Two-step Human in the Loop approval).
 */
export async function applyStagedContentUpdate(
  actionType: string,
  payload: any
): Promise<{ success: boolean; message: string }> {
  await assertAdmin();
  try {
    if (actionType === "update_hero_bio") {
      const res = await updateHeroBioAutonomous(payload.bio, payload.roles);
      if (res.success) {
        return { success: true, message: "Hero bio and rotating titles successfully updated in PostgreSQL!" };
      }
      return { success: false, message: "Failed to update Hero section." };
    } else if (actionType === "update_about_content") {
      const res = await updateAboutContentAutonomous(payload);
      return res;
    } else if (actionType === "manage_skill") {
      const res = await manageSkillAutonomous(
        payload.action || "add",
        payload.skillName,
        payload.preferredCategory
      );
      return res;
    } else if (actionType === "update_project") {
      const res = await updateProjectAutonomous(payload.slug, payload);
      return res;
    } else if (actionType === "toggle_featured_project") {
      const res = await toggleProjectFeaturedAutonomous(payload.slug || payload.id, payload.featured);
      return res;
    } else if (actionType === "delete_project") {
      const res = await deleteProjectAutonomous(payload.slug);
      return res;
    }
    return { success: false, message: `Unrecognized action type: ${actionType}` };
  } catch (err: any) {
    console.error("applyStagedContentUpdate error:", err);
    return { success: false, message: `Error applying update: ${err?.message || "Unknown error"}` };
  }
}

export interface AruAdminPanelData {
  config: DbAiConfigRow | null;
  leads: Array<{
    id: string;
    name: string;
    email: string;
    company?: string;
    phone?: string;
    notes?: string;
    source: string;
    created_at: string;
  }>;
  chatLogs: Array<{
    id: string;
    visitor_id: string;
    message_count: number;
    messages: any[];
    last_interaction: string;
  }>;
  stats: {
    totalSessions: number;
    totalLeads: number;
    totalVisitors: number;
    activeToolsCount: number;
    recentInteractions24h: number;
  };
}

/**
 * Fetches all AI configuration, captured leads, chat logs, and real metrics for the Aru admin panel.
 * Automatically purges chat logs older than 7 days to keep database storage clean.
 */
export async function getAruAdminPanelData(): Promise<AruAdminPanelData> {
  await assertAdmin();
  await ensurePortfolioTables();

  // Auto-prune chat sessions older than 3 days and clear anonymous spam
  await executeSql(`DELETE FROM ai_chat_logs WHERE last_interaction < NOW() - INTERVAL '3 days' OR (visitor_id NOT LIKE '%@%' AND id != 'admin_session');`).catch(() => {});

  const [config, leadsRes, chatLogsRes, sessionCountRes, visitorCountRes, recent24hRes] = await Promise.all([
    getAiConfigDb(),
    executeSql<{
      id: string;
      name: string;
      email: string;
      company?: string;
      phone?: string;
      notes?: string;
      source: string;
      created_at: string;
    }>(`SELECT * FROM leads ORDER BY created_at DESC LIMIT 100;`).catch(() => ({ rows: [] })),
    executeSql<{
      id: string;
      visitor_id: string;
      message_count: number;
      messages: any;
      last_interaction: string;
    }>(
      `SELECT id, visitor_id, jsonb_array_length(COALESCE(messages, '[]'::jsonb)) as message_count, messages, last_interaction FROM ai_chat_logs ORDER BY last_interaction DESC LIMIT 50;`
    ).catch(() => ({ rows: [] })),
    executeSql<{ count: string }>(`SELECT COUNT(*) as count FROM ai_chat_logs;`).catch(() => ({
      rows: [{ count: "0" }],
    })),
    executeSql<{ count: string }>(`SELECT COUNT(DISTINCT visitor_id) as count FROM analytics_events;`).catch(
      () => ({ rows: [{ count: "0" }] })
    ),
    executeSql<{ count: string }>(
      `SELECT COUNT(*) as count FROM ai_chat_logs WHERE last_interaction > NOW() - INTERVAL '24 hours';`
    ).catch(() => ({ rows: [{ count: "0" }] })),
  ]);

  const adminTools = Array.isArray(config?.tools_config?.admin_tools) ? config.tools_config.admin_tools : [];
  const visitorTools = Array.isArray(config?.tools_config?.visitor_tools) ? config.tools_config.visitor_tools : [];

  return {
    config,
    leads: leadsRes.rows,
    chatLogs: chatLogsRes.rows,
    stats: {
      totalSessions: Number(sessionCountRes.rows[0]?.count || 0),
      totalLeads: leadsRes.rows.length,
      totalVisitors: Number(visitorCountRes.rows[0]?.count || 0),
      activeToolsCount: adminTools.length + visitorTools.length,
      recentInteractions24h: Number(recent24hRes.rows[0]?.count || 0),
    },
  };
}

/**
 * Saves AI prompts, knowledge base, or tool permissions into PostgreSQL.
 */
export async function saveAruConfig(updates: {
  visitor_prompt?: string;
  admin_prompt?: string;
  knowledge_base?: string;
  avatar_url?: string;
  tools_config?: {
    visitor_tools?: any[];
    admin_tools?: any[];
  };
}): Promise<{ success: boolean; config?: DbAiConfigRow | null; error?: string }> {
  await assertAdmin();
  try {
    const updated = await updateAiConfigDb(updates);
    revalidatePath("/control-room-internal/aru");
    return { success: true, config: updated };
  } catch (err: any) {
    console.error("saveAruConfig error:", err);
    return { success: false, error: err?.message || "Failed to save AI configuration" };
  }
}

/**
 * Deletes a chat session log from PostgreSQL.
 */
export async function deleteAruChatLog(id: string): Promise<{ success: boolean; error?: string }> {
  await assertAdmin();
  try {
    await executeSql(`DELETE FROM ai_chat_logs WHERE id = ${escapeSqlString(id)};`);
    revalidatePath("/control-room-internal/aru");
    return { success: true };
  } catch (err: any) {
    console.error("deleteAruChatLog error:", err);
    return { success: false, error: err?.message || "Failed to delete chat log" };
  }
}

/**
 * Deletes an identified lead from PostgreSQL.
 */
export async function deleteAruLead(id: string): Promise<{ success: boolean; error?: string }> {
  await assertAdmin();
  try {
    await executeSql(`DELETE FROM leads WHERE id = ${escapeSqlString(id)};`);
    revalidatePath("/control-room-internal/aru");
    return { success: true };
  } catch (err: any) {
    console.error("deleteAruLead error:", err);
    return { success: false, error: err?.message || "Failed to delete lead" };
  }
}

