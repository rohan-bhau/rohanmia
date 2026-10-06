"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Loader2,
  ArrowUpRight,
  Pencil,
  ArrowRight,
  Sparkles,
  Camera,
  Check,
} from "lucide-react";
import {
  fetchAdminGuestbook,
  createAdminGuestbookEntry,
  updateAdminGuestbookEntry,
  removeAdminGuestbookEntry,
} from "@/actions/adminGuestbook";
import { DbGuestbookRow } from "@/lib/db/guestbook";
import { useToast } from "@/components/admin/ui/Toast";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import AdminModal from "@/components/admin/ui/AdminModal";
import ImageCropModal from "@/components/admin/ui/ImageCropModal";
import { useThemeAccent } from "@/components/theme/ThemeProvider";

// =========================================================================
// PLAYFUL DOODLE ACCENTS & SCALLOPED DIVIDERS (Exact Match to Public Guestbook)
// =========================================================================
const SparkleStarDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <path
      d="M50 0 C52 35 65 48 100 50 C65 52 52 65 50 100 C48 65 35 52 0 50 C35 48 48 35 50 0 Z"
      fill="currentColor"
      opacity="0.85"
    />
  </svg>
);

const LightningDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 2L3 14h7v8l11-14h-8l0-6z" />
  </svg>
);

const SmileyDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 126 138" fill="none" className={className}>
    <path
      d="M 41.415 66.638 C 41.415 67.654 41.122 69.39 42.621 69.39 C 43.635 69.39 45.145 68.037 45.203 66.982 M 76.202 63.541 C 76.202 65.768 75.913 67.317 78.767 66.561 C 80.82 66.019 83.436 64.364 83.436 61.993 M 24.537 86.593 C 30.682 92.172 36.278 98.044 44.209 101.158 C 49.42 103.205 55.301 102.764 60.779 102.764 C 67.156 102.764 72.485 100.923 77.963 97.68 C 88.004 91.734 98.735 83.23 104.522 72.87"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="4.5"
    />
    <path
      d="M 47.084 36.922 C 35.57 36.922 28.438 39.099 19.85 47.626 C 9.976 57.432 4.786 69.445 3.23 83.019 C 1.745 95.976 2.049 107.71 11.267 117.63 C 25.85 133.321 50.781 136.794 71.119 134.896 C 88.897 133.236 107.063 122.271 115.52 106.105 C 125.151 87.696 125.797 62.476 118.563 43.251 C 114.57 32.64 107.572 23.551 99.055 16.14 C 89.728 8.025 78.284 5.146 66.241 3.639"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="4.5"
    />
  </svg>
);

const WaveDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 191 117" fill="none" className={className}>
    <path
      d="M43.8532 21.6587C35.2616 30.8676 9.64144 58.5872 18.7959 49.9377C28.5802 40.6931 37.719 30.7576 47.412 21.4126C49.1624 19.725 50.8448 17.9477 52.7717 16.4649C32.8988 39.0849 29.2779 42.82 17.9058 55.5342C14.0593 59.8346 10.1855 64.113 6.46175 68.5201C4.9633 70.2936 -2.50903 79.0773 5.38398 72.0587C19.7011 59.3276 33.0142 45.4381 46.9955 32.3412C49.5417 29.9561 51.9606 27.4088 54.7427 25.3036C59.6009 21.6276 46.7607 34.5124 42.6209 38.9821C31.7456 50.724 22.2321 60.8066 11.6275 72.7703C28.1593 59.0374 43.9271 42.8651 60.1992 27.1899"
      stroke="white"
      strokeLinecap="round"
      strokeWidth="2.5"
    />
  </svg>
);

const HeartDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GeometricOrbitDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <ellipse
      cx="50"
      cy="50"
      rx="40"
      ry="16"
      transform="rotate(-30 50 50)"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeDasharray="4 4"
    />
    <ellipse
      cx="50"
      cy="50"
      rx="40"
      ry="16"
      transform="rotate(30 50 50)"
      stroke="currentColor"
      strokeWidth="2.5"
    />
    <circle cx="50" cy="50" r="5" fill="currentColor" />
  </svg>
);

const SunburstDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <circle cx="50" cy="50" r="14" stroke="currentColor" strokeWidth="3" />
    <path
      d="M50 12v12M50 76v12M12 50h12M76 50h12M23 23l9 9M68 68l9 9M23 77l9-9M68 32l9-9"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
  </svg>
);

const StarBurstDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <path
      d="M50 8 C50 34 66 50 92 50 C66 50 50 66 50 92 C50 66 34 50 8 50 C34 50 50 34 50 8 Z"
      fill="currentColor"
      opacity="0.8"
    />
  </svg>
);

// Wavy / Scallop Divider Cut
const WavyDivider = () => (
  <svg
    className="absolute right-0 bottom-0 left-0 w-full z-10"
    fill="none"
    preserveAspectRatio="none"
    viewBox="0 0 400 20"
  >
    <path
      className="fill-[#0c0e15]"
      d="M0 20V12C10 12 10 4 20 4C30 4 30 12 40 12C50 12 50 4 60 4C70 4 70 12 80 12C90 12 90 4 100 4C110 4 110 12 120 12C130 12 130 4 140 4C150 4 150 12 160 12C170 12 170 4 180 4C190 4 190 12 200 12C210 12 210 4 220 4C230 4 230 12 240 12C250 12 250 4 260 4C270 4 270 12 280 12C290 12 290 4 300 4C310 4 310 12 320 12C330 12 330 4 340 4C350 4 350 12 360 12C370 12 370 4 380 4C390 4 390 12 400 12V20H0Z"
    />
    <path
      d="M0 12C10 12 10 4 20 4C30 4 30 12 40 12C50 12 50 4 60 4C70 4 70 12 80 12C90 12 90 4 100 4C110 4 110 12 120 12C130 12 130 4 140 4C150 4 150 12 160 12C170 12 170 4 180 4C190 4 190 12 200 12C210 12 210 4 220 4C230 4 230 12 240 12C250 12 250 4 260 4C270 4 270 12 280 12C290 12 290 4 300 4C310 4 310 12 320 12C330 12 330 4 340 4C350 4 350 12 360 12C370 12 370 4 380 4C390 4 390 12 400 12"
      stroke="rgba(255,255,255,0.12)"
      strokeWidth="1.2"
    />
  </svg>
);

// 8 Distinct Rich Thematic Color Palettes (Curated for authentic variety)
const THEME_STYLES = {
  violet: {
    cardBg:
      "radial-gradient(120% 100% at 30% 20%, rgba(88, 28, 135, 0.95), rgba(30, 10, 60, 0.98))",
    accent: "#c084fc",
    DoodleComponent: SparkleStarDoodle,
  },
  emerald: {
    cardBg:
      "radial-gradient(120% 100% at 30% 20%, rgba(6, 78, 59, 0.95), rgba(4, 35, 27, 0.98))",
    accent: "#34d399",
    DoodleComponent: LightningDoodle,
  },
  crimson: {
    cardBg:
      "radial-gradient(120% 100% at 30% 20%, rgba(190, 18, 60, 0.95), rgba(76, 5, 25, 0.98))",
    accent: "#fb7185",
    DoodleComponent: HeartDoodle,
  },
  sapphire: {
    cardBg:
      "radial-gradient(120% 100% at 30% 20%, rgba(29, 78, 216, 0.95), rgba(15, 23, 42, 0.98))",
    accent: "#60a5fa",
    DoodleComponent: GeometricOrbitDoodle,
  },
  amber: {
    cardBg:
      "radial-gradient(120% 100% at 30% 20%, rgba(180, 83, 9, 0.95), rgba(69, 26, 3, 0.98))",
    accent: "#fbbf24",
    DoodleComponent: SunburstDoodle,
  },
  teal: {
    cardBg:
      "radial-gradient(120% 100% at 30% 20%, rgba(13, 148, 136, 0.95), rgba(4, 47, 46, 0.98))",
    accent: "#2dd4bf",
    DoodleComponent: WaveDoodle,
  },
  rose: {
    cardBg:
      "radial-gradient(120% 100% at 30% 20%, rgba(157, 23, 77, 0.95), rgba(60, 7, 30, 0.98))",
    accent: "#f472b6",
    DoodleComponent: StarBurstDoodle,
  },
  slate: {
    cardBg:
      "radial-gradient(120% 100% at 30% 20%, rgba(39, 39, 42, 0.95), rgba(18, 18, 24, 0.98))",
    accent: "#a1a1aa",
    DoodleComponent: SmileyDoodle,
  },
} as const;

type ThemeKey = keyof typeof THEME_STYLES;

const PALETTE_CYCLE: ThemeKey[] = [
  "emerald",
  "sapphire",
  "amber",
  "rose",
  "teal",
  "crimson",
  "slate",
  "violet",
];

