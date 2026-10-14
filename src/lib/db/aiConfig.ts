import { executeSql, escapeSqlString, escapeSqlJson } from "@/lib/postgres";
import { ensurePortfolioTables } from "./schema";

export interface DbAiConfigRow {
  id: string;
  visitor_prompt: string;
  admin_prompt: string;
  knowledge_base?: string;
  tone_rules?: Record<string, unknown>;
  updated_at: string;
}

/**
 * Fetches the active AI persona and prompts dynamically from PostgreSQL.
 * Keeps all instructions and context 100% private in the database, away from git/codebase.
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
 * Updates or seeds the active AI persona in PostgreSQL.
 */
export async function updateAiConfigDb(
  data: Partial<Omit<DbAiConfigRow, "id" | "updated_at">>
): Promise<DbAiConfigRow | null> {
  try {
    await ensurePortfolioTables();
    const visitorPrompt = escapeSqlString(data.visitor_prompt || "");
    const adminPrompt = escapeSqlString(data.admin_prompt || "");
    const knowledgeBase = escapeSqlString(data.knowledge_base || "");
    const toneRules = escapeSqlJson(data.tone_rules || {});

    const res = await executeSql<DbAiConfigRow>(`
      INSERT INTO ai_system_config (id, visitor_prompt, admin_prompt, knowledge_base, tone_rules, updated_at)
      VALUES ('primary', ${visitorPrompt}, ${adminPrompt}, ${knowledgeBase}, ${toneRules}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        visitor_prompt = CASE WHEN ${visitorPrompt} != '' THEN ${visitorPrompt} ELSE ai_system_config.visitor_prompt END,
        admin_prompt = CASE WHEN ${adminPrompt} != '' THEN ${adminPrompt} ELSE ai_system_config.admin_prompt END,
        knowledge_base = CASE WHEN ${knowledgeBase} != '' THEN ${knowledgeBase} ELSE ai_system_config.knowledge_base END,
        tone_rules = ${toneRules},
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `);

    return res.rows[0] || null;
  } catch (error) {
    console.error("Error saving AI config to PostgreSQL:", error);
    return null;
  }
}
