'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Save, 
  Loader2, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Mail,
  FileText,
  Globe
} from 'lucide-react';
import { fetchAdminSettings, saveAdminSettings } from '@/actions/adminSettings';
import { DbSiteSettingsRow } from '@/lib/db/content';
import { useToast } from '@/components/admin/ui/Toast';
import { useThemeAccent } from '@/components/theme/ThemeProvider';

export default function AdminSettingsPage() {
  const { currentTheme } = useThemeAccent();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<DbSiteSettingsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    site_title: '',
    meta_description: '',
    contact_email: '',
    resume_url: '',
  });

  const loadSettings = async () => {
    setLoading(true);
    const res = await fetchAdminSettings();
    if (res.success && res.settings) {
      setSettings(res.settings);
      setFormData({
        site_title: res.settings.site_title || '',
        meta_description: res.settings.meta_description || '',
        contact_email: res.settings.contact_email || '',
        resume_url: res.settings.resume_url || '/resume.pdf',
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
        showToast('Settings saved successfully.', 'success');
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
    <div className="space-y-12 max-w-4xl pb-16">
      
      {/* Header */}
      <div className="relative rounded-[32px] bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-2xl p-8 sm:p-12 shadow-2xl space-y-4 overflow-hidden">
        <div className="space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block">
            STUDIO SETTINGS
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal text-white tracking-tight leading-[1.12]">
            Site &amp;{' '}
            <span 
              className="font-serif italic font-normal text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${currentTheme.primary} 100%)`
              }}
            >
              Preferences
            </span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed max-w-xl">
            Configure global website metadata, contact routing, and public resume assets.
          </p>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="p-8 sm:p-10 rounded-[32px] bg-[#0c1017]/70 border border-white/[0.08] backdrop-blur-xl space-y-8 shadow-xl">
        
        {/* Site Title */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-300">
            <Globe size={14} style={{ color: currentTheme.primary }} />
            <span>Website Meta Title</span>
          </label>
          <input
            type="text"
            required
            value={formData.site_title}
            onChange={(e) => setFormData({ ...formData, site_title: e.target.value })}
            placeholder="MD Rohan Mia | Full-Stack Software Engineer"
            className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
          />
          <p className="text-xs text-neutral-500 font-mono">
            Displayed in browser tabs and search engine result previews.
          </p>
        </div>

        {/* Meta Description */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-300">
            <FileText size={14} className="text-cyan-400" />
            <span>SEO Meta Description</span>
          </label>
          <textarea
            rows={4}
            value={formData.meta_description}
            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
            placeholder="Specializing in Next.js 16 architectures, type-safe full-stack platforms, and cinematic UI/UX."
            className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-sm text-neutral-200 focus:outline-none focus:border-white/30 transition-colors"
          />
          <p className="text-xs text-neutral-500 font-mono">
            Optimal length between 140 and 160 characters for search snippet previews.
          </p>
        </div>

        {/* Contact Email */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-300">
            <Mail size={14} className="text-cyan-400" />
            <span>Primary Contact Email</span>
          </label>
          <input
            type="email"
            required
            value={formData.contact_email}
            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
            placeholder="rohanmia.org@gmail.com"
            className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
          />
          <p className="text-xs text-neutral-500 font-mono">
            Destination for inquiry notifications and footer mailto links.
          </p>
        </div>

        {/* Resume URL */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-300">
            <FileText size={14} className="text-cyan-400" />
            <span>Public Resume URL / Path</span>
          </label>
          <input
            type="text"
            required
            value={formData.resume_url}
            onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
            placeholder="/resume.pdf"
            className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
          />
          <p className="text-xs text-neutral-500 font-mono">
            Direct download link for your curriculum vitae on homepage and about sections.
          </p>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <ShieldCheck size={14} />
            <span>Neon PostgreSQL Encrypted Storage</span>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 rounded-2xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-2 transition-all shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            <span>Save Preferences</span>
          </button>
        </div>

      </form>

    </div>
  );
}
