import { executeSql, escapeSqlString, escapeSqlJson } from "@/lib/postgres";
import { ensurePortfolioTables } from "./schema";

export interface DbAiConfigRow {
  id: string;
  visitor_prompt: string;
  admin_prompt: string;
  github_synth_prompt?: string;
  skill_classifier_prompt?: string;
  knowledge_base?: string;
  avatar_url?: string;
  tone_rules?: Record<string, unknown>;
  tools_config?: {
    visitor_tools?: any[];
    admin_tools?: any[];
  };
  updated_at: string;
}

/**
 * Fetches the active AI configuration and prompts from PostgreSQL.
 */
export async function getAiConfigDb(): Promise<DbAiConfigRow | null> {
  try {
    await ensurePortfolioTables();
    const res = await executeSql<DbAiConfigRow>(
      `SELECT * FROM ai_system_config WHERE id = 'primary' LIMIT 1;`
    );
    if (res.rows.length > 0) {
      return res.rows[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching AI config from PostgreSQL:", error);
    return null;
  }
}

/**
 * Fetches tool declarations dynamically from PostgreSQL.
 * Keeps all function definitions and descriptions 100% in database.
 */
export async function getAiToolsDb(mode: "visitor" | "admin"): Promise<any[]> {
  const config = await getAiConfigDb();
  if (!config || !config.tools_config) return [];

  const visitorTools = Array.isArray(config.tools_config.visitor_tools)
    ? config.tools_config.visitor_tools
    : [];
  const adminTools = Array.isArray(config.tools_config.admin_tools)
    ? config.tools_config.admin_tools
    : [];

  return mode === "admin" ? [...visitorTools, ...adminTools] : visitorTools;
}

/**
 * Fetches a specific prompt template by key from PostgreSQL.
 */
export async function getPromptTemplateDb(
  key: "visitor" | "admin" | "github_synth" | "skill_classifier"
): Promise<string> {
  const config = await getAiConfigDb();
  if (!config) return "";

  switch (key) {
    case "visitor":
      return config.visitor_prompt || "";
    case "admin":
      return config.admin_prompt || "";
    case "github_synth":
      return config.github_synth_prompt || "";
    case "skill_classifier":
      return config.skill_classifier_prompt || "";
    default:
      return "";
  }
}

/**
 * Updates or seeds the AI configuration, prompt templates, and tools in PostgreSQL.
 */
export async function updateAiConfigDb(
  data: Partial<Omit<DbAiConfigRow, "id" | "updated_at">>
): Promise<DbAiConfigRow | null> {
  try {
    await ensurePortfolioTables();
    const visitorPrompt = escapeSqlString(data.visitor_prompt || "");
    const adminPrompt = escapeSqlString(data.admin_prompt || "");
    const githubSynthPrompt = escapeSqlString(data.github_synth_prompt || "");
    const skillClassifierPrompt = escapeSqlString(data.skill_classifier_prompt || "");
    const knowledgeBase = escapeSqlString(data.knowledge_base || "");
    const avatarUrl = escapeSqlString(data.avatar_url || "");
    const toneRules = escapeSqlJson(data.tone_rules || {});
    const toolsConfig = escapeSqlJson(data.tools_config || {});

    const res = await executeSql<DbAiConfigRow>(`
      INSERT INTO ai_system_config (
        id, visitor_prompt, admin_prompt, github_synth_prompt, skill_classifier_prompt,
        knowledge_base, avatar_url, tone_rules, tools_config, updated_at
      )
      VALUES (
        'primary', ${visitorPrompt}, ${adminPrompt}, ${githubSynthPrompt}, ${skillClassifierPrompt},
        ${knowledgeBase}, ${avatarUrl}, ${toneRules}, ${toolsConfig}, CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        visitor_prompt = CASE WHEN ${visitorPrompt} != '' THEN ${visitorPrompt} ELSE ai_system_config.visitor_prompt END,
        admin_prompt = CASE WHEN ${adminPrompt} != '' THEN ${adminPrompt} ELSE ai_system_config.admin_prompt END,
        github_synth_prompt = CASE WHEN ${githubSynthPrompt} != '' THEN ${githubSynthPrompt} ELSE ai_system_config.github_synth_prompt END,
        skill_classifier_prompt = CASE WHEN ${skillClassifierPrompt} != '' THEN ${skillClassifierPrompt} ELSE ai_system_config.skill_classifier_prompt END,
        knowledge_base = CASE WHEN ${knowledgeBase} != '' THEN ${knowledgeBase} ELSE ai_system_config.knowledge_base END,
        avatar_url = CASE WHEN ${avatarUrl} != '' THEN ${avatarUrl} ELSE ai_system_config.avatar_url END,
        tone_rules = ${toneRules},
        tools_config = CASE WHEN ${toolsConfig}::text != '{}'::text THEN ${toolsConfig} ELSE ai_system_config.tools_config END,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `);

    return res.rows[0] || null;
  } catch (error) {
    console.error("Error saving AI config to PostgreSQL:", error);
    return null;
  }
}