export default function AdminGuestbookPage() {
  const { currentTheme } = useThemeAccent();
  const { showToast } = useToast();
  const [entries, setEntries] = useState<DbGuestbookRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Composer State
  const [composeMessage, setComposeMessage] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>("violet");
  const [adminAvatar, setAdminAvatar] = useState(
    "/images/about/hero-profile.png",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Note State
  const [editingEntry, setEditingEntry] = useState<DbGuestbookRow | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [editTheme, setEditTheme] = useState<ThemeKey>("violet");
  const [editAvatar, setEditAvatar] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Avatar Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [isCropOpen, setIsCropOpen] = useState(false);

  // Deletion Modal
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadEntries = useCallback(async () => {
    setLoading(true);
    const res = await fetchAdminGuestbook();
    if (res.success && res.entries) {
      setEntries(res.entries);
    } else {
      showToast(res.error || "Failed to load guestbook signatures", "error");
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadEntries();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadEntries]);

  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await createAdminGuestbookEntry({
        message: composeMessage.trim(),
        theme: selectedTheme,
        avatar: adminAvatar,
      });

      if (res.success && res.entry) {
        showToast("Guestbook signature posted successfully.", "success");
        setEntries((prev) => [res.entry!, ...prev]);
        setComposeMessage("");
      } else {
        showToast(res.error || "Failed to post signature", "error");
      }
    } catch {
      showToast("An error occurred while posting signature", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (entry: DbGuestbookRow) => {
    setEditingEntry(entry);
    setEditMessage(entry.message);
    setEditTheme(
      entry.theme && entry.theme in THEME_STYLES
        ? (entry.theme as ThemeKey)
        : "violet",
    );
    setEditAvatar(entry.avatar || adminAvatar);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry || !editMessage.trim()) return;
    setIsSavingEdit(true);
    try {
      const res = await updateAdminGuestbookEntry({
        id: editingEntry.id,
        message: editMessage.trim(),
        theme: editTheme,
        avatar: editAvatar,
      });

      if (res.success && res.entry) {
        showToast("Note updated successfully in PostgreSQL.", "success");
        setEntries((prev) =>
          prev.map((item) => (item.id === editingEntry.id ? res.entry! : item)),
        );
        setEditingEntry(null);
      } else {
        showToast(res.error || "Failed to update note", "error");
      }
    } catch {
      showToast("An error occurred while updating note", "error");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    startTransition(async () => {
      const res = await removeAdminGuestbookEntry(deletingId);
      if (res.success) {
        showToast("Signature removed.", "success");
        setEntries((prev) => prev.filter((e) => e.id !== deletingId));
      } else {
        showToast(res.error || "Failed to delete entry", "error");
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-8 max-w-7xl px-4 sm:px-8 py-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1.5">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
            COMMUNITY &amp; VISITOR SIGNATURES
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white tracking-tight">
            The{" "}
            <span
              className="font-serif italic font-normal text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${currentTheme.primary} 100%)`,
              }}
            >
              Guestbook
            </span>
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            {entries.length} signature(s) stored in PostgreSQL &bull; Post or
            edit notes directly as Rohan Mia or moderate visitor signatures
          </p>
        </div>

        <Link
          href="/guestbook"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-neutral-300 hover:text-white border border-white/[0.08] transition-colors self-start sm:self-auto"
        >
          <span>Public Wall</span>
          <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* Grid of Guestbook Cards (3 Cards Per Row on Large Screens) */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500 font-mono text-xs">
          <Loader2 size={24} className="animate-spin text-white" />
          <span>Loading guestbook ledger...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
          {/* ========================================================
              CARD 1: ADMIN COMPOSE CARD (EXACT IN-CARD COMPOSE BOX)
             ======================================================== */}
          <div className="relative z-10 flex flex-col overflow-hidden rounded-2xl bg-[#0c0e15] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:border-white/20 transition-all duration-300 cursor-default">
            <form
              onSubmit={handleComposeSubmit}
              className="relative flex flex-col justify-between h-full p-5 text-white"
              style={{
                background:
                  THEME_STYLES[selectedTheme]?.cardBg ||
                  THEME_STYLES.violet.cardBg,
                minHeight: "260px",
              }}
            >
              {/* Top Bar: Clickable Avatar + Name + Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomAvatarUrl(adminAvatar);
                      setIsAvatarModalOpen(true);
                    }}
                    className="relative size-9 rounded-full overflow-hidden border border-white/20 shadow-md group/avatar cursor-pointer shrink-0 bg-rose-600"
                    title="Click to change your avatar"
                  >
                    <Image
                      src={adminAvatar}
                      alt="Rohan Mia"
                      fill
                      unoptimized
                      className="object-cover object-top"
                      onError={(e) => {
                        e.currentTarget.src = "/images/about/hero-profile.png";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Camera size={12} />
                    </div>
                  </button>

                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-sm text-white leading-tight">
                      Rohan Mia
                    </span>
                    <span className="text-xs text-emerald-400 font-medium">
                      Composing...
                    </span>
                  </div>
                </div>

                <SparkleStarDoodle className="size-6 text-white/30" />
              </div>

              {/* Center: Dashed Input Box */}
              <div className="my-3 relative rounded-xl border border-dashed border-white/25 bg-black/15 p-3 focus-within:border-white/50 transition-colors">
                <textarea
                  required
                  maxLength={100}
                  rows={2}
                  value={composeMessage}
                  onChange={(e) => setComposeMessage(e.target.value)}
                  placeholder="Type something nice..."
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Theme Color Picker Row */}
              <div className="flex items-center justify-between gap-1 mb-2 pt-1 border-t border-white/10">
                <span className="text-[10px] font-mono text-white/60 uppercase">
                  Theme
                </span>
                <div className="flex items-center gap-1.5">
                  {PALETTE_CYCLE.map((th) => (
                    <button
                      key={th}
                      type="button"
                      onClick={() => setSelectedTheme(th)}
                      className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer border ${
                        selectedTheme === th
                          ? "scale-125 border-white shadow-xs"
                          : "border-white/30 hover:scale-110"
                      }`}
                      style={{ backgroundColor: THEME_STYLES[th].accent }}
                      title={th}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom Bar: Character count + Submit Arrow Button */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-xs text-white/50 font-mono">
                  <Pencil size={12} className="rotate-45" />
                  <span>{composeMessage.length} / 100</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !composeMessage.trim()}
                  className="size-9 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-md"
                  title="Post to Guestbook"
                >
                  {isSubmitting ? (
                    <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ArrowRight size={15} />
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ========================================================
              CARDS 2+: COMMUNITY MESSAGE CARDS LOADED FROM POSTGRESQL
              (Exact match to public guestbook card styling)
             ======================================================== */}
          {entries.map((entry, idx) => {
            const paletteTheme =
              entry.theme && entry.theme in THEME_STYLES
                ? (entry.theme as ThemeKey)
                : PALETTE_CYCLE[idx % PALETTE_CYCLE.length];
            const themeConfig =
              THEME_STYLES[paletteTheme] || THEME_STYLES.violet;
            const Doodle = themeConfig.DoodleComponent;
            const isAdminMessage =
              entry.provider === "admin" ||
              entry.email === "rohanmia.org@gmail.com" ||
              entry.name === "Rohan Mia";

            return (
              <div
                key={entry.id}
                className="relative z-10 group flex flex-col overflow-hidden rounded-2xl bg-[#0c0e15] border border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.65)] hover:border-white/25 transition-all duration-300 cursor-default"
              >
                {/* Colored Jewel-Tone Upper Body */}
                <div
                  className="relative flex min-h-[190px] w-full flex-1 flex-col items-center justify-center overflow-hidden p-6 pb-12 text-center cursor-default"
                  style={{ background: themeConfig.cardBg }}
                >
                  {/* Background Doodle Accent */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden opacity-30 group-hover:opacity-45 transition-opacity"
                    style={{ color: themeConfig.accent }}
                  >
                    <Doodle className="absolute top-2 right-2 size-20 rotate-12" />
                    <SparkleStarDoodle className="absolute -bottom-2 -left-2 size-16 opacity-20" />
                  </div>

                  {/* Centered Message Content */}
                  <p className="relative z-10 font-bold text-base sm:text-lg text-white leading-snug tracking-tight text-balance line-clamp-6 drop-shadow-md">
                    {entry.message}
                  </p>

                  <WavyDivider />
                </div>

                {/* Bottom Information Tray (Clean Avatar, Name, Date, Edit & Delete) */}
                <div className="flex items-center justify-between px-4 pt-2.5 pb-3 bg-[#0c0e15] cursor-default">
                  {/* Left: Author Avatar + Name + Date (Clean, no IDs, no emails, no provider labels) */}
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="relative size-7 rounded-full overflow-hidden border border-white/20 shrink-0 bg-zinc-800">
                      {entry.avatar ? (
                        <Image
                          src={entry.avatar}
                          alt={entry.name || "User"}
                          fill
                          unoptimized
                          className="object-cover object-top"
                          onError={(e) => {
                            e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(entry.name || "User")}`;
                          }}
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center font-mono text-xs text-white">
                          {entry.name?.[0] || "U"}
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-col text-left">
                      <span className="truncate font-medium text-xs sm:text-sm text-zinc-200">
                        {entry.name}
                      </span>
                      <time className="text-[11px] font-mono text-zinc-500">
                        {entry.created_at
                          ? new Date(entry.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "Recent"}
                      </time>
                    </div>
                  </div>

                  {/* Right Actions: Edit (for Admin's own note) & Delete Button */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isAdminMessage && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(entry)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-sky-400 hover:bg-sky-500/10 transition-all cursor-pointer"
                        title="Edit Your Note"
                      >
                        <Pencil size={13} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeletingId(entry.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Delete Signature"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Admin Note Modal */}
      <AdminModal
        isOpen={Boolean(editingEntry)}
        onClose={() => setEditingEntry(null)}
        title="Edit Your Note"
        subtitle="Update your pinned note message and theme on the guestbook wall"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {/* Live Preview of Note */}
          <div
            className="p-5 rounded-2xl text-white text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[140px] shadow-lg border border-white/10"
            style={{
              background:
                THEME_STYLES[editTheme]?.cardBg || THEME_STYLES.violet.cardBg,
            }}
          >
            <SparkleStarDoodle className="absolute top-2 right-2 size-12 opacity-25 text-white" />
            <p className="relative z-10 font-bold text-sm sm:text-base text-white leading-snug drop-shadow-md">
              {editMessage || "Your note message..."}
            </p>
          </div>

          {/* Message Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
              Note Message
            </label>
            <textarea
              required
              maxLength={100}
              rows={3}
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-neutral-600 font-mono resize-none focus:outline-none focus:border-white/30"
            />
            <div className="flex justify-between text-[10px] font-mono text-neutral-500">
              <span>Max 100 characters</span>
              <span>{editMessage.length} / 100</span>
            </div>
          </div>

          {/* Theme Picker */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
              Theme Accent
            </label>
            <div className="flex items-center gap-2">
              {PALETTE_CYCLE.map((th) => (
                <button
                  key={th}
                  type="button"
                  onClick={() => setEditTheme(th)}
                  className={`w-5 h-5 rounded-full transition-transform cursor-pointer border ${
                    editTheme === th
                      ? "scale-125 border-white shadow-xs"
                      : "border-white/30 hover:scale-110"
                  }`}
                  style={{ backgroundColor: THEME_STYLES[th].accent }}
                  title={th}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingEntry(null)}
              className="px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingEdit || !editMessage.trim()}
              className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs font-mono transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isSavingEdit ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Check size={13} />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Avatar Change Modal */}
      <AdminModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        title="Admin Avatar"
        subtitle="Set the profile image used when signing the guestbook"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative size-16 rounded-full overflow-hidden border-2 border-white/20 shrink-0 bg-zinc-800">
              <Image
                src={customAvatarUrl || adminAvatar}
                alt="Avatar"
                fill
                unoptimized
                className="object-cover object-top"
                onError={(e) => {
                  e.currentTarget.src = "/images/about/hero-profile.png";
                }}
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-white">Rohan Mia</p>
              <p className="text-[11px] text-neutral-400 font-mono">
                Upload a cropped image to Cloudinary or specify an image URL.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
              Image URL
            </label>
            <input
              type="url"
              value={customAvatarUrl}
              onChange={(e) => setCustomAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-neutral-600 font-mono"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsCropOpen(true)}
            className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-mono text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Camera size={14} />
            <span>Upload &amp; Crop New Avatar</span>
          </button>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (customAvatarUrl.trim()) {
                  setAdminAvatar(customAvatarUrl.trim());
                  showToast("Avatar updated.", "success");
                }
                setIsAvatarModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs font-mono transition-all"
            >
              Apply
            </button>
          </div>
        </div>
      </AdminModal>

      {/* Cloudinary Image Crop Modal for Avatar */}
      <ImageCropModal
        isOpen={isCropOpen}
        onClose={() => setIsCropOpen(false)}
        onSuccess={(url) => {
          setCustomAvatarUrl(url);
          setAdminAvatar(url);
          setIsCropOpen(false);
          setIsAvatarModalOpen(false);
          showToast("Avatar uploaded to Cloudinary successfully.", "success");
        }}
        title="Crop & Upload Admin Avatar"
        subtitle="Crop your profile photo to a square frame."
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Delete Signature?"
        description="Are you sure you want to delete this guestbook signature? It will be removed permanently from the public wall and database."
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
}
