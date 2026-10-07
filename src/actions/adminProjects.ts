"use server";

import { assertAdmin } from "@/lib/admin";
import {
  getProjectsDb,
  upsertProjectDb,
  deleteProjectDb,
  DbProjectRow,
  DbFeaturedCaseStudyRow,
  getFeaturedCaseStudiesDb,
  upsertFeaturedCaseStudyDb,
  deleteFeaturedCaseStudyDb,
  updateFeaturedCaseStudiesOrderDb,
  updateProjectsOrderDb,
} from "@/lib/db/projects";
import { revalidatePath, updateTag } from "next/cache";
import { getCachedFeaturedProjects, PUBLIC_DATA_TAGS } from "@/lib/publicData";

/**
 * Public & Admin Server Action to fetch featured case studies directly from PostgreSQL
 */
export async function getFeaturedProjects(): Promise<any[]> {
  try {
    return await getCachedFeaturedProjects();
  } catch (error) {
    console.error("getFeaturedProjects error:", error);
    return [];
  }
}

export async function fetchAdminProjects(): Promise<{
  success: boolean;
  projects?: DbProjectRow[];
  error?: string;
}> {
  try {
    await assertAdmin();
    const projects = await getProjectsDb();
    return { success: true, projects };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchAdminFeaturedCaseStudies(): Promise<{
  success: boolean;
  caseStudies?: DbFeaturedCaseStudyRow[];
  error?: string;
}> {
  try {
    await assertAdmin();
    const caseStudies = await getFeaturedCaseStudiesDb();
    return { success: true, caseStudies };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveAdminFeaturedCaseStudy(
  data: Partial<DbFeaturedCaseStudyRow> & {
    id?: string;
    title: string;
    tagline: string;
    overview: string;
  },
): Promise<{
  success: boolean;
  caseStudy?: DbFeaturedCaseStudyRow;
  error?: string;
}> {
  try {
    await assertAdmin();

    const title = data.title.trim();
    if (!title) {
      return { success: false, error: "Title is required." };
    }

    const id = data.id || `fcs_${Date.now()}`;
    const slug =
      data.slug?.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const saved = await upsertFeaturedCaseStudyDb({
      ...data,
      id,
      slug,
      title,
      tagline: data.tagline.trim(),
      overview: data.overview.trim(),
      category: data.category || "Full Stack",
      year: data.year || "2026",
      preview_image: data.preview_image || "",
      hover_image: data.hover_image || "",
      gradient:
        data.gradient || "linear-gradient(135deg, #182848 0%, #4b6cb7 100%)",
      accent_color: data.accent_color || "#6366f1",
      key_features: data.key_features || [],
      tech_stack: data.tech_stack || [],
      live_url: data.live_url || "",
      github_url: data.github_url || "",
      client_url: data.client_url || "",
      server_url: data.server_url || "",
      sort_order: data.sort_order !== undefined ? Number(data.sort_order) : 0,
    });

    revalidatePath("/projects");
    revalidatePath("/");
    updateTag(PUBLIC_DATA_TAGS.projects);
    return { success: true, caseStudy: saved };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function removeAdminFeaturedCaseStudy(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    const deleted = await deleteFeaturedCaseStudyDb(id);
    if (!deleted) {
      return { success: false, error: "Failed to delete featured case study." };
    }

    revalidatePath("/projects");
    revalidatePath("/");
    updateTag(PUBLIC_DATA_TAGS.projects);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function reorderAdminFeaturedCaseStudies(
  orderedIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    await updateFeaturedCaseStudiesOrderDb(orderedIds);
    revalidatePath("/");
    revalidatePath("/projects");
    updateTag(PUBLIC_DATA_TAGS.projects);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function reorderAdminProjects(
  orderedIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    await updateProjectsOrderDb(orderedIds);
    updateTag(PUBLIC_DATA_TAGS.projects);
    revalidatePath("/projects");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveAdminProject(
  projectData: Partial<DbProjectRow> & {
    id?: string;
    title: string;
    category: string;
  },
): Promise<{ success: boolean; project?: DbProjectRow; error?: string }> {
  try {
    await assertAdmin();

    const title = projectData.title.trim();
    if (!title) {
      return { success: false, error: "Project title is required." };
    }

    const slug =
      projectData.slug?.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const id = projectData.id || `proj_${Date.now()}`;

    let existingProject: DbProjectRow | undefined;
    if (projectData.id) {
      const allProjects = await getProjectsDb();
      existingProject = allProjects.find((p) => p.id === projectData.id);
    }

    const saved = await upsertProjectDb({
      ...(existingProject || {}),
      ...projectData,
      id,
      slug: projectData.slug?.trim() || existingProject?.slug || slug,
      title,
      category:
        projectData.category || existingProject?.category || "Full Stack",
      tagline: projectData.tagline ?? existingProject?.tagline ?? "",
      overview: projectData.overview ?? existingProject?.overview ?? "",
      preview_image:
        projectData.preview_image || existingProject?.preview_image || "",
      live_url: projectData.live_url ?? existingProject?.live_url ?? "",
      github_url: projectData.github_url ?? existingProject?.github_url ?? "",
      tech_stack: projectData.tech_stack || existingProject?.tech_stack || [],
      featured:
        projectData.featured !== undefined
          ? Boolean(projectData.featured)
          : Boolean(existingProject?.featured),
      sort_order:
        projectData.sort_order !== undefined
          ? Number(projectData.sort_order)
          : (existingProject?.sort_order ?? 0),
    });

    revalidatePath("/projects");
    revalidatePath("/");
    updateTag(PUBLIC_DATA_TAGS.projects);
    return { success: true, project: saved };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleFeaturedProject(
  id: string,
  currentFeatured: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    const projects = await getProjectsDb();
    const target = projects.find((p) => p.id === id);
    if (!target) return { success: false, error: "Project not found" };

    await upsertProjectDb({
      ...target,
      featured: !currentFeatured,
    });

    revalidatePath("/projects");
    revalidatePath("/");
    updateTag(PUBLIC_DATA_TAGS.projects);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function removeAdminProject(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    const deleted = await deleteProjectDb(id);
    if (!deleted) {
      return { success: false, error: "Failed to delete project." };
    }

    revalidatePath("/projects");
    revalidatePath("/");
    updateTag(PUBLIC_DATA_TAGS.projects);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
