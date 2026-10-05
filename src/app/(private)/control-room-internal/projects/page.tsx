'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FolderGit2, 
  Plus, 
  Search, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Star, 
  StarOff, 
  Check, 
  X, 
  Loader2,
  ArrowUpRight
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import { fetchAdminProjects, saveAdminProject, removeAdminProject, toggleFeaturedProject } from '@/actions/adminProjects';
import { DbProjectRow } from '@/lib/db/projects';
import { useToast } from '@/components/admin/ui/Toast';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import AdminModal from '@/components/admin/ui/AdminModal';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import TechBadge from '@/components/ui/TechBadge';
import TechAutocompleteInput from '@/components/ui/TechAutocompleteInput';

const CATEGORIES = ['All', 'Full Stack', 'Frontend', 'Backend', 'App'] as const;

export default function AdminProjectsPage() {
  const { currentTheme } = useThemeAccent();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<DbProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [editingProject, setEditingProject] = useState<Partial<DbProjectRow> | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load projects from database
  const loadProjects = async () => {
    setLoading(true);
    const res = await fetchAdminProjects();
    if (res.success && res.projects) {
      setProjects(res.projects);
    } else {
      showToast(res.error || 'Failed to fetch projects', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        p.title.toLowerCase().includes(q) || 
        p.tagline?.toLowerCase().includes(q) ||
        p.tech_stack?.some(t => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [projects, selectedCategory, searchQuery]);

  // Handle Save (Create or Update)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title?.trim()) {
      showToast('Project title is required.', 'error');
      return;
    }

    startTransition(async () => {
      const res = await saveAdminProject({
        ...editingProject,
        title: editingProject.title!.trim(),
        category: editingProject.category || 'Full Stack',
      });

      if (res.success && res.project) {
        showToast(editingProject.id ? 'Project updated successfully.' : 'Project created successfully.', 'success');
        setEditingProject(null);
        loadProjects();
      } else {
        showToast(res.error || 'Failed to save project', 'error');
      }
    });
  };

  // Handle Toggle Featured
  const handleToggleFeatured = async (p: DbProjectRow) => {
    startTransition(async () => {
      const res = await toggleFeaturedProject(p.id, p.featured);
      if (res.success) {
        showToast(`Project marked as ${!p.featured ? 'Featured' : 'Standard'}.`, 'success');
        setProjects(prev => prev.map(item => item.id === p.id ? { ...item, featured: !item.featured } : item));
      } else {
        showToast(res.error || 'Could not update status', 'error');
      }
    });
  };

  // Handle Delete
  const confirmDelete = async () => {
    if (!deletingId) return;
    startTransition(async () => {
      const res = await removeAdminProject(deletingId);
      if (res.success) {
        showToast('Project deleted successfully.', 'success');
        setProjects(prev => prev.filter(p => p.id !== deletingId));
      } else {
        showToast(res.error || 'Failed to delete project', 'error');
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-8 max-w-6xl pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1.5">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
            SELECTED WORKS & ARCHITECTURE
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white tracking-tight">
            Projects &{' '}
            <span 
              className="font-serif italic font-normal text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${currentTheme.primary} 100%)`
              }}
            >
              Systems
            </span>
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            {projects.length} project(s) synchronized with PostgreSQL
          </p>
        </div>

        <button
          onClick={() => setEditingProject({
            title: '',
            tagline: '',
            category: 'Full Stack',
            featured: false,
            overview: '',
            preview_image: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=1000',
            live_url: '',
            github_url: '',
            tech_stack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
          })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-tight transition-all shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={selectedCategory === cat ? {
                borderColor: `${currentTheme.primary}50`,
                backgroundColor: `${currentTheme.primary}15`,
                color: '#ffffff',
                boxShadow: `0 0 12px ${currentTheme.glow}`,
              } : undefined}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'font-semibold border'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/20 focus:outline-none text-xs text-white placeholder:text-neutral-500 font-mono transition-colors"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500 font-mono text-xs">
          <Loader2 size={24} className="animate-spin text-white" />
          <span>Loading projects from database...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0c0e14]/60 border border-white/[0.08] space-y-2">
          <FolderGit2 size={32} className="mx-auto text-neutral-600" />
          <p className="text-sm text-neutral-300 font-medium">No projects found</p>
          <p className="text-xs text-neutral-500 font-mono">
            {searchQuery ? 'Try matching another query' : 'Create your first project above'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] hover:border-white/20 backdrop-blur-2xl overflow-hidden flex flex-col justify-between group transition-all"
            >
              {/* Image Preview & Badges */}
              <div className="relative h-48 sm:h-52 w-full bg-neutral-900 overflow-hidden">
                <Image
                  src={p.preview_image || 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=1000'}
                  alt={p.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-transparent to-black/30" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-mono text-white border border-white/10 uppercase tracking-wider">
                    {p.category}
                  </span>
                  {p.featured && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 backdrop-blur-md text-[10px] font-mono text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Star size={10} />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                {/* Quick Toggle Featured Button */}
                <button
                  onClick={() => handleToggleFeatured(p)}
                  title={p.featured ? 'Unfeature' : 'Feature on homepage'}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-neutral-300 hover:text-white border border-white/10 transition-colors"
                >
                  {p.featured ? <Star size={14} className="text-amber-400 fill-amber-400" /> : <StarOff size={14} />}
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold text-white tracking-tight leading-snug">
                      {p.title}
                    </h2>
                    <span className="text-[11px] font-mono text-neutral-500 shrink-0">
                      {p.year || '2026'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {p.tagline || p.overview || 'Engineering project description.'}
                  </p>

                  {/* Tech stack pills */}
                  {p.tech_stack && p.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {p.tech_stack.slice(0, 4).map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] font-mono text-neutral-300 border border-white/[0.06]"
                        >
                          {tech}
                        </span>
                      ))}
                      {p.tech_stack.length > 4 && (
                        <span className="text-[10px] font-mono text-neutral-500 self-center">
                          +{p.tech_stack.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {p.live_url && (
                      <Link
                        href={p.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                        title="Open Live URL"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    )}
                    {p.github_url && (
                      <Link
                        href={p.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                        title="Open GitHub"
                      >
                        <FaGithub size={14} />
                      </Link>
                    )}
                    <Link
                      href={`/projects/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-neutral-500 hover:text-neutral-300 flex items-center gap-1 pl-1"
                    >
                      <span>Public</span>
                      <ArrowUpRight size={11} />
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingProject(p)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-white transition-colors"
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setDeletingId(p.id)}
                      className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      <AdminModal
        isOpen={Boolean(editingProject)}
        onClose={() => setEditingProject(null)}
        title={editingProject?.id ? 'Edit Project' : 'Create New Project'}
        subtitle="Synchronizes directly with Neon PostgreSQL"
        maxWidth="max-w-2xl"
      >
        {editingProject && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingProject.title || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  placeholder="e.g. FlatFlow - Management"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Category
                </label>
                <select
                  value={editingProject.category || 'Full Stack'}
                  onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0e14] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white font-mono"
                >
                  <option value="Full Stack">Full Stack</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="App">App</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Tagline / Catchphrase
              </label>
              <input
                type="text"
                value={editingProject.tagline || ''}
                onChange={(e) => setEditingProject({ ...editingProject, tagline: e.target.value })}
                placeholder="e.g. Next-generation platform for property management"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Preview Image URL (Cloudinary or Unsplash)
              </label>
              <input
                type="url"
                value={editingProject.preview_image || ''}
                onChange={(e) => setEditingProject({ ...editingProject, preview_image: e.target.value })}
                placeholder="https://res.cloudinary.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Live Demo URL
                </label>
                <input
                  type="url"
                  value={editingProject.live_url || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, live_url: e.target.value })}
                  placeholder="https://project.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={editingProject.github_url || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, github_url: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Tech Stack
              </label>
              <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-xl bg-black/40 border border-white/[0.08] min-h-[42px] items-center">
                {(() => {
                  const stack = Array.isArray(editingProject.tech_stack)
                    ? editingProject.tech_stack
                    : [];
                  if (stack.length === 0) {
                    return (
                      <span className="text-xs text-neutral-600 font-mono italic">
                        No technologies added yet. Type below to add with brand icons.
                      </span>
                    );
                  }
                  return stack.map((tech, idx) => (
                    <div key={idx} className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <TechBadge name={tech} size="sm" />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = stack.filter((_, i) => i !== idx);
                          setEditingProject({ ...editingProject, tech_stack: updated });
                        }}
                        className="text-neutral-400 hover:text-rose-400 p-0.5 cursor-pointer transition-colors"
                        title={`Remove ${tech}`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ));
                })()}
              </div>
              <TechAutocompleteInput
                onAddTech={(tech) => {
                  const currentStack = Array.isArray(editingProject.tech_stack) ? editingProject.tech_stack : [];
                  if (tech && !currentStack.includes(tech)) {
                    setEditingProject({
                      ...editingProject,
                      tech_stack: [...currentStack, tech]
                    });
                  }
                }}
                placeholder="Type tech name (e.g. Next.js, PostgreSQL, Docker)..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Overview
              </label>
              <textarea
                rows={3}
                value={editingProject.overview || ''}
                onChange={(e) => setEditingProject({ ...editingProject, overview: e.target.value })}
                placeholder="Architectural overview of the project..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="featured-checkbox"
                checked={Boolean(editingProject.featured)}
                onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-emerald-500 cursor-pointer"
              />
              <label htmlFor="featured-checkbox" className="text-xs text-neutral-300 font-medium cursor-pointer">
                Feature this project on Homepage Bento & Selected Studies
              </label>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-tight transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>Save Project</span>
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Delete Project?"
        description="Are you sure you want to remove this project? This change is permanent and will delete it from the Neon PostgreSQL database."
        confirmText="Delete Permanently"
        confirmVariant="danger"
        isLoading={isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeletingId(null)}
      />

    </div>
  );
}
