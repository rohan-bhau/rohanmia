'use server';

import { assertAdmin } from '@/lib/admin';
import { executeSql } from '@/lib/postgres';
import { getTechStackDb, upsertTechItemDb, deleteTechItemDb, DbTechCategoryRow, DbTechItemRow } from '@/lib/db/stack';
import { revalidatePath } from 'next/cache';

export async function fetchAdminStack(): Promise<{ success: boolean; categories?: DbTechCategoryRow[]; error?: string }> {
  try {
    await assertAdmin();
    const categories = await getTechStackDb();
    return { success: true, categories };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveAdminTechItem(data: Partial<DbTechItemRow> & { name: string; category_id: string }): Promise<{ success: boolean; item?: DbTechItemRow; error?: string }> {
  try {
    await assertAdmin();

    const name = data.name.trim();
    if (!name) {
      return { success: false, error: 'Tech name is required.' };
    }

    const id = data.id || `tech_${Date.now()}`;
    let existingItem: DbTechItemRow | undefined;
    if (data.id) {
      const cats = await getTechStackDb();
      for (const c of cats) {
        const found = c.items?.find((i) => i.id === data.id);
        if (found) {
          existingItem = found;
          break;
        }
      }
    }

    const categoryName = data.category_name || existingItem?.category_name || (
      data.category_id === 'frontend' ? 'Frontend Architecture' :
      data.category_id === 'backend' ? 'Backend & Distributed Systems' :
      data.category_id === 'database' ? 'Database & State Machines' :
      'Infrastructure & DevOps'
    );

    const saved = await upsertTechItemDb({
      ...(existingItem || {}),
      id,
      category_id: data.category_id || existingItem?.category_id || 'frontend',
      category_name: categoryName,
      name,
      version: data.version ?? existingItem?.version ?? '',
      description: data.description ?? existingItem?.description ?? '',
      proficiency: data.proficiency !== undefined ? Number(data.proficiency) : (existingItem?.proficiency ?? 90),
      is_core: data.is_core !== undefined ? Boolean(data.is_core) : Boolean(existingItem?.is_core),
      use_case: data.use_case ?? existingItem?.use_case ?? '',
      production_project: data.production_project ?? existingItem?.production_project ?? '',
      docs_url: data.docs_url ?? existingItem?.docs_url ?? '',
      brand_color: data.brand_color || existingItem?.brand_color || '#38bdf8',
      sort_order: data.sort_order !== undefined ? Number(data.sort_order) : (existingItem?.sort_order ?? 0),
    });

    revalidatePath('/tech-stack');
    revalidatePath('/stack');
    revalidatePath('/');
    return { success: true, item: saved };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function removeAdminTechItem(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    const deleted = await deleteTechItemDb(id);
    if (!deleted) {
      return { success: false, error: 'Failed to delete tech item.' };
    }

    revalidatePath('/tech-stack');
    revalidatePath('/stack');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export interface TechSuggestion {
  name: string;
  brand_color?: string;
  category_name?: string;
}

/**
 * Fetch all available tech items from PostgreSQL database for autocomplete
 */
export async function getAvailableTechSuggestions(): Promise<TechSuggestion[]> {
  try {
    const res = await executeSql<TechSuggestion>(
      `SELECT DISTINCT name, brand_color, category_name FROM tech_items ORDER BY name ASC;`
    );
    return res.rows;
  } catch (error) {
    console.error('getAvailableTechSuggestions error:', error);
    return [];
  }
}

