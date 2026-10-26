"use client";

import React, { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import {
  Globe,
  User,
  Image as ImageIcon,
  FileCode2,
  FolderGit2,
  Share2,
  ShieldCheck,
  ExternalLink,
  Upload,
  Loader2,
  Check,
  Trash2,
  Link2,
} from "lucide-react";
import {
  fetchSeoDashboardData,
  saveGlobalSeoSettings,
  savePageSeoSettings,
  saveProjectSeoOverrides,
  uploadSeoProfilePhoto,
  uploadSeoOgImage,
} from "@/actions/adminSeo";
import { DbSeoSettingsRow, DbPageSeoRow, DbProjectSeoItem } from "@/lib/db/seo";
import { useToast } from "@/components/admin/ui/Toast";
import { useThemeAccent } from "@/components/theme/ThemeProvider";
import { useAdminMode } from "@/components/admin/AdminModeContext";
import { generatePersonJsonLd, generateWebSiteJsonLd } from "@/lib/seo/jsonLd";

type SeoTab =
  | "global"
  | "identity"
  | "profile_image"
  | "pages"
  | "projects"
  | "socials"
  | "verification";

const STANDARD_PAGES = [
  { path: "/", label: "Homepage" },
  { path: "/about", label: "About" },
  { path: "/projects", label: "Projects" },
  { path: "/tech-stack", label: "Tech Stack" },
  { path: "/gallery", label: "Gallery" },
  { path: "/guestbook", label: "Guestbook" },
  { path: "/links", label: "Links" },
  { path: "/contact", label: "Contact" },
];

const TABS: { id: SeoTab; label: string; icon: React.ElementType }[] = [
  { id: "global", label: "Global", icon: Globe },
  { id: "identity", label: "Identity", icon: User },
  { id: "profile_image", label: "Profile Photo", icon: ImageIcon },
  { id: "pages", label: "Pages", icon: FileCode2 },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "socials", label: "Socials", icon: Share2 },
  { id: "verification", label: "Verification", icon: ShieldCheck },
];

