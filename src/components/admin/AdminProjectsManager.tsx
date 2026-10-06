'use client';

import React, { useState, useTransition, useRef } from 'react';
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
  Check, 
  X, 
  Loader2,
  ArrowUpRight,
  GripVertical,
  ChevronUp,
  ChevronDown,
  UploadCloud,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Eye,
  Layers
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import { 
  saveAdminProject, 
  removeAdminProject, 
  reorderAdminProjects,
  saveAdminFeaturedCaseStudy,
  removeAdminFeaturedCaseStudy,
  reorderAdminFeaturedCaseStudies
} from '@/actions/adminProjects';
import { uploadImage } from '@/actions/upload';
import { DbProjectRow, DbFeaturedCaseStudyRow } from '@/lib/db/projects';
import { useToast } from '@/components/admin/ui/Toast';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import AdminModal from '@/components/admin/ui/AdminModal';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import TechBadge from '@/components/ui/TechBadge';
import TechAutocompleteInput from '@/components/ui/TechAutocompleteInput';
import FeaturedCaseStudies from '@/components/home/FeaturedCaseStudies';

const CATEGORIES = ['All', 'Full Stack', 'Frontend', 'Backend', 'App'] as const;

const PRESET_GRADIENTS = [
  { label: 'Deep Ocean (Indigo)', value: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 40%, #415a77 100%)', accent: '#38bdf8' },
  { label: 'Emerald Forest (Green)', value: 'linear-gradient(135deg, #062419 0%, #0d402b 40%, #15803d 100%)', accent: '#34d399' },
  { label: 'Midnight Obsidian (Dark Violet)', value: 'linear-gradient(135deg, #182848 0%, #293859 50%, #4b6cb7 100%)', accent: '#6366f1' },
  { label: 'Crimson Nebula (Ruby)', value: 'linear-gradient(135deg, #2b0b14 0%, #4c1122 50%, #9f1239 100%)', accent: '#f43f5e' },
  { label: 'Sunset Amber (Warm Gold)', value: 'linear-gradient(135deg, #2e1605 0%, #4a2800 50%, #b45309 100%)', accent: '#f59e0b' },
];

interface AdminProjectsManagerProps {
  initialProjects: DbProjectRow[];
  initialFeatured: DbFeaturedCaseStudyRow[];
}

export default function AdminProjectsManager({
  initialProjects,
  initialFeatured,
}: AdminProjectsManagerProps) {
  const { currentTheme } = useThemeAccent();
  const { showToast } = useToast();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'featured' | 'projects'>('featured');

  // Instantaneous 0ms initial states
  const [projects, setProjects] = useState<DbProjectRow[]>(initialProjects);
  const [featuredList, setFeaturedList] = useState<DbFeaturedCaseStudyRow[]>(initialFeatured);

  // Filter & Search states for regular projects
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 2-Step Project Modal State
  const [projectModalStep, setProjectModalStep] = useState<1 | 2>(1);
  const [editingProject, setEditingProject] = useState<Partial<DbProjectRow> | null>(null);
  const [showClientRepoInput, setShowClientRepoInput] = useState(false);
  const [showServerRepoInput, setShowServerRepoInput] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // Featured Case Study Modal State
  const [editingFeatured, setEditingFeatured] = useState<Partial<DbFeaturedCaseStudyRow> | null>(null);
  const [deletingFeaturedId, setDeletingFeaturedId] = useState<string | null>(null);

  // Image Upload States
  const [uploadingProjMain, setUploadingProjMain] = useState(false);
  const [uploadingProjHover, setUploadingProjHover] = useState(false);
  const [uploadingFeatMain, setUploadingFeatMain] = useState(false);
  const [uploadingFeatHover, setUploadingFeatHover] = useState(false);

  const projMainFileInputRef = useRef<HTMLInputElement>(null);
  const projHoverFileInputRef = useRef<HTMLInputElement>(null);
  const featMainFileInputRef = useRef<HTMLInputElement>(null);
  const featHoverFileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop states for Featured Case Studies
  const [draggedFeatIdx, setDraggedFeatIdx] = useState<number | null>(null);
  const [dragOverFeatIdx, setDragOverFeatIdx] = useState<number | null>(null);

  // Drag and drop states for Regular Projects
  const [draggedProjIdx, setDraggedProjIdx] = useState<number | null>(null);
  const [dragOverProjIdx, setDragOverProjIdx] = useState<number | null>(null);

  const [isPending, startTransition] = useTransition();

  // Filtered regular projects
  const filteredProjects = React.useMemo(() => {
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

  // Staggered columns for Studio Engine matching Surface Canvas layout
  const col1StudioProjects = React.useMemo(() => {
    return filteredProjects.filter((_, i) => i % 2 === 0);
  }, [filteredProjects]);

  const col2StudioProjects = React.useMemo(() => {
    return filteredProjects.filter((_, i) => i % 2 === 1);
  }, [filteredProjects]);

  // Mapped featured list for FeaturedCaseStudies component
  const mappedFeatured = React.useMemo(() => {
    return featuredList.map(f => ({
      id: f.id,
      slug: f.slug,
      title: f.title,
      tagline: f.tagline,
      category: f.category as any,
      featured: true,
      role: 'Lead Architect & Engineer',
      year: f.year,
      targetAudience: '',
      overview: f.overview,
      problem: '',
      solution: '',
      gradient: f.gradient,
      accentColor: f.accent_color,
      previewImage: f.preview_image,
      hoverImage: f.hover_image,
      githubUrl: f.github_url,
      clientUrl: f.client_url,
      serverUrl: f.server_url,
      liveUrl: f.live_url,
      techStack: f.tech_stack || [],
      architecture: { frontend: [], backend: [], database: [], infrastructure: [] },
      systemBreakdown: [],
      challenges: [],
      technicalDecisions: [],
      keyFeatures: f.key_features || [],
      metrics: [],
    }));
  }, [featuredList]);

  // =========================================================================
  // IMAGE UPLOAD HANDLERS (Cloudinary, Protected Link)
  // =========================================================================
  const handleUploadProjectMain = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProjMain(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadImage(formData);
      if (res.success && res.url) {
        setEditingProject((prev) => prev ? { ...prev, preview_image: res.url } : prev);
        showToast('Main thumbnail uploaded successfully!', 'success');
      } else {
        showToast(res.error || 'Failed to upload image', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error uploading image', 'error');
    } finally {
      setUploadingProjMain(false);
      if (projMainFileInputRef.current) projMainFileInputRef.current.value = '';
    }
  };

  const handleUploadProjectHover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProjHover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadImage(formData);
      if (res.success && res.url) {
        setEditingProject((prev) => prev ? { ...prev, hover_image: res.url } : prev);
        showToast('Hover reveal image uploaded successfully!', 'success');
      } else {
        showToast(res.error || 'Failed to upload image', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error uploading image', 'error');
    } finally {
      setUploadingProjHover(false);
      if (projHoverFileInputRef.current) projHoverFileInputRef.current.value = '';
    }
  };

  const handleUploadFeaturedMain = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFeatMain(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadImage(formData);
      if (res.success && res.url) {
        setEditingFeatured((prev) => prev ? { ...prev, preview_image: res.url } : prev);
        showToast('Main thumbnail uploaded successfully!', 'success');
      } else {
        showToast(res.error || 'Failed to upload thumbnail', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error uploading image', 'error');
    } finally {
      setUploadingFeatMain(false);
      if (featMainFileInputRef.current) featMainFileInputRef.current.value = '';
    }
  };

  const handleUploadFeaturedHover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFeatHover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadImage(formData);
      if (res.success && res.url) {
        setEditingFeatured((prev) => prev ? { ...prev, hover_image: res.url } : prev);
        showToast('Hover reveal image uploaded successfully!', 'success');
      } else {
        showToast(res.error || 'Failed to upload hover reveal image', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error uploading image', 'error');
    } finally {
      setUploadingFeatHover(false);
      if (featHoverFileInputRef.current) featHoverFileInputRef.current.value = '';
    }
  };

  // =========================================================================
  // REGULAR PROJECT HANDLERS (2-Step Validation & 0ms Optimistic Save)
  // =========================================================================
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title?.trim()) {
      showToast('Project title is required.', 'error');
      setProjectModalStep(1);
      return;
    }

    // Step 2 Validation: Case Study Context is mandatory!
    if (!editingProject?.overview?.trim()) {
      showToast('Case study overview is required.', 'error');
      setProjectModalStep(2);
      return;
    }
    if (!editingProject?.problem?.trim()) {
      showToast('Case study problem statement is required.', 'error');
      setProjectModalStep(2);
      return;
    }
    if (!editingProject?.solution?.trim()) {
      showToast('Case study architectural solution is required.', 'error');
      setProjectModalStep(2);
      return;
    }

    const isNew = !editingProject.id;
    const projId = editingProject.id || `proj_${Date.now()}`;
    const slug = editingProject.slug?.trim() || editingProject.title!.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const savedData: DbProjectRow = {
      id: projId,
      slug,
      title: editingProject.title!.trim(),
      tagline: editingProject.tagline?.trim() || '',
      category: editingProject.category || 'Full Stack',
      featured: Boolean(editingProject.featured),
      role: editingProject.role || 'Lead Engineer',
      year: editingProject.year || '2026',
      target_audience: editingProject.target_audience || '',
      overview: editingProject.overview.trim(),
      problem: editingProject.problem.trim(),
      solution: editingProject.solution.trim(),
      gradient: editingProject.gradient || 'linear-gradient(135deg, #182848 0%, #4b6cb7 100%)',
      accent_color: editingProject.accent_color || '#6366f1',
      preview_image: editingProject.preview_image || '',
      hover_image: editingProject.hover_image || '',
      github_url: editingProject.github_url?.trim() || '',
      client_url: editingProject.client_url?.trim() || '',
      server_url: editingProject.server_url?.trim() || '',
      live_url: editingProject.live_url?.trim() || '',
      tech_stack: editingProject.tech_stack || [],
      architecture: editingProject.architecture || { frontend: [], backend: [], database: [], infrastructure: [] },
      system_breakdown: editingProject.system_breakdown || [],
      challenges: editingProject.challenges || [],
      technical_decisions: editingProject.technical_decisions || [],
      key_features: editingProject.key_features || [],
      metrics: editingProject.metrics || [],
      directory_tree: editingProject.directory_tree || '',
      sort_order: editingProject.sort_order ?? (isNew ? projects.length : 0),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 0ms Optimistic UI update
    setProjects(prev => {
      const idx = prev.findIndex(p => p.id === projId);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = savedData;
        return updated;
      }
      return [...prev, savedData];
    });

    showToast(isNew ? 'Project created successfully.' : 'Project updated successfully.', 'success');
    setEditingProject(null);
    setProjectModalStep(1);

    // Persist in background
    startTransition(async () => {
      await saveAdminProject(savedData);
    });
  };

  const confirmDeleteProject = async () => {
    if (!deletingProjectId) return;
    const targetId = deletingProjectId;
    setDeletingProjectId(null);

    // 0ms Optimistic UI removal
    setProjects(prev => prev.filter(p => p.id !== targetId));
    showToast('Project deleted successfully.', 'success');

    startTransition(async () => {
      await removeAdminProject(targetId);
    });
  };

  // Move Project Up/Down (0ms Optimistic)
  const handleMoveProject = async (id: string, direction: 'up' | 'down') => {
    const curIdx = projects.findIndex(p => p.id === id);
    if (curIdx === -1) return;
    const targetIdx = direction === 'up' ? curIdx - 1 : curIdx + 1;
    if (targetIdx < 0 || targetIdx >= projects.length) return;

    const reordered = [...projects];
    const [moved] = reordered.splice(curIdx, 1);
    reordered.splice(targetIdx, 0, moved);

    // 0ms Optimistic UI
    setProjects(reordered);

    const ids = reordered.map(p => p.id);
    startTransition(async () => {
      await reorderAdminProjects(ids);
    });
  };

  // Drop Project (0ms Optimistic)
  const handleDropProject = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (draggedProjIdx === null || draggedProjIdx === dropIdx) {
      setDraggedProjIdx(null);
      setDragOverProjIdx(null);
      return;
    }

    const reordered = [...projects];
    const [moved] = reordered.splice(draggedProjIdx, 1);
    reordered.splice(dropIdx, 0, moved);

    setProjects(reordered);
    setDraggedProjIdx(null);
    setDragOverProjIdx(null);

    const ids = reordered.map(p => p.id);
    startTransition(async () => {
      await reorderAdminProjects(ids);
    });
  };

  // =========================================================================
  // FEATURED CASE STUDIES HANDLERS (0ms Optimistic)
  // =========================================================================
  const handleSaveFeatured = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeatured?.title?.trim()) {
      showToast('Title is required.', 'error');
      return;
    }
    if (!editingFeatured?.tagline?.trim()) {
      showToast('Tagline is required for featured card.', 'error');
      return;
    }
    if (!editingFeatured?.overview?.trim()) {
      showToast('Overview is required.', 'error');
      return;
    }

    const featId = editingFeatured.id || `fcs_${Date.now()}`;
    const slug = editingFeatured.slug?.trim() || editingFeatured.title!.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const savedData: DbFeaturedCaseStudyRow = {
      id: featId,
      slug,
      title: editingFeatured.title!.trim(),
      tagline: editingFeatured.tagline!.trim(),
      overview: editingFeatured.overview!.trim(),
      category: editingFeatured.category || 'Full Stack',
      year: editingFeatured.year || '2026',
      preview_image: editingFeatured.preview_image || '',
      hover_image: editingFeatured.hover_image || '',
      gradient: editingFeatured.gradient || 'linear-gradient(135deg, #182848 0%, #4b6cb7 100%)',
      accent_color: editingFeatured.accent_color || '#6366f1',
      key_features: editingFeatured.key_features || [],
      tech_stack: editingFeatured.tech_stack || [],
      live_url: editingFeatured.live_url?.trim() || '',
      github_url: editingFeatured.github_url?.trim() || '',
      client_url: editingFeatured.client_url?.trim() || '',
      server_url: editingFeatured.server_url?.trim() || '',
      sort_order: editingFeatured.sort_order ?? 0,
    };

    // 0ms Optimistic update
    setFeaturedList(prev => {
      const idx = prev.findIndex(f => f.id === featId);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = savedData;
        return updated;
      }
      return [...prev, savedData];
    });

    showToast(editingFeatured.id ? 'Featured Case Study updated.' : 'Featured Case Study created.', 'success');
    setEditingFeatured(null);

    startTransition(async () => {
      await saveAdminFeaturedCaseStudy(savedData);
    });
  };

  const confirmDeleteFeatured = async () => {
    if (!deletingFeaturedId) return;
    const targetId = deletingFeaturedId;
    setDeletingFeaturedId(null);

    setFeaturedList(prev => prev.filter(f => f.id !== targetId));
    showToast('Featured Case Study removed.', 'success');

    startTransition(async () => {
      await removeAdminFeaturedCaseStudy(targetId);
    });
  };

  // Move Featured Up/Down (0ms Optimistic)
  const handleMoveFeatured = async (id: string, direction: 'up' | 'down') => {
    const curIdx = featuredList.findIndex(f => f.id === id);
    if (curIdx === -1) return;
    const targetIdx = direction === 'up' ? curIdx - 1 : curIdx + 1;
    if (targetIdx < 0 || targetIdx >= featuredList.length) return;

    const reordered = [...featuredList];
    const [moved] = reordered.splice(curIdx, 1);
    reordered.splice(targetIdx, 0, moved);

    setFeaturedList(reordered);

    const ids = reordered.map(f => f.id);
    startTransition(async () => {
      await reorderAdminFeaturedCaseStudies(ids);
    });
  };

  // Drop Featured (0ms Optimistic)
  const handleDropFeatured = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (draggedFeatIdx === null || draggedFeatIdx === dropIdx) {
      setDraggedFeatIdx(null);
      setDragOverFeatIdx(null);
      return;
    }

    const reordered = [...featuredList];
    const [moved] = reordered.splice(draggedFeatIdx, 1);
    reordered.splice(dropIdx, 0, moved);

    setFeaturedList(reordered);
    setDraggedFeatIdx(null);
    setDragOverFeatIdx(null);

    const ids = reordered.map(f => f.id);
    startTransition(async () => {
      await reorderAdminFeaturedCaseStudies(ids);
    });
  };

  return (
    <div className="space-y-8 max-w-6xl px-4 sm:px-8 pt-4 sm:pt-6 pb-24 animate-in fade-in duration-200">
      
      {/* Top Header (Compact & Tight) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div className="space-y-1">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
            SELECTED WORKS & ARCHITECTURE
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-white tracking-tight">
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
            {featuredList.length} Homepage Featured Case Study(s) &bull; {projects.length} Total Projects in PostgreSQL
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <Link
            href="/projects"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-neutral-300 hover:text-white border border-white/[0.08] transition-colors"
          >
            <span>Public View</span>
            <ArrowUpRight size={12} />
          </Link>

          {activeTab === 'featured' ? (
            <button
              onClick={() => setEditingFeatured({
                title: '',
                tagline: '',
                category: 'Full Stack',
                year: '2026',
                overview: '',
                preview_image: '',
                hover_image: '',
                tech_stack: [],
                live_url: '',
                github_url: '',
                client_url: '',
                server_url: '',
                gradient: 'linear-gradient(135deg, #182848 0%, #4b6cb7 100%)',
                accent_color: '#6366f1',
                key_features: [
                  { title: '', description: '' },
                  { title: '', description: '' },
                  { title: '', description: '' },
                  { title: '', description: '' },
                ],
              })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-[11px] sm:text-xs tracking-tight transition-all cursor-pointer shadow-md"
            >
              <Sparkles size={13} />
              <span>+ Add Case Study</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingProject({
                  title: '',
                  tagline: '',
                  category: 'Full Stack',
                  role: 'Lead Engineer',
                  year: '2026',
                  overview: '',
                  problem: '',
                  solution: '',
                  preview_image: '',
                  hover_image: '',
                  live_url: '',
                  github_url: '',
                  client_url: '',
                  server_url: '',
                  tech_stack: [],
                  key_features: [
                    { title: '', description: '' },
                    { title: '', description: '' },
                    { title: '', description: '' },
                    { title: '', description: '' },
                  ],
                });
                setShowClientRepoInput(false);
                setShowServerRepoInput(false);
                setProjectModalStep(1);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-[11px] sm:text-xs tracking-tight transition-all shadow-md cursor-pointer"
            >
              <Plus size={14} />
              <span>+ Add Project</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          TAB SELECTOR: Featured Case Studies vs All Projects
         ========================================================================= */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0c0e14] border border-white/[0.08] w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('featured')}
          style={activeTab === 'featured' ? {
            backgroundColor: `${currentTheme.primary}20`,
            borderColor: `${currentTheme.primary}40`,
            color: '#ffffff',
            boxShadow: `0 0 12px ${currentTheme.glow}`,
          } : undefined}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-mono transition-all border cursor-pointer ${
            activeTab === 'featured'
              ? 'font-medium'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Sparkles size={12} style={activeTab === 'featured' ? { color: currentTheme.primary } : undefined} />
          <span>Featured<span className="hidden sm:inline"> Case Studies</span></span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/[0.06] text-[10px] text-neutral-400 font-mono">
            {featuredList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          style={activeTab === 'projects' ? {
            backgroundColor: `${currentTheme.primary}20`,
            borderColor: `${currentTheme.primary}40`,
            color: '#ffffff',
            boxShadow: `0 0 12px ${currentTheme.glow}`,
          } : undefined}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-mono transition-all border cursor-pointer ${
            activeTab === 'projects'
              ? 'font-medium'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <FolderGit2 size={12} style={activeTab === 'projects' ? { color: currentTheme.primary } : undefined} />
          <span>All Projects</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/[0.06] text-[10px] text-neutral-400 font-mono">
            {projects.length}
          </span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: FEATURED CASE STUDIES (Homepage Curated Showcase with Public Design)
         ========================================================================= */}
      {activeTab === 'featured' && (
        <section className="space-y-4 animate-in fade-in duration-200">
          <FeaturedCaseStudies
            initialProjects={mappedFeatured}
            isAdmin={true}
            compact={true}
            onEdit={(proj) => {
              const raw = featuredList.find(f => f.id === proj.id);
              if (raw) setEditingFeatured(raw);
            }}
            onDelete={(id) => setDeletingFeaturedId(id)}
            onMove={(id, direction) => handleMoveFeatured(id, direction)}
            onDrop={(sourceIdx, targetIdx) => {
              const reordered = Array.from(featuredList);
              const [moved] = reordered.splice(sourceIdx, 1);
              reordered.splice(targetIdx, 0, moved);
              setFeaturedList(reordered);
              const ids = reordered.map(f => f.id);
              startTransition(async () => {
                await reorderAdminFeaturedCaseStudies(ids);
              });
            }}
            onAdd={() => setEditingFeatured({
              title: '',
              tagline: '',
              category: 'Full Stack',
              year: '2026',
              overview: '',
              preview_image: '',
              hover_image: '',
              tech_stack: [],
              live_url: '',
              github_url: '',
              client_url: '',
              server_url: '',
              gradient: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 40%, #415a77 100%)',
              accent_color: '#38bdf8',
              key_features: [
                { title: '', description: '' },
                { title: '', description: '' },
                { title: '', description: '' },
                { title: '', description: '' },
              ],
            })}
          />
        </section>
      )}

      {/* =========================================================================
          TAB 2: ALL PORTFOLIO PROJECTS (Rendered in Exact Surface ProjectCard Style!)
         ========================================================================= */}
      {activeTab === 'projects' && (
        <section className="space-y-8 animate-in fade-in duration-200">
          
          {/* Controls Bar: Category Filter Pills + Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'font-semibold border'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

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

          {/* Regular Projects Rendered in Exact Surface Staggered 2-Column Style */}
          {filteredProjects.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0c0e14]/60 border border-white/[0.08] space-y-2">
              <FolderGit2 size={32} className="mx-auto text-neutral-600" />
              <p className="text-sm text-neutral-300 font-medium">No projects found</p>
              <p className="text-xs text-neutral-500 font-mono">
                {searchQuery ? 'Try matching another query' : 'Create your first project above'}
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Desktop View: Staggered Columns with Center Dividing Line matching Image 2 */}
              <div className="hidden lg:grid lg:grid-cols-2 lg:gap-16 items-start relative">
                
                {/* Continuous Center Architectural Dividing Axis Line */}
                <div 
                  aria-hidden="true" 
                  className="absolute left-1/2 -translate-x-1/2 -top-6 -bottom-6 w-px bg-white/[0.08] pointer-events-none"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[9px] text-neutral-500 select-none">
                    90°
                  </div>
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `linear-gradient(180deg, transparent, ${currentTheme.primary}, transparent)`
                    }}
                  />
                </div>

                {/* Column 1 (Left - Starts at normal height) */}
                <div className="flex flex-col gap-24">
                  {col1StudioProjects.map((p) => {
                    const origIdx = projects.findIndex(item => item.id === p.id);
                    const filtIdx = filteredProjects.findIndex(item => item.id === p.id);
                    return (
                      <AdminStudioProjectCard
                        key={p.id}
                        project={p}
                        originalIndex={origIdx}
                        displayIndex={filtIdx}
                        totalCount={projects.length}
                        column="left"
                        currentTheme={currentTheme}
                        isDragOver={dragOverProjIdx === origIdx}
                        onDragStart={() => setDraggedProjIdx(origIdx)}
                        onDragOver={(e) => { e.preventDefault(); setDragOverProjIdx(origIdx); }}
                        onDrop={(e) => handleDropProject(e, origIdx)}
                        onMoveUp={() => handleMoveProject(p.id, 'up')}
                        onMoveDown={() => handleMoveProject(p.id, 'down')}
                        onEdit={() => {
                          setEditingProject(p);
                          setShowClientRepoInput(Boolean(p.client_url));
                          setShowServerRepoInput(Boolean(p.server_url));
                          setProjectModalStep(1);
                        }}
                        onDelete={() => setDeletingProjectId(p.id)}
                      />
                    );
                  })}
                </div>

                {/* Column 2 (Right - Staggered / Shifted down by lg:pt-28 matching Image 2!) */}
                <div className="flex flex-col gap-24 lg:pt-28">
                  {col2StudioProjects.map((p) => {
                    const origIdx = projects.findIndex(item => item.id === p.id);
                    const filtIdx = filteredProjects.findIndex(item => item.id === p.id);
                    return (
                      <AdminStudioProjectCard
                        key={p.id}
                        project={p}
                        originalIndex={origIdx}
                        displayIndex={filtIdx}
                        totalCount={projects.length}
                        column="right"
                        currentTheme={currentTheme}
                        isDragOver={dragOverProjIdx === origIdx}
                        onDragStart={() => setDraggedProjIdx(origIdx)}
                        onDragOver={(e) => { e.preventDefault(); setDragOverProjIdx(origIdx); }}
                        onDrop={(e) => handleDropProject(e, origIdx)}
                        onMoveUp={() => handleMoveProject(p.id, 'up')}
                        onMoveDown={() => handleMoveProject(p.id, 'down')}
                        onEdit={() => {
                          setEditingProject(p);
                          setShowClientRepoInput(Boolean(p.client_url));
                          setShowServerRepoInput(Boolean(p.server_url));
                          setProjectModalStep(1);
                        }}
                        onDelete={() => setDeletingProjectId(p.id)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Mobile / Tablet View: Sequential Linear Flow */}
              <div className="flex flex-col gap-20 lg:hidden">
                {filteredProjects.map((p, idx) => {
                  const origIdx = projects.findIndex(item => item.id === p.id);
                  return (
                    <AdminStudioProjectCard
                      key={p.id}
                      project={p}
                      originalIndex={origIdx}
                      displayIndex={idx}
                      totalCount={projects.length}
                      column="left"
                      currentTheme={currentTheme}
                      isDragOver={dragOverProjIdx === origIdx}
                      onDragStart={() => setDraggedProjIdx(origIdx)}
                      onDragOver={(e) => { e.preventDefault(); setDragOverProjIdx(origIdx); }}
                      onDrop={(e) => handleDropProject(e, origIdx)}
                      onMoveUp={() => handleMoveProject(p.id, 'up')}
                      onMoveDown={() => handleMoveProject(p.id, 'down')}
                      onEdit={() => {
                        setEditingProject(p);
                        setShowClientRepoInput(Boolean(p.client_url));
                        setShowServerRepoInput(Boolean(p.server_url));
                        setProjectModalStep(1);
                      }}
                      onDelete={() => setDeletingProjectId(p.id)}
                    />
                  );
                })}
              </div>
            </div>
          )}

        </section>
      )}

      {/* =========================================================================
          MODAL 1: 2-STEP REGULAR PROJECT & CASE STUDY MODAL
          Step 1: General Info, Dual Images (Protected URL), Repos, Tech Stack
          Step 2: Full Case Study Architecture (Mandatory to save!)
         ========================================================================= */}
      <AdminModal
        isOpen={Boolean(editingProject)}
        onClose={() => setEditingProject(null)}
        title={editingProject?.id ? 'Edit Project & Case Study' : 'Create Project & Case Study'}
        subtitle={projectModalStep === 1 ? 'Step 1 of 2: General Identity & Dual Mockup Images' : 'Step 2 of 2: Mandatory System Architecture Case Study'}
        maxWidth="max-w-2xl"
      >
        {editingProject && (
          <form onSubmit={handleSaveProject} className="space-y-5">
            
            {/* Step Navigation Indicator */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setProjectModalStep(1)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    projectModalStep === 1 ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>1. General &amp; Visuals</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProjectModalStep(2)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    projectModalStep === 2 ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>2. Case Study Content *</span>
                </button>
              </div>

              <span className="text-[10px] font-mono text-neutral-500">
                {projectModalStep === 1 ? 'Next: Case Study' : 'Step 2 of 2'}
              </span>
            </div>

            {/* ================= STEP 1: GENERAL INFO & VISUALS ================= */}
            {projectModalStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.title || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                      placeholder="e.g. Reserva"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                      Category *
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

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                      Tagline / Catchphrase *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.tagline || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, tagline: e.target.value })}
                      placeholder="e.g. Instant facility booking with atomic concurrency locks"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                      Year
                    </label>
                    <input
                      type="text"
                      value={editingProject.year || '2026'}
                      onChange={(e) => setEditingProject({ ...editingProject, year: e.target.value })}
                      placeholder="2026"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                    />
                  </div>
                </div>

                {/* DUAL IMAGES UPLOAD (Protected link, cannot mess up URL) */}
                <div className="space-y-3 p-3.5 rounded-2xl bg-black/40 border border-white/[0.06]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block font-semibold">
                    Dual Mockup Images (Screen 1 &amp; Screen 2 Hover Reveal)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Screen 1: Main Preview Thumbnail */}
                    <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-300 block font-medium">
                        Screen 1: Main Thumbnail
                      </label>

                      <div className="relative w-full h-28 rounded-xl overflow-hidden bg-neutral-950 border border-white/10 flex items-center justify-center">
                        {editingProject.preview_image ? (
                          <Image
                            src={editingProject.preview_image}
                            alt="Main Thumbnail"
                            fill
                            className="object-cover object-top"
                          />
                        ) : (
                          <span className="text-xs font-mono text-neutral-600">No thumbnail</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          disabled={uploadingProjMain}
                          onClick={() => projMainFileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-white border border-white/[0.1] transition-all cursor-pointer disabled:opacity-50"
                        >
                          {uploadingProjMain ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                          <span>{editingProject.preview_image ? 'Change Image' : 'Upload Image'}</span>
                        </button>
                        <input
                          ref={projMainFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleUploadProjectMain}
                          className="hidden"
                        />

                        {editingProject.preview_image && (
                          <button
                            type="button"
                            onClick={() => setEditingProject({ ...editingProject, preview_image: '' })}
                            className="p-1.5 text-neutral-400 hover:text-rose-400"
                            title="Remove Image"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Screen 2: Hover Mockup */}
                    <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-300 block font-medium">
                        Screen 2: Hover Mockup (Secondary)
                      </label>

                      <div className="relative w-full h-28 rounded-xl overflow-hidden bg-neutral-950 border border-white/10 flex items-center justify-center">
                        {editingProject.hover_image ? (
                          <Image
                            src={editingProject.hover_image}
                            alt="Hover Mockup"
                            fill
                            className="object-cover object-top"
                          />
                        ) : (
                          <span className="text-xs font-mono text-neutral-600">No hover mockup</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          disabled={uploadingProjHover}
                          onClick={() => projHoverFileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-white border border-white/[0.1] transition-all cursor-pointer disabled:opacity-50"
                        >
                          {uploadingProjHover ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                          <span>{editingProject.hover_image ? 'Change Mockup' : 'Upload Mockup'}</span>
                        </button>
                        <input
                          ref={projHoverFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleUploadProjectHover}
                          className="hidden"
                        />

                        {editingProject.hover_image && (
                          <button
                            type="button"
                            onClick={() => setEditingProject({ ...editingProject, hover_image: '' })}
                            className="p-1.5 text-neutral-400 hover:text-rose-400"
                            title="Remove Mockup"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Demo URL */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={editingProject.live_url || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, live_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                  />
                </div>

                {/* Repositories: Interactive Buttons to reveal Frontend / Backend repos */}
                <div className="space-y-2 p-3.5 rounded-2xl bg-black/40 border border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                      Repositories (GitHub Links)
                    </span>

                    <div className="flex items-center gap-1.5">
                      {!showClientRepoInput && (
                        <button
                          type="button"
                          onClick={() => setShowClientRepoInput(true)}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[10px] font-mono text-neutral-300 hover:text-white border border-white/[0.08] cursor-pointer"
                        >
                          + Frontend Repo
                        </button>
                      )}
                      {!showServerRepoInput && (
                        <button
                          type="button"
                          onClick={() => setShowServerRepoInput(true)}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[10px] font-mono text-neutral-300 hover:text-white border border-white/[0.08] cursor-pointer"
                        >
                          + Backend Repo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Main / Monorepo GitHub */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-neutral-500 block">
                      Main / Combined GitHub Repo
                    </label>
                    <input
                      type="url"
                      value={editingProject.github_url || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, github_url: e.target.value })}
                      placeholder="https://github.com/rohan-mia/..."
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-neutral-600 font-mono"
                    />
                  </div>

                  {/* Client Repo Input */}
                  {showClientRepoInput && (
                    <div className="space-y-1 relative animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono text-neutral-500 block">
                          Client / Frontend Repo URL
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowClientRepoInput(false);
                            setEditingProject({ ...editingProject, client_url: '' });
                          }}
                          className="text-[10px] text-neutral-500 hover:text-rose-400"
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        type="url"
                        value={editingProject.client_url || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, client_url: e.target.value })}
                        placeholder="https://github.com/rohan-mia/...-client"
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-neutral-600 font-mono"
                      />
                    </div>
                  )}

                  {/* Server Repo Input */}
                  {showServerRepoInput && (
                    <div className="space-y-1 relative animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono text-neutral-500 block">
                          Server / Backend Repo URL
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowServerRepoInput(false);
                            setEditingProject({ ...editingProject, server_url: '' });
                          }}
                          className="text-[10px] text-neutral-500 hover:text-rose-400"
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        type="url"
                        value={editingProject.server_url || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, server_url: e.target.value })}
                        placeholder="https://github.com/rohan-mia/...-server"
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-neutral-600 font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* Tech Stack */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                    Tech Stack
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-xl bg-black/40 border border-white/[0.08] min-h-[42px] items-center">
                    {(() => {
                      const stack = Array.isArray(editingProject.tech_stack) ? editingProject.tech_stack : [];
                      if (stack.length === 0) {
                        return (
                          <span className="text-xs text-neutral-600 font-mono italic">
                            No technologies added yet. Type below to pick.
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

                {/* Next Step Button */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => setProjectModalStep(2)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-tight transition-all cursor-pointer"
                  >
                    <span>Next: Case Study Details</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

              </div>
            )}

            {/* ================= STEP 2: MANDATORY CASE STUDY DETAILS ================= */}
            {projectModalStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                    Case Study Overview * (High-level summary)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={editingProject.overview || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, overview: e.target.value })}
                    placeholder="Architectural overview of the system, concurrency goals, and infrastructure setup..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                    The Problem * (Architectural Challenge)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={editingProject.problem || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, problem: e.target.value })}
                    placeholder="Describe the bottleneck, race conditions, or business problems the project solves..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                    The Solution * (Engineering Architecture)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={editingProject.solution || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, solution: e.target.value })}
                    placeholder="Describe the specific engineering patterns, database locks, or algorithms implemented..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono resize-none"
                  />
                </div>

                {/* 4 Key Features Highlights with Placeholders */}
                <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                    Key Features Highlights (✦ 4 Points)
                  </span>

                  {[0, 1, 2, 3].map((fIndex) => {
                    const feat = editingProject.key_features?.[fIndex] || { title: '', description: '' };
                    return (
                      <div key={fIndex} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="space-y-1 sm:col-span-1">
                          <input
                            type="text"
                            value={feat.title || ''}
                            onChange={(e) => {
                              const updated = [...(editingProject.key_features || [])];
                              while (updated.length < 4) updated.push({ title: '', description: '' });
                              updated[fIndex] = { ...updated[fIndex], title: e.target.value };
                              setEditingProject({ ...editingProject, key_features: updated });
                            }}
                            placeholder={
                              fIndex === 0 ? "✦ Point 1 Title" :
                              fIndex === 1 ? "✦ Point 2 Title" :
                              fIndex === 2 ? "✦ Point 3 Title" :
                              "✦ Point 4 Title"
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-neutral-600 font-mono"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <input
                            type="text"
                            value={feat.description || ''}
                            onChange={(e) => {
                              const updated = [...(editingProject.key_features || [])];
                              while (updated.length < 4) updated.push({ title: '', description: '' });
                              updated[fIndex] = { ...updated[fIndex], description: e.target.value };
                              setEditingProject({ ...editingProject, key_features: updated });
                            }}
                            placeholder="Description of the architectural guarantee..."
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-neutral-600 font-mono"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Back and Save Buttons */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setProjectModalStep(1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Back to General Info</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-tight transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    <span>{editingProject.id ? 'Save Changes' : 'Save Project to Database'}</span>
                  </button>
                </div>

              </div>
            )}

          </form>
        )}
      </AdminModal>

      {/* =========================================================================
          MODAL 2: EDIT / CREATE FEATURED CASE STUDY (Empty Placeholders)
         ========================================================================= */}
      <AdminModal
        isOpen={Boolean(editingFeatured)}
        onClose={() => setEditingFeatured(null)}
        title={editingFeatured?.id ? 'Edit Homepage Featured Case Study' : 'Create Featured Case Study'}
        subtitle="Configures the dual-screen mockup & right-side showcase on the Homepage"
        maxWidth="max-w-3xl"
      >
        {editingFeatured && (
          <form onSubmit={handleSaveFeatured} className="space-y-6">
            
            {/* 1. Identity & Headings */}
            <div className="space-y-4 p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-semibold">
                1. Case Study Identity & Heading
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                    Project Title * (1 - 3 Words)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFeatured.title || ''}
                    onChange={(e) => setEditingFeatured({ ...editingFeatured, title: e.target.value })}
                    placeholder="e.g. Reserva"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                    Category *
                  </label>
                  <select
                    value={editingFeatured.category || 'Full Stack'}
                    onChange={(e) => setEditingFeatured({ ...editingFeatured, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0e14] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white font-mono"
                  >
                    <option value="Full Stack">Full Stack</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="App">App</option>
                    <option value="Platform">Platform</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5 sm:col-span-3">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                    Card Tagline *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFeatured.tagline || ''}
                    onChange={(e) => setEditingFeatured({ ...editingFeatured, tagline: e.target.value })}
                    placeholder="e.g. Instant facility booking with atomic concurrency locks"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                    Year
                  </label>
                  <input
                    type="text"
                    value={editingFeatured.year || ''}
                    onChange={(e) => setEditingFeatured({ ...editingFeatured, year: e.target.value })}
                    placeholder="2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. DUAL SCREEN IMAGES UPLOAD (Protected Links) */}
            <div className="space-y-4 p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-semibold">
                2. Dual Screen Images (Mockup on Hover)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Screen 1: Main Preview Thumbnail */}
                <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-white block font-medium">
                    Screen 1: Main Preview Thumbnail *
                  </label>
                  
                  <div className="relative w-full h-32 rounded-xl overflow-hidden bg-neutral-950 border border-white/10 flex items-center justify-center">
                    {editingFeatured.preview_image ? (
                      <Image
                        src={editingFeatured.preview_image}
                        alt="Screen 1 Preview"
                        fill
                        className="object-cover object-top"
                      />
                    ) : (
                      <span className="text-xs font-mono text-neutral-600">No image uploaded</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={uploadingFeatMain}
                      onClick={() => featMainFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-white border border-white/[0.1] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {uploadingFeatMain ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                      <span>{editingFeatured.preview_image ? 'Change Screen 1' : 'Upload Screen 1'}</span>
                    </button>
                    <input
                      ref={featMainFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadFeaturedMain}
                      className="hidden"
                    />

                    {editingFeatured.preview_image && (
                      <button
                        type="button"
                        onClick={() => setEditingFeatured({ ...editingFeatured, preview_image: '' })}
                        className="p-1.5 text-neutral-400 hover:text-rose-400"
                        title="Remove Image"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Screen 2: Hover Reveal Image */}
                <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-white block font-medium">
                    Screen 2: Hover Reveal Mockup (Secondary)
                  </label>
                  
                  <div className="relative w-full h-32 rounded-xl overflow-hidden bg-neutral-950 border border-white/10 flex items-center justify-center">
                    {editingFeatured.hover_image ? (
                      <Image
                        src={editingFeatured.hover_image}
                        alt="Screen 2 Hover Preview"
                        fill
                        className="object-cover object-top"
                      />
                    ) : (
                      <span className="text-xs font-mono text-neutral-600">No hover mockup uploaded</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={uploadingFeatHover}
                      onClick={() => featHoverFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 border border-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {uploadingFeatHover ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                      <span>{editingFeatured.hover_image ? 'Change Screen 2' : 'Upload Screen 2'}</span>
                    </button>
                    <input
                      ref={featHoverFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadFeaturedHover}
                      className="hidden"
                    />

                    {editingFeatured.hover_image && (
                      <button
                        type="button"
                        onClick={() => setEditingFeatured({ ...editingFeatured, hover_image: '' })}
                        className="p-1.5 text-neutral-400 hover:text-rose-400"
                        title="Remove Hover Mockup"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* 3. RIGHT-SIDE SHOWCASE CONTENT */}
            <div className="space-y-4 p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-semibold">
                3. Right-Side Viewport Content (Fixed Sticky Column)
              </span>

              {/* Overview */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Overview / Summary * (Calibrated: 25 - 35 words)
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingFeatured.overview || ''}
                  onChange={(e) => setEditingFeatured({ ...editingFeatured, overview: e.target.value })}
                  placeholder="e.g. Reserva is a high-throughput facility reservation platform engineered with Next.js and MongoDB. It addresses concurrency bottlenecks through atomic locks and dynamic pricing."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono resize-none"
                />
              </div>

              {/* 4 Key Feature Highlights */}
              <div className="space-y-3">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Key Features Highlights (✦ Exactly 4 Points)
                </label>

                <div className="space-y-2.5">
                  {[0, 1, 2, 3].map((fIndex) => {
                    const feat = editingFeatured.key_features?.[fIndex] || { title: '', description: '' };
                    return (
                      <div key={fIndex} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="space-y-1 sm:col-span-1">
                          <input
                            type="text"
                            value={feat.title || ''}
                            onChange={(e) => {
                              const updated = [...(editingFeatured.key_features || [])];
                              while (updated.length < 4) updated.push({ title: '', description: '' });
                              updated[fIndex] = { ...updated[fIndex], title: e.target.value };
                              setEditingFeatured({ ...editingFeatured, key_features: updated });
                            }}
                            placeholder={
                              fIndex === 0 ? "✦ Point 1 Title" :
                              fIndex === 1 ? "✦ Point 2 Title" :
                              fIndex === 2 ? "✦ Point 3 Title" :
                              "✦ Point 4 Title"
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-neutral-600 font-mono"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <input
                            type="text"
                            value={feat.description || ''}
                            onChange={(e) => {
                              const updated = [...(editingFeatured.key_features || [])];
                              while (updated.length < 4) updated.push({ title: '', description: '' });
                              updated[fIndex] = { ...updated[fIndex], description: e.target.value };
                              setEditingFeatured({ ...editingFeatured, key_features: updated });
                            }}
                            placeholder="Description of the architectural guarantee..."
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-neutral-600 font-mono"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Technologies (Target: 8 - 10 Badges)
                </label>
                <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-xl bg-black/40 border border-white/[0.08] min-h-[42px] items-center">
                  {(() => {
                    const stack = Array.isArray(editingFeatured.tech_stack) ? editingFeatured.tech_stack : [];
                    if (stack.length === 0) {
                      return (
                        <span className="text-xs text-neutral-600 font-mono italic">
                          No technologies added yet. Type below to pick.
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
                            setEditingFeatured({ ...editingFeatured, tech_stack: updated });
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
                    const currentStack = Array.isArray(editingFeatured.tech_stack) ? editingFeatured.tech_stack : [];
                    if (tech && !currentStack.includes(tech)) {
                      setEditingFeatured({
                        ...editingFeatured,
                        tech_stack: [...currentStack, tech]
                      });
                    }
                  }}
                  placeholder="Type tech name (e.g. Next.js, PostgreSQL, Docker)..."
                />
              </div>

              {/* External Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                    Live Demo URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={editingFeatured.live_url || ''}
                    onChange={(e) => setEditingFeatured({ ...editingFeatured, live_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-neutral-600 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                    GitHub URL (All / Main)
                  </label>
                  <input
                    type="url"
                    value={editingFeatured.github_url || ''}
                    onChange={(e) => setEditingFeatured({ ...editingFeatured, github_url: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-neutral-600 font-mono"
                  />
                </div>
              </div>

              {/* Radiant Gradient & Accent Color */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Card Radiant Background Gradient
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_GRADIENTS.map((p, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setEditingFeatured({
                        ...editingFeatured,
                        gradient: p.value,
                        accent_color: p.accent
                      })}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono border border-white/10 hover:border-white/30 text-white cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.value }} />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Submit Footer */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingFeatured(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs tracking-tight transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>{editingFeatured.id ? 'Save Changes' : 'Create Featured Case Study'}</span>
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Delete Regular Project Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingProjectId)}
        title="Delete Project?"
        description="Are you sure you want to remove this project? This change is permanent and will delete it from Neon PostgreSQL."
        confirmText="Delete Project"
        confirmVariant="danger"
        isLoading={isPending}
        onConfirm={confirmDeleteProject}
        onClose={() => setDeletingProjectId(null)}
      />

      {/* Delete Featured Case Study Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingFeaturedId)}
        title="Remove Featured Case Study?"
        description="This will remove this case study from the homepage interactive showcase in PostgreSQL."
        confirmText="Remove"
        confirmVariant="danger"
        isLoading={isPending}
        onConfirm={confirmDeleteFeatured}
        onClose={() => setDeletingFeaturedId(null)}
      />

    </div>
  );
}

// =========================================================================
// ADMIN STUDIO PROJECT CARD (Exact 100% Surface Look + Admin Controls)
// Left of project name: Drag Handle (hand cursor) + Up/Down Order Buttons
// Right of project name: Edit & Delete buttons
// Center: Architectural Line with Junction Node
// Body: Full Dual-Screen Hover Slab + Circular Exploration Badge
// Footer: Full Tech Badges
// =========================================================================
interface AdminStudioProjectCardProps {
  project: DbProjectRow;
  originalIndex: number;
  displayIndex: number;
  totalCount: number;
  column: 'left' | 'right';
  currentTheme: any;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function AdminStudioProjectCard({
  project,
  originalIndex,
  displayIndex,
  totalCount,
  column,
  currentTheme,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: AdminStudioProjectCardProps) {
  const indexNumber = String(displayIndex + 1).padStart(2, '0');
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringImage, setIsHoveringImage] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    setIsHoveringImage(true);
  };

  const handleMouseLeave = () => {
    setIsHoveringImage(false);
  };

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`group relative flex flex-col space-y-4 pb-8 sm:pb-10 lg:pb-0 transition-all duration-300 rounded-3xl p-1 -m-1 ${
        isDragOver 
          ? 'ring-2 ring-indigo-500 bg-indigo-500/10 scale-[1.01]' 
          : ''
      }`}
    >
      {/* 1. Header Bar Above Card (Meta category & Year) */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-mono text-xs font-semibold text-neutral-400 tracking-wider shrink-0">
            {indexNumber}
          </span>
          <div className="h-px w-6 bg-neutral-700 hidden sm:block shrink-0" />
          <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest shrink-0 hidden sm:inline">
            {project.category}
          </span>
          <span className="font-serif text-sm font-medium text-white truncate sm:hidden">
            {project.title}
          </span>
        </div>

        {/* Date / Year Pill */}
        <span className="shrink-0 rounded-full px-3.5 py-1 font-mono text-[10px] sm:text-[11px] bg-[#121316] border border-white/10 text-neutral-400 font-medium tracking-wider">
          {project.year || '2026'}
        </span>
      </div>

      {/* 2. Project Name Row with Left Order Controls & Right Action Buttons */}
      <div className="flex items-center justify-between gap-3 px-1">
        {/* Left side: Drag Handle & Order Change Buttons + Project Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1 bg-[#121316] px-2 py-1 rounded-xl border border-white/10 shadow-sm shrink-0">
            <div 
              className="cursor-grab active:cursor-grabbing p-0.5 text-neutral-400 hover:text-white transition-colors"
              title="Drag to reorder"
            >
              <GripVertical size={14} />
            </div>
            <button
              type="button"
              disabled={originalIndex === 0}
              onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
              className="p-1 text-neutral-400 hover:text-white disabled:opacity-20 hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Move Up"
            >
              <ChevronUp size={13} />
            </button>
            <button
              type="button"
              disabled={originalIndex === totalCount - 1}
              onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
              className="p-1 text-neutral-400 hover:text-white disabled:opacity-20 hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Move Down"
            >
              <ChevronDown size={13} />
            </button>
          </div>

          {/* Project Title */}
          <h2 className="font-serif font-normal text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight truncate">
            {project.title}
          </h2>
        </div>

        {/* Right side: Edit & Delete buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white text-neutral-200 hover:text-black border border-white/15 transition-all text-xs font-mono font-medium cursor-pointer shadow-sm active:scale-95"
            title="Edit Project"
          >
            <Edit3 size={12} />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Delete Project"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* 3. Architectural Horizontal Line spanning full card width and connecting to the center vertical axis */}
      <div className="relative w-full py-1 pointer-events-none">
        <div className="relative w-full h-px bg-white/[0.08]">
          {/* Column 1 (Left): Extends 32px to the right to meet the center line */}
          {column === 'left' && (
            <div className="hidden lg:block absolute right-0 top-0 w-[32px] translate-x-full h-px bg-white/[0.08]">
              {/* Junction Circle Node right on the center vertical line */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 size-2 rounded-full border border-white/40 bg-[#0c0e14] ring-4 ring-[#08090a]" />
            </div>
          )}

          {/* Column 2 (Right): Extends 32px to the left to meet the center line */}
          {column === 'right' && (
            <div className="hidden lg:block absolute left-0 top-0 w-[32px] -translate-x-full h-px bg-white/[0.08]">
              {/* Junction Circle Node right on the center vertical line */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 size-2 rounded-full border border-white/40 bg-[#0c0e14] ring-4 ring-[#08090a]" />
            </div>
          )}
        </div>
      </div>

      {/* 4. Interactive Card Slab with Dual-Mockup Reveal & Cursor-Following Circle Badge */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onEdit}
        className="group/card relative block aspect-[16/11] sm:aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-[26px] sm:rounded-[30px] p-1.5 sm:p-2 bg-white/[0.04] border border-white/[0.08] hover:border-white/20 transition-all duration-300 ease-in-out hover:-translate-y-2 shadow-2xl"
      >
        <div className="relative flex size-full flex-col justify-between overflow-hidden rounded-[20px] sm:rounded-[24px] bg-black">
          
          {/* Full-Bleed Radiant Gradient Canvas */}
          <div 
            aria-hidden="true" 
            className="absolute inset-0 z-0 transition-all duration-500 ease-in-out group-hover/card:scale-105 group-hover/card:brightness-110"
            style={{
              background: project.gradient || 'linear-gradient(135deg, #182848 0%, #4b6cb7 100%)'
            }}
          />

          {/* Subtle Contrast Overlay for Typography */}
          <div className="absolute inset-0 z-1 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

          {/* Top Row: Tagline + Right Arrow */}
          <div className="z-10 flex w-full flex-row items-start justify-between gap-6 px-5 py-4 sm:px-6 sm:py-5">
            <h3 className="text-xs sm:text-sm md:text-base font-medium text-white/95 leading-snug max-w-[85%]">
              {project.tagline || project.overview}
            </h3>
            <ArrowRight 
              className="size-5 shrink-0 text-white/90 transition-transform duration-200 ease-out group-hover/card:translate-x-1.5" 
            />
          </div>

          {/* Floating Circle Exploration Badge on Hover */}
          <div 
            aria-hidden="true"
            className={`absolute z-30 pointer-events-none select-none transition-all duration-150 ${
              isHoveringImage ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              transform: 'translate(-50%, -50%)',
              transition: 'transform 0.06s ease-out, opacity 0.15s ease-out, scale 0.15s ease-out',
            }}
          >
            <div className="relative size-[86px] sm:size-[92px] flex items-center justify-center">
              
              {/* Outer Fine Dotted Ring */}
              <div className="absolute inset-0 rounded-full border border-dotted border-white/80" />

              {/* Frosted Silver/Grey Annular Disc with Rotating Circular Text */}
              <div className="relative size-[76px] sm:size-[82px] rounded-full bg-[#d6dbe1]/92 backdrop-blur-md border border-white/40 shadow-[0_12px_36px_rgba(0,0,0,0.65)] flex items-center justify-center overflow-hidden">
                <svg 
                  className="absolute inset-0 size-full animate-spin-slow pointer-events-none" 
                  viewBox="0 0 100 100"
                >
                  <defs>
                    <path 
                      id={`circle-path-admin-${project.id}`} 
                      d="M 50, 50 m -33.5, 0 a 33.5,33.5 0 1,1 67,0 a 33.5,33.5 0 1,1 -67,0" 
                    />
                  </defs>
                  <text className="font-sans text-[8.8px] sm:text-[9.2px] font-black uppercase tracking-[0.24em] fill-black">
                    <textPath href={`#circle-path-admin-${project.id}`} startOffset="0%">
                      EDIT • OPEN • STUDIO •
                    </textPath>
                  </text>
                </svg>

                {/* Solid Pure White Center Circle (Edit Core) */}
                <div className="relative z-10 size-9 sm:size-10 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center border border-black/[0.08]">
                  <Edit3 className="size-4.5 sm:size-5 text-black" strokeWidth={2.4} />
                </div>
              </div>

            </div>
          </div>

          {/* Screenshot Platform Area: Dual-Screen Mockup on Hover */}
          <div className="absolute top-14 sm:top-18 md:top-20 right-3.5 left-3.5 sm:right-6 sm:left-6 bottom-0 z-10 flex flex-col items-center">
            <div className="relative w-full h-full flex items-end justify-center">
              
              {/* Screen 1 (Default Thumbnail / Tilts back to the left on hover) */}
              <div 
                className={`w-full h-full rounded-t-xl sm:rounded-t-2xl border-t-2 border-x-2 border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.65)] overflow-hidden bg-black/90 relative transition-all duration-500 ease-out ${
                  project.hover_image 
                    ? 'group-hover/card:-rotate-6 group-hover/card:-translate-x-6 sm:group-hover/card:-translate-x-8 group-hover/card:scale-95 group-hover/card:opacity-85'
                    : 'group-hover/card:scale-[1.02]'
                }`}
              >
                {project.preview_image ? (
                  <Image
                    src={project.preview_image}
                    alt={project.title}
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover/card:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-mono text-neutral-500">
                    No Preview Image
                  </div>
                )}
              </div>

              {/* Screen 2 (Secondary Mockup / Slides up and in front on hover) */}
              {project.hover_image && (
                <div 
                  className="absolute inset-0 w-full h-full rounded-t-xl sm:rounded-t-2xl border-t-2 border-x-2 border-white/60 shadow-[0_30px_70px_rgba(0,0,0,0.85)] overflow-hidden bg-black/95 z-20 transition-all duration-500 ease-out opacity-0 translate-y-8 scale-90 pointer-events-none group-hover/card:opacity-100 group-hover/card:translate-y-0 group-hover/card:translate-x-4 sm:group-hover/card:translate-x-7 group-hover/card:rotate-2 group-hover/card:scale-100"
                >
                  <Image
                    src={project.hover_image}
                    alt={`${project.title} Mockup Preview`}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* 5. Underneath the Card: Stylized Pill Tech Badges matching Surface */}
      <div className="flex flex-wrap items-center gap-2 pt-1 px-1">
        {(project.tech_stack || []).map((tech) => (
          <TechBadge key={tech} name={tech} />
        ))}
      </div>
    </article>
  );
}

