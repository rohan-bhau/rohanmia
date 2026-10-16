"use client";

import React, { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import {
  Shield,
  Users,
  MessageSquare,
  Sliders,
  Check,
  Trash2,
  ExternalLink,
  Search,
  Loader2,
  Mail,
  Building,
  UploadCloud,
  Database,
  Lock,
  Unlock,
  ImageIcon,
  Sparkles,
  Bot,
  Activity,
  Cpu,
  Clock,
  Layers,
} from "lucide-react";
import {
  AruAdminPanelData,
  saveAruConfig,
  deleteAruChatLog,
  deleteAruLead,
} from "@/actions/aiAdmin";
import ImageCropModal from "@/components/admin/ui/ImageCropModal";
import { useToast } from "@/components/admin/ui/Toast";
import { useThemeAccent } from "@/components/theme/ThemeProvider";
import { useAdminMode } from "@/components/admin/AdminModeContext";

interface Props {
  initialData: AruAdminPanelData;
  basePath: string;
}

export default function AruManagementClient({ initialData }: Props) {
  const { currentTheme } = useThemeAccent();
  const { mode } = useAdminMode();
  const { showToast } = useToast();

  const [data, setData] = useState<AruAdminPanelData>(initialData);
  const [isPending, startTransition] = useTransition();

  // Surface Canvas view selector: 'overview' | 'logs' | 'leads'
  const [surfaceView, setSurfaceView] = useState<"overview" | "logs" | "leads">("overview");

  // Studio Engine view selector: 'permissions' | 'prompts' | 'avatar'
  const [engineTab, setEngineTab] = useState<"permissions" | "prompts" | "avatar">("permissions");

  // Search filter for leads
  const [leadSearch, setLeadSearch] = useState("");
  // Selected chat log for inspecting conversation
  const [selectedLog, setSelectedLog] = useState<AruAdminPanelData["chatLogs"][0] | null>(null);

  // Avatar Modal State
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(data.config?.avatar_url || "/aru-avatar.png");

  // Form states for Prompts
  const [visitorPrompt, setVisitorPrompt] = useState(data.config?.visitor_prompt || "");
  const [adminPrompt, setAdminPrompt] = useState(data.config?.admin_prompt || "");
  const [knowledgeBase, setKnowledgeBase] = useState(data.config?.knowledge_base || "");

  // All known tools definition catalog
  const TOOL_CATALOG = useMemo(
    () => [
      {
        id: "update_about_content",
        name: "Update About & Education",
        category: "Content Autonomy",
        description: "Allows Aru to modify biography paragraphs, degree, and university details in PostgreSQL.",
        scope: "admin" as const,
      },
      {
        id: "update_project",
        name: "Modify Case Study Metadata",
        category: "Content Autonomy",
        description: "Allows Aru to update existing project live demos, GitHub URLs, titles, and taglines.",
        scope: "admin" as const,
      },
      {
        id: "update_hero_bio",
        name: "Update Hero & Rotating Roles",
        category: "Content Autonomy",
        description: "Allows Aru to rewrite hero tagline and modify rotating roles in PostgreSQL.",
        scope: "admin" as const,
      },
      {
        id: "stage_github_project",
        name: "GitHub Case Study Synthesizer",
        category: "Projects",
        description: "Synthesizes public repository architecture, metrics, and highlights into project drafts.",
        scope: "admin" as const,
      },
      {
        id: "manage_skill",
        name: "Autonomous Skill Taxonomy",
        category: "Tech Stack",
        description: "Allows Aru to append or prune technology tags directly from PostgreSQL tech items.",
        scope: "admin" as const,
      },
      {
        id: "get_daily_briefing",
        name: "Daily Executive Briefing",
        category: "Diagnostics",
        description: "Aggregates 24-hour visitors, chat interactions, new leads, and guestbook entries.",
        scope: "admin" as const,
      },
      {
        id: "audit_portfolio",
        name: "Portfolio Data Integrity Audit",
        category: "Diagnostics",
        description: "Scans all case studies for missing screenshots, code snippets, or architecture trees.",
        scope: "admin" as const,
      },
      {
        id: "capture_lead",
        name: "Visitor Lead Capture",
        category: "Visitor Engagement",
        description: "Captures visitor contact information when they share their email during chat.",
        scope: "visitor" as const,
      },
      {
        id: "navigate_to_booking",
        name: "Calendar Meeting Redirection",
        category: "Visitor Engagement",
        description: "Triggers interactive meeting booking redirect actions for /contact#meeting.",
        scope: "visitor" as const,
      },
      {
        id: "recommend_project",
        name: "Verified Project Recommendations",
        category: "Visitor Engagement",
        description: "Renders interactive mini project cards when visitors ask for specific work.",
        scope: "visitor" as const,
      },
    ],
    []
  );

  // Active tools in PostgreSQL
  const activeToolNames = useMemo(() => {
    const adminTools = Array.isArray(data.config?.tools_config?.admin_tools)
      ? data.config.tools_config.admin_tools.map((t: any) => t.name)
      : [];
    const visitorTools = Array.isArray(data.config?.tools_config?.visitor_tools)
      ? data.config.tools_config.visitor_tools.map((t: any) => t.name)
      : [];
    return new Set([...adminTools, ...visitorTools]);
  }, [data.config]);

  // Master Gemini tool schemas with full parameters
  const MASTER_TOOL_DEFINITIONS: Record<string, any> = {
    update_about_content: {
      name: "update_about_content",
      description: "Updates the About section bio paragraphs or education information in PostgreSQL database",
      parameters: {
        type: "OBJECT",
        properties: {
          bioParagraphs: { type: "ARRAY", items: { type: "STRING" } },
          educationDegree: { type: "STRING" },
          educationPeriod: { type: "STRING" },
          educationLocation: { type: "STRING" },
          educationInstitution: { type: "STRING" },
        },
      },
    },
    update_project: {
      name: "update_project",
      description: "Updates details of an existing project in PostgreSQL database (such as live URL, github URL, tagline, or title)",
      parameters: {
        type: "OBJECT",
        required: ["slug"],
        properties: {
          slug: { type: "STRING", description: "Slug of the project to update" },
          title: { type: "STRING", description: "Updated project title" },
          liveUrl: { type: "STRING", description: "Updated live deployment URL" },
          tagline: { type: "STRING", description: "Updated project tagline" },
          githubUrl: { type: "STRING", description: "Updated GitHub repository URL" },
        },
      },
    },
    update_hero_bio: {
      name: "update_hero_bio",
      description: "Updates the hero bio text and roles in PostgreSQL",
      parameters: {
        type: "OBJECT",
        required: ["bio"],
        properties: {
          bio: { type: "STRING" },
          roles: { type: "ARRAY", items: { type: "STRING" } },
        },
      },
    },
    stage_github_project: {
      name: "stage_github_project",
      description: "Synthesizes a case study draft from a public GitHub repository",
      parameters: {
        type: "OBJECT",
        required: ["repoUrl"],
        properties: {
          repoUrl: { type: "STRING" },
          liveUrl: { type: "STRING" },
        },
      },
    },
    manage_skill: {
      name: "manage_skill",
      description: "Autonomously manages a skill in PostgreSQL",
      parameters: {
        type: "OBJECT",
        required: ["action", "skillName"],
        properties: {
          action: { type: "STRING" },
          skillName: { type: "STRING" },
          preferredCategory: { type: "STRING" },
        },
      },
    },
    get_daily_briefing: {
      name: "get_daily_briefing",
      description: "Retrieves 24-hour summary of site statistics",
      parameters: { type: "OBJECT", properties: {} },
    },
    audit_portfolio: {
      name: "audit_portfolio",
      description: "Audits projects for missing content in database",
      parameters: { type: "OBJECT", properties: {} },
    },
    capture_lead: {
      name: "capture_lead",
      description: "Captures visitor contact info when they share an email or request a collaboration",
      parameters: {
        type: "OBJECT",
        required: ["email"],
        properties: {
          name: { type: "STRING" },
          email: { type: "STRING" },
          notes: { type: "STRING" },
          company: { type: "STRING" },
        },
      },
    },
    navigate_to_booking: {
      name: "navigate_to_booking",
      description: "Generates a meeting booking action for /contact#meeting",
      parameters: { type: "OBJECT", properties: {} },
    },
    recommend_project: {
      name: "recommend_project",
      description: "Recommends a verified project card by slug",
      parameters: {
        type: "OBJECT",
        required: ["slug"],
        properties: { slug: { type: "STRING" } },
      },
    },
  };

  // Toggle tool permission
  const handleToggleTool = (toolId: string, scope: "admin" | "visitor") => {
    startTransition(async () => {
      const currentConfig = data.config?.tools_config || { admin_tools: [], visitor_tools: [] };
      let newAdmin = [...(currentConfig.admin_tools || [])];
      let newVisitor = [...(currentConfig.visitor_tools || [])];

      const template = MASTER_TOOL_DEFINITIONS[toolId] || {
        name: toolId,
        description: TOOL_CATALOG.find((t) => t.id === toolId)?.description || "",
        parameters: { type: "OBJECT", properties: {} },
      };

      if (scope === "admin") {
        const exists = newAdmin.some((t: any) => t.name === toolId);
        if (exists) {
          newAdmin = newAdmin.filter((t: any) => t.name !== toolId);
        } else {
          newAdmin.push(template);
        }
      } else {
        const exists = newVisitor.some((t: any) => t.name === toolId);
        if (exists) {
          newVisitor = newVisitor.filter((t: any) => t.name !== toolId);
        } else {
          newVisitor.push(template);
        }
      }

      const res = await saveAruConfig({
        tools_config: { admin_tools: newAdmin, visitor_tools: newVisitor },
      });

      if (res.success && res.config) {
        setData((prev) => ({
          ...prev,
          config: res.config || prev.config,
          stats: {
            ...prev.stats,
            activeToolsCount: newAdmin.length + newVisitor.length,
          },
        }));
        showToast("Tool permissions updated in PostgreSQL.", "success");
      } else {
        showToast(res.error || "Failed to update permissions.", "error");
      }
    });
  };

  // Avatar upload success handler
  const handleAvatarSuccess = (newUrl: string) => {
    setIsCropModalOpen(false);
    setAvatarUrl(newUrl);
    startTransition(async () => {
      const res = await saveAruConfig({ avatar_url: newUrl });
      if (res.success && res.config) {
        setData((prev) => ({ ...prev, config: res.config || prev.config }));
        showToast("Aru avatar updated successfully in PostgreSQL.", "success");
      } else {
        showToast(res.error || "Failed to save avatar.", "error");
      }
    });
  };

  // Save prompts
  const handleSavePrompts = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveAruConfig({
        visitor_prompt: visitorPrompt.trim(),
        admin_prompt: adminPrompt.trim(),
        knowledge_base: knowledgeBase.trim(),
      });

      if (res.success && res.config) {
        setData((prev) => ({ ...prev, config: res.config || prev.config }));
        showToast("AI system prompts & knowledge base saved in PostgreSQL.", "success");
      } else {
        showToast(res.error || "Failed to save prompts.", "error");
      }
    });
  };

  // Delete chat session
  const handleDeleteLog = (id: string) => {
    startTransition(async () => {
      const res = await deleteAruChatLog(id);
      if (res.success) {
        setData((prev) => ({
          ...prev,
          chatLogs: prev.chatLogs.filter((l) => l.id !== id),
          stats: {
            ...prev.stats,
            totalSessions: Math.max(0, prev.stats.totalSessions - 1),
          },
        }));
        if (selectedLog?.id === id) setSelectedLog(null);
        showToast("Chat session deleted from PostgreSQL.", "success");
      } else {
        showToast(res.error || "Failed to delete log.", "error");
      }
    });
  };

  // Delete lead
  const handleDeleteLead = (id: string) => {
    startTransition(async () => {
      const res = await deleteAruLead(id);
      if (res.success) {
        setData((prev) => ({
          ...prev,
          leads: prev.leads.filter((l) => l.id !== id),
          stats: {
            ...prev.stats,
            totalLeads: Math.max(0, prev.stats.totalLeads - 1),
          },
        }));
        showToast("Lead removed from PostgreSQL.", "success");
      } else {
        showToast(res.error || "Failed to remove lead.", "error");
      }
    });
  };

  // Filtered leads
  const filteredLeads = useMemo(() => {
    if (!leadSearch.trim()) return data.leads;
    const q = leadSearch.toLowerCase();
    return data.leads.filter(
      (l) =>
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.company && l.company.toLowerCase().includes(q)) ||
        (l.notes && l.notes.toLowerCase().includes(q))
    );
  }, [data.leads, leadSearch]);

  return (
    <div className="space-y-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-20 animate-in fade-in duration-300">
      {/* 1. Header Section */}
      <div className="pt-2 pb-1 border-b border-white/[0.08] pb-6">
        <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 block mb-1">
          AI AGENT &amp; EXECUTIVE COPILOT
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white tracking-tight leading-[1.15]">
          Aru{" "}
          <span
            className="font-serif italic font-normal text-transparent bg-clip-text"
            style={{
              backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${currentTheme.primary} 100%)`,
            }}
          >
            Intelligence
          </span>
        </h1>
        <p className="text-xs text-neutral-400 font-mono mt-2">
          {mode === "preview"
            ? "Surface Canvas: Live grounding snapshot, system telemetry, conversation history, and captured inquiries."
            : "Studio Engine: Configure autonomous tool permissions, system prompts, and avatar appearance."}
        </p>
      </div>

      {/* ========================================================
          MODE 1: SURFACE CANVAS (DIAGNOSTICS, LOGS & LEADS)
         ======================================================== */}
      {mode === "preview" ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Agent Identity & Live Grounding Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0e14]/80 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-lg shrink-0">
                  <Image src={avatarUrl} alt="Aru" fill className="object-cover" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-serif font-medium text-white tracking-tight">
                      Aru
                    </h3>
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Grounded
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 font-mono">
                    Model: <code className="text-white font-semibold">gemini-flash-lite-latest</code> &bull; Ultra Low Latency
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono text-neutral-400">
                <Clock size={13} style={{ color: currentTheme.primary }} />
                <span>7-Day Chat Auto-Purge Active</span>
              </div>
            </div>

            {/* Realtime PostgreSQL Grounding Data Sources */}
            <div className="pt-5">
              <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-2.5">
                REALTIME KNOWLEDGE GROUNDING CHANNELS
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  "about_content (Education & Bio)",
                  "hero_content (Headline & Roles)",
                  "projects (All Case Studies)",
                  "tech_items (Categorized Skills)",
                  "links (Social Connects)",
                  "site_settings (Global SEO)",
                  "analytics_events (Visitor Metrics)",
                ].map((channel, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-neutral-300 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentTheme.primary }} />
                    <span>{channel}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 4 Core Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Conversations */}
            <div className="p-5 rounded-2xl bg-[#0c0e14]/80 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-400">Total Conversations</span>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/10"
                  style={{ backgroundColor: `${currentTheme.primary}18`, color: currentTheme.primary }}
                >
                  <MessageSquare size={15} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-white tracking-tight">
                  {data.stats.totalSessions}
                </span>
                <span className="text-[11px] font-mono text-neutral-500">active (7d)</span>
              </div>
            </div>

            {/* Card 2: Identified Leads */}
            <div className="p-5 rounded-2xl bg-[#0c0e14]/80 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-400">Captured Leads</span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-amber-500/20 bg-amber-500/10 text-amber-400">
                  <Users size={15} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-white tracking-tight">
                  {data.stats.totalLeads}
                </span>
                <span className="text-[11px] font-mono text-neutral-500">inquiries</span>
              </div>
            </div>

            {/* Card 3: Autonomous Tools Active */}
            <div className="p-5 rounded-2xl bg-[#0c0e14]/80 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-400">Active Tools</span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-purple-500/20 bg-purple-500/10 text-purple-400">
                  <Shield size={15} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-white tracking-tight">
                  {data.stats.activeToolsCount}
                </span>
                <span className="text-[11px] font-mono text-neutral-500">tools</span>
              </div>
            </div>

            {/* Card 4: 24h Interactions */}
            <div className="p-5 rounded-2xl bg-[#0c0e14]/80 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-400">24h Interactions</span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  <Activity size={15} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-white tracking-tight">
                  {data.stats.recentInteractions24h}
                </span>
                <span className="text-[11px] font-mono text-neutral-500">recent</span>
              </div>
            </div>
          </div>

          {/* Surface Canvas View Switcher */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto [scrollbar-width:none]">
              <button
                type="button"
                onClick={() => setSurfaceView("overview")}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                  surfaceView === "overview"
                    ? "bg-white text-black font-semibold shadow-md"
                    : "bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <Layers size={14} />
                <span>Active Capabilities ({data.stats.activeToolsCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSurfaceView("logs")}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                  surfaceView === "logs"
                    ? "bg-white text-black font-semibold shadow-md"
                    : "bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <MessageSquare size={14} />
                <span>Conversation Logs ({data.chatLogs.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSurfaceView("leads")}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                  surfaceView === "leads"
                    ? "bg-white text-black font-semibold shadow-md"
                    : "bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <Users size={14} />
                <span>Visitor Leads ({data.leads.length})</span>
              </button>
            </div>

            {/* SUB-VIEW 1: ACTIVE CAPABILITIES */}
            {surfaceView === "overview" && (
              <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-2xl space-y-6 shadow-xl animate-in fade-in duration-200">
                <div className="space-y-1 pb-4 border-b border-white/[0.06]">
                  <h2 className="text-lg font-serif font-medium text-white tracking-tight flex items-center gap-2">
                    <Shield size={18} style={{ color: currentTheme.primary }} />
                    <span>Active Autonomous Capabilities</span>
                  </h2>
                  <p className="text-xs text-neutral-400 font-mono">
                    Actions currently authorized for autonomous execution by Aru. Toggle capabilities in Studio Engine.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TOOL_CATALOG.filter((t) => activeToolNames.has(t.id)).map((tool) => (
                    <div
                      key={tool.id}
                      className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 hover:border-white/15 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-300">
                          {tool.category}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                            tool.scope === "admin"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          }`}
                        >
                          {tool.scope.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white tracking-tight">
                        {tool.name}
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: CONVERSATION LOGS */}
            {surfaceView === "logs" && (
              <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-2xl space-y-6 shadow-xl animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.06]">
                  <div className="space-y-1">
                    <h2 className="text-lg font-serif font-medium text-white tracking-tight flex items-center gap-2">
                      <MessageSquare size={18} style={{ color: currentTheme.primary }} />
                      <span>Realtime Chat Sessions (ai_chat_logs)</span>
                    </h2>
                    <p className="text-xs text-neutral-400 font-mono">
                      Sessions older than 7 days are automatically purged from database storage.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    {data.chatLogs.length} Sessions (Last 7 Days)
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Session list */}
                  <div className="lg:col-span-5 space-y-2 max-h-[520px] overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {data.chatLogs.length === 0 ? (
                      <div className="p-8 text-center text-xs font-mono text-neutral-500">
                        No chat logs recorded in the last 7 days.
                      </div>
                    ) : (
                      data.chatLogs.map((log) => {
                        const isSelected = selectedLog?.id === log.id;
                        return (
                          <div
                            key={log.id}
                            onClick={() => setSelectedLog(log)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-white/[0.08] border-white/20 shadow-md"
                                : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-mono font-medium text-white truncate">
                                Visitor: {log.visitor_id}
                              </span>
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLog(log.id);
                                }}
                                className="text-neutral-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                                title="Delete Session"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <div className="flex items-center justify-between pt-2 text-[10px] font-mono text-neutral-400">
                              <span>{log.message_count} messages</span>
                              <span>{new Date(log.last_interaction).toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Conversation message viewer */}
                  <div className="lg:col-span-7 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col h-[520px]">
                    <div className="pb-3 border-b border-white/[0.06] flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-neutral-400 font-medium truncate">
                        {selectedLog ? `Session: ${selectedLog.visitor_id}` : "Select a session"}
                      </span>
                      {selectedLog && (
                        <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                          {selectedLog.message_count} messages
                        </span>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto py-4 space-y-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      {!selectedLog ? (
                        <div className="h-full flex items-center justify-center text-xs font-mono text-neutral-500">
                          Click any session on the left to inspect messages.
                        </div>
                      ) : Array.isArray(selectedLog.messages) && selectedLog.messages.length > 0 ? (
                        selectedLog.messages.map((m: any, i: number) => {
                          const isUser = m.role === "user";
                          return (
                            <div
                              key={i}
                              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                            >
                              <div
                                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs font-mono leading-relaxed ${
                                  isUser
                                    ? "bg-primary text-white"
                                    : "bg-white/[0.06] border border-white/10 text-neutral-200"
                                }`}
                              >
                                <span className="block text-[9px] uppercase tracking-wider opacity-60 mb-1">
                                  {isUser ? "Visitor" : "Aru"}
                                </span>
                                {m.content || m.text || JSON.stringify(m)}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-xs font-mono text-neutral-500 text-center py-8">
                          No messages in this session.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW 3: VISITOR LEADS */}
            {surfaceView === "leads" && (
              <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-2xl space-y-6 shadow-xl animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                  <div className="space-y-1">
                    <h2 className="text-lg font-serif font-medium text-white tracking-tight flex items-center gap-2">
                      <Users size={18} style={{ color: currentTheme.primary }} />
                      <span>Captured Visitor Leads (leads table)</span>
                    </h2>
                    <p className="text-xs text-neutral-400 font-mono">
                      Visitors who shared contact information before chatting with Aru.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search name or email..."
                      value={leadSearch}
                      onChange={(e) => setLeadSearch(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30 font-mono"
                    />
                  </div>
                </div>

                {filteredLeads.length === 0 ? (
                  <div className="py-12 text-center text-xs font-mono text-neutral-500">
                    No visitor leads recorded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-neutral-400 uppercase text-[10px]">
                          <th className="pb-3 font-medium">Visitor Name</th>
                          <th className="pb-3 font-medium">Email Address</th>
                          <th className="pb-3 font-medium">Company</th>
                          <th className="pb-3 font-medium">Source</th>
                          <th className="pb-3 font-medium">Captured Date</th>
                          <th className="pb-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {filteredLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3.5 pr-4 text-white font-medium">
                              {lead.name}
                            </td>
                            <td className="py-3.5 pr-4">
                              <a
                                href={`mailto:${lead.email}`}
                                className="text-sky-400 hover:underline flex items-center gap-1.5"
                              >
                                <span>{lead.email}</span>
                                <ExternalLink size={11} className="shrink-0" />
                              </a>
                            </td>
                            <td className="py-3.5 pr-4 text-neutral-400">
                              {lead.company || "—"}
                            </td>
                            <td className="py-3.5 pr-4">
                              <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-[10px] text-neutral-300">
                                {lead.source}
                              </span>
                            </td>
                            <td className="py-3.5 pr-4 text-neutral-500 text-[11px]">
                              {new Date(lead.created_at).toLocaleString()}
                            </td>
                            <td className="py-3.5 text-right">
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleDeleteLead(lead.id)}
                                className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="Delete Lead"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================
            MODE 2: STUDIO ENGINE (CONFIGURATION & MANAGEMENT)
           ======================================================== */
        <div className="space-y-6">
          {/* Sub-tabs for Studio Engine */}
          <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setEngineTab("permissions")}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                engineTab === "permissions"
                  ? "bg-white text-black font-semibold shadow-md"
                  : "bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <Shield size={14} />
              <span>Tool Permissions ({data.stats.activeToolsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setEngineTab("prompts")}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                engineTab === "prompts"
                  ? "bg-white text-black font-semibold shadow-md"
                  : "bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <Sliders size={14} />
              <span>System Prompts</span>
            </button>

            <button
              type="button"
              onClick={() => setEngineTab("avatar")}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                engineTab === "avatar"
                  ? "bg-white text-black font-semibold shadow-md"
                  : "bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <ImageIcon size={14} />
              <span>Aru Avatar</span>
            </button>
          </div>

          {/* TAB 1: TOOL PERMISSIONS */}
          {engineTab === "permissions" && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-2xl space-y-6 shadow-xl animate-in fade-in duration-200">
              <div className="space-y-1 pb-4 border-b border-white/[0.06]">
                <h2 className="text-lg font-serif font-medium text-white tracking-tight flex items-center gap-2">
                  <Shield size={18} style={{ color: currentTheme.primary }} />
                  <span>Autonomous Tool Permissions</span>
                </h2>
                <p className="text-xs text-neutral-400 font-mono">
                  Toggle which actions Aru can execute autonomously when conversing with you or visitors.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TOOL_CATALOG.map((tool) => {
                  const isActive = activeToolNames.has(tool.id);
                  return (
                    <div
                      key={tool.id}
                      className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                        isActive
                          ? "bg-white/[0.04] border-white/20 shadow-md"
                          : "bg-white/[0.01] border-white/[0.06] opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-300">
                            {tool.category}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              tool.scope === "admin"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                            }`}
                          >
                            {tool.scope.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white tracking-tight">
                          {tool.name}
                        </h4>
                        <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                          {tool.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleToggleTool(tool.id, tool.scope)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                          isActive
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
                            : "bg-white/[0.05] border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Unlock size={12} />
                            <span>Enabled</span>
                          </>
                        ) : (
                          <>
                            <Lock size={12} />
                            <span>Disabled</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM PROMPTS (LARGE INPUT AREAS, HIDDEN SCROLLBARS) */}
          {engineTab === "prompts" && (
            <form onSubmit={handleSavePrompts} className="space-y-6 animate-in fade-in duration-200">
              <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-2xl space-y-6 shadow-xl">
                <div className="space-y-1 pb-4 border-b border-white/[0.06]">
                  <h2 className="text-lg font-serif font-medium text-white tracking-tight flex items-center gap-2">
                    <Sliders size={18} style={{ color: currentTheme.primary }} />
                    <span>System Prompt Configuration</span>
                  </h2>
                  <p className="text-xs text-neutral-400 font-mono">
                    All prompts are saved directly in PostgreSQL (<code className="text-primary font-mono">ai_system_config</code>).
                  </p>
                </div>

                {/* Visitor Prompt */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-neutral-300 font-medium">
                    <span>Visitor System Prompt (Public Concierge)</span>
                    <span className="text-[11px] text-neutral-500">{visitorPrompt.length} chars</span>
                  </div>
                  <textarea
                    rows={12}
                    value={visitorPrompt}
                    onChange={(e) => setVisitorPrompt(e.target.value)}
                    placeholder="Enter visitor system prompt..."
                    className="w-full min-h-[300px] px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-neutral-200 focus:outline-none focus:border-white/30 transition-colors leading-relaxed resize-y [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  />
                  <p className="text-[11px] text-neutral-500 font-mono">
                    Configures tone, language mirroring (English / Banglish), and anti-hallucination rules.
                  </p>
                </div>

                {/* Admin Prompt */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-neutral-300 font-medium">
                    <span>Admin System Prompt (Executive Co-pilot for Bhau)</span>
                    <span className="text-[11px] text-neutral-500">{adminPrompt.length} chars</span>
                  </div>
                  <textarea
                    rows={12}
                    value={adminPrompt}
                    onChange={(e) => setAdminPrompt(e.target.value)}
                    placeholder="Enter admin system prompt..."
                    className="w-full min-h-[300px] px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-neutral-200 focus:outline-none focus:border-white/30 transition-colors leading-relaxed resize-y [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  />
                  <p className="text-[11px] text-neutral-500 font-mono">
                    Instructs autonomous tool calling behavior, direct database updates, and executive briefing formats.
                  </p>
                </div>

                {/* Knowledge Base */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-neutral-300 font-medium">
                    <span>Custom Knowledge Base (Markdown)</span>
                    <span className="text-[11px] text-neutral-500">{knowledgeBase.length} chars</span>
                  </div>
                  <textarea
                    rows={8}
                    value={knowledgeBase}
                    onChange={(e) => setKnowledgeBase(e.target.value)}
                    placeholder="Enter supplementary knowledge or FAQs..."
                    className="w-full min-h-[200px] px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-neutral-200 focus:outline-none focus:border-white/30 transition-colors leading-relaxed resize-y [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="p-4 rounded-2xl bg-[#08090d]/80 border border-white/[0.08] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                  <Database size={14} style={{ color: currentTheme.primary }} />
                  <span>Saves directly to Neon PostgreSQL ai_system_config</span>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-tight transition-all shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>Save AI Prompts</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: AVATAR IMAGE CONFIGURATION */}
          {engineTab === "avatar" && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-2xl space-y-6 shadow-xl animate-in fade-in duration-200">
              <div className="space-y-1 pb-4 border-b border-white/[0.06]">
                <h2 className="text-lg font-serif font-medium text-white tracking-tight flex items-center gap-2">
                  <ImageIcon size={18} style={{ color: currentTheme.primary }} />
                  <span>Aru Avatar Image</span>
                </h2>
                <p className="text-xs text-neutral-400 font-mono">
                  Change the avatar displayed in the chat header and floating launcher widget.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2">
                <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-2 border-white/10 bg-black/50 shadow-2xl shrink-0">
                  <Image
                    src={avatarUrl}
                    alt="Aru Avatar"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-3 text-center sm:text-left flex-1">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Current Active Avatar</h4>
                    <p className="text-xs text-neutral-400 font-mono break-all mt-0.5">
                      {avatarUrl}
                    </p>
                  </div>

                  <p className="text-[11px] text-neutral-500 font-mono leading-relaxed">
                    Upload a high-resolution square image. Position and crop it in the crop modal before uploading to Cloudinary and saving into PostgreSQL.
                  </p>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCropModalOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold tracking-tight transition-all shadow-md cursor-pointer"
                    >
                      <UploadCloud size={14} />
                      <span>Upload &amp; Change Avatar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Crop Modal for Avatar */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        onSuccess={handleAvatarSuccess}
        title="Change Aru Avatar"
        subtitle="Upload and position Aru's avatar image within the square frame."
      />
    </div>
  );
}
