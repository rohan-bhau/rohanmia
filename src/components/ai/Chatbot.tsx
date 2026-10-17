"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Loader2,
  Volume2,
  VolumeX,
  Sparkles,
  ExternalLink,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Terminal,
  Copy,
  Check,
  Upload,
  ArrowRight,
  Plus,
  Trash2,
  FolderPlus,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { chatWithAru, getAruAvatar } from "@/actions/ai";
import { saveLead } from "@/actions/leads";
import { uploadImage } from "@/actions/upload";
import {
  commitProjectWithImage,
  applyStagedContentUpdate,
  manageSkillAutonomous,
  stageProjectFromGitHub,
  createProjectAutonomous,
} from "@/actions/aiAdmin";
import { MiniProjectCardData, ActionPromptData } from "@/types/ai";
import Tooltip from "../shared/Tooltip";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  miniProjectCard?: MiniProjectCardData;
  actionPrompt?: ActionPromptData;
  timestamp?: string;
  isTyping?: boolean;
}

/**
 * Smooth typewriter streaming for newly arrived bot responses.
 */
function TypewriterContent({
  content,
  isTyping,
  renderFn,
  onDone,
}: {
  content: string;
  isTyping?: boolean;
  renderFn: (txt: string) => React.ReactNode;
  onDone?: () => void;
}) {
  const [typedLength, setTypedLength] = useState(0);
  const displayedLength = isTyping ? typedLength : content.length;

  useEffect(() => {
    if (!isTyping) {
      return;
    }
    let current = 0;
    const step = Math.max(5, Math.floor(content.length / 18));
    const interval = setInterval(() => {
      current += step;
      if (current >= content.length) {
        setTypedLength(content.length);
        clearInterval(interval);
        if (onDone) onDone();
      } else {
        setTypedLength(current);
      }
    }, 12);
    return () => clearInterval(interval);
  }, [content, isTyping, onDone]);

  const textToRender = isTyping ? content.slice(0, displayedLength) : content;
  return <>{renderFn(textToRender)}</>;
}

/**
 * Lightweight Web Audio synthesizer for futuristic feedback sounds.
 */
function playChime(type: "open" | "send" | "receive") {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "open") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "send") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "receive") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch {
    // Graceful fallback
  }
}

/**
 * Interactive inline form for adding a Tech Stack skill directly from chat.
 */
function InlineAddSkillForm({
  msgId,
  onSuccess,
}: {
  msgId: string;
  onSuccess: (skillName: string, category: string) => void;
}) {
  const [skillName, setSkillName] = useState("");
  const [category, setCategory] = useState("Backend");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const categories = ["Frontend", "Backend", "Database", "DevOps", "Tools"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) {
      setError("Please enter a skill or technology name.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await manageSkillAutonomous("add", skillName.trim(), category);
      if (res.success) {
        setSubmitted(true);
        onSuccess(skillName.trim(), category);
      } else {
        setError(res.message || "Failed to add skill");
      }
    } catch (err: any) {
      setError(err?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
        <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
        <span>Skill <strong>&quot;{skillName}&quot;</strong> successfully added to <strong>{category}</strong> in PostgreSQL!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 rounded-xl border border-primary/30 bg-black/40 space-y-3 text-xs">
      <div className="space-y-1">
        <label className="text-[10px] font-mono uppercase text-white/60 tracking-wider font-bold">
          Skill / Technology Name:
        </label>
        <input
          type="text"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          placeholder="e.g. Apache Kafka, Redis, Docker, GraphQL"
          className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-primary transition-all font-medium"
          disabled={loading}
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-mono uppercase text-white/60 tracking-wider font-bold">
          Target Category:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-2 py-1 rounded-md text-[10.5px] font-mono font-medium transition-all ${
                category === cat
                  ? "bg-primary text-white shadow-sm shadow-primary/40 font-bold border border-primary"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-[11px] text-red-400 flex items-center gap-1 font-medium">
          <X size={12} />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !skillName.trim()}
        className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 disabled:opacity-40 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 size={12} className="animate-spin" />
            <span>Adding to Tech Stack...</span>
          </>
        ) : (
          <>
            <Plus size={12} />
            <span>Add Skill to PostgreSQL</span>
          </>
        )}
      </button>
    </form>
  );
}

/**
 * Interactive inline form for adding a Case Study project directly from chat.
 */
