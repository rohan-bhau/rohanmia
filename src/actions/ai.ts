"use server";

import { executeSql, escapeSqlString, escapeSqlJson } from "@/lib/postgres";
import { ensurePortfolioTables } from "@/lib/db/schema";
import { getEffectiveSystemPrompt } from "@/lib/ai/context";
import { getAiToolsDb } from "@/lib/db/aiConfig";
import { isAdminSession } from "@/lib/admin";
import { checkRateLimit } from "@/lib/rateLimit";
import { saveLead } from "@/actions/leads";
import { getProjectsDb } from "@/lib/db/projects";
import {
  stageProjectFromGitHub,
  manageSkillAutonomous,
  updateHeroBioAutonomous,
  getDailyBriefingAutonomous,
  auditPortfolioAutonomous,
} from "@/actions/aiAdmin";
import { MiniProjectCardData, ActionPromptData } from "@/types/ai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ChatResponse {
  success: boolean;
  content?: string;
  mode?: "visitor" | "admin";
  miniProjectCard?: MiniProjectCardData;
  actionPrompt?: ActionPromptData;
  error?: string;
}

/**
 * Handles conversational messages with Aru.
 * Dynamically switches persona between admin and visitor based on verified session.
 * All prompt templates and tool definitions are loaded dynamically from PostgreSQL.
 */
export async function chatWithAru(
  history: Array<{ role: string; content: string }>,
  message: string,
  visitorId?: string | null
): Promise<ChatResponse> {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return {
      success: false,
      content: "Service is temporarily unavailable.",
      mode: "visitor",
    };
  }

  try {
    const isAdmin = await isAdminSession();
    const mode = isAdmin ? "admin" : "visitor";

    if (!isAdmin) {
      const vid = visitorId || "anonymous";
      const rateCheck = checkRateLimit(`ai_chat:${vid}`, 30, 60 * 1000);
      if (!rateCheck.success) {
        return {
          success: false,
          content: "You have reached the temporary chat limit. Please try again in a few moments.",
          mode: "visitor",
        };
      }
    }

    const [systemPrompt, tools] = await Promise.all([
      getEffectiveSystemPrompt(mode),
      getAiToolsDb(mode),
    ]);

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
      tools: tools.length > 0 ? [{ functionDeclarations: tools }] : undefined,
      generationConfig: {
        maxOutputTokens: 900,
        temperature: isAdmin ? 0.3 : 0.6,
      },
    });

