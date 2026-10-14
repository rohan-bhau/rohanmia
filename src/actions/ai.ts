"use server";

import { executeSql, escapeSqlString, escapeSqlJson } from "@/lib/postgres";
import { ensurePortfolioTables } from "@/lib/db/schema";
import { getEffectiveSystemPrompt } from "@/lib/ai/context";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function chatWithAru(
  history: Array<{ role: string; content: string }>,
  message: string,
  visitorId?: string | null
): Promise<{ success: boolean; content: string }> {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return { success: false, content: "Neural core offline. API Key missing." };
  }

  try {
    const systemPrompt = await getEffectiveSystemPrompt("visitor");
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.6,
      },
    });

    const chatHistory = history
      .filter((h) => h.role === "bot" || h.role === "assistant" || h.role === "user")
      .map((h) => ({
        role: h.role === "bot" || h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      }));

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(message);
    const aiResponse = result.response.text();

    // Archiving
    saveAIChatLog(visitorId, message, aiResponse).catch((e) =>
      console.error("Archive Error:", e)
    );

    return { success: true, content: aiResponse };
  } catch (error: any) {
    console.error("chatWithAru error:", error);
    return {
      success: true,
      content:
        "I'm experiencing a brief neural synchronization delay. Please feel free to ask again or reach out through the contact page!",
    };
  }
}

async function saveAIChatLog(
  visitorId: string | null | undefined,
  userMsg: string,
  botMsg: string
) {
  try {
    const vid = visitorId || "anonymous_subject";
    await ensurePortfolioTables();
    const newItems = [
      { role: "user", content: userMsg, timestamp: new Date().toISOString() },
      { role: "assistant", content: botMsg, timestamp: new Date().toISOString() },
    ];
    await executeSql(`
      INSERT INTO ai_chat_logs (id, visitor_id, messages, last_interaction)
      VALUES (
        ${escapeSqlString(vid)},
        ${escapeSqlString(vid)},
        ${escapeSqlJson(newItems)},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        messages = ai_chat_logs.messages || EXCLUDED.messages,
        last_interaction = CURRENT_TIMESTAMP;
    `);
  } catch (err) {
    console.error("Archive Failed:", err);
  }
}

export async function deleteAIChatLog(id: string): Promise<{ success: boolean }> {
  try {
    await ensurePortfolioTables();
    await executeSql(`DELETE FROM ai_chat_logs WHERE id = ${escapeSqlString(id)};`);
    return { success: true };
  } catch (err) {
    console.error("Delete Archive Failed:", err);
    return { success: false };
  }
}
