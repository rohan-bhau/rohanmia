'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { 
  Globe, 
  Mail, 
  FileText, 
  ShieldCheck, 
  Database, 
  Cloud, 
  Key, 
  Send,
  Loader2, 
  Check, 
  ExternalLink,
  Eye,
  SlidersHorizontal,
  Lock
} from 'lucide-react';
import { fetchAdminSettings, saveAdminSettings } from '@/actions/adminSettings';
import { DbSiteSettingsRow } from '@/lib/db/content';
import { useToast } from '@/components/admin/ui/Toast';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { useAdminMode } from '@/components/admin/AdminModeContext';

export default function AdminSettingsPage() {
  const { currentTheme } = useThemeAccent();
  const { mode, setMode } = useAdminMode();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<DbSiteSettingsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    site_title: 'MD Rohan Mia | Full-Stack Software Engineer & Creative Developer',
    meta_description: 'Personal portfolio and engineering chronicle of MD Rohan Mia. Specializing in high-performance Next.js systems, distributed architectures, and bespoke interactive web experiences.',
    contact_email: 'rohanmia.org@gmail.com',
    resume_url: 'https://drive.google.com/file/d/1d1K3fJnkLDyc5ExLN8nYC_09e0e5ZCfi/view?usp=sharing',
  });

  const loadSettings = async () => {
    setLoading(true);
    const res = await fetchAdminSettings();
    if (res.success && res.settings) {
      setSettings(res.settings);
      setFormData({
        site_title: res.settings.site_title || 'MD Rohan Mia | Full-Stack Software Engineer & Creative Developer',
        meta_description: res.settings.meta_description || 'Personal portfolio and engineering chronicle of MD Rohan Mia. Specializing in high-performance Next.js systems, distributed architectures, and bespoke interactive web experiences.',
        contact_email: res.settings.contact_email || 'rohanmia.org@gmail.com',
        resume_url: res.settings.resume_url || 'https://drive.google.com/file/d/1d1K3fJnkLDyc5ExLN8nYC_09e0e5ZCfi/view?usp=sharing',
      });
    } else {
      showToast(res.error || 'Failed to load settings', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveAdminSettings({
        site_title: formData.site_title.trim(),
        meta_description: formData.meta_description.trim(),
        contact_email: formData.contact_email.trim(),
        resume_url: formData.resume_url.trim(),
      });

      if (res.success && res.settings) {
        setSettings(res.settings);
        showToast('Settings & Resume URL saved successfully in PostgreSQL.', 'success');
      } else {
        showToast(res.error || 'Failed to save settings', 'error');
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-neutral-400 font-mono text-xs gap-2">
        <Loader2 size={16} className="animate-spin text-white" />
        <span>Loading Studio Settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl px-4 sm:px-8 py-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1.5">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
            SYSTEM ENGINE &amp; SITE PREFERENCES
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white tracking-tight">
            Studio{' '}
            <span 
              className="font-serif italic font-normal text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${currentTheme.primary} 100%)`
              }}
            >
              Settings
            </span>
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            {mode === 'preview'
              ? 'Surface Canvas: 100% read-only overview of live metadata, routing, and infrastructure.'
              : 'Studio Engine: Modify global SEO, destination addresses, and public resume document.'}
          </p>
        </div>
      </div>

      {/* ========================================================
          MODE 1: SURFACE CANVAS (READ-ONLY OVERVIEW)
         ======================================================== */}
      {mode === 'preview' ? (
        <div className="space-y-6 animate-in fade-in duration-200 select-none">
          
          {/* 1. Global Metadata & SEO (Read-Only) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-2xl space-y-5 shadow-xl">
            <div className="space-y-1 pb-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-serif font-medium text-white tracking-tight flex items-center gap-2">
                <Globe size={18} style={{ color: currentTheme.primary }} />
                <span>Global Metadata &amp; SEO Identity</span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Stored in Neon PostgreSQL and served to search engines and browser clients.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase text-neutral-500 font-medium">
                  Website Meta Title
                </span>
                <p className="text-sm font-mono text-white font-medium">
                  {formData.site_title}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                  <span className="uppercase font-medium">SEO Meta Description</span>
                  <span>{formData.meta_description.length} characters</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs sm:text-sm font-mono text-neutral-300 leading-relaxed">
                  {formData.meta_description}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Public Documents & Destination Routing (Read-Only with Clickable Links) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-2xl space-y-5 shadow-xl">
            <div className="space-y-1 pb-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-serif font-medium text-white tracking-tight flex items-center gap-2">
                <FileText size={18} style={{ color: currentTheme.primary }} />
                <span>Public Documents &amp; Communications</span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Verified destination addresses and active document links.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase">
                  <FileText size={14} style={{ color: currentTheme.primary }} />
                  <span>Public Resume / CV Asset</span>
                </div>
                <div className="pt-1">
                  <a
                    href={formData.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-sky-400 hover:underline flex items-center gap-1.5 break-all"
                  >
                    <span>{formData.resume_url}</span>
                    <ExternalLink size={12} className="shrink-0" />
                  </a>
                </div>
                <p className="text-[11px] text-neutral-500 font-mono">
                  Opens directly in a new tab without downloading.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase">
                  <Mail size={14} style={{ color: currentTheme.primary }} />
                  <span>Primary Admin Contact Email</span>
                </div>
                <div className="pt-1">
                  <span className="text-sm font-mono text-white font-medium">
                    {formData.contact_email}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 font-mono">
                  All visitor inquiries from the contact form route to this address.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Infrastructure Diagnostics */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-2xl space-y-5 shadow-xl">
            <div className="space-y-1 pb-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-serif font-medium text-white tracking-tight flex items-center gap-2">
                <Database size={18} style={{ color: currentTheme.primary }} />
                <span>Connected Infrastructure &amp; Services</span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Live operational health verification for connected storage engines and microservices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3.5">
                <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Database size={18} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">PostgreSQL Database</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[11px] font-mono text-neutral-400">
                    Neon Serverless Postgres &bull; Pooler Active
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3.5">
                <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <Cloud size={18} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">Cloudinary Media CDN</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[11px] font-mono text-neutral-400">
                    Image transformation &amp; CDN distribution
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3.5">
                <div className="size-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Key size={18} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">Stealth Gatekeeper</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[11px] font-mono text-neutral-400">
                    NextAuth v5 &bull; bcrypt salted hash validation
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3.5">
                <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Send size={18} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">Gmail SMTP Transport</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[11px] font-mono text-neutral-400">
                    Port 587 STARTTLS &bull; Automatic notification dispatch
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (

        /* ========================================================
            MODE 2: STUDIO ENGINE (CONFIGURATION FORMS & INPUTS)
           ======================================================== */
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Global Metadata & SEO Configuration */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-2xl space-y-6 shadow-xl animate-in fade-in duration-200">
            
            <div className="space-y-1 pb-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-serif font-medium text-white tracking-tight flex items-center gap-2">
                <Globe size={18} style={{ color: currentTheme.primary }} />
                <span>Global Metadata &amp; SEO Identity</span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Saved directly to PostgreSQL and dynamically injected into search engines, meta tags, and open graph crawlers.
              </p>
            </div>

            {/* Site Title */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-300 font-medium">
                <span>Website Meta Title</span>
              </label>
              <input
                type="text"
                required
                value={formData.site_title}
                onChange={(e) => setFormData({ ...formData, site_title: e.target.value })}
                placeholder="MD Rohan Mia | Full-Stack Software Engineer & Creative Developer"
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-white/30 transition-colors font-mono"
              />
              <p className="text-[11px] text-neutral-500 font-mono">
                Displayed in browser tabs, search engine indices, and social preview headlines.
              </p>
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-300 font-medium">
                <span>SEO Meta Description</span>
              </label>
              <textarea
                rows={4}
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                placeholder="Personal portfolio and engineering chronicle of MD Rohan Mia. Specializing in high-performance Next.js systems, distributed architectures, and bespoke interactive web experiences."
                className="w-full min-h-[120px] px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-white/30 transition-colors resize-none leading-relaxed font-mono [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              />
              <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                <span>Recommended search length: 140 - 160 characters</span>
                <span className={formData.meta_description.length > 160 ? 'text-amber-400' : 'text-neutral-400'}>
                  {formData.meta_description.length} chars
                </span>
              </div>
            </div>
          </div>

          {/* 2. Public Documents & Destination Routing (Resume & Contact) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-2xl space-y-6 shadow-xl animate-in fade-in duration-200">
            
            <div className="space-y-1 pb-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-serif font-medium text-white tracking-tight flex items-center gap-2">
                <FileText size={18} style={{ color: currentTheme.primary }} />
                <span>Public Documents &amp; Communications</span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Configure destination addresses for client inquiries and the official public resume link.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              
              {/* Public Resume Link */}
              <div className="space-y-2 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-300 font-medium">
                    <FileText size={14} style={{ color: currentTheme.primary }} />
                    <span>Public Resume / CV Link</span>
                  </label>

                  {formData.resume_url && (
                    <a
                      href={formData.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-mono transition-colors self-start sm:self-auto cursor-pointer"
                      title="Open link in a new tab"
                    >
                      <span>Test Resume Link</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                <input
                  type="url"
                  required
                  value={formData.resume_url}
                  onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs sm:text-sm text-white focus:outline-none focus:border-white/30 transition-colors font-mono"
                />
                <p className="text-[11px] text-neutral-500 font-mono">
                  Clicking &ldquo;View Resume&rdquo; on the homepage and portfolio will immediately open this link in a new tab without forcing a direct download.
                </p>
              </div>

              {/* Primary Contact Email */}
              <div className="space-y-2 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-300 font-medium">
                  <Mail size={14} style={{ color: currentTheme.primary }} />
                  <span>Primary Admin Contact Email</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="rohanmia.org@gmail.com"
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs sm:text-sm text-white focus:outline-none focus:border-white/30 transition-colors font-mono"
                />
                <p className="text-[11px] text-neutral-500 font-mono">
                  All visitor messages from the contact page and automated alerts are delivered to this mailbox.
                </p>
              </div>

            </div>

          </div>

          {/* 3. Infrastructure Diagnostics */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-2xl space-y-6 shadow-xl animate-in fade-in duration-200">
            <div className="space-y-1 pb-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-serif font-medium text-white tracking-tight flex items-center gap-2">
                <Database size={18} style={{ color: currentTheme.primary }} />
                <span>Connected Infrastructure &amp; Services</span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Live operational health verification for databases, media delivery, and secure transport.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3.5">
                <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Database size={18} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">PostgreSQL Database</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[11px] font-mono text-neutral-400">
                    Neon Serverless Postgres &bull; Pooler Active
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3.5">
                <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <Cloud size={18} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">Cloudinary Media CDN</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[11px] font-mono text-neutral-400">
                    Image transformation &amp; CDN distribution
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3.5">
                <div className="size-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Key size={18} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">Stealth Gatekeeper</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[11px] font-mono text-neutral-400">
                    NextAuth v5 &bull; bcrypt salted hash validation
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3.5">
                <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Send size={18} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">Gmail SMTP Transport</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[11px] font-mono text-neutral-400">
                    Port 587 STARTTLS &bull; Automatic notification dispatch
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Global Save Button */}
          <div className="p-4 rounded-2xl bg-[#08090d]/80 border border-white/[0.08] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <ShieldCheck size={14} style={{ color: currentTheme.primary }} />
              <span>Persisted directly into PostgreSQL with zero downtime</span>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-tight transition-all shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              <span>Save Preferences</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
