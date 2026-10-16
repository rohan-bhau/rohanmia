"use server";

import { executeSql, escapeSqlString, escapeSqlJson } from "@/lib/postgres";
import { ensurePortfolioTables } from "@/lib/db/schema";
import { getEffectiveSystemPrompt } from "@/lib/ai/context";
import { getAiToolsDb, getAiConfigDb } from "@/lib/db/aiConfig";
import { isAdminSession } from "@/lib/admin";
import { checkRateLimit } from "@/lib/rateLimit";
import { saveLead } from "@/actions/leads";

/**
 * Returns active avatar URL for Aru from PostgreSQL.
 */
export async function getAruAvatar(): Promise<string> {
  try {
    const config = await getAiConfigDb();
    return config?.avatar_url || "/aru-avatar.png";
  } catch {
    return "/aru-avatar.png";
  }
}
import { getProjectsDb } from "@/lib/db/projects";
import { getAboutContentDb } from "@/lib/db/content";
import { getHeroData } from "@/actions/adminHero";
import {
  stageProjectFromGitHub,
  manageSkillAutonomous,
  updateHeroBioAutonomous,
  getDailyBriefingAutonomous,
  auditPortfolioAutonomous,
  updateAboutContentAutonomous,
  updateProjectAutonomous,
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
  visitorId?: string | null,
  visitorMeta?: { name?: string; email?: string } | null
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

    const CASCADE_MODELS = [
      "gemini-3.8-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest",
      "gemini-flash-lite-latest",
    ];

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

    let result: any = null;
    let chat: any = null;
    let lastError: any = null;

    for (const modelName of CASCADE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
          tools: tools.length > 0 ? [{ functionDeclarations: tools }] : undefined,
          generationConfig: {
            maxOutputTokens: 900,
            temperature: isAdmin ? 0.3 : 0.6,
          },
        });

        const activeChat = model.startChat({
          history: chatHistory,
        });

        result = await activeChat.sendMessage(message);
        chat = activeChat;
        break; // Successfully got response from model!
      } catch (sendErr: any) {
        lastError = sendErr;
        console.warn(`Model ${modelName} hit quota/error. Instantly failing over to next model...`);
      }
    }

    if (!result && lastError) {
      throw lastError;
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

      // Strictly verify tool permission against active database tools_config
      const isToolAuthorized = tools.some((t: any) => t.name === fnName);
      if (!isToolAuthorized) {
        content = `This action (${fnName}) is currently disabled in Aru Control Room permissions.`;
      } else if (fnName === "capture_lead") {
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
        const stageRes = await stageProjectFromGitHub(args.repoUrl, args.liveUrl, args.serverRepoUrl);
        if (stageRes.success && stageRes.project) {
          actionPrompt = {
            type: "upload_project_image",
            title: `Upload Images for "${stageRes.project.title}"`,
            message: "Project case study synthesized! Upload the Main Thumbnail and Secondary Hover Image below:",
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
      } else if (isAdmin && (fnName === "open_add_skill_form" || fnName === "show_add_skill_form")) {
        actionPrompt = {
          type: "form_add_skill",
          title: "Add Skill to Tech Stack",
          message: "Enter the technology name and select its category to add it directly to PostgreSQL:",
        };
        content = "I have opened the Tech Stack addition form below. Please enter the skill details:";
      } else if (isAdmin && (fnName === "open_add_project_form" || fnName === "show_add_project_form")) {
        actionPrompt = {
          type: "form_add_project",
          title: "Create New Project Case Study",
          message: "Analyze a public GitHub repo or enter case study details directly below:",
        };
        content = "I have opened the Case Study creator card below for you:";
      } else if (isAdmin && (fnName === "manage_skill" || fnName === "add_skill_to_stack")) {
        const actionType = args.action === "delete" ? "delete" : "add";
        const skillName = (args.skillName || args.name || "").trim();
        const category = args.preferredCategory || args.category || "General";

        if (!skillName) {
          actionPrompt = {
            type: "form_add_skill",
            title: "Add Skill to Tech Stack",
            message: "Enter the technology name and select its category to add it directly to PostgreSQL:",
          };
          content = "Please enter the skill name and select its category in the form below:";
        } else {
          actionPrompt = {
            type: "confirm_action",
            title: actionType === "delete" ? `Confirm Skill Deletion: ${skillName}` : `Confirm Skill Addition: ${skillName}`,
            message: actionType === "delete"
              ? `Are you sure you want to permanently remove "${skillName}" from your tech stack?`
              : `Aru is ready to add "${skillName}" to your tech stack under category "${category}".`,
            meta: {
              actionType: "manage_skill",
              targetName: `Tech Stack (${skillName})`,
              summary: actionType === "delete" ? `Delete Skill "${skillName}"` : `Add Skill "${skillName}"`,
              changeType: actionType,
              currentValue: actionType === "delete" ? `Active skill: ${skillName}` : "Not in active tech stack",
              proposedValue: actionType === "delete" ? "Permanent removal from PostgreSQL" : `Add "${skillName}" (${category})`,
              payload: {
                action: actionType,
                skillName: skillName,
                preferredCategory: category,
              },
            },
          };
          try {
            const followUp = await chat.sendMessage([
              {
                functionResponse: {
                  name: fnName,
                  response: { status: "staged_for_confirmation", skill: skillName, action: actionType },
                },
              },
            ]);
            content = followUp.response.text();
          } catch {
            content = `I have staged this skill ${actionType === "delete" ? "deletion" : "addition"} for your review. Please confirm using the staged card below:`;
          }
        }
      } else if (isAdmin && (fnName === "update_hero_bio" || fnName === "update_about_content" || fnName === "modify_about")) {
        content = "Bhau, amar modification access shudhu **Projects** ebong **Tech Stack**-e simito ache (jate live website-er core layout o visual structure safe thake). Hero ba About section edit korte chaile Control Room Dashboard ([Hero Section](/control-room-internal) ba [About Section](/control-room-internal/about)) theke shorasori edit korte parbe. Ami website-er shob content read korte pari ebong Projects & Tech Stack add/delete/update korte pari!";
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
      } else if (isAdmin && (fnName === "delete_project" || fnName === "delete_case_study")) {
        const projects = await getProjectsDb();
        const target = projects.find(
          (p) => p.slug.toLowerCase() === (args.slug || "").toLowerCase() || p.title.toLowerCase().includes((args.slug || "").toLowerCase())
        );
        if (!target) {
          content = `Project with slug "${args.slug}" was not found in the database.`;
        } else {
          actionPrompt = {
            type: "confirm_action",
            title: `Confirm Deletion: ${target.title}`,
            message: `Are you sure you want to permanently delete "${target.title}" and its case study from PostgreSQL?`,
            meta: {
              actionType: "delete_project",
              targetName: `Case Study (${target.title})`,
              summary: `Permanently Delete "${target.title}"`,
              changeType: "delete",
              currentValue: {
                title: target.title,
                slug: target.slug,
                category: target.category,
              },
              proposedValue: "Permanent removal from database",
              payload: {
                slug: target.slug,
              },
            },
          };
          try {
            const followUp = await chat.sendMessage([
              {
                functionResponse: {
                  name: fnName,
                  response: { status: "staged_for_confirmation", target: target.title },
                },
              },
            ]);
            content = followUp.response.text();
          } catch {
            content = `I have staged the deletion of "${target.title}". Please confirm using the card below:`;
          }
        }
      } else if (isAdmin && (fnName === "toggle_featured_project" || fnName === "toggle_project_featured" || fnName === "unstar_project" || fnName === "star_project")) {
        const projects = await getProjectsDb();
        const target = projects.find(
          (p) => p.slug.toLowerCase() === (args.slug || "").toLowerCase() || p.id === (args.slug || "")
        );
        if (!target) {
          content = `Project with identifier "${args.slug}" was not found in the database.`;
        } else {
          const nextFeatured = args.featured !== undefined ? Boolean(args.featured) : (fnName === "unstar_project" ? false : (fnName === "star_project" ? true : !target.featured));
          actionPrompt = {
            type: "confirm_action",
            title: nextFeatured ? `Star "${target.title}" as Featured Case Study` : `Unstar "${target.title}" from Featured Case Studies`,
            message: nextFeatured
              ? `Aru is ready to promote "${target.title}" to your primary Featured Case Studies carousel.`
              : `Aru is ready to unstar "${target.title}". It will remain fully accessible on your /projects page with all data intact.`,
            meta: {
              actionType: "toggle_featured_project",
              targetName: `Case Study (${target.title})`,
              summary: nextFeatured ? `Star "${target.title}"` : `Unstar "${target.title}"`,
              changeType: "update",
              currentValue: target.featured ? "Featured (Starred)" : "Regular (Unstarred)",
              proposedValue: nextFeatured ? "Featured (Starred)" : "Regular (Unstarred)",
              payload: {
                slug: target.slug,
                featured: nextFeatured,
              },
            },
          };
          try {
            const followUp = await chat.sendMessage([
              {
                functionResponse: {
                  name: fnName,
                  response: { status: "staged_for_confirmation", target: target.title, nextFeatured },
                },
              },
            ]);
            content = followUp.response.text();
          } catch {
            content = `I have staged the featured status update for "${target.title}". Please inspect and confirm using the card below:`;
          }
        }
      } else if (isAdmin && (fnName === "update_project" || fnName === "modify_project")) {
        const projects = await getProjectsDb();
        const target = projects.find(
          (p) => p.slug.toLowerCase() === (args.slug || "").toLowerCase() || p.id === (args.slug || "")
        );
        if (!target) {
          content = `Project with slug "${args.slug}" was not found in the database.`;
        } else {
          const hasFeaturedChange = args.featured !== undefined || args.isFeatured !== undefined;
          const targetFeatured = args.featured !== undefined ? Boolean(args.featured) : (args.isFeatured !== undefined ? Boolean(args.isFeatured) : target.featured);

          actionPrompt = {
            type: "confirm_action",
            title: `Confirm Update: ${target.title}`,
            message: `Aru has prepared updates for "${target.title}". Review below:`,
            meta: {
              actionType: "update_project",
              targetName: `Case Study: ${target.title}`,
              summary: `Update Metadata for ${target.title}`,
              currentValue: {
                tagline: target.tagline,
                liveUrl: target.live_url,
                githubUrl: target.github_url,
                ...(hasFeaturedChange ? { featured: target.featured ? "Featured (Starred)" : "Regular (Unstarred)" } : {}),
              },
              proposedValue: {
                tagline: args.tagline || target.tagline,
                liveUrl: args.liveUrl !== undefined ? args.liveUrl : target.live_url,
                githubUrl: args.githubUrl !== undefined ? args.githubUrl : target.github_url,
                ...(hasFeaturedChange ? { featured: targetFeatured ? "Featured (Starred)" : "Regular (Unstarred)" } : {}),
              },
              payload: {
                slug: target.slug,
                ...args,
              },
            },
          };
          try {
            const followUp = await chat.sendMessage([
              {
                functionResponse: {
                  name: fnName,
                  response: { status: "staged_for_confirmation", target: target.title },
                },
              },
            ]);
            content = followUp.response.text();
          } catch {
            content = `I have staged the updates for "${target.title}". Please inspect the preview card below and click **Approve & Apply** to publish to the database.`;
          }
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

    // Direct intent detection for adding skills or projects in Admin mode
    if (isAdmin && !actionPrompt) {
      const lowerMsg = message.toLowerCase().trim();
      if (
        lowerMsg === "add tech skill" ||
        lowerMsg === "add skill" ||
        lowerMsg === "skill add" ||
        lowerMsg.includes("skill add kor") ||
        lowerMsg.includes("notun skill add")
      ) {
        actionPrompt = {
          type: "form_add_skill",
          title: "Add Skill to Tech Stack",
          message: "Enter the technology name and select its category to add it directly to PostgreSQL:",
        };
      } else if (
        lowerMsg === "add project" ||
        lowerMsg === "project add" ||
        lowerMsg.includes("project add kor") ||
        lowerMsg.includes("notun project add") ||
        lowerMsg.includes("case study add")
      ) {
        actionPrompt = {
          type: "form_add_project",
          title: "Create New Project Case Study",
          message: "Analyze a public GitHub repo or enter project case study details directly below:",
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

    // Option 1: Only archive chat logs if the visitor is an identified lead (has email) or admin
    // Anonymous guest chats are completely ephemeral (0 rows in database)
    if (isAdmin || (visitorMeta && visitorMeta.email)) {
      saveAIChatLog(visitorId, message, content, visitorMeta, isAdmin).catch((e) =>
        console.error("Archive Error:", e)
      );
    }

    return {
      success: true,
      content,
      mode,
      miniProjectCard,
      actionPrompt,
    };
  } catch (error: any) {
    console.error("chatWithAru error detail:", error);
    for (const fallbackModel of [
      "gemini-3.8-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest",
      "gemini-flash-lite-latest",
    ]) {
      try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: fallbackModel });
        const fallback = await model.generateContent(message);
        return {
          success: true,
          content: fallback.response.text(),
          mode: "visitor",
        };
      } catch {
        continue;
      }
    }
    return {
      success: false,
      error: error?.message || "Failed to communicate with AI engine",
    };
  }
}

/**
 * Persists chat logs into PostgreSQL ai_chat_logs.
 */
async function saveAIChatLog(
  visitorId: string | null | undefined,
  userMsg: string,
  botMsg: string,
  meta?: { name?: string; email?: string } | null,
  isAdmin?: boolean
) {
  try {
    await ensurePortfolioTables();
    const newItems = [
      { role: "user", content: userMsg, timestamp: new Date().toISOString() },
      { role: "assistant", content: botMsg, timestamp: new Date().toISOString() },
    ];
    const logId = meta?.email
      ? `lead_${meta.email.toLowerCase().trim()}`
      : (isAdmin ? "admin_session" : (visitorId || `session_${Date.now()}`));

    const displayName = meta?.name && meta?.email
      ? `${meta.name} (${meta.email})`
      : (isAdmin ? "Admin Session" : (visitorId || "Identified Lead"));

    await executeSql(`
      INSERT INTO ai_chat_logs (id, visitor_id, messages, last_interaction)
      VALUES (
        ${escapeSqlString(logId)},
        ${escapeSqlString(displayName)},
        ${escapeSqlJson(newItems)},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        visitor_id = EXCLUDED.visitor_id,
        messages = ai_chat_logs.messages || EXCLUDED.messages,
        last_interaction = CURRENT_TIMESTAMP;
    `);

    // Auto-delete chat history older than 3 days to keep database storage clean and prevent spam accumulation
    await executeSql(`DELETE FROM ai_chat_logs WHERE last_interaction < NOW() - INTERVAL '3 days';`).catch(() => {});
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