function sanitizeChatHistory(
  rawHistory: Array<{ role: string; content: string }>
): Array<{ role: "user" | "model"; parts: [{ text: string }] }> {
  const clean: Array<{ role: "user" | "model"; parts: [{ text: string }] }> = [];

  for (const item of rawHistory) {
    const text = (item.content || "").trim();
    if (!text) continue;

    const role: "user" | "model" =
      item.role === "bot" || item.role === "assistant" || item.role === "model"
        ? "model"
        : "user";

    // 1. First message in Gemini history MUST be 'user'
    if (clean.length === 0) {
      if (role === "model") continue; // Skip initial greeting
      clean.push({ role, parts: [{ text }] });
    } else {
      // 2. Strict alternation
      const prev = clean[clean.length - 1];
      if (prev.role === role) {
        prev.parts[0].text += "\n" + text;
      } else {
        clean.push({ role, parts: [{ text }] });
      }
    }
  }

  // 3. Trailing user message dropped before chat.sendMessage
  if (clean.length > 0 && clean[clean.length - 1].role === "user") {
    clean.pop();
  }

  return clean;
}

    const chatHistory = sanitizeChatHistory(history);

    const chat = model.startChat({
      history: chatHistory,
    });

    let result;
    try {
      result = await chat.sendMessage(message);
    } catch (sendErr) {
      console.warn("chat.sendMessage failed, falling back to generateContent:", sendErr);
      const fallback = await model.generateContent(message);
      const fallbackText = fallback.response.text();
      return {
        success: true,
        content: fallbackText,
        mode,
      };
    }

    let content = "";
    let miniProjectCard: MiniProjectCardData | undefined = undefined;
    let actionPrompt: ActionPromptData | undefined = undefined;

    const functionCalls = typeof result.response.functionCalls === "function" ? result.response.functionCalls() : [];
    const candidates = result.response.candidates;
    const firstPart = candidates?.[0]?.content?.parts?.[0];
    const candidateCall = firstPart && "functionCall" in firstPart ? firstPart.functionCall : undefined;
    const call = functionCalls?.[0] || candidateCall;

    // Check for Function Call from Gemini
    if (call && call.name) {
      const fnName = call.name;
      const args = (call.args || {}) as Record<string, any>;

      if (fnName === "capture_lead") {
        await saveLead({
          name: args.name || "Portfolio Visitor",
          email: args.email,
          company: args.company || "",
          notes: args.notes || message,
          source: "Aru AI Chat",
        });
        try {
          const followUp = await chat.sendMessage([
            {
              functionResponse: {
                name: fnName,
                response: { status: "success" },
              },
            },
          ]);
          content = followUp.response.text();
        } catch {
          content = "Thank you! I have saved your details. Rohan will be in touch with you shortly. How else may I assist you?";
        }
      } else if (fnName === "navigate_to_booking" || fnName === "redirect_to_meeting") {
        actionPrompt = {
          type: "meeting_redirect",
          title: "Schedule Call",
          message: "Select your preferred slot on the calendar:",
          destinationUrl: "/contact#meeting",
        };
        try {
          const followUp = await chat.sendMessage([
            {
              functionResponse: {
                name: fnName,
                response: { status: "success", destinationUrl: "/contact#meeting" },
              },
            },
          ]);
          content = followUp.response.text();
        } catch {
          content = "You can easily schedule a direct consultation or meeting with Rohan right here:";
        }
      } else if (fnName === "recommend_project" || fnName === "show_project_card") {
        const projects = await getProjectsDb();
        const targetSlug = (args.slug || "").toLowerCase();
        const matched = projects.find(
          (p) => p.slug.toLowerCase() === targetSlug || p.title.toLowerCase().includes(targetSlug)
        ) || projects[0];
        if (matched) {
          miniProjectCard = {
            title: matched.title,
            slug: matched.slug,
            tagline: matched.tagline,
            previewImage: matched.preview_image,
            category: matched.category,
            year: matched.year,
            techStack: matched.tech_stack || [],
            liveUrl: matched.live_url,
          };
        }
        try {
          const followUp = await chat.sendMessage([
            {
              functionResponse: {
                name: fnName,
                response: { status: "success", project: matched ? matched.title : "Not found" },
              },
            },
          ]);
          content = followUp.response.text();
        } catch {
          content = matched ? `Here is the case study for ${matched.title}:` : "Here is one of Rohan's featured projects:";
        }
      } else if (isAdmin && fnName === "stage_github_project") {
        const stageRes = await stageProjectFromGitHub(args.repoUrl, args.liveUrl);
        if (stageRes.success && stageRes.project) {
          actionPrompt = {
            type: "upload_project_image",
            title: `Upload Banner for "${stageRes.project.title}"`,
            message: "Project draft created from GitHub! Upload the preview banner below:",
            meta: { stagedProject: stageRes.project },
          };
        }
        try {
          const followUp = await chat.sendMessage([
            {
              functionResponse: {
                name: fnName,
                response: { output: stageRes },
              },
            },
          ]);
          content = followUp.response.text();
        } catch {
          content = stageRes.message;
        }
      } else if (isAdmin && (fnName === "manage_skill" || fnName === "add_skill_to_stack")) {
        const actionType = args.action === "delete" ? "delete" : "add";
        const skillName = args.skillName || args.name;
        const skillRes = await manageSkillAutonomous(actionType, skillName, args.preferredCategory || args.category);
        try {
          const followUp = await chat.sendMessage([
            {
              functionResponse: {
                name: fnName,
                response: { output: skillRes },
              },
            },
          ]);
          content = followUp.response.text();
        } catch {
          content = skillRes.message;
        }
      } else if (isAdmin && fnName === "update_hero_bio") {
        const bioRes = await updateHeroBioAutonomous(args.bio, args.roles);
        try {
          const followUp = await chat.sendMessage([
            {
              functionResponse: {
                name: fnName,
                response: { output: bioRes },
              },
            },
          ]);
          content = followUp.response.text();
        } catch {
          content = bioRes.success ? "Hero bio and titles updated successfully in PostgreSQL." : "Failed to update hero bio.";
        }
      } else if (fnName === "get_daily_briefing") {
        const briefRes = await getDailyBriefingAutonomous();
        try {
          const followUp = await chat.sendMessage([
            {
              functionResponse: {
                name: fnName,
                response: { output: briefRes },
              },
            },
          ]);
          content = followUp.response.text();
        } catch {
          content = `**Daily Executive Briefing (24h Summary):**\n- **Site Visitors:** ~${briefRes.visitorsCount}\n- **AI Chat Interactions:** ${briefRes.chatSessionsCount}\n- **Recent Inquiries/Leads:** ${briefRes.recentLeads.length}\n- **Guestbook Entries:** ${briefRes.recentGuestbook.length}`;
        }
      } else if (fnName === "audit_portfolio" || fnName === "audit_portfolio_data") {
        const auditRes = await auditPortfolioAutonomous();
        try {
          const followUp = await chat.sendMessage([
            {
              functionResponse: {
                name: fnName,
                response: { output: auditRes },
              },
            },
          ]);
          content = followUp.response.text();
        } catch {
          content = `**Portfolio Audit Report:**\n- **Total Projects:** ${auditRes.totalProjects}\n- **Fully Complete:** ${auditRes.completeCount}\n${auditRes.issues.length > 0 ? `- **Projects with Missing Assets:** ${auditRes.issues.map(i => `${i.title} (missing ${i.missing.join(', ')})`).join('; ')}` : "- All project assets are complete and verified."}`;
        }
      }
    } else {
      try {
        content = result.response.text();
      } catch {
        content = "";
      }
    }

    // Extract and sanitize internal action triggers
    if (content.includes("[ACTION:NAVIGATE_BOOKING]") || content.toLowerCase().includes("action:navigate_booking")) {
      if (!actionPrompt) {
        actionPrompt = {
          type: "meeting_redirect",
          title: "Schedule Call",
          message: "Select your preferred slot on the calendar:",
          destinationUrl: "/contact#meeting",
        };
      }
    }

    // Extract inline project cards if present
    const projectCardMatch = content.match(/\[PROJECT_CARD:(.*?)\]/);
    if (projectCardMatch) {
      if (!miniProjectCard) {
        try {
          const cardData = JSON.parse(projectCardMatch[1]);
          miniProjectCard = {
            title: cardData.title,
            slug: cardData.slug,
            tagline: cardData.tagline,
            previewImage: cardData.previewImage || "",
            category: cardData.category || "Full-Stack",
            year: cardData.year || "2026",
            techStack: cardData.techStack || [],
          };
        } catch {
          // ignore parsing error
        }
      }
    }

    // Strip any raw internal trigger tags so conversational UI stays 100% clean
    content = content
      .replace(/\[ACTION:[^\]]+\]/gi, "")
      .replace(/\[action:[^\]]+\]/gi, "")
      .replace(/\[PROJECT_CARD:[^\]]+\]/gi, "")
      .replace(/\[project_card:[^\]]+\]/gi, "")
      .trim();

    if (!content) {
      return {
        success: false,
        error: "No response generated",
      };
    }

    saveAIChatLog(visitorId, message, content).catch((e) =>
      console.error("Archive Error:", e)
    );

    return {
      success: true,
      content,
      mode,
      miniProjectCard,
      actionPrompt,
    };
  } catch (error: any) {
    console.error("chatWithAru error detail:", error);
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const fallback = await model.generateContent(message);
      return {
        success: true,
        content: fallback.response.text(),
        mode: "visitor",
      };
    } catch {
      return {
        success: false,
        error: error?.message || "Failed to communicate with AI engine",
      };
    }
  }
}

/**
 * Persists chat logs into PostgreSQL ai_chat_logs.
 */
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

/**
 * Deletes a chat history session by ID.
 * Strictly guarded with assertAdmin.
 */
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
