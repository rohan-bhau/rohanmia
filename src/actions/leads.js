'use server';

import { executeSql, escapeSqlString } from '@/lib/postgres';
import { ensurePortfolioTables } from '@/lib/db/schema';
import { assertAdmin } from '@/lib/admin';

export async function saveLead(data) {
  try {
    await ensurePortfolioTables();
    const id = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const name = escapeSqlString(data.name || '');
    const email = escapeSqlString(data.email || '');
    const phone = escapeSqlString(data.phone || '');
    const company = escapeSqlString(data.company || '');
    const notes = escapeSqlString(data.notes || '');
    const source = escapeSqlString(data.source || 'chatbot');

    const res = await executeSql(`
      INSERT INTO leads (id, name, email, phone, company, notes, source)
      VALUES ('${id}', ${name}, ${email}, ${phone}, ${company}, ${notes}, ${source})
      RETURNING *;
    `);

    return { success: true, lead: res.rows[0] };
  } catch (error) {
    console.error('Save Lead Error:', error);
    return { success: false, error: error.message };
  }
}

export async function getLeads() {
  try {
    await assertAdmin();
    await ensurePortfolioTables();
    const res = await executeSql('SELECT * FROM leads ORDER BY created_at DESC;');
    return res.rows;
  } catch (error) {
    console.error('Get Leads Error:', error);
    return [];
  }
}

export async function deleteLead(id) {
  try {
    await assertAdmin();
    await ensurePortfolioTables();
    await executeSql(`DELETE FROM leads WHERE id = ${escapeSqlString(id)};`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
