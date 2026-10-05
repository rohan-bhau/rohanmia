'use server';

import { assertAdmin } from '@/lib/admin';
import { getProjectsDb, getFeaturedProjectsDb, upsertProjectDb, deleteProjectDb, DbProjectRow } from '@/lib/db/projects';
import { revalidatePath } from 'next/cache';

/**
 * Public & Admin Server Action to fetch featured case studies directly from PostgreSQL
 */
export async function getFeaturedProjects(): Promise<any[]> {
  try {
    return await getFeaturedProjectsDb();
  } catch (error) {
    console.error('getFeaturedProjects error:', error);
    return [];
  }
}


export async function fetchAdminProjects(): Promise<{ success: boolean; projects?: DbProjectRow[]; error?: string }> {
  try {
    await assertAdmin();
    const projects = await getProjectsDb();
    return { success: true, projects };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveAdminProject(projectData: Partial<DbProjectRow> & { id?: string; title: string; category: string }): Promise<{ success: boolean; project?: DbProjectRow; error?: string }> {
  try {
    await assertAdmin();

    const title = projectData.title.trim();
    if (!title) {
      return { success: false, error: 'Project title is required.' };
    }

    const slug = projectData.slug?.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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
      category: projectData.category || existingProject?.category || 'Full Stack',
      tagline: projectData.tagline ?? existingProject?.tagline ?? '',
      overview: projectData.overview ?? existingProject?.overview ?? '',
      preview_image: projectData.preview_image || existingProject?.preview_image || 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=1000',
      live_url: projectData.live_url ?? existingProject?.live_url ?? '',
      github_url: projectData.github_url ?? existingProject?.github_url ?? '',
      tech_stack: projectData.tech_stack || existingProject?.tech_stack || [],
      featured: projectData.featured !== undefined ? Boolean(projectData.featured) : Boolean(existingProject?.featured),
      sort_order: projectData.sort_order !== undefined ? Number(projectData.sort_order) : (existingProject?.sort_order ?? 0),
    });

    revalidatePath('/projects');
    revalidatePath('/');
    return { success: true, project: saved };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleFeaturedProject(id: string, currentFeatured: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    const projects = await getProjectsDb();
    const target = projects.find(p => p.id === id);
    if (!target) return { success: false, error: 'Project not found' };

    await upsertProjectDb({
      ...target,
      featured: !currentFeatured,
    });

    revalidatePath('/projects');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function removeAdminProject(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    const deleted = await deleteProjectDb(id);
    if (!deleted) {
      return { success: false, error: 'Failed to delete project.' };
    }

    revalidatePath('/projects');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
