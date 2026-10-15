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
  Terminal,
  Copy,
  Check,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { chatWithAru } from "@/actions/ai";
import { saveLead } from "@/actions/leads";
import { uploadImage } from "@/actions/upload";
import { commitProjectWithImage } from "@/actions/aiAdmin";
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
  const [displayedLength, setDisplayedLength] = useState(isTyping ? 0 : content.length);

  useEffect(() => {
    if (!isTyping) {
      setDisplayedLength(content.length);
      return;
    }
    let current = 0;
    const step = Math.max(5, Math.floor(content.length / 18));
    const interval = setInterval(() => {
      current += step;
      if (current >= content.length) {
        setDisplayedLength(content.length);
        clearInterval(interval);
        if (onDone) onDone();
      } else {
        setDisplayedLength(current);
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

export default function Chatbot() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin =
    (session?.user as any)?.role === "admin" &&
    (session?.user as any)?.isAdmin === true;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "bot",
      content:
        "Hello! I am Aru, personal AI concierge for Rohan Mia. How can I assist you with his projects, architecture, or scheduling today?",
    },
  ]);
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

  const isReadyForChat = isIdentified || isAdmin;

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollTarget = useRef(0);
  const animationFrame = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      setIsLoading(true);
      if (soundEnabled) playChime("send");

      try {
        const vid = typeof window !== "undefined" ? localStorage.getItem("visitor_id") : null;
        const updatedHistory = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const result = await chatWithAru(updatedHistory, textToSend, vid);

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    executeSend(input);
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
          content: `Welcome, ${visitorInfo.name}! I am ready to guide you through Rohan's engineering case studies, tech stack, or schedule a conversation. What would you like to explore?`,
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

  const renderInlineMarkdown = (str: string, keyPrefix: string) => {
    const tokenRegex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    const tokens = str.split(tokenRegex);

    return tokens.map((token, i) => {
      const tokenKey = `${keyPrefix}_tok_${i}`;

      // Link match [label](url)
      const linkMatch = token.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        const label = linkMatch[1];
        let url = linkMatch[2];
        if (url.includes("localhost:3000")) {
          url = url.replace(/https?:\/\/localhost:3000/, "");
        }
        return (
          <Link
            key={tokenKey}
            href={url}
            className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-bold underline underline-offset-4 decoration-primary/50 transition-colors mx-0.5"
          >
            <span>{label}</span>
            <ArrowUpRight size={11} className="inline opacity-70" />
          </Link>
        );
      }

      // Bold match **text**
      const boldMatch = token.match(/^\*\*(.*?)\*\*$/);
      if (boldMatch) {
        return (
          <strong key={tokenKey} className="font-bold text-white">
            {boldMatch[1]}
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
    { label: "⚡ Add Tech Skill", query: "Autonomously add Redis to my backend tech stack." },
    { label: "🚀 Stage GitHub", query: "I have a GitHub repo to synthesize into a case study." },
  ];

  const activeChips = isAdmin ? adminSuggestions : visitorSuggestions;

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 md:right-8 z-[70] chatbot-container pointer-events-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={wrapperRef}
            initial={{ opacity: 0, y: 16, scale: 0.95, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", damping: 28, stiffness: 360 }}
            className="w-[calc(100vw-2rem)] sm:w-[410px] md:w-[430px] max-h-[calc(100vh-5.5rem)] h-[min(540px,calc(100vh-5.5rem))] border border-white/[0.12] rounded-[24px] shadow-[0_25px_80px_rgba(0,0,0,0.85),0_0_50px_rgba(14,165,233,0.08)] flex flex-col overflow-hidden backdrop-blur-3xl bg-[#0b0d13]/95 pointer-events-auto ring-1 ring-white/[0.08]"
          >
            {/* Header */}
            <div className="p-4 md:p-5 border-b border-white/10 flex items-center justify-between pointer-events-auto transition-colors bg-gradient-to-r from-primary/15 via-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/40 bg-background/50 relative shadow-lg shadow-primary/20">
                    <Image
                      src="/aru-avatar.png"
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
                    Online
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
              className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-5 space-y-4 relative z-10 pointer-events-auto touch-pan-y [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {!isReadyForChat ? (
                /* Welcome & Lead Identification Card */
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 py-1"
                >
                  <div className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] space-y-1.5">
                    <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                      <span>Hey there!</span>
                      <span>👋</span>
                    </h4>
                    <p className="text-xs text-white/70 leading-relaxed font-normal">
                      I&apos;m Aru, Rohan&apos;s digital assistant. Ask me anything about his projects, tech stack, or collaborate directly.
                    </p>
                  </div>

                  <form onSubmit={handleLeadSubmit} className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-primary uppercase tracking-wider ml-1">
                        Full Name
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Alex Morgan"
                        value={visitorInfo.name}
                        onChange={(e) => setVisitorInfo((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-primary uppercase tracking-wider ml-1">
                        Email Address
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="e.g. alex@company.com"
                        value={visitorInfo.email}
                        onChange={(e) => setVisitorInfo((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={!visitorInfo.name || !visitorInfo.email}
                        className="flex-1 py-2.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                      >
                        Start Chat
                      </button>
                      <button
                        type="button"
                        onClick={handleGuestSkip}
                        className="py-2.5 px-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-[11px] font-semibold text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Continue as Guest →
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

                            {/* Inline Image Upload Widget for Staged Project */}
                            {msg.actionPrompt.type === "upload_project_image" &&
                            msg.actionPrompt.meta &&
                            Boolean(msg.actionPrompt.meta.stagedProject) ? (
                              <div className="pt-1">
                                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-primary/40 bg-black/40 hover:bg-primary/10 hover:border-primary transition-all cursor-pointer text-xs text-white/90 font-bold">
                                  {uploadingForMsgId === msg.id ? (
                                    <>
                                      <Loader2 size={14} className="animate-spin text-primary" />
                                      <span>Uploading Banner & Publishing to PostgreSQL...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload size={14} className="text-primary" />
                                      <span>Click to Select Preview Banner Image</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={uploadingForMsgId === msg.id}
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          const proj = msg.actionPrompt?.meta?.stagedProject;
                                          if (file && proj) {
                                            handleInlineImageUpload(file, proj, msg.id);
                                          }
                                        }}
                                      />
                                    </>
                                  )}
                                </label>
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
              <div className="px-4 py-2 border-t border-white/[0.06] bg-black/40 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex items-center gap-1.5">
                {activeChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLoading}
                    onClick={() => executeSend(chip.query)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight border border-white/10 bg-white/[0.04] text-white/75 hover:text-white hover:border-primary/50 hover:bg-primary/[0.08] transition-all disabled:opacity-40"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            {isReadyForChat && (
              <div className="p-3 md:p-4 border-t border-white/10 bg-black/60">
                <form onSubmit={handleSendMessage} className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      isAdmin
                        ? "Execute co-pilot command (e.g. daily briefing)..."
                        : "Ask about Rohan's projects, architecture, or stack..."
                    }
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white text-xs focus:outline-none focus:border-primary/60 transition-all font-medium placeholder:text-white/30"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary/20 text-primary hover:bg-primary hover:text-white rounded-lg flex items-center justify-center transition-all disabled:opacity-20 cursor-pointer shadow-sm"
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
                  src="/aru-avatar.png"
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
