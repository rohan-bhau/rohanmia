"use server";

import { assertAdmin } from "@/lib/admin";
import { executeSql, escapeSqlString } from "@/lib/postgres";
import {
  getTechStackDb,
  upsertTechItemDb,
  deleteTechItemDb,
  upsertTechCategoryDb,
  deleteTechCategoryDb,
  updateTechCategoriesOrderDb,
  updateTechItemsOrderDb,
  DbTechCategoryRow,
  DbTechItemRow,
} from "@/lib/db/stack";
import { revalidatePath, updateTag } from "next/cache";
import { PUBLIC_DATA_TAGS } from "@/lib/publicData";

const invalidatePublicTechStack = () => updateTag(PUBLIC_DATA_TAGS.stack);

export async function fetchAdminStack(): Promise<{
  success: boolean;
  categories?: DbTechCategoryRow[];
  error?: string;
}> {
  try {
    await assertAdmin();
    const categories = await getTechStackDb();
    return { success: true, categories };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createAdminTechCategory(categoryData: {
  id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  philosophy?: string;
  badge?: string;
}): Promise<{
  success: boolean;
  category?: DbTechCategoryRow;
  error?: string;
}> {
  try {
    await assertAdmin();

    const title = categoryData.title.trim();
    if (!title) {
      return { success: false, error: "Category title is required." };
    }

    const existingCats = await getTechStackDb();
    const nextNumber = String(existingCats.length + 1).padStart(2, "0");
    const id = categoryData.id || `cat-${Date.now()}`;

    const saved = await upsertTechCategoryDb({
      id,
      number: nextNumber,
      title,
      subtitle: categoryData.subtitle?.trim() || "",
      description: categoryData.description?.trim() || "",
      philosophy: categoryData.philosophy?.trim() || "",
      badge: categoryData.badge?.trim() || "",
      sort_order: existingCats.length + 1,
    });

    invalidatePublicTechStack();
    revalidatePath("/tech-stack");
    revalidatePath("/stack");
    return { success: true, category: saved };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateAdminTechCategory(categoryData: {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  philosophy?: string;
  badge?: string;
  sort_order?: number;
}): Promise<{
  success: boolean;
  category?: DbTechCategoryRow;
  error?: string;
}> {
  try {
    await assertAdmin();

    const title = categoryData.title.trim();
    if (!title) {
      return { success: false, error: "Category title is required." };
    }

    const saved = await upsertTechCategoryDb({
      id: categoryData.id,
      title,
      subtitle: categoryData.subtitle?.trim() || "",
      description: categoryData.description?.trim() || "",
      philosophy: categoryData.philosophy?.trim() || "",
      badge: categoryData.badge?.trim() || "",
      sort_order: categoryData.sort_order ?? 0,
    });

    invalidatePublicTechStack();
    revalidatePath("/tech-stack");
    revalidatePath("/stack");
    return { success: true, category: saved };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function removeAdminTechCategory(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    const deleted = await deleteTechCategoryDb(id);
    if (!deleted) {
      return { success: false, error: "Failed to delete tech category." };
    }

    invalidatePublicTechStack();
    revalidatePath("/tech-stack");
    revalidatePath("/stack");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function reorderAdminTechCategories(
  orderedIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    await updateTechCategoriesOrderDb(orderedIds);
    invalidatePublicTechStack();
    revalidatePath("/tech-stack");
    revalidatePath("/stack");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveAdminTechItem(
  data: Partial<DbTechItemRow> & { name: string; category_id: string },
): Promise<{ success: boolean; item?: DbTechItemRow; error?: string }> {
  try {
    await assertAdmin();

    const name = data.name.trim();
    if (!name) {
      return { success: false, error: "Tech name is required." };
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

    const categoryName =
      data.category_name ||
      existingItem?.category_name ||
      (data.category_id === "frontend"
        ? "Frontend Architecture"
        : data.category_id === "backend"
          ? "Backend & Distributed Systems"
          : data.category_id === "database"
            ? "Database & State Machines"
            : "Infrastructure & DevOps");

    let iconSlug = data.icon_slug || existingItem?.icon_slug;
    let brandColor = data.brand_color || existingItem?.brand_color;

    // Check PostgreSQL tech_catalog for official brand color and icon_slug
    const catCheck = await executeSql<{
      slug: string;
      name: string;
      icon_slug: string;
      brand_color: string;
      category_name: string;
    }>(
      `SELECT slug, name, icon_slug, brand_color, category_name FROM tech_catalog WHERE LOWER(name) = ${escapeSqlString(name.toLowerCase())} LIMIT 1;`
    );

    if (catCheck.rows.length > 0) {
      const match = catCheck.rows[0];
      if (!iconSlug) iconSlug = match.icon_slug;
      if (!brandColor || brandColor === "#38bdf8") brandColor = match.brand_color;
    } else {
      // If not in catalog, auto-register into PostgreSQL tech_catalog so it is permanently available for suggestions
      const generatedSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const finalIconSlug = iconSlug || generatedSlug;
      const finalBrandColor = brandColor || "#38bdf8";
      await executeSql(`
        INSERT INTO tech_catalog (slug, name, category_name, brand_color, icon_slug)
        VALUES (
          ${escapeSqlString(generatedSlug)},
          ${escapeSqlString(name)},
          ${escapeSqlString(categoryName)},
          ${escapeSqlString(finalBrandColor)},
          ${escapeSqlString(finalIconSlug)}
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          category_name = EXCLUDED.category_name,
          brand_color = EXCLUDED.brand_color,
          icon_slug = EXCLUDED.icon_slug;
      `);
      if (!iconSlug) iconSlug = finalIconSlug;
    }

    const saved = await upsertTechItemDb({
      ...(existingItem || {}),
      id,
      category_id: data.category_id || existingItem?.category_id || "frontend",
      category_name: categoryName,
      name,
      version: data.version ?? existingItem?.version ?? "",
      description: data.description ?? existingItem?.description ?? "",
      proficiency:
        data.proficiency !== undefined
          ? Number(data.proficiency)
          : (existingItem?.proficiency ?? 90),
      is_core:
        data.is_core !== undefined
          ? Boolean(data.is_core)
          : Boolean(existingItem?.is_core),
      use_case: data.use_case ?? existingItem?.use_case ?? "",
      production_project:
        data.production_project ?? existingItem?.production_project ?? "",
      docs_url: data.docs_url ?? existingItem?.docs_url ?? "",
      brand_color: brandColor || "#38bdf8",
      icon_slug: iconSlug || "",
      sort_order:
        data.sort_order !== undefined
          ? Number(data.sort_order)
          : (existingItem?.sort_order ?? 0),
    });

    invalidatePublicTechStack();
    revalidatePath("/tech-stack");
    revalidatePath("/stack");
    revalidatePath("/");
    return { success: true, item: saved };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function removeAdminTechItem(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    const deleted = await deleteTechItemDb(id);
    if (!deleted) {
      return { success: false, error: "Failed to delete tech item." };
    }

    invalidatePublicTechStack();
    revalidatePath("/tech-stack");
    revalidatePath("/stack");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function reorderAdminTechItems(
  orderedIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    await updateTechItemsOrderDb(orderedIds);
    invalidatePublicTechStack();
    revalidatePath("/tech-stack");
    revalidatePath("/stack");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export interface TechSuggestion {
  name: string;
  brand_color?: string;
  category_name?: string;
  icon_slug?: string;
}

/**
 * Fetch all available tech items from PostgreSQL database (tech_items and tech_catalog) for autocomplete
 */
export async function getAvailableTechSuggestions(): Promise<TechSuggestion[]> {
  try {
    const [itemsRes, catalogRes] = await Promise.all([
      executeSql<TechSuggestion>(
        `SELECT DISTINCT name, brand_color, category_name, icon_slug FROM tech_items ORDER BY name ASC;`
      ),
      executeSql<TechSuggestion>(
        `SELECT name, brand_color, category_name, icon_slug FROM tech_catalog ORDER BY name ASC;`
      ),
    ]);

    const seen = new Set<string>();
    const combined: TechSuggestion[] = [];

    // Prioritize active tech_items
    for (const item of itemsRes.rows || []) {
      const key = item.name.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(item);
      }
    }

    // Merge comprehensive tech_catalog from PostgreSQL
    for (const cat of catalogRes.rows || []) {
      const key = cat.name.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(cat);
      }
    }

    return combined.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("getAvailableTechSuggestions error:", error);
    return [];
  }
}
