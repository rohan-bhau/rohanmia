import { GoogleGenerativeAI } from "@google/generative-ai";
import { getTechStackDb, upsertTechItemDb, deleteTechItemDb } from "@/lib/db/stack";
import { AutonomousSkillPayload } from "@/types/ai";
import { getPromptTemplateDb } from "@/lib/db/aiConfig";

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
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });

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

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text()) as AutonomousSkillPayload;

    // Validate that category_id exists
    let matchedCat = categories.find((c) => c.id === parsed.category_id);
    if (!matchedCat) {
      matchedCat = categories[0];
      parsed.category_id = matchedCat.id;
      parsed.category_name = matchedCat.title;
    } else {
      parsed.category_name = matchedCat.title;
    }

    const skillId = `tech-${parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;

    // Insert into PostgreSQL
    await upsertTechItemDb({
      id: skillId,
      category_id: parsed.category_id,
      category_name: parsed.category_name,
      name: parsed.name,
      version: parsed.version || "",
      description: parsed.description,
      proficiency: parsed.proficiency || 90,
      is_core: Boolean(parsed.is_core),
      use_case: parsed.use_case,
      docs_url: parsed.docs_url,
      brand_color: parsed.brand_color,
      sort_order: (matchedCat.items?.length || 0) + 1,
    });

    return {
      success: true,
      skill: parsed,
      message: `Skill ${parsed.name} successfully classified under ${parsed.category_name} and saved to database.`,
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
