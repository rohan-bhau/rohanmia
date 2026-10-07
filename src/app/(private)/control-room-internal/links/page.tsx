"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import {
  Link2,
  Plus,
  ExternalLink,
  Edit3,
  Trash2,
  Check,
  X,
  Loader2,
  Globe,
  Mail,
  Calendar,
  Layers,
  BookOpen,
  Briefcase,
} from "lucide-react";
import { fetchAdminLinks, saveAdminLinks } from "@/actions/adminLinks";
import {
  FaGithub,
  FaLinkedin,
  FaXTwitter,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa6";
import { AdminCustomLink } from "@/lib/constants/defaults";
import { useToast } from "@/components/admin/ui/Toast";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import AdminModal from "@/components/admin/ui/AdminModal";
import { useThemeAccent } from "@/components/theme/ThemeProvider";
import { useAdminMode } from "@/components/admin/AdminModeContext";
import LinksClient from "@/app/(public)/links/LinksClient";

export default function AdminLinksPage() {
  const { currentTheme } = useThemeAccent();
  const { showToast } = useToast();
  const { mode } = useAdminMode();

  const [links, setLinks] = useState<AdminCustomLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [editingLink, setEditingLink] = useState<AdminCustomLink | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    const res = await fetchAdminLinks();
    if (res.success && res.links) {
      setLinks(res.links);
    } else {
      showToast(res.error || "Failed to load links", "error");
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadLinks();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadLinks]);

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    startTransition(async () => {
      let updated: AdminCustomLink[];
      const exists = links.some((l) => l.id === editingLink.id);
      if (exists) {
        updated = links.map((l) => (l.id === editingLink.id ? editingLink : l));
      } else {
        updated = [...links, editingLink];
      }

      const res = await saveAdminLinks(updated);
      if (res.success) {
        setLinks(updated);
        setEditingLink(null);
        showToast("Link saved successfully.", "success");
      } else {
        showToast(res.error || "Failed to save link", "error");
      }
    });
  };

  const handleToggleActive = (id: string) => {
    startTransition(async () => {
      const updated = links.map((l) =>
        l.id === id ? { ...l, active: !l.active } : l,
      );
      const res = await saveAdminLinks(updated);
      if (res.success) {
        setLinks(updated);
        showToast("Link visibility updated.", "success");
      } else {
        showToast(res.error || "Failed to update link", "error");
      }
    });
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    startTransition(async () => {
      const updated = links.filter((l) => l.id !== deletingId);
      const res = await saveAdminLinks(updated);
      if (res.success) {
        setLinks(updated);
        setDeletingId(null);
        showToast("Link deleted.", "success");
      } else {
        showToast(res.error || "Failed to delete link", "error");
      }
    });
  };

  const getLinkIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "github":
        return <FaGithub size={18} />;
      case "linkedin":
        return <FaLinkedin size={18} />;
      case "twitter":
        return <FaXTwitter size={18} />;
      case "facebook":
        return <FaFacebook size={18} />;
      case "instagram":
        return <FaInstagram size={18} />;
      case "mail":
        return <Mail size={18} />;
      case "calendar":
        return <Calendar size={18} />;
      case "guestbook":
        return <BookOpen size={18} />;
      case "projects":
        return <Briefcase size={18} />;
      case "stack":
        return <Layers size={18} />;
      default:
        return <Globe size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-neutral-400 font-mono text-xs gap-2">
        <Loader2 size={16} className="animate-spin text-white" />
        <span>Loading Links Manager...</span>
      </div>
    );
  }

  if (mode === "preview") {
    return (
      <div className="animate-in fade-in duration-200">
        <LinksClient links={links} compactTop={true} />
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-5xl pb-16 pt-4 px-4 sm:px-8 mx-auto">
      {/* Header */}
      <div className="relative rounded-[32px] bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-2xl p-8 sm:p-12 shadow-2xl space-y-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block">
              LINKS &amp; SOCIAL TREE
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal text-white tracking-tight leading-[1.12]">
              Digital{" "}
              <span
                className="font-serif italic font-normal text-transparent bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${currentTheme.primary} 100%)`,
                }}
              >
                Connections
              </span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed max-w-xl">
              Manage public link hub, social profiles, email channels, and
              developer directories.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() =>
                setEditingLink({
                  id: `link-${Date.now()}`,
                  category: "connect",
                  title: "",
                  handle: "",
                  href: "",
                  iconName: "globe",
                  isExternal: true,
                  active: true,
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all shadow-md cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Link</span>
            </button>

            <Link
              href="/links"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 hover:text-white transition-colors"
              title="View Public Links Page"
            >
              <ExternalLink size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* Links List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((link) => (
          <div
            key={link.id}
            className={`p-6 rounded-3xl bg-[#0c1017]/70 border transition-all backdrop-blur-md flex items-center justify-between group ${
              link.active
                ? "border-white/[0.08] hover:border-white/20"
                : "border-white/[0.04] opacity-60"
            }`}
          >
            <div className="flex items-center gap-4 min-w-0 pr-4">
              <div
                className="size-11 rounded-2xl flex items-center justify-center border border-white/10 shrink-0 bg-white/[0.03]"
                style={{ color: link.color || "#ffffff" }}
              >
                {getLinkIcon(link.iconName)}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg text-white font-medium truncate">
                    {link.title}
                  </h3>
                  {!link.active && (
                    <span className="text-[10px] font-mono text-neutral-500 bg-white/[0.04] px-1.5 py-0.5 rounded">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 font-mono truncate mt-0.5">
                  {link.handle || link.href}
                </p>
              </div>
            </div>

            {/* Action Buttons: Clean Edit and Delete (Tick checkmark removed per user request) */}
            <div className="flex items-center gap-2 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditingLink(link)}
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Edit Link"
              >
                <Edit3 size={14} />
              </button>

              <button
                onClick={() => setDeletingId(link.id)}
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 border border-white/[0.08] hover:border-rose-500/30 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Delete Link"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Link Modal */}
      <AdminModal
        isOpen={Boolean(editingLink)}
        onClose={() => setEditingLink(null)}
        title={
          links.some((l) => l.id === editingLink?.id)
            ? "Edit Link"
            : "Add New Link"
        }
        subtitle="Public link and social profile"
        maxWidth="max-w-lg"
      >
        {editingLink && (
          <form onSubmit={handleSaveLink} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-neutral-400">
                Title (e.g. LinkedIn, GitHub) *
              </label>
              <input
                type="text"
                required
                value={editingLink.title}
                onChange={(e) =>
                  setEditingLink({ ...editingLink, title: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-neutral-400">
                Handle / Subtitle *
              </label>
              <input
                type="text"
                required
                value={editingLink.handle}
                onChange={(e) =>
                  setEditingLink({ ...editingLink, handle: e.target.value })
                }
                placeholder="in/rohan-mia or @rohan-bhau"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-neutral-400">
                Destination URL *
              </label>
              <input
                type="text"
                required
                value={editingLink.href}
                onChange={(e) =>
                  setEditingLink({ ...editingLink, href: e.target.value })
                }
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-neutral-400">
                  Icon Type
                </label>
                <select
                  value={editingLink.iconName}
                  onChange={(e) =>
                    setEditingLink({ ...editingLink, iconName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e14] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                >
                  <option value="github" className="bg-[#0c0e14]">
                    GitHub
                  </option>
                  <option value="linkedin" className="bg-[#0c0e14]">
                    LinkedIn
                  </option>
                  <option value="twitter" className="bg-[#0c0e14]">
                    Twitter / X
                  </option>
                  <option value="facebook" className="bg-[#0c0e14]">
                    Facebook
                  </option>
                  <option value="instagram" className="bg-[#0c0e14]">
                    Instagram
                  </option>
                  <option value="mail" className="bg-[#0c0e14]">
                    Email
                  </option>
                  <option value="calendar" className="bg-[#0c0e14]">
                    Calendar
                  </option>
                  <option value="projects" className="bg-[#0c0e14]">
                    Projects
                  </option>
                  <option value="stack" className="bg-[#0c0e14]">
                    Tech Stack
                  </option>
                  <option value="guestbook" className="bg-[#0c0e14]">
                    Guestbook
                  </option>
                  <option value="globe" className="bg-[#0c0e14]">
                    Website / Globe
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-neutral-400">
                  Accent Color Hex
                </label>
                <input
                  type="text"
                  value={editingLink.color || "#ffffff"}
                  onChange={(e) =>
                    setEditingLink({ ...editingLink, color: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setEditingLink(null)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isPending && <Loader2 size={13} className="animate-spin" />}
                <span>Save Link</span>
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deletingId !== null}
        title="Delete Link"
        message="Are you sure you want to remove this public link? This action cannot be undone."
        confirmText="Delete Link"
        isDestructive={true}
        isLoading={isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
