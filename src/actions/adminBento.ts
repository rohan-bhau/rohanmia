"use server";

import { executeSql, escapeSqlString, escapeSqlJson } from "@/lib/postgres";
import { ensurePortfolioTables } from "@/lib/db/schema";
import { assertAdmin } from "@/lib/admin";
import { revalidatePath, updateTag } from "next/cache";
import { updateBentoContentDb } from "@/lib/db/content";
import { getCachedBentoContent, PUBLIC_DATA_TAGS } from "@/lib/publicData";

import { BentoCardsData } from "@/lib/constants/homepage";

const emptyBentoData: BentoCardsData = {
  badge: "",
  title_prefix: "",
  title_suffix: "",
  card1: { tag: "", headline: "", description: "", points: [] },
  card2: {
    tag: "",
    project_title: "",
    description: "",
    link_url: "",
    tech_stack: [],
  },
  card4: { tag: "", title: "", description: "", tools: [] },
  card5: { tag: "", location: "", description: "", timezone: "" },
};

/**
 * Fetch Bento Content from PostgreSQL
 */
export async function getBentoData(): Promise<BentoCardsData> {
  try {
    const row = await getCachedBentoContent();
    if (!row) {
      return emptyBentoData;
    }

    const cards =
      typeof row.cards === "object" && row.cards !== null ? row.cards : {};

    return {
      badge: row.badge || "",
      title_prefix: cards.title_prefix || "",
      title_suffix: cards.title_suffix || "",
      card1: cards.card1 || emptyBentoData.card1,
      card2: cards.card2 || emptyBentoData.card2,
      card4: cards.card4 || emptyBentoData.card4,
      card5: cards.card5 || emptyBentoData.card5,
    };
  } catch (error) {
    console.error("getBentoData error:", error);
    return emptyBentoData;
  }
}

/**
 * Save Bento Content to PostgreSQL
 */
export async function saveBentoData(data: Partial<BentoCardsData>) {
  try {
    await assertAdmin();
    await ensurePortfolioTables();

    // Strict read: throws on DB failure so we never merge into empty values
    const curRes = await executeSql<any>(
      `SELECT * FROM bento_content WHERE id = 'primary' LIMIT 1;`,
    );
    const curRow = curRes.rows[0] || {};
    const curCards =
      typeof curRow.cards === "object" && curRow.cards !== null
        ? curRow.cards
        : {};
    const current: BentoCardsData = {
      badge: curRow.badge || "",
      title_prefix: curCards.title_prefix || "",
      title_suffix: curCards.title_suffix || "",
      card1: curCards.card1 || emptyBentoData.card1,
      card2: curCards.card2 || emptyBentoData.card2,
      card4: curCards.card4 || emptyBentoData.card4,
      card5: curCards.card5 || emptyBentoData.card5,
    };
    const updated: BentoCardsData = {
      ...current,
      ...data,
      card1: { ...current.card1, ...(data.card1 || {}) },
      card2: { ...current.card2, ...(data.card2 || {}) },
      card4: { ...current.card4, ...(data.card4 || {}) },
      card5: { ...current.card5, ...(data.card5 || {}) },
    };

    await updateBentoContentDb({
      badge: updated.badge,
      title: `${updated.title_prefix} ${updated.title_suffix}`.trim(),
      cards: updated,
    });
    updateTag(PUBLIC_DATA_TAGS.bento);
    revalidatePath("/");
    revalidatePath("/control-room-internal");
    return { success: true, bento: updated };
  } catch (error: any) {
    console.error("saveBentoData error:", error);
    return {
      success: false,
      error: error.message || "Failed to save bento content",
    };
  }
}