export default function AdminSeoPage() {
  const { currentTheme } = useThemeAccent();
  const { mode } = useAdminMode();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SeoTab>("global");
  const [isPending, startTransition] = useTransition();

  const [globalSeo, setGlobalSeo] = useState<DbSeoSettingsRow | null>(null);
  const [pages, setPages] = useState<DbPageSeoRow[]>([]);
  const [projects, setProjects] = useState<DbProjectSeoItem[]>([]);
  const [verifiedSocials, setVerifiedSocials] = useState<string[]>([]);

  const [selectedPagePath, setSelectedPagePath] = useState<string>("/");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const [newAlias, setNewAlias] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newSocialUrl, setNewSocialUrl] = useState("");

  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      const res = await fetchSeoDashboardData();
      if (!isMounted) return;
      if (res.success && res.globalSeo) {
        setGlobalSeo(res.globalSeo);
        setPages(res.pages || []);
        setProjects(res.projects || []);
        setVerifiedSocials(res.verifiedSocials || []);
        if (res.projects?.length) {
          setSelectedProjectId(res.projects[0].id);
        }
      } else {
        showToast(res.error || "Failed to load SEO data", "error");
      }
      setLoading(false);
    }

    init();
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const activePageSeo =
    pages.find((p) => p.page_path === selectedPagePath) || {
      page_path: selectedPagePath,
      title: "",
      description: "",
      canonical_url: "",
      og_title: "",
      og_description: "",
      og_image: "",
      og_image_alt: "",
      twitter_card: "summary_large_image" as const,
      robots_index: true,
      robots_follow: true,
      keywords: [],
      updated_at: new Date().toISOString(),
    };

  const activeProject =
    projects.find((p) => p.id === selectedProjectId) ||
    projects[0] ||
    null;

  const handleSaveGlobal = () => {
    if (!globalSeo) return;
    startTransition(async () => {
      const res = await saveGlobalSeoSettings(globalSeo);
      if (res.success && res.globalSeo) {
        setGlobalSeo(res.globalSeo);
        showToast("SEO settings saved", "success");
      } else {
        showToast(res.error || "Failed to save settings", "error");
      }
    });
  };

  const handleSavePage = (updates: Partial<DbPageSeoRow>) => {
    const updated = { ...activePageSeo, ...updates };
    setPages((prev) =>
      prev.some((p) => p.page_path === selectedPagePath)
        ? prev.map((p) => (p.page_path === selectedPagePath ? updated : p))
        : [...prev, updated]
    );

    startTransition(async () => {
      const res = await savePageSeoSettings({
        ...updates,
        page_path: selectedPagePath,
      });
      if (res.success) {
        showToast("Page SEO updated", "success");
      } else {
        showToast(res.error || "Failed to save page SEO", "error");
      }
    });
  };

  const handleSaveProject = (updates: Partial<DbProjectSeoItem>) => {
    if (!activeProject) return;
    const updated = { ...activeProject, ...updates };
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProject.id ? updated : p))
    );

    startTransition(async () => {
      const res = await saveProjectSeoOverrides(activeProject.id, updates);
      if (res.success) {
        showToast("Project SEO updated", "success");
      } else {
        showToast(res.error || "Failed to save project SEO", "error");
      }
    });
  };

  const handleProfilePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProfile(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadSeoProfilePhoto(formData);
    setUploadingProfile(false);

    if (res.success && res.url) {
      setGlobalSeo((prev) =>
        prev
          ? {
              ...prev,
              profile_image_url: res.url!,
              profile_image_variants: res.variants || {},
            }
          : prev
      );
      showToast("Profile photo uploaded", "success");
    } else {
      showToast(res.error || "Upload failed", "error");
    }
  };

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingOg(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadSeoOgImage(formData);
    setUploadingOg(false);

    if (res.success && res.url) {
      setGlobalSeo((prev) =>
        prev ? { ...prev, default_og_image: res.url! } : prev
      );
      showToast("OG image uploaded", "success");
    } else {
      showToast(res.error || "OG upload failed", "error");
    }
  };

  if (loading || !globalSeo) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-neutral-400 font-mono text-xs gap-2">
        <Loader2 size={16} className="animate-spin text-white" />
        <span>Loading SEO settings...</span>
      </div>
    );
  }

  const baseUrl = globalSeo.canonical_base_url || "";
  const personJsonLd = generatePersonJsonLd(globalSeo, baseUrl, verifiedSocials);
  const webSiteJsonLd = generateWebSiteJsonLd(globalSeo, baseUrl);

  return (
    <div className="space-y-6 max-w-5xl px-4 sm:px-8 py-6 pb-24 no-scrollbar">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <h1 className="text-2xl sm:text-3xl font-serif font-normal text-white tracking-tight">
          SEO &amp; Identity
        </h1>

        {mode === "studio" && (
          <button
            onClick={handleSaveGlobal}
            disabled={isPending}
            style={{
              backgroundColor: currentTheme.primary,
              color: "#000000",
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Check size={13} />
            )}
            <span>Save Changes</span>
          </button>
        )}
      </div>

      {/* ========================================================
          MODE 1: SURFACE CANVAS (LIVE READ-ONLY PREVIEW)
         ======================================================== */}
      {mode === "preview" ? (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Google SERP Preview */}
          <div className="p-6 rounded-2xl bg-[#0c0e14]/90 border border-white/[0.08] space-y-3">
            <h2 className="text-xs font-mono uppercase text-neutral-400 font-medium">
              Google Search Result
            </h2>

            <div className="p-4 rounded-xl bg-[#202124] border border-neutral-700/60 max-w-2xl space-y-2 text-left font-sans">
              <div className="flex items-center gap-2">
                {globalSeo.profile_image_url ? (
                  <Image
                    src={globalSeo.profile_image_url}
                    alt={globalSeo.primary_name || "Profile"}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full object-cover border border-white/10"
                  />
                ) : null}
                <div className="flex flex-col text-xs leading-tight">
                  <span className="text-[#dadce0] font-medium text-[13px]">
                    {globalSeo.primary_name || "—"}
                  </span>
                  <span className="text-[#9aa0a6] text-[11px] font-mono">
                    {globalSeo.canonical_base_url || "—"}
                  </span>
                </div>
              </div>

              <h3 className="text-[#8ab4f8] text-base sm:text-lg font-normal leading-snug">
                {globalSeo.default_meta_title || "—"}
              </h3>

              <p className="text-[#bdc1c6] text-xs sm:text-sm leading-relaxed line-clamp-2">
                {globalSeo.default_meta_description || "—"}
              </p>
            </div>
          </div>

          {/* Social Card Preview */}
          <div className="p-6 rounded-2xl bg-[#0c0e14]/90 border border-white/[0.08] space-y-3">
            <h2 className="text-xs font-mono uppercase text-neutral-400 font-medium">
              Social Sharing Card
            </h2>

            <div className="max-w-xl rounded-xl overflow-hidden border border-white/10 bg-[#16181d]">
              <div className="relative aspect-[1200/630] w-full bg-[#08090d] flex items-center justify-center overflow-hidden">
                {globalSeo.default_og_image || globalSeo.profile_image_url ? (
                  <Image
                    src={globalSeo.default_og_image || globalSeo.profile_image_url}
                    alt={globalSeo.primary_name || "OG Image"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xs font-mono text-neutral-600">
                    No image uploaded
                  </span>
                )}
              </div>
              <div className="p-4 space-y-1 bg-[#16181d]">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                  {(() => {
                    try {
                      return globalSeo.canonical_base_url
                        ? new URL(globalSeo.canonical_base_url).hostname
                        : "—";
                    } catch {
                      return globalSeo.canonical_base_url || "—";
                    }
                  })()}
                </span>
                <h4 className="text-sm font-medium text-white line-clamp-1">
                  {globalSeo.default_og_title || globalSeo.default_meta_title || "—"}
                </h4>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {globalSeo.default_og_description || globalSeo.default_meta_description || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Structured Data Preview */}
          <div className="p-6 rounded-2xl bg-[#0c0e14]/90 border border-white/[0.08] space-y-3">
            <h2 className="text-xs font-mono uppercase text-neutral-400 font-medium">
              Structured Data (JSON-LD)
            </h2>
            <pre className="p-4 rounded-xl bg-black/60 border border-white/[0.06] text-[11px] font-mono text-neutral-300 overflow-x-auto no-scrollbar max-h-80">
              {JSON.stringify({ person: personJsonLd, website: webSiteJsonLd }, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        /* ========================================================
            MODE 2: STUDIO ENGINE (TABS & EDIT FORMS)
           ======================================================== */
        <div className="space-y-6">
          {/* Studio Navigation Tabs - Clean, wrapping, no horizontal scrollbar */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-white/[0.08] no-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={
                    active
                      ? {
                          backgroundColor: `${currentTheme.primary}20`,
                          borderColor: `${currentTheme.primary}50`,
                          color: "#ffffff",
                        }
                      : undefined
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
                    active
                      ? "font-medium"
                      : "border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon
                    size={13}
                    style={active ? { color: currentTheme.primary } : undefined}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: GLOBAL METADATA */}
          {activeTab === "global" && (
            <div className="p-6 rounded-2xl bg-[#0c0e14]/90 border border-white/[0.08] space-y-5">
              <h2 className="text-sm font-medium text-white">Global Metadata</h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                    Default Meta Title
                  </label>
                  <input
                    type="text"
                    value={globalSeo.default_meta_title || ""}
                    onChange={(e) =>
                      setGlobalSeo((prev) =>
                        prev ? { ...prev, default_meta_title: e.target.value } : prev
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-white/30"
                    placeholder="Default Meta Title"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                    Default Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={globalSeo.default_meta_description || ""}
                    onChange={(e) =>
                      setGlobalSeo((prev) =>
                        prev
                          ? { ...prev, default_meta_description: e.target.value }
                          : prev
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-white/30 leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                    Canonical Website Base URL
                  </label>
                  <input
                    type="url"
                    value={globalSeo.canonical_base_url || ""}
                    onChange={(e) =>
                      setGlobalSeo((prev) =>
                        prev ? { ...prev, canonical_base_url: e.target.value } : prev
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-white/30"
                    placeholder="https://rohanmia.vercel.app"
                  />
                </div>

                {/* OG Image */}
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <label className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                    Default Social Sharing Image
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative w-36 h-20 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                      {globalSeo.default_og_image ? (
                        <Image
                          src={globalSeo.default_og_image}
                          alt="Default OG"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-neutral-600">
                          None
                        </div>
                      )}
                    </div>

                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-mono text-neutral-300 hover:text-white cursor-pointer transition-colors">
                      {uploadingOg ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Upload size={13} />
                      )}
                      <span>Upload OG Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleOgImageUpload}
                        disabled={uploadingOg}
                      />
                    </label>
                  </div>
                </div>

                {/* Robots Default Index & Follow */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-xs text-white">Robots Index</span>
                    <button
                      type="button"
                      onClick={() =>
                        setGlobalSeo((prev) =>
                          prev
                            ? {
                                ...prev,
                                default_robots_index: !prev.default_robots_index,
                              }
                            : prev
                        )
                      }
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                        globalSeo.default_robots_index ? "bg-emerald-500" : "bg-neutral-700"
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-[3px] ${
                          globalSeo.default_robots_index ? "right-[3px]" : "left-[3px]"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-xs text-white">Robots Follow</span>
                    <button
                      type="button"
                      onClick={() =>
                        setGlobalSeo((prev) =>
                          prev
                            ? {
                                ...prev,
                                default_robots_follow: !prev.default_robots_follow,
                              }
                            : prev
                        )
                      }
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                        globalSeo.default_robots_follow ? "bg-emerald-500" : "bg-neutral-700"
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-[3px] ${
                          globalSeo.default_robots_follow ? "right-[3px]" : "left-[3px]"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERSONAL IDENTITY */}
          {activeTab === "identity" && (
            <div className="p-6 rounded-2xl bg-[#0c0e14]/90 border border-white/[0.08] space-y-5">
              <h2 className="text-sm font-medium text-white">Personal Identity</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                    Primary Name
                  </label>
                  <input
                    type="text"
                    value={globalSeo.primary_name || ""}
                    onChange={(e) =>
                      setGlobalSeo((prev) =>
                        prev ? { ...prev, primary_name: e.target.value } : prev
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-white/30"
                    placeholder="Primary Name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                    Nickname / Moniker
                  </label>
                  <input
                    type="text"
                    value={globalSeo.nickname || ""}
                    onChange={(e) =>
                      setGlobalSeo((prev) =>
                        prev ? { ...prev, nickname: e.target.value } : prev
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-white/30"
                    placeholder="Nickname / Moniker"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    value={globalSeo.professional_title || ""}
                    onChange={(e) =>
                      setGlobalSeo((prev) =>
                        prev ? { ...prev, professional_title: e.target.value } : prev
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-white/30"
                    placeholder="Professional Title"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                    City
                  </label>
                  <input
                    type="text"
                    value={globalSeo.location_locality || ""}
                    onChange={(e) =>
                      setGlobalSeo((prev) =>
                        prev ? { ...prev, location_locality: e.target.value } : prev
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-white/30"
                    placeholder="City"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                    Country
                  </label>
                  <input
                    type="text"
                    value={globalSeo.location_country || ""}
                    onChange={(e) =>
                      setGlobalSeo((prev) =>
                        prev ? { ...prev, location_country: e.target.value } : prev
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-white/30"
                    placeholder="Country"
                  />
                </div>
              </div>

              {/* Aliases List */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <label className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                  Alternative Names (Aliases)
                </label>

                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  {globalSeo.alternate_names?.map((alias, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-mono text-white"
                    >
                      <span>{alias}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setGlobalSeo((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  alternate_names: prev.alternate_names.filter(
                                    (_, i) => i !== idx
                                  ),
                                }
                              : prev
                          )
                        }
                        className="text-neutral-400 hover:text-rose-400 cursor-pointer"
                      >
                        &times;
                      </button>
                    </span>
                  ))}

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newAlias}
                      onChange={(e) => setNewAlias(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (!newAlias.trim()) return;
                          setGlobalSeo((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  alternate_names: [
                                    ...(prev.alternate_names || []),
                                    newAlias.trim(),
                                  ],
                                }
                              : prev
                          );
                          setNewAlias("");
                        }
                      }}
                      placeholder="Add alias..."
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Detailed Bio */}
              <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                <label className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                  Bio
                </label>
                <textarea
                  rows={4}
                  value={globalSeo.detailed_bio || ""}
                  onChange={(e) =>
                    setGlobalSeo((prev) =>
                      prev ? { ...prev, detailed_bio: e.target.value } : prev
                    )
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-white/30 leading-relaxed"
                />
              </div>

              {/* Skills List */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <label className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                  Skills
                </label>

                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  {globalSeo.skills?.map((sk, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-mono text-white"
                    >
                      <span>{sk}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setGlobalSeo((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  skills: prev.skills.filter((_, i) => i !== idx),
                                }
                              : prev
                          )
                        }
                        className="text-neutral-400 hover:text-rose-400 cursor-pointer"
                      >
                        &times;
                      </button>
                    </span>
                  ))}

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (!newSkill.trim()) return;
                          setGlobalSeo((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  skills: [...(prev.skills || []), newSkill.trim()],
                                }
                              : prev
                          );
                          setNewSkill("");
                        }
                      }}
                      placeholder="Add skill..."
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROFILE PHOTO */}
          {activeTab === "profile_image" && (
            <div className="p-6 rounded-2xl bg-[#0c0e14]/90 border border-white/[0.08] space-y-5">
              <h2 className="text-sm font-medium text-white">Profile Photo</h2>

              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-neutral-900 border border-white/15 shrink-0">
                  {globalSeo.profile_image_url ? (
                    <Image
                      src={globalSeo.profile_image_url}
                      alt={globalSeo.profile_image_alt || "Profile"}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <div className="space-y-4 flex-1 w-full">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                      Image Alt Text
                    </label>
                    <input
                      type="text"
                      value={globalSeo.profile_image_alt || ""}
                      onChange={(e) =>
                        setGlobalSeo((prev) =>
                          prev ? { ...prev, profile_image_alt: e.target.value } : prev
                        )
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-white/30"
                      placeholder="Descriptive profile image alt text"
                    />
                  </div>

                  <div>
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-xs font-mono text-white cursor-pointer transition-colors">
                      {uploadingProfile ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Upload size={13} />
                      )}
                      <span>Upload Profile Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePhotoUpload}
                        disabled={uploadingProfile}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Crop Previews */}
              <div className="pt-4 border-t border-white/[0.06] space-y-3">
                <span className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                  Generated Aspect Ratios
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                    <span className="text-xs font-mono text-neutral-400 block">1:1 Square</span>
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-900 border border-white/10">
                      {globalSeo.profile_image_variants?.square_1x1 || globalSeo.profile_image_url ? (
                        <Image
                          src={
                            globalSeo.profile_image_variants?.square_1x1 ||
                            globalSeo.profile_image_url
                          }
                          alt="1:1"
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                    <span className="text-xs font-mono text-neutral-400 block">4:3 Portrait</span>
                    <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-neutral-900 border border-white/10">
                      {globalSeo.profile_image_variants?.photo_4x3 || globalSeo.profile_image_url ? (
                        <Image
                          src={
                            globalSeo.profile_image_variants?.photo_4x3 ||
                            globalSeo.profile_image_url
                          }
                          alt="4:3"
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                    <span className="text-xs font-mono text-neutral-400 block">16:9 Landscape</span>
                    <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-neutral-900 border border-white/10">
                      {globalSeo.profile_image_variants?.landscape_16x9 || globalSeo.profile_image_url ? (
                        <Image
                          src={
                            globalSeo.profile_image_variants?.landscape_16x9 ||
                            globalSeo.profile_image_url
                          }
                          alt="16:9"
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAGES */}
          {activeTab === "pages" && (
            <div className="p-6 rounded-2xl bg-[#0c0e14]/90 border border-white/[0.08] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                <h2 className="text-sm font-medium text-white">Page SEO</h2>

                <select
                  value={selectedPagePath}
                  onChange={(e) => setSelectedPagePath(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-mono text-white focus:outline-none cursor-pointer"
                >
                  {STANDARD_PAGES.map((p) => (
                    <option key={p.path} value={p.path} className="bg-neutral-900 text-white">
                      {p.label} ({p.path})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                    SEO Title ({selectedPagePath})
                  </label>
                  <input
                    type="text"
                    value={activePageSeo.title || ""}
                    onChange={(e) => handleSavePage({ title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-white/30"
                    placeholder="Page SEO Title"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={activePageSeo.description || ""}
                    onChange={(e) => handleSavePage({ description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-white/30 leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                    Canonical URL Override
                  </label>
                  <input
                    type="text"
                    value={activePageSeo.canonical_url || ""}
                    onChange={(e) => handleSavePage({ canonical_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-white/30"
                    placeholder={globalSeo.canonical_base_url ? `${globalSeo.canonical_base_url.replace(/\/+$/, "")}${selectedPagePath}` : `https://rohanmia.vercel.app${selectedPagePath}`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-xs text-white">Robots Index</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleSavePage({ robots_index: !activePageSeo.robots_index })
                      }
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                        activePageSeo.robots_index ? "bg-emerald-500" : "bg-neutral-700"
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-[3px] ${
                          activePageSeo.robots_index ? "right-[3px]" : "left-[3px]"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-xs text-white">Robots Follow</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleSavePage({ robots_follow: !activePageSeo.robots_follow })
                      }
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                        activePageSeo.robots_follow ? "bg-emerald-500" : "bg-neutral-700"
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-[3px] ${
                          activePageSeo.robots_follow ? "right-[3px]" : "left-[3px]"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROJECTS */}
          {activeTab === "projects" && (
            <div className="p-6 rounded-2xl bg-[#0c0e14]/90 border border-white/[0.08] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                <h2 className="text-sm font-medium text-white">Project SEO</h2>

                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-mono text-white focus:outline-none cursor-pointer"
                >
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id} className="bg-neutral-900 text-white">
                      {proj.title} (/projects/{proj.slug})
                    </option>
                  ))}
                </select>
              </div>

              {activeProject && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                      SEO Title Override
                    </label>
                    <input
                      type="text"
                      value={activeProject.seo_title || ""}
                      onChange={(e) =>
                        handleSaveProject({ seo_title: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-white/30"
                      placeholder={activeProject.title || "Project SEO Title"}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                      Meta Description Override
                    </label>
                    <textarea
                      rows={3}
                      value={activeProject.seo_description || ""}
                      onChange={(e) =>
                        handleSaveProject({ seo_description: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-white/30 leading-relaxed"
                      placeholder={activeProject.tagline || ""}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-xs text-white">Exclude from Search (Noindex)</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleSaveProject({ no_index: !activeProject.no_index })
                      }
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                        activeProject.no_index ? "bg-rose-500" : "bg-neutral-700"
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-[3px] ${
                          activeProject.no_index ? "right-[3px]" : "left-[3px]"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SOCIALS */}
          {activeTab === "socials" && (
            <div className="p-6 rounded-2xl bg-[#0c0e14]/90 border border-white/[0.08] space-y-5">
              <h2 className="text-sm font-medium text-white">Social Profiles</h2>

              <div className="space-y-3">
                {globalSeo.social_profiles?.map((url, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                  >
                    <div className="flex items-center gap-2 text-xs font-mono text-white truncate min-w-0 pr-2">
                      <Link2 size={13} className="text-neutral-500 shrink-0" />
                      <span className="truncate">{url}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setGlobalSeo((prev) =>
                          prev
                            ? {
                                ...prev,
                                social_profiles: prev.social_profiles.filter(
                                  (_, i) => i !== idx
                                ),
                              }
                            : prev
                        )
                      }
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="url"
                    value={newSocialUrl}
                    onChange={(e) => setNewSocialUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (!newSocialUrl.trim()) return;
                        setGlobalSeo((prev) =>
                          prev
                            ? {
                                ...prev,
                                social_profiles: [
                                  ...(prev.social_profiles || []),
                                  newSocialUrl.trim(),
                                ],
                              }
                            : prev
                        );
                        setNewSocialUrl("");
                      }
                    }}
                    placeholder="https://..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newSocialUrl.trim()) return;
                      setGlobalSeo((prev) =>
                        prev
                          ? {
                              ...prev,
                              social_profiles: [
                                ...(prev.social_profiles || []),
                                newSocialUrl.trim(),
                              ],
                            }
                          : prev
                      );
                      setNewSocialUrl("");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono text-white font-medium cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: VERIFICATION */}
          {activeTab === "verification" && (
            <div className="p-6 rounded-2xl bg-[#0c0e14]/90 border border-white/[0.08] space-y-5">
              <h2 className="text-sm font-medium text-white">Search Console Verification</h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-neutral-400 font-medium block">
                    Verification Token
                  </label>
                  <input
                    type="text"
                    value={globalSeo.google_verification_token || ""}
                    onChange={(e) =>
                      setGlobalSeo((prev) =>
                        prev
                          ? { ...prev, google_verification_token: e.target.value }
                          : prev
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-white/30"
                    placeholder="Enter Google verification token"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                      <span>XML Sitemap</span>
                      <ExternalLink size={12} />
                    </div>
                    <a
                      href="/sitemap.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-sky-400 hover:underline block break-all"
                    >
                      /sitemap.xml
                    </a>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                      <span>Robots.txt</span>
                      <ExternalLink size={12} />
                    </div>
                    <a
                      href="/robots.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-sky-400 hover:underline block break-all"
                    >
                      /robots.txt
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
