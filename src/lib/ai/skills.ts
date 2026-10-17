import { GoogleGenerativeAI } from "@google/generative-ai";
import { getTechStackDb, upsertTechItemDb, deleteTechItemDb } from "@/lib/db/stack";
import { AutonomousSkillPayload } from "@/types/ai";
import { getPromptTemplateDb } from "@/lib/db/aiConfig";
import { executeSql, escapeSqlString } from "@/lib/postgres";

/**
 * Autonomously classifies a skill name into an existing category,
 * generates missing column values (brand color, description, docsUrl, use case),
 * and commits it into PostgreSQL.
 */
export async function autonomouslyAddSkill(
  skillName: string,
  preferredCategory?: string
): Promise<{ success: boolean; skill?: AutonomousSkillPayload; message: string }> {
  try {
    const categories = await getTechStackDb();
    if (!categories || categories.length === 0) {
      return { success: false, message: "No tech categories found in database." };
    }

    const categoryListStr = categories
      .map((c) => `- ID: "${c.id}" | Title: "${c.title}"`)
      .join("\n");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const template = await getPromptTemplateDb("skill_classifier");
    if (!template) {
      throw new Error("Skill classifier prompt template is not configured in PostgreSQL database.");
    }

    const prompt = template
      .replace(/{{SKILL_NAME}}/g, skillName)
      .replace(
        /{{SUGGESTED_CATEGORY}}/g,
        preferredCategory ? `The developer suggested category: "${preferredCategory}".` : ""
      )
      .replace(/{{CATEGORIES_LIST}}/g, categoryListStr);

    let parsed: AutonomousSkillPayload | null = null;
    let lastErr: any = null;

    const CASCADE_MODELS = [
      "gemini-3.8-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest",
      "gemini-flash-lite-latest",
    ];

    for (const mName of CASCADE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: mName,
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        });
        const result = await model.generateContent(prompt);
        parsed = JSON.parse(result.response.text()) as AutonomousSkillPayload;
        if (parsed) break;
      } catch (err) {
        lastErr = err;
      }
    }

    if (!parsed) {
      throw lastErr || new Error("Failed to classify skill across all models");
    }

    // Validate that category_id exists
    let matchedCat = categories.find((c) => c.id === parsed.category_id);
    if (!matchedCat) {
      matchedCat = categories[0];
      parsed.category_id = matchedCat.id;
      parsed.category_name = matchedCat.title;
    } else {
      parsed.category_name = matchedCat.title;
    }

    const userCleanName = skillName.trim();
    const finalName = userCleanName.length > 0
      ? (userCleanName.charAt(0).toUpperCase() + userCleanName.slice(1))
      : parsed.name;

    // Check if skill already exists in any category to update instead of duplicating
    let existingItemId: string | null = null;
    let existingSortOrder = (matchedCat.items?.length || 0) + 1;
    for (const cat of categories) {
      const match = (cat.items || []).find(
        (it) => it.name.toLowerCase().trim() === finalName.toLowerCase().trim()
      );
      if (match) {
        existingItemId = match.id;
        existingSortOrder = match.sort_order;
        break;
      }
    }

    const skillId = existingItemId || `tech-${finalName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;

    // Look up in PostgreSQL tech_catalog
    const catCheck = await executeSql<{
      slug: string;
      name: string;
      icon_slug: string;
      brand_color: string;
      category_name: string;
    }>(
      `SELECT slug, name, icon_slug, brand_color, category_name FROM tech_catalog WHERE LOWER(name) = ${escapeSqlString(finalName.toLowerCase())} LIMIT 1;`
    );

    let iconSlug = "";
    let finalBrandColor = parsed.brand_color;

    if (catCheck.rows.length > 0) {
      const match = catCheck.rows[0];
      iconSlug = match.icon_slug;
      if (match.brand_color) {
        finalBrandColor = match.brand_color;
      }
    } else {
      // If not in tech_catalog, auto-register it into PostgreSQL tech_catalog
      const generatedSlug = finalName.toLowerCase().replace(/[^a-z0-9]/g, "");
      iconSlug = generatedSlug;
      await executeSql(`
        INSERT INTO tech_catalog (slug, name, category_name, brand_color, icon_slug)
        VALUES (
          ${escapeSqlString(generatedSlug)},
          ${escapeSqlString(finalName)},
          ${escapeSqlString(parsed.category_name)},
          ${escapeSqlString(finalBrandColor || "#38bdf8")},
          ${escapeSqlString(iconSlug)}
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          category_name = EXCLUDED.category_name,
          brand_color = EXCLUDED.brand_color,
          icon_slug = EXCLUDED.icon_slug;
      `);
    }

    // Insert into PostgreSQL
    await upsertTechItemDb({
      id: skillId,
      category_id: parsed.category_id,
      category_name: parsed.category_name,
      name: finalName,
      version: parsed.version || "",
      description: parsed.description,
      proficiency: parsed.proficiency || 90,
      is_core: Boolean(parsed.is_core),
      use_case: parsed.use_case,
      docs_url: parsed.docs_url,
      brand_color: finalBrandColor,
      icon_slug: iconSlug,
      sort_order: existingSortOrder,
    });

    return {
      success: true,
      skill: { ...parsed, brand_color: finalBrandColor },
      message: `Skill ${finalName} successfully classified under ${parsed.category_name} with official brand logo (${iconSlug}) and saved to database.`,
    };
  } catch (error: any) {
    console.error("autonomouslyAddSkill error:", error);
    return {
      success: false,
      message: `Failed to autonomously add skill: ${error?.message || "Unknown error"}`,
    };
  }
}

/**
 * Autonomously removes a skill by matching its name in the database.
 */
export async function autonomouslyDeleteSkill(
  skillName: string
): Promise<{ success: boolean; message: string }> {
  try {
    const categories = await getTechStackDb();
    let targetItemId: string | null = null;
    let targetItemName = skillName;

    for (const cat of categories) {
      const match = (cat.items || []).find(
        (it) => it.name.toLowerCase() === skillName.toLowerCase() ||
                it.name.toLowerCase().includes(skillName.toLowerCase())
      );
      if (match) {
        targetItemId = match.id;
        targetItemName = match.name;
        break;
      }
    }

    if (!targetItemId) {
      return {
        success: false,
        message: `Could not find skill matching "${skillName}" in database.`,
      };
    }

    await deleteTechItemDb(targetItemId);
    return {
      success: true,
      message: `Skill "${targetItemName}" was successfully removed from the database.`,
    };
  } catch (error: any) {
    console.error("autonomouslyDeleteSkill error:", error);
    return {
      success: false,
      message: `Failed to remove skill: ${error?.message || "Unknown error"}`,
    };
  }
}
