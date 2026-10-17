"use server";

import { executeSql, escapeSqlString } from "@/lib/postgres";
import { ensurePortfolioTables } from "@/lib/db/schema";
import { assertAdmin } from "@/lib/admin";
import { LeadCapturePayload } from "@/types/ai";

export interface DbLeadRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  notes?: string;
  source: string;
  created_at: string;
}

/**
 * Saves a new lead safely into PostgreSQL.
 * Non-destructive insert only.
 */
export async function saveLead(data: LeadCapturePayload): Promise<{
  success: boolean;
  lead?: DbLeadRow;
  error?: string;
}> {
  try {
    await ensurePortfolioTables();
    const id = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const name = escapeSqlString(data.name || "");
    const email = escapeSqlString(data.email || "");
    const phone = escapeSqlString(data.phone || "");
    const company = escapeSqlString(data.company || "");
    const notes = escapeSqlString(data.notes || "");
    const source = escapeSqlString(data.source || "chatbot");

    const res = await executeSql<DbLeadRow>(`
      INSERT INTO leads (id, name, email, phone, company, notes, source)
      VALUES ('${id}', ${name}, ${email}, ${phone}, ${company}, ${notes}, ${source})
      RETURNING *;
    `);

    return { success: true, lead: res.rows[0] };
  } catch (error: any) {
    console.error("Save Lead Error:", error);
    return { success: false, error: "Unable to save inquiry at this time." };
  }
}

/**
 * Retrieves all leads for admin review.
 * Protected with assertAdmin.
 */
export async function getLeads(): Promise<DbLeadRow[]> {
  try {
    await assertAdmin();
    await ensurePortfolioTables();
    const res = await executeSql<DbLeadRow>(
      "SELECT * FROM leads ORDER BY created_at DESC;"
    );
    return res.rows;
  } catch (error) {
    console.error("Get Leads Error:", error);
    return [];
  }
}

/**
 * Deletes a specific lead by ID.
 * Protected with assertAdmin.
 */
export async function deleteLead(id: string): Promise<{ success: boolean }> {
  try {
    await assertAdmin();
    await ensurePortfolioTables();
    await executeSql(`DELETE FROM leads WHERE id = ${escapeSqlString(id)};`);
    return { success: true };
  } catch (error) {
    console.error("Delete Lead Error:", error);
    return { success: false };
  }
}