function InlineAddProjectForm({
  msgId,
  onStagedProject,
  onCreatedManual,
}: {
  msgId: string;
  onStagedProject: (project: any) => void;
  onCreatedManual: (title: string, slug: string) => void;
}) {
  const [mode, setMode] = useState<"github" | "manual">("github");
  const [repoUrl, setRepoUrl] = useState("");
  const [serverRepoUrl, setServerRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("Full Stack");
  const [techStack, setTechStack] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGitHubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setError("Please provide a valid GitHub repository URL.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await stageProjectFromGitHub(
        repoUrl.trim(),
        liveUrl.trim() || undefined,
        serverRepoUrl.trim() || undefined
      );
      if (res.success && res.project) {
        onStagedProject(res.project);
      } else {
        setError(res.message || "Failed to analyze GitHub repository");
      }
    } catch (err: any) {
      setError(err?.message || "Unexpected error analyzing repo");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !tagline.trim()) {
      setError("Please provide project title and tagline.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const stackArr = techStack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await createProjectAutonomous({
        title: title.trim(),
        tagline: tagline.trim(),
        category,
        techStack: stackArr.length > 0 ? stackArr : ["Next.js", "TypeScript", "PostgreSQL"],
        liveUrl: liveUrl.trim() || undefined,
        githubUrl: repoUrl.trim() || undefined,
        clientUrl: repoUrl.trim() || undefined,
        serverUrl: serverRepoUrl.trim() || undefined,
      });
      if (res.success && res.slug) {
        onCreatedManual(title.trim(), res.slug);
      } else {
        setError(res.message || "Failed to create project");
      }
    } catch (err: any) {
      setError(err?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 rounded-xl border border-primary/30 bg-black/40 space-y-3 text-xs">
      <div className="flex rounded-lg bg-white/5 p-0.5 border border-white/10">
        <button
          type="button"
          onClick={() => { setMode("github"); setError(null); }}
          className={`flex-1 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition-all ${
            mode === "github" ? "bg-primary text-white shadow" : "text-white/60 hover:text-white"
          }`}
        >
          From GitHub Repo
        </button>
        <button
          type="button"
          onClick={() => { setMode("manual"); setError(null); }}
          className={`flex-1 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition-all ${
            mode === "manual" ? "bg-primary text-white shadow" : "text-white/60 hover:text-white"
          }`}
        >
          Quick Manual Draft
        </button>
      </div>

      {mode === "github" ? (
        <form onSubmit={handleGitHubSubmit} className="space-y-2.5">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-white/60 tracking-wider font-bold">
              Frontend / Main Repo URL:
            </label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="e.g. https://github.com/rohan-bhau/my-project"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-primary transition-all font-mono"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-white/60 tracking-wider font-bold">
              Backend Repo URL (Optional):
            </label>
            <input
              type="text"
              value={serverRepoUrl}
              onChange={(e) => setServerRepoUrl(e.target.value)}
              placeholder="e.g. https://github.com/rohan-bhau/my-project-server"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-primary transition-all font-mono"
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-white/60 tracking-wider font-bold">
              Live Demo URL (Optional):
            </label>
            <input
              type="text"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://myproject.app"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-primary transition-all font-mono"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-[11px] text-red-400 flex items-center gap-1 font-medium">
              <X size={12} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !repoUrl.trim()}
            className="w-full py-2 px-3 rounded-lg bg-primary hover:brightness-110 active:scale-[0.98] text-white text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-primary/30 disabled:opacity-40 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>Analyzing GitHub Repo(s)...</span>
              </>
            ) : (
              <>
                <Sparkles size={12} />
                <span>Analyze & Stage Case Study</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-2.5">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-white/60 tracking-wider font-bold">
              Project Title:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Task Orchestrator"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-primary transition-all font-medium"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-white/60 tracking-wider font-bold">
              Tagline / Short Summary:
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. High-throughput job processing engine with Kafka and Go"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-primary transition-all font-medium"
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-white/60 tracking-wider font-bold">
              Tech Stack (Comma Separated):
            </label>
            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="Next.js, TypeScript, PostgreSQL, Tailwind"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-primary transition-all font-mono"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-white/60 tracking-wider font-bold">
                Frontend Repo (Optional):
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-primary transition-all font-mono"
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-white/60 tracking-wider font-bold">
                Backend Repo (Optional):
              </label>
              <input
                type="text"
                value={serverRepoUrl}
                onChange={(e) => setServerRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-primary transition-all font-mono"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-white/60 tracking-wider font-bold">
              Live Demo URL (Optional):
            </label>
            <input
              type="text"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://myproject.app"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-primary transition-all font-mono"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-[11px] text-red-400 flex items-center gap-1 font-medium">
              <X size={12} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !title.trim() || !tagline.trim()}
            className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 disabled:opacity-40 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>Publishing to Database...</span>
              </>
            ) : (
              <>
                <Plus size={12} />
                <span>Save Case Study to Database</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

/**
 * Dual Image Uploader widget for Staged Case Study projects:
 * Slot 1: Main Thumbnail (Default Card Cover - Required)
 * Slot 2: Hover Showcase Image (Revealed on Card Hover - Optional)
 */
function DualProjectImageUploader({
  msgId,
  stagedProject,
  onPublished,
}: {
  msgId: string;
  stagedProject: any;
  onPublished: (slug: string, card: MiniProjectCardData) => void;
}) {
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [hoverFile, setHoverFile] = useState<File | null>(null);
  const [hoverPreview, setHoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mainInputRef = useRef<HTMLInputElement>(null);
  const hoverInputRef = useRef<HTMLInputElement>(null);

  const handleMainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainFile(file);
      setMainPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleHoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHoverFile(file);
      setHoverPreview(URL.createObjectURL(file));
    }
  };

  const handlePublish = async () => {
    if (!mainFile) {
      setError("Please select the Main Thumbnail image before publishing.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 1. Upload Main Thumbnail
      const formDataMain = new FormData();
      formDataMain.append("file", mainFile);
      const resMain = await uploadImage(formDataMain);
      if (!resMain.success || !resMain.url) {
        throw new Error(resMain.error || "Failed to upload main thumbnail image");
      }

      // 2. Upload Hover Image if selected, otherwise fallback to main
      let hoverUrl = resMain.url;
      if (hoverFile) {
        const formDataHover = new FormData();
        formDataHover.append("file", hoverFile);
        const resHover = await uploadImage(formDataHover);
        if (resHover.success && resHover.url) {
          hoverUrl = resHover.url;
        }
      }

      // 3. Commit project with both preview and hover image URLs
      const commitRes = await commitProjectWithImage(stagedProject, resMain.url, hoverUrl);
      if (!commitRes.success || !commitRes.slug) {
        throw new Error(commitRes.message || "Failed to commit project");
      }

      const publishedSlug: string = commitRes.slug;
      const newCard: MiniProjectCardData = {
        title: String(stagedProject.title || "Project"),
        slug: publishedSlug,
        tagline: String(stagedProject.tagline || ""),
        previewImage: resMain.url,
        category: String(stagedProject.category || "Full-Stack"),
        year: String(stagedProject.year || new Date().getFullYear()),
        techStack: Array.isArray(stagedProject.techStack) ? stagedProject.techStack : [],
        liveUrl: stagedProject.liveUrl ? String(stagedProject.liveUrl) : undefined,
      };

      onPublished(publishedSlug, newCard);
    } catch (err: any) {
      setError(err?.message || "Failed to upload and publish project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 rounded-xl border border-primary/30 bg-black/50 space-y-3 text-xs">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
        <div>
          <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
            <Sparkles size={13} className="text-primary" />
            <span>{stagedProject?.title || "Case Study Staged"}</span>
          </div>
          <div className="text-[10px] text-white/50 line-clamp-1">
            {stagedProject?.tagline || "Complete technical case study synthesized"}
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-primary/20 text-primary border border-primary/30 shrink-0">
          {stagedProject?.category || "Full Stack"}
        </span>
      </div>

      {/* Synthesis Summary Badges */}
      <div className="flex flex-wrap gap-1.5 text-[9px] font-mono text-white/70">
        {Array.isArray(stagedProject?.keyFeatures) && stagedProject.keyFeatures.length > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
            ✓ {stagedProject.keyFeatures.length} Key Features
          </span>
        )}
        {Array.isArray(stagedProject?.technicalDecisions) && stagedProject.technicalDecisions.length > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
            ✓ {stagedProject.technicalDecisions.length} Decisions
          </span>
        )}
        {stagedProject?.clientUrl && (
          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-400">
            ✓ Frontend Repo
          </span>
        )}
        {stagedProject?.serverUrl && (
          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-emerald-400">
            ✓ Backend Repo
          </span>
        )}
      </div>

      {/* Dual Image Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {/* Slot 1: Main Thumbnail */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="font-bold text-white/80">1. Main Thumbnail</span>
            <span className="text-[9px] text-emerald-400 font-bold">Required</span>
          </div>
          <input
            ref={mainInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={loading}
            onChange={handleMainChange}
          />
          {mainPreview ? (
            <div className="relative group rounded-lg overflow-hidden border border-emerald-500/40 aspect-video bg-black/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mainPreview}
                alt="Main Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                disabled={loading}
                onClick={() => mainInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-[10px] font-bold text-white"
              >
                <Upload size={12} />
                <span>Change</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => mainInputRef.current?.click()}
              className="w-full aspect-video rounded-lg border-2 border-dashed border-primary/40 bg-white/5 hover:bg-primary/10 hover:border-primary transition-all flex flex-col items-center justify-center gap-1.5 text-white/70 hover:text-white cursor-pointer"
            >
              <Upload size={16} className="text-primary" />
              <span className="text-[10px] font-bold">Choose Main Cover</span>
              <span className="text-[8px] text-white/40">Portfolio card default</span>
            </button>
          )}
        </div>

        {/* Slot 2: Hover Showcase Image */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="font-bold text-white/80">2. Hover Reveal</span>
            <span className="text-[9px] text-white/40">Optional</span>
          </div>
          <input
            ref={hoverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={loading}
            onChange={handleHoverChange}
          />
          {hoverPreview ? (
            <div className="relative group rounded-lg overflow-hidden border border-primary/40 aspect-video bg-black/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hoverPreview}
                alt="Hover Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                disabled={loading}
                onClick={() => hoverInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-[10px] font-bold text-white"
              >
                <Upload size={12} />
                <span>Change</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => hoverInputRef.current?.click()}
              className="w-full aspect-video rounded-lg border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all flex flex-col items-center justify-center gap-1.5 text-white/70 hover:text-white cursor-pointer"
            >
              <ImageIcon size={16} className="text-white/40" />
              <span className="text-[10px] font-bold">Choose Hover Image</span>
              <span className="text-[8px] text-white/40">Shown on card hover</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="text-[11px] text-red-400 flex items-center gap-1 font-medium">
          <X size={12} />
          <span>{error}</span>
        </div>
      )}

      {/* Publish Button */}
      <button
        type="button"
        disabled={loading || !mainFile}
        onClick={handlePublish}
        className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            <span>Uploading Images & Publishing to PostgreSQL...</span>
          </>
        ) : (
          <>
            <Sparkles size={13} />
            <span>Publish Case Study to Portfolio</span>
          </>
        )}
      </button>
    </div>
  );
}

export default function Chatbot() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin =
    (session?.user as any)?.role === "admin" &&
    (session?.user as any)?.isAdmin === true;

  const [isOpen, setIsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("/aru-avatar.png");

  useEffect(() => {
    getAruAvatar().then((url) => {
      if (url) setAvatarUrl(url);
    });
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "init",
      role: "bot",
      content: isAdmin
        ? "Welcome back, Bhau! I'm your executive co-pilot. I can help you audit portfolio case studies, synthesize GitHub repos into drafts, manage your tech stack, or pull the daily briefing. What would you like to work on?"
        : "Hello! I'm Aru. Whether you're exploring Rohan's engineering projects, inquiring about architecture and tech stack, or looking to schedule a direct call, I'm here to help. What would you like to explore today?",
    },
  ]);

  useEffect(() => {
    if (isAdmin) {
      setMessages((prev) => {
        if (prev.length === 1 && prev[0].id === "init") {
          return [
            {
              id: "init",
              role: "bot",
              content:
                "Welcome back, Bhau! I'm your executive co-pilot. I can help you audit portfolio case studies, synthesize GitHub repos into drafts, manage your tech stack, or pull the daily briefing. What would you like to work on?",
            },
          ];
        }
        return prev;
      });
    }
  }, [isAdmin]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isIdentified, setIsIdentified] = useState(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("visitor_name");
      const savedEmail = localStorage.getItem("visitor_email");
      return Boolean(savedName && savedEmail);
    }
    return false;
  });
  const [visitorInfo, setVisitorInfo] = useState(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("visitor_name") || "";
      const savedEmail = localStorage.getItem("visitor_email") || "";
      return { name: savedName, email: savedEmail, company: "" };
    }
    return { name: "", email: "", company: "" };
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("aru_sound") !== "false";
    }
    return true;
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadingForMsgId, setUploadingForMsgId] = useState<string | null>(null);
  const [stagedState, setStagedState] = useState<
    Record<string, { status: "idle" | "applying" | "approved" | "discarded"; message?: string }>
  >({});

  const handleApproveStaged = async (msgId: string, actionType: string, payload: any) => {
    setStagedState((prev) => ({ ...prev, [msgId]: { status: "applying" } }));
    try {
      const res = await applyStagedContentUpdate(actionType, payload);
      if (res.success) {
        setStagedState((prev) => ({
          ...prev,
          [msgId]: { status: "approved", message: res.message },
        }));
        if (soundEnabled) playChime("receive");
        router.refresh();
      } else {
        setStagedState((prev) => ({
          ...prev,
          [msgId]: { status: "idle", message: res.message || "Failed to apply changes." },
        }));
      }
    } catch (err: any) {
      setStagedState((prev) => ({
        ...prev,
        [msgId]: { status: "idle", message: err?.message || "Error applying update." },
      }));
    }
  };

  const handleDiscardStaged = (msgId: string) => {
    setStagedState((prev) => ({
      ...prev,
      [msgId]: { status: "discarded", message: "Staged changes discarded. Live site was NOT modified." },
    }));
  };

  const isReadyForChat = isIdentified || isAdmin;

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollTarget = useRef(0);
  const animationFrame = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Liquid smooth scroll physics
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const container = containerRef.current;
    if (!wrapper || !container || !isOpen) return;

    scrollTarget.current = container.scrollTop;

    const smoothScroll = () => {
      const current = container.scrollTop;
      const target = scrollTarget.current;
      const diff = target - current;
      const step = diff * 0.18;

      if (Math.abs(diff) > 0.5) {
        container.scrollTop += step;
        animationFrame.current = requestAnimationFrame(smoothScroll);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      scrollTarget.current += e.deltaY;
      const maxScroll = container.scrollHeight - container.clientHeight;
      scrollTarget.current = Math.max(0, Math.min(scrollTarget.current, maxScroll));

      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      animationFrame.current = requestAnimationFrame(smoothScroll);

      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    };

    wrapper.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      wrapper.removeEventListener("wheel", handleWheel);
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [isOpen, messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("aru_sound", String(next));
    }
  };

  const handleOpenToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next && soundEnabled) playChime("open");
  };

  const copyCode = (codeText: string, id: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(codeText);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const executeSend = useCallback(
    async (textToSend: string) => {
      if (!textToSend.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: `usr_${Date.now()}`,
        role: "user",
        content: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      setIsLoading(true);
      if (soundEnabled) playChime("send");

      try {
        const vid = typeof window !== "undefined" ? localStorage.getItem("visitor_id") : null;
        const savedEmail = typeof window !== "undefined" ? localStorage.getItem("visitor_email") : null;
        const savedName = typeof window !== "undefined" ? localStorage.getItem("visitor_name") : null;
        const visitorMeta = savedEmail && savedName ? { name: savedName, email: savedEmail } : null;

        const updatedHistory = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const result = await chatWithAru(updatedHistory, textToSend, vid, visitorMeta);

        if (result.success && result.content) {
          const botMsg: ChatMessage = {
            id: `bot_${Date.now()}`,
            role: "bot",
            content: result.content,
            miniProjectCard: result.miniProjectCard,
            actionPrompt: result.actionPrompt,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isTyping: true,
          };

          setMessages((prev) => [...prev, botMsg]);
          if (soundEnabled) playChime("receive");
        } else {
          throw new Error(result.error || "No response");
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            role: "bot",
            content: "Connection issue. Please try sending your message again.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, soundEnabled]
  );

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    executeSend(input);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSendMessage();
      }
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (visitorInfo.name && visitorInfo.email) {
      if (typeof window !== "undefined") {
        const vid = localStorage.getItem("visitor_id") || `v_${Date.now().toString(36)}`;
        localStorage.setItem("visitor_id", vid);
        localStorage.setItem("visitor_name", visitorInfo.name);
        localStorage.setItem("visitor_email", visitorInfo.email);
        await saveLead({
          name: visitorInfo.name,
          email: visitorInfo.email,
          company: visitorInfo.company,
          source: "Aru AI Welcome Form",
        });
      }
      setIsIdentified(true);
      if (soundEnabled) playChime("receive");
      setMessages([
        {
          id: "greet",
          role: "bot",
          content: `Welcome, ${visitorInfo.name}! It's a pleasure to connect with you. I can guide you through Rohan's verified case studies, system architecture, or help coordinate a direct conversation. What would you like to explore?`,
        },
      ]);
    }
  };

  const handleGuestSkip = () => {
    setIsIdentified(true);
  };

  const handleInlineImageUpload = async (file: File, stagedProject: any, msgId: string) => {
    setUploadingForMsgId(msgId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await uploadImage(formData);
      if (!uploadRes.success || !uploadRes.url) {
        throw new Error(uploadRes.error || "Failed to upload image");
      }

      const commitRes = await commitProjectWithImage(stagedProject, uploadRes.url);
      if (!commitRes.success || !commitRes.slug) {
        throw new Error(commitRes.message || "Failed to commit project");
      }

      const publishedSlug: string = commitRes.slug || "project";
      const newCard: MiniProjectCardData = {
        title: String(stagedProject.title || "Project"),
        slug: publishedSlug,
        tagline: String(stagedProject.tagline || ""),
        previewImage: uploadRes.url,
        category: String(stagedProject.category || "Full-Stack"),
        year: String(stagedProject.year || new Date().getFullYear()),
        techStack: Array.isArray(stagedProject.techStack) ? stagedProject.techStack : [],
        liveUrl: stagedProject.liveUrl ? String(stagedProject.liveUrl) : undefined,
      };

      setMessages((prev) => [
        ...prev,
        {
          id: `pub_${Date.now()}`,
          role: "bot",
          content: `🎉 Project **"${stagedProject.title}"** published successfully to PostgreSQL! You can explore the live case study at [/projects/${publishedSlug}](/projects/${publishedSlug}).`,
          miniProjectCard: newCard,
        },
      ]);
      if (soundEnabled) playChime("receive");
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "bot",
          content: `⚠️ Upload or publish failed: ${err?.message || "Unknown error"}. Please try again or upload via Studio Engine.`,
        },
      ]);
    } finally {
      setUploadingForMsgId(null);
    }
  };

  // Render markdown, lists, headers, code snippets, and links cleanly
  const renderFormattedText = (rawText: string) => {
    if (!rawText) return "";

    // 1. Strip raw internal action tokens or brackets
    const text = rawText
      .replace(/\[ACTION:[^\]]+\]/gi, "")
      .replace(/\[action:[^\]]+\]/gi, "")
      .replace(/\[PROJECT_CARD:[^\]]+\]/gi, "")
      .replace(/\[project_card:[^\]]+\]/gi, "");

    // 2. Split by code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const preText = text.slice(lastIndex, match.index);
      if (preText) parts.push(renderBlockContent(preText, `pre_${match.index}`));

      const lang = match[1] || "code";
      const codeContent = match[2];
      const blockId = `code_${match.index}`;
      const isCopied = copiedId === blockId;

      parts.push(
        <div
          key={blockId}
          className="my-3 rounded-xl border border-white/10 bg-black/60 overflow-hidden font-mono text-xs"
        >
          <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.04] border-b border-white/[0.08] text-[10px] text-white/50 uppercase tracking-widest font-black">
            <span>{lang}</span>
            <button
              onClick={() => copyCode(codeContent, blockId)}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{isCopied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <pre className="p-3 overflow-x-auto text-emerald-300/90 leading-relaxed font-mono">
            <code>{codeContent}</code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    const remainingText = text.slice(lastIndex);
    if (remainingText) parts.push(renderBlockContent(remainingText, "rem"));

    return <div className="space-y-2">{parts}</div>;
  };

  const renderBlockContent = (blockStr: string, blockKey: string) => {
    const lines = blockStr.split("\n");
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listItems: React.ReactNode[] = [];

    const flushList = (key: string) => {
      if (inList && listItems.length > 0) {
        elements.push(
          <ul key={key} className="space-y-1.5 my-1.5 pl-1">
            {listItems}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      const lineKey = `${blockKey}_l_${idx}`;

      // Check bullet point (- or * or •)
      if (/^[-*•]\s+/.test(trimmed)) {
        inList = true;
        const itemText = trimmed.replace(/^[-*•]\s+/, "");
        listItems.push(
          <li key={`${lineKey}_item`} className="flex items-start gap-2 text-white/90">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <span className="flex-1 leading-relaxed">{renderInlineMarkdown(itemText, lineKey)}</span>
          </li>
        );
        return;
      }

      // Check numbered list (e.g. 1. 2.)
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        inList = true;
        listItems.push(
          <li key={`${lineKey}_num`} className="flex items-start gap-2 text-white/90">
            <span className="text-[10px] font-mono text-primary font-bold mt-0.5 shrink-0">{numMatch[1]}.</span>
            <span className="flex-1 leading-relaxed">{renderInlineMarkdown(numMatch[2], lineKey)}</span>
          </li>
        );
        return;
      }

      // Flush any active list
      flushList(`${lineKey}_flush`);

      // Check header (### or ## or #)
      if (/^#{1,4}\s+/.test(trimmed)) {
        const headerText = trimmed.replace(/^#{1,4}\s+/, "");
        elements.push(
          <h5 key={lineKey} className="font-bold text-white tracking-wide text-xs mt-2 mb-1">
            {renderInlineMarkdown(headerText, lineKey)}
          </h5>
        );
        return;
      }

      // Regular line
      if (trimmed === "") {
        elements.push(<div key={lineKey} className="h-0.5" />);
      } else {
        elements.push(
          <p key={lineKey} className="leading-relaxed">
            {renderInlineMarkdown(line, lineKey)}
          </p>
        );
      }
    });

    flushList(`${blockKey}_final_flush`);

    return <div key={blockKey} className="space-y-1">{elements}</div>;
  };

  const renderInlineMarkdown = (rawStr: string, keyPrefix: string): React.ReactNode => {
    if (!rawStr) return null;

    // 1. Normalize **[label](url)** or [**label**](url) -> [label](url)
    let s = rawStr
      .replace(/\*\*\[(.*?)\]\((.*?)\)\*\*/g, "[$1]($2)")
      .replace(/\[\*\*(.*?)\*\*\]\((.*?)\)/g, "[$1]($2)");

    // 2. Normalize Project ( /projects/slug ) or **Project** ( /projects/slug ) -> [Project](/projects/slug)
    s = s.replace(
      /(^|[\s•*–-])(?:\*\*([^*()]+)\*\*|([A-Z][A-Za-z0-9_ -]+?))\s*\(\s*(\/(?:projects|contact|guestbook|about|gallery|tech-stack|links)[\w/#-]*)\s*\)/g,
      (m, prefix, g1, g2, url) => {
        const label = (g1 || g2).trim();
        return `${prefix}[${label}](${url})`;
      }
    );

    // 3. Normalize standalone ( /path ) -> [/path](/path)
    s = s.replace(
      /(?<!\])\(\s*(\/(?:projects|contact|guestbook|about|gallery|tech-stack|links)[\w/#-]*)\s*\)/g,
      " [$1]($1)"
    );

    // 4. Tokenize markdown links, bold, italics, code, and bare internal paths
    const tokenRegex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|\*.*?\*|`.*?`|(?<![\w/])\/(?:projects|contact|guestbook|about|gallery|tech-stack|links)[a-zA-Z0-9_\/#-]*)/g;
    const tokens = s.split(tokenRegex);

    return tokens.map((token, i) => {
      const tokenKey = `${keyPrefix}_tok_${i}`;
      if (!token) return null;

      // Link match [label](url)
      const linkMatch = token.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        const label = linkMatch[1];
        let url = linkMatch[2].trim();
        if (url.includes("localhost:3000")) {
          url = url.replace(/https?:\/\/localhost:3000/, "");
        }
        return (
          <Link
            key={tokenKey}
            href={url}
            className="inline-flex items-center gap-0.5 text-primary hover:text-primary/80 font-bold underline underline-offset-4 decoration-primary/50 transition-colors mx-0.5"
          >
            <span>{label}</span>
            <ArrowUpRight size={11} className="inline opacity-80" />
          </Link>
        );
      }

      // Bare internal path match (e.g. /projects/vireo or /guestbook)
      const barePathMatch = token.match(/^\/(?:projects|contact|guestbook|about|gallery|tech-stack|links)[a-zA-Z0-9_\/#-]*$/);
      if (barePathMatch) {
        const path = barePathMatch[0];
        return (
          <Link
            key={tokenKey}
            href={path}
            className="inline-flex items-center gap-0.5 text-primary hover:text-primary/80 font-semibold underline underline-offset-4 decoration-primary/50 transition-colors mx-0.5 font-mono text-[11px]"
          >
            <span>{path}</span>
            <ArrowUpRight size={11} className="inline opacity-80" />
          </Link>
        );
      }

      // Bold match **text** (recursively render inner text so any inner links work)
      const boldMatch = token.match(/^\*\*(.*?)\*\*$/);
      if (boldMatch) {
        return (
          <strong key={tokenKey} className="font-bold text-white">
            {renderInlineMarkdown(boldMatch[1], `${tokenKey}_b`)}
          </strong>
        );
      }

      // Italic match *text*
      const italicMatch = token.match(/^\*(.*?)\*$/);
      if (italicMatch) {
        return (
          <em key={tokenKey} className="italic text-white/95">
            {italicMatch[1]}
          </em>
        );
      }

      // Inline code `text`
      const codeMatch = token.match(/^`(.*?)`$/);
      if (codeMatch) {
        return (
          <code key={tokenKey} className="px-1.5 py-0.5 rounded bg-white/[0.08] text-primary font-mono text-[11px]">
            {codeMatch[1]}
          </code>
        );
      }

      return <span key={tokenKey}>{token}</span>;
    });
  };

  const visitorSuggestions = [
    { label: "💼 About Rohan", query: "Can you tell me about Rohan's engineering background?" },
    { label: "🚀 Featured Work", query: "Show me Rohan's top featured case studies." },
    { label: "🛠️ Tech Stack", query: "What technologies and architecture does Rohan specialize in?" },
    { label: "📅 Schedule Call", query: "I would like to book a direct call with Rohan." },
  ];

  const adminSuggestions = [
    { label: "📊 Daily Briefing", query: "Give me the daily executive briefing." },
    { label: "🔍 Audit Portfolio", query: "Audit all case studies for missing fields." },
    { label: "⚡ Add Tech Skill", query: "I want to add a new tech skill to my stack." },
    { label: "🚀 Add Project", query: "I want to add a new project to my portfolio." },
  ];

  const activeChips = isAdmin ? adminSuggestions : visitorSuggestions;

  return (
    <div className="fixed bottom-3 right-3 left-3 sm:left-auto sm:bottom-6 sm:right-6 md:right-8 z-[70] chatbot-container pointer-events-auto flex justify-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={wrapperRef}
            initial={{ opacity: 0, y: 16, scale: 0.95, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", damping: 28, stiffness: 360 }}
            className="w-full sm:w-[410px] md:w-[430px] max-h-[calc(100dvh-6.75rem)] h-[min(440px,calc(100dvh-6.75rem))] sm:h-[540px] sm:max-h-[580px] border border-white/[0.12] rounded-[24px] shadow-[0_25px_80px_rgba(0,0,0,0.85),0_0_50px_rgba(14,165,233,0.08)] flex flex-col overflow-hidden backdrop-blur-3xl bg-[#0b0d13]/95 pointer-events-auto ring-1 ring-white/[0.08]"
          >
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between pointer-events-auto transition-colors bg-gradient-to-r from-primary/15 via-primary/5 to-transparent shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="relative">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-primary/40 bg-background/50 relative shadow-lg shadow-primary/20">
                    <Image
                      src={avatarUrl}
                      alt="Aru"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-black bg-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Aru</h3>
                  <p className="text-[11px] font-medium text-emerald-400 tracking-wide mt-0.5">
                    {isAdmin ? "Co-pilot • Admin Control" : "Online"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSound}
                  className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors"
                  aria-label="Toggle sound"
                >
                  {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors"
                  aria-label="Close chat"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div
              ref={containerRef}
              className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-4 md:p-5 space-y-3.5 sm:space-y-4 relative z-10 pointer-events-auto touch-pan-y [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {!isReadyForChat ? (
                /* Welcome & Lead Identification Card */
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 py-0.5"
                >
                  <div className="p-3.5 sm:p-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                        <span>Welcome! I&apos;m Aru</span>
                        <span className="text-xl inline-block select-none hover:rotate-12 transition-transform cursor-default">👋</span>
                      </h4>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                      </div>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                      I&apos;m here to guide you through Rohan&apos;s engineering projects, explore his technical architecture, or help coordinate a direct conversation.
                    </p>
                  </div>

                  <form onSubmit={handleLeadSubmit} className="space-y-3">
                    <div className="p-2.5 sm:p-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-300/90 text-[11px] font-medium">
                        <Sparkles size={12} className="shrink-0" />
                        <span>Why introduce yourself?</span>
                      </div>
                      <p className="text-[11px] text-neutral-300/90 leading-relaxed font-sans">
                        Sharing your name and email allows Rohan to review our conversation and follow up with you directly. You can also skip this and browse anonymously as a guest below.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-medium text-neutral-300 uppercase tracking-wider ml-1">
                          Your Name <span className="text-neutral-500 normal-case">(For personal follow-up)</span>
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Alex Morgan"
                          value={visitorInfo.name}
                          onChange={(e) => setVisitorInfo((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-primary transition-colors font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-medium text-neutral-300 uppercase tracking-wider ml-1">
                          Email Address <span className="text-neutral-500 normal-case">(Where Rohan can reach you)</span>
                        </label>
                        <input
                          required
                          type="email"
                          placeholder="e.g. alex@company.com"
                          value={visitorInfo.email}
                          onChange={(e) => setVisitorInfo((prev) => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-primary transition-colors font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-0.5 flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={!visitorInfo.name || !visitorInfo.email}
                        className="flex-1 py-2 sm:py-2.5 bg-white text-black font-semibold text-xs tracking-tight rounded-xl shadow-md hover:bg-neutral-200 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                      >
                        Introduce &amp; Chat
                      </button>
                      <button
                        type="button"
                        onClick={handleGuestSkip}
                        className="group py-2 sm:py-2.5 px-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-[11px] font-mono font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Continue as Guest</span>
                        <ArrowRight size={13} className="text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                /* Chat Messages History */
                <div className="space-y-4 pb-2 w-full">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} w-full`}
                    >
                      <div
                        className={`max-w-[88%] p-3.5 md:p-4 rounded-2xl text-xs leading-relaxed font-medium break-words ${
                          msg.role === "user"
                            ? "bg-primary text-white rounded-tr-none shadow-[0_8px_20px_rgba(14,165,233,0.25)]"
                            : "bg-white/[0.05] border border-white/10 text-white/90 rounded-tl-none shadow-lg backdrop-blur-md"
                        }`}
                      >
                        <div>
                          {msg.role === "bot" && msg.isTyping ? (
                            <TypewriterContent
                              content={msg.content}
                              isTyping={true}
                              renderFn={renderFormattedText}
                              onDone={() => {
                                setMessages((prev) =>
                                  prev.map((m) =>
                                    m.id === msg.id ? { ...m, isTyping: false } : m
                                  )
                                );
                              }}
                            />
                          ) : (
                            renderFormattedText(msg.content)
                          )}
                        </div>

                        {/* Interactive Project Card */}
                        {msg.miniProjectCard && (
                          <div className="mt-3 rounded-xl border border-white/10 bg-black/40 overflow-hidden shadow-lg">
                            {msg.miniProjectCard.previewImage && (
                              <div className="relative w-full h-32 overflow-hidden bg-black/60">
                                <Image
                                  src={msg.miniProjectCard.previewImage}
                                  alt={msg.miniProjectCard.title}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/90 text-white shadow">
                                  {msg.miniProjectCard.category}
                                </span>
                              </div>
                            )}
                            <div className="p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <h5 className="font-black text-white text-sm tracking-tight">
                                  {msg.miniProjectCard.title}
                                </h5>
                                <span className="text-[10px] text-white/50 font-mono">
                                  {msg.miniProjectCard.year}
                                </span>
                              </div>
                              <p className="text-[11px] text-white/70 line-clamp-2">
                                {msg.miniProjectCard.tagline}
                              </p>
                              {msg.miniProjectCard.techStack && msg.miniProjectCard.techStack.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {msg.miniProjectCard.techStack.slice(0, 4).map((tech, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 rounded text-[9px] font-semibold bg-white/[0.06] text-white/80 border border-white/[0.08]"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="pt-2 flex items-center gap-2">
                                <Link
                                  href={`/projects/${msg.miniProjectCard.slug}`}
                                  className="flex-1 py-1.5 px-3 rounded-lg bg-primary text-white text-center text-[10px] font-bold uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-1 shadow"
                                >
                                  <span>View Case Study</span>
                                  <ArrowUpRight size={12} />
                                </Link>
                                {msg.miniProjectCard.liveUrl && (
                                  <a
                                    href={msg.miniProjectCard.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-white/80 hover:text-white hover:bg-white/[0.08] transition-colors"
                                    title="Open Live Deployment"
                                  >
                                    <ExternalLink size={14} />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Interactive Action Prompt */}
                        {msg.actionPrompt && (
                          <div className="mt-3 p-3.5 rounded-xl border border-primary/30 bg-primary/[0.08] space-y-2.5">
                            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-wider text-[10px]">
                              {msg.actionPrompt.type === "meeting_redirect" ? (
                                <Calendar size={12} />
                              ) : msg.actionPrompt.type === "upload_project_image" ? (
                                <Upload size={12} />
                              ) : (
                                <Terminal size={12} />
                              )}
                              <span>{msg.actionPrompt.title}</span>
                            </div>
                            <p className="text-[11px] text-white/80 leading-relaxed font-medium">
                              {msg.actionPrompt.message}
                            </p>

                            {/* Option B Staged Confirmation Card */}
                            {msg.actionPrompt.type === "confirm_action" && msg.actionPrompt.meta && (
                              <div className="pt-1 space-y-2.5">
                                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 space-y-3 shadow-inner">
                                  {(() => {
                                    const meta = msg.actionPrompt.meta as any;
                                    const currentVal = meta.currentValue;
                                    const proposedVal = meta.proposedValue;
                                    const state = stagedState[msg.id] || { status: "idle" };

                                    const formatVal = (v: any) => {
                                      if (v === undefined || v === null || v === "") {
                                        return <span className="italic opacity-50">Empty</span>;
                                      }
                                      if (typeof v === "string") return v;
                                      if (Array.isArray(v)) {
                                        return (
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {v.map((item, i) => (
                                              <span
                                                key={i}
                                                className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-white/90"
                                              >
                                                {typeof item === "string" ? item : JSON.stringify(item)}
                                              </span>
                                            ))}
                                          </div>
                                        );
                                      }
                                      if (typeof v === "object") {
                                        return (
                                          <div className="space-y-1.5 mt-1 text-[10.5px]">
                                            {Object.entries(v).map(([k, val]) => (
                                              <div key={k} className="flex flex-col gap-0.5">
                                                <span className="text-white/40 uppercase text-[9px] font-mono tracking-wider font-bold">
                                                  {k}:
                                                </span>
                                                <div className="text-white/90">
                                                  {Array.isArray(val) ? (
                                                    <div className="flex flex-wrap gap-1">
                                                      {val.map((item, i) => (
                                                        <span
                                                          key={i}
                                                          className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono"
                                                        >
                                                          {String(item)}
                                                        </span>
                                                      ))}
                                                    </div>
                                                  ) : (
                                                    String(val)
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      }
                                      return String(v);
                                    };

                                    return (
                                      <>
                                        {/* Target and Action Header */}
                                        <div className="flex items-center justify-between text-[10px] border-b border-amber-500/20 pb-2">
                                          <span className="font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                            <ShieldAlert size={12} />
                                            <span>{meta.targetName || "Database Target"}</span>
                                          </span>
                                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] uppercase border border-amber-500/30 font-bold">
                                            Staged Proposal
                                          </span>
                                        </div>

                                        {/* Comparison Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                          {/* Current Value */}
                                          <div className="rounded-lg bg-black/40 border border-white/5 p-2.5">
                                            <div className="text-[9px] font-mono uppercase text-red-400/90 mb-1 flex items-center gap-1 font-bold">
                                              <span>Current (Live Site)</span>
                                            </div>
                                            <div className="text-white/70 break-words text-[10.5px]">
                                              {formatVal(currentVal)}
                                            </div>
                                          </div>

                                          {/* Proposed Value */}
                                          <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/30 p-2.5">
                                            <div className="text-[9px] font-mono uppercase text-emerald-400 mb-1 flex items-center gap-1 font-bold">
                                              <Check size={10} />
                                              <span>Proposed (Stage)</span>
                                            </div>
                                            <div className="text-emerald-100 break-words text-[10.5px] font-medium">
                                              {formatVal(proposedVal)}
                                            </div>
                                          </div>
                                        </div>

                                        {/* State Feedback or Buttons */}
                                        {state.status === "approved" ? (
                                          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                                            <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                                            <span>{state.message || "Approved & applied to PostgreSQL live site!"}</span>
                                          </div>
                                        ) : state.status === "discarded" ? (
                                          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs font-medium">
                                            <X size={15} className="shrink-0 text-white/40" />
                                            <span>{state.message || "Staged update was discarded. Zero changes made."}</span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2 pt-1">
                                            {(() => {
                                              const isDelete = meta.changeType === "delete" || meta.actionType === "delete_project";
                                              return (
                                                <>
                                                  <button
                                                    type="button"
                                                    disabled={state.status === "applying"}
                                                    onClick={() => handleApproveStaged(msg.id, meta.actionType, meta.payload)}
                                                    className={`flex-1 py-1.5 px-3 rounded-lg active:scale-95 text-white font-bold text-[10.5px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer ${
                                                      isDelete
                                                        ? "bg-red-600 hover:bg-red-500 shadow-red-900/40"
                                                        : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30"
                                                    }`}
                                                  >
                                                    {state.status === "applying" ? (
                                                      <>
                                                        <Loader2 size={12} className="animate-spin" />
                                                        <span>{isDelete ? "Deleting from PostgreSQL..." : "Applying to PostgreSQL..."}</span>
                                                      </>
                                                    ) : (
                                                      <>
                                                        {isDelete ? <Trash2 size={12} /> : <ShieldCheck size={12} />}
                                                        <span>{isDelete ? "Approve & Delete from Live" : "Approve & Apply to Live"}</span>
                                                      </>
                                                    )}
                                                  </button>
                                                  <button
                                                    type="button"
                                                    disabled={state.status === "applying"}
                                                    onClick={() => handleDiscardStaged(msg.id)}
                                                    className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-white/70 hover:text-white font-medium text-[10.5px] uppercase tracking-wider border border-white/10 transition-all disabled:opacity-50 cursor-pointer"
                                                  >
                                                    {isDelete ? "Cancel / Keep" : "Discard"}
                                                  </button>
                                                </>
                                              );
                                            })()}
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            )}

                            {/* Inline Form: Add Tech Skill */}
                            {msg.actionPrompt.type === "form_add_skill" && (
                              <InlineAddSkillForm
                                msgId={msg.id}
                                onSuccess={(name, cat) => {
                                  router.refresh();
                                  if (soundEnabled) playChime("receive");
                                }}
                              />
                            )}

                            {/* Inline Form: Add Project */}
                            {msg.actionPrompt.type === "form_add_project" && (
                              <InlineAddProjectForm
                                msgId={msg.id}
                                onStagedProject={(stagedProject) => {
                                  setMessages((prev) =>
                                    prev.map((m) =>
                                      m.id === msg.id
                                        ? {
                                            ...m,
                                            actionPrompt: {
                                              type: "upload_project_image",
                                              title: `Upload Banner for "${stagedProject.title}"`,
                                              message: `Draft created from GitHub! Upload the preview banner below:`,
                                              meta: { stagedProject },
                                            },
                                          }
                                        : m
                                    )
                                  );
                                  if (soundEnabled) playChime("receive");
                                }}
                                onCreatedManual={(title, slug) => {
                                  router.refresh();
                                  if (soundEnabled) playChime("receive");
                                  setMessages((prev) => [
                                    ...prev,
                                    {
                                      id: `created_${Date.now()}`,
                                      role: "bot",
                                      content: `🎉 Project **"${title}"** successfully created and published! You can view it live at [/projects/${slug}](/projects/${slug}).`,
                                    },
                                  ]);
                                }}
                              />
                            )}

                            {/* Dual Image Upload Widget for Staged Project (Main Thumbnail + Hover Image) */}
                            {msg.actionPrompt.type === "upload_project_image" &&
                            msg.actionPrompt.meta &&
                            Boolean(msg.actionPrompt.meta.stagedProject) ? (
                              <div className="pt-1">
                                <DualProjectImageUploader
                                  msgId={msg.id}
                                  stagedProject={msg.actionPrompt.meta.stagedProject}
                                  onPublished={(publishedSlug, card) => {
                                    router.refresh();
                                    if (soundEnabled) playChime("receive");
                                    setMessages((prev) => [
                                      ...prev,
                                      {
                                        id: `pub_${Date.now()}`,
                                        role: "bot",
                                        content: `🎉 Project **"${card.title}"** published successfully to PostgreSQL! You can explore the live case study at [/projects/${publishedSlug}](/projects/${publishedSlug}).`,
                                        miniProjectCard: card,
                                      },
                                    ]);
                                  }}
                                />
                              </div>
                            ) : null}

                            {msg.actionPrompt.destinationUrl && (
                              <Link
                                href={msg.actionPrompt.destinationUrl}
                                className="inline-flex items-center gap-1.5 mt-1 px-3 py-2 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(14,165,233,0.3)] hover:brightness-110 active:scale-95 transition-all"
                              >
                                <span>Go to Meeting Scheduler</span>
                                <ArrowUpRight size={12} />
                              </Link>
                            )}
                          </div>
                        )}

                        {msg.timestamp && (
                          <div
                            className={`text-[9px] mt-1.5 opacity-40 font-mono ${
                              msg.role === "user" ? "text-right text-white" : "text-left text-white/70"
                            }`}
                          >
                            {msg.timestamp}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/[0.05] border border-white/10 px-3.5 py-2 rounded-2xl flex items-center gap-2 text-white/60 text-xs font-medium backdrop-blur-md">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-pulse delay-150" />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse delay-300" />
                        </div>
                        <span className="text-white/50 text-[11px] font-mono ml-1">Aru is thinking...</span>
                      </div>
                    </div>
                  )}

                  <div ref={scrollRef} className="h-1 w-full" />
                </div>
              )}
            </div>

            {/* Quick Suggestion Chips */}
            {isReadyForChat && (
              <div className="px-3 sm:px-4 py-2 border-t border-white/[0.06] bg-black/40 overflow-x-auto touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex items-center gap-1.5 shrink-0">
                {activeChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLoading}
                    onClick={() => executeSend(chip.query)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight border border-white/10 bg-white/[0.04] text-white/75 hover:text-white hover:border-primary/50 hover:bg-primary/[0.08] transition-all disabled:opacity-40 shrink-0"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            {isReadyForChat && (
              <div className="p-3 md:p-4 border-t border-white/10 bg-black/60 shrink-0">
                <form onSubmit={handleSendMessage} className="relative flex items-end gap-2 bg-white/[0.04] border border-white/10 rounded-2xl p-1.5 focus-within:border-primary/60 transition-all">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={handleTextareaChange}
                    onKeyDown={handleTextareaKeyDown}
                    placeholder={
                      isAdmin
                        ? "Execute co-pilot command (Shift+Enter for newline)..."
                        : "Ask about Rohan's projects, architecture... (Shift+Enter for newline)"
                    }
                    className="flex-1 bg-transparent border-0 px-3 py-2 text-white text-xs focus:outline-none font-medium placeholder:text-white/30 resize-none max-h-28 min-h-[36px] leading-relaxed [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-8 h-8 shrink-0 bg-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-20 cursor-pointer shadow-sm mb-0.5 mr-0.5 active:scale-95"
                    aria-label="Send message"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Trigger Button - only displayed when chat is closed */}
      {!isOpen && (
        <Tooltip text={isAdmin ? "Aru • Executive Co-pilot" : "Chat with Aru"} position="left">
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleOpenToggle}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white relative group overflow-hidden shadow-2xl transition-all ${
              isAdmin
                ? "bg-gradient-to-br from-amber-500 via-primary to-accent shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                : "bg-gradient-to-br from-primary to-accent shadow-[0_0_30px_rgba(14,165,233,0.4)]"
            }`}
            aria-label="Open AI assistant"
          >
            <div
              className={`absolute inset-0 rounded-full animate-ping opacity-25 group-hover:opacity-45 ${
                isAdmin ? "bg-amber-400" : "bg-primary"
              }`}
            />
            <div className="relative w-full h-full p-1">
              <div className="w-full h-full rounded-full overflow-hidden relative">
                <Image
                  src={avatarUrl}
                  alt="Aru AI"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.button>
        </Tooltip>
      )}
    </div>
  );
}
