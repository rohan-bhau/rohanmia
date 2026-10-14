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
  content: string;
  mode: "visitor" | "admin";
  miniProjectCard?: MiniProjectCardData;
  actionPrompt?: ActionPromptData;
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
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
      tools: tools.length > 0 ? [{ functionDeclarations: tools }] : undefined,
      generationConfig: {
        maxOutputTokens: 900,
        temperature: isAdmin ? 0.3 : 0.6,
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

    let content = "";
    let miniProjectCard: MiniProjectCardData | undefined = undefined;
    let actionPrompt: ActionPromptData | undefined = undefined;

    const candidates = result.response.candidates;
    const firstPart = candidates?.[0]?.content?.parts?.[0];

    // Check for Function Call from Gemini
    if (firstPart && "functionCall" in firstPart && firstPart.functionCall) {
      const call = firstPart.functionCall;
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
        const followUp = await chat.sendMessage([
          {
            functionResponse: {
              name: "capture_lead",
              response: { status: "success" },
            },
          },
        ]);
        content = followUp.response.text();
      } else if (fnName === "navigate_to_booking") {
        actionPrompt = {
          type: "meeting_redirect",
          title: "Schedule Call",
          message: "Select your preferred slot on the calendar:",
          destinationUrl: "/contact#meeting",
        };
        const followUp = await chat.sendMessage([
          {
            functionResponse: {
              name: "navigate_to_booking",
              response: { status: "success", destinationUrl: "/contact#meeting" },
            },
          },
        ]);
        content = followUp.response.text();
      } else if (fnName === "recommend_project") {
        const projects = await getProjectsDb();
        const matched = projects.find(
          (p) => p.slug.toLowerCase() === (args.slug || "").toLowerCase()
        );
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
        const followUp = await chat.sendMessage([
          {
            functionResponse: {
              name: "recommend_project",
              response: { status: "success", project: matched ? matched.title : "Not found" },
            },
          },
        ]);
        content = followUp.response.text();
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
        const followUp = await chat.sendMessage([
          {
            functionResponse: {
              name: "stage_github_project",
              response: stageRes,
            },
          },
        ]);
        content = followUp.response.text();
      } else if (isAdmin && fnName === "manage_skill") {
        const actionType = args.action === "delete" ? "delete" : "add";
        const skillRes = await manageSkillAutonomous(actionType, args.skillName, args.preferredCategory);
        const followUp = await chat.sendMessage([
          {
            functionResponse: {
              name: "manage_skill",
              response: skillRes,
            },
          },
        ]);
        content = followUp.response.text();
      } else if (isAdmin && fnName === "update_hero_bio") {
        const bioRes = await updateHeroBioAutonomous(args.bio, args.roles);
        const followUp = await chat.sendMessage([
          {
            functionResponse: {
              name: "update_hero_bio",
              response: bioRes,
            },
          },
        ]);
        content = followUp.response.text();
      } else if (isAdmin && fnName === "get_daily_briefing") {
        const briefRes = await getDailyBriefingAutonomous();
        const followUp = await chat.sendMessage([
          {
            functionResponse: {
              name: "get_daily_briefing",
              response: briefRes,
            },
          },
        ]);
        content = followUp.response.text();
      } else if (isAdmin && fnName === "audit_portfolio") {
        const auditRes = await auditPortfolioAutonomous();
        const followUp = await chat.sendMessage([
          {
            functionResponse: {
              name: "audit_portfolio",
              response: auditRes,
            },
          },
        ]);
        content = followUp.response.text();
      }
    } else {
      content = result.response.text();
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
    console.error("chatWithAru error:", error);
    return {
      success: true,
      content:
        "I'm experiencing a brief synchronization delay. Please feel free to ask again or reach out through the contact page!",
      mode: "visitor",
    };
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
