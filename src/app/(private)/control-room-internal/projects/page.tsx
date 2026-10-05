'use client';

import React, { useState, useEffect, useTransition, useMemo, useRef } from 'react';
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
  Layers,
  Eye,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import { 
  fetchAdminProjects, 
  saveAdminProject, 
  removeAdminProject, 
  reorderAdminProjects,
  fetchAdminFeaturedCaseStudies,
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
import { useAdminMode } from '@/components/admin/AdminModeContext';
import TechBadge from '@/components/ui/TechBadge';
import TechAutocompleteInput from '@/components/ui/TechAutocompleteInput';
import ProjectsClientView from '@/components/projects/ProjectsClientView';
import FeaturedCaseStudies from '@/components/home/FeaturedCaseStudies';

const CATEGORIES = ['All', 'Full Stack', 'Frontend', 'Backend', 'App'] as const;

const PRESET_GRADIENTS = [
  { label: 'Deep Ocean (Indigo)', value: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 40%, #415a77 100%)', accent: '#38bdf8' },
  { label: 'Emerald Forest (Green)', value: 'linear-gradient(135deg, #062419 0%, #0d402b 40%, #15803d 100%)', accent: '#34d399' },
  { label: 'Midnight Obsidian (Dark Violet)', value: 'linear-gradient(135deg, #182848 0%, #293859 50%, #4b6cb7 100%)', accent: '#6366f1' },
  { label: 'Crimson Nebula (Ruby)', value: 'linear-gradient(135deg, #2b0b14 0%, #4c1122 50%, #9f1239 100%)', accent: '#f43f5e' },
  { label: 'Sunset Amber (Warm Gold)', value: 'linear-gradient(135deg, #2e1605 0%, #4a2800 50%, #b45309 100%)', accent: '#f59e0b' },
];

export default function AdminProjectsPage() {
  const { currentTheme } = useThemeAccent();
  const { showToast } = useToast();
  const { mode: activeMode } = useAdminMode();

  // Data states
  const [projects, setProjects] = useState<DbProjectRow[]>([]);
  const [featuredList, setFeaturedList] = useState<DbFeaturedCaseStudyRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states for regular projects
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & form states
  const [editingProject, setEditingProject] = useState<Partial<DbProjectRow> | null>(null);
  const [alsoAddToFeatured, setAlsoAddToFeatured] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const [editingFeatured, setEditingFeatured] = useState<Partial<DbFeaturedCaseStudyRow> | null>(null);
  const [deletingFeaturedId, setDeletingFeaturedId] = useState<string | null>(null);

  // Image upload states
  const [uploadingProjImg, setUploadingProjImg] = useState(false);
  const [uploadingFeatMain, setUploadingFeatMain] = useState(false);
  const [uploadingFeatHover, setUploadingFeatHover] = useState(false);
  const projFileInputRef = useRef<HTMLInputElement>(null);
  const featMainFileInputRef = useRef<HTMLInputElement>(null);
  const featHoverFileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop states for Featured Case Studies
  const [draggedFeatIdx, setDraggedFeatIdx] = useState<number | null>(null);
  const [dragOverFeatIdx, setDragOverFeatIdx] = useState<number | null>(null);

  // Drag and drop states for Regular Projects
  const [draggedProjIdx, setDraggedProjIdx] = useState<number | null>(null);
  const [dragOverProjIdx, setDragOverProjIdx] = useState<number | null>(null);

  const [isPending, startTransition] = useTransition();

  // Load both projects and featured case studies from Neon PostgreSQL
  const loadAll = async () => {
    setLoading(true);
    const [pRes, fRes] = await Promise.all([
      fetchAdminProjects(),
      fetchAdminFeaturedCaseStudies()
    ]);

    if (pRes.success && pRes.projects) {
      setProjects(pRes.projects);
    } else {
      showToast(pRes.error || 'Failed to fetch projects', 'error');
    }

    if (fRes.success && fRes.caseStudies) {
      setFeaturedList(fRes.caseStudies);
    } else {
      showToast(fRes.error || 'Failed to fetch featured case studies', 'error');
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Filtered regular projects
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

  // =========================================================================
  // IMAGE UPLOAD HANDLERS (Cloudinary via Server Action)
  // =========================================================================
  const handleUploadProjectImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProjImg(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadImage(formData);
      if (res.success && res.url) {
        setEditingProject((prev) => prev ? { ...prev, preview_image: res.url } : prev);
        showToast('Image uploaded to Cloudinary successfully!', 'success');
      } else {
        showToast(res.error || 'Failed to upload image', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error uploading image', 'error');
    } finally {
      setUploadingProjImg(false);
      if (projFileInputRef.current) projFileInputRef.current.value = '';
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
  // REGULAR PROJECT HANDLERS
  // =========================================================================
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title?.trim()) {
      showToast('Project title is required.', 'error');
      return;
    }

    startTransition(async () => {
      const isNew = !editingProject.id;
      const res = await saveAdminProject({
        ...editingProject,
        title: editingProject.title!.trim(),
        category: editingProject.category || 'Full Stack',
      });

      if (res.success && res.project) {
        showToast(isNew ? 'Project created successfully.' : 'Project updated successfully.', 'success');
        
        const savedProj = res.project;
        const promptFeatured = isNew && alsoAddToFeatured;
        setEditingProject(null);
        setAlsoAddToFeatured(false);
        await loadAll();

        // If user opted to also feature this project, open Featured modal pre-populated!
        if (promptFeatured) {
          setEditingFeatured({
            title: savedProj.title,
            tagline: savedProj.tagline || '',
            category: savedProj.category || 'Full Stack',
            year: savedProj.year || '2026',
            overview: savedProj.overview || '',
            preview_image: savedProj.preview_image || '',
            hover_image: '',
            tech_stack: savedProj.tech_stack || [],
            live_url: savedProj.live_url || '',
            github_url: savedProj.github_url || '',
            gradient: 'linear-gradient(135deg, #182848 0%, #4b6cb7 100%)',
            accent_color: '#6366f1',
            key_features: [
              { title: 'Core Architecture', description: 'Engineered for high performance and zero latency.' },
              { title: 'Type-Safe Data Flow', description: 'End-to-end typing with PostgreSQL persistence.' },
              { title: 'Reactive UI Engine', description: 'Optimistic UI transitions and cinematic micro-interactions.' },
              { title: 'Production Security', description: 'Role-based access guards and audit logging.' },
            ],
          });
        }
      } else {
        showToast(res.error || 'Failed to save project', 'error');
      }
    });
  };

  const confirmDeleteProject = async () => {
    if (!deletingProjectId) return;
    startTransition(async () => {
      const res = await removeAdminProject(deletingProjectId);
      if (res.success) {
        showToast('Project deleted successfully.', 'success');
        setProjects(prev => prev.filter(p => p.id !== deletingProjectId));
      } else {
        showToast(res.error || 'Failed to delete project', 'error');
      }
      setDeletingProjectId(null);
    });
  };

  // Reorder regular projects
  const persistProjectsOrder = async (newList: DbProjectRow[]) => {
    setProjects(newList);
    const ids = newList.map(p => p.id);
    const res = await reorderAdminProjects(ids);
    if (!res.success) {
      showToast('Failed to update projects order', 'error');
      loadAll();
    } else {
      showToast('Projects order saved to PostgreSQL.', 'success');
    }
  };

  const handleMoveProject = (id: string, direction: 'up' | 'down') => {
    const curIdx = projects.findIndex(p => p.id === id);
    if (curIdx === -1) return;
    const targetIdx = direction === 'up' ? curIdx - 1 : curIdx + 1;
    if (targetIdx < 0 || targetIdx >= projects.length) return;

    const reordered = [...projects];
    const [moved] = reordered.splice(curIdx, 1);
    reordered.splice(targetIdx, 0, moved);
    persistProjectsOrder(reordered);
  };

  const handleDropProject = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (draggedProjIdx === null || draggedProjIdx === dropIdx) {
      setDraggedProjIdx(null);
      setDragOverProjIdx(null);
      return;
    }

    const draggedItem = filteredProjects[draggedProjIdx];
    const targetItem = filteredProjects[dropIdx];
    if (!draggedItem || !targetItem) return;

    const fromRealIdx = projects.findIndex(p => p.id === draggedItem.id);
    const toRealIdx = projects.findIndex(p => p.id === targetItem.id);

    const reordered = [...projects];
    const [moved] = reordered.splice(fromRealIdx, 1);
    reordered.splice(toRealIdx, 0, moved);

    setDraggedProjIdx(null);
    setDragOverProjIdx(null);
    persistProjectsOrder(reordered);
  };

  // =========================================================================
  // FEATURED CASE STUDIES HANDLERS
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

    startTransition(async () => {
      const res = await saveAdminFeaturedCaseStudy({
        ...editingFeatured,
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
        live_url: editingFeatured.live_url || '',
        github_url: editingFeatured.github_url || '',
        client_url: editingFeatured.client_url || '',
        server_url: editingFeatured.server_url || '',
      });

      if (res.success && res.caseStudy) {
        showToast(editingFeatured.id ? 'Featured Case Study updated.' : 'Featured Case Study created.', 'success');
        setEditingFeatured(null);
        loadAll();
      } else {
        showToast(res.error || 'Failed to save featured case study', 'error');
      }
    });
  };

  const confirmDeleteFeatured = async () => {
    if (!deletingFeaturedId) return;
    startTransition(async () => {
      const res = await removeAdminFeaturedCaseStudy(deletingFeaturedId);
      if (res.success) {
        showToast('Featured Case Study removed.', 'success');
        setFeaturedList(prev => prev.filter(f => f.id !== deletingFeaturedId));
      } else {
        showToast(res.error || 'Failed to delete featured case study', 'error');
      }
      setDeletingFeaturedId(null);
    });
  };

  // Reorder featured case studies
  const persistFeaturedOrder = async (newList: DbFeaturedCaseStudyRow[]) => {
    setFeaturedList(newList);
    const ids = newList.map(f => f.id);
    const res = await reorderAdminFeaturedCaseStudies(ids);
    if (!res.success) {
      showToast('Failed to update featured case studies order', 'error');
      loadAll();
    } else {
      showToast('Featured order saved to PostgreSQL.', 'success');
    }
  };

  const handleMoveFeatured = (id: string, direction: 'up' | 'down') => {
    const curIdx = featuredList.findIndex(f => f.id === id);
    if (curIdx === -1) return;
    const targetIdx = direction === 'up' ? curIdx - 1 : curIdx + 1;
    if (targetIdx < 0 || targetIdx >= featuredList.length) return;

    const reordered = [...featuredList];
    const [moved] = reordered.splice(curIdx, 1);
    reordered.splice(targetIdx, 0, moved);
    persistFeaturedOrder(reordered);
  };

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

    setDraggedFeatIdx(null);
    setDragOverFeatIdx(null);
    persistFeaturedOrder(reordered);
  };

  // Quick Promote a regular project to Featured
  const handlePromoteToFeatured = (p: DbProjectRow) => {
    setEditingFeatured({
      title: p.title,
      tagline: p.tagline || '',
      category: p.category || 'Full Stack',
      year: p.year || '2026',
      overview: p.overview || '',
      preview_image: p.preview_image || '',
      hover_image: '',
      tech_stack: p.tech_stack || [],
      live_url: p.live_url || '',
      github_url: p.github_url || '',
      gradient: 'linear-gradient(135deg, #182848 0%, #4b6cb7 100%)',
      accent_color: '#6366f1',
      key_features: [
        { title: 'Core Architecture', description: 'Engineered for high performance and zero latency.' },
        { title: 'Type-Safe Data Flow', description: 'End-to-end typing with PostgreSQL persistence.' },
        { title: 'Reactive UI Engine', description: 'Optimistic UI transitions and cinematic micro-interactions.' },
        { title: 'Production Security', description: 'Role-based access guards and audit logging.' },
      ],
    });
  };

  // ========================================================
  // MODE 1: SURFACE CANVAS (100% Read-Only Live Preview)
  // ========================================================
  if (activeMode === 'preview') {
    // Convert DB projects to CaseStudy interface
    const mappedProjects = projects.map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      tagline: p.tagline,
      category: p.category as any,
      featured: p.featured,
      role: p.role || 'Lead Engineer',
      year: p.year || '2026',
      targetAudience: p.target_audience || '',
      overview: p.overview || '',
      problem: p.problem || '',
      solution: p.solution || '',
      gradient: p.gradient || 'linear-gradient(135deg, #182848 0%, #4b6cb7 100%)',
      accentColor: p.accent_color || '#6366f1',
      previewImage: p.preview_image,
      hoverImage: p.hover_image,
      githubUrl: p.github_url,
      clientUrl: p.client_url,
      serverUrl: p.server_url,
      liveUrl: p.live_url,
      techStack: p.tech_stack || [],
      architecture: {
        frontend: p.architecture?.frontend || [],
        backend: p.architecture?.backend || [],
        database: p.architecture?.database || [],
        infrastructure: p.architecture?.infrastructure || [],
      },
      systemBreakdown: p.system_breakdown || [],
      challenges: p.challenges || [],
      technicalDecisions: p.technical_decisions || [],
      keyFeatures: p.key_features || [],
      metrics: p.metrics || [],
      directoryTree: p.directory_tree,
      codeSnippet: p.code_snippet,
      backendArchitecture: p.backend_architecture,
      whatILearned: p.what_i_learned,
    }));

    const mappedFeatured = featuredList.map(f => ({
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

    return (
      <div className="space-y-16 animate-in fade-in duration-200">
        {/* Top: Featured Case Studies Preview Section */}
        <div className="border-b border-white/[0.08] pb-12">
          <div className="px-4 sm:px-8 max-w-6xl mx-auto mb-6">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              LIVE PREVIEW • HOMEPAGE FEATURED CASE STUDIES SHOWCASE
            </span>
          </div>
          <FeaturedCaseStudies initialProjects={mappedFeatured} isAdmin={false} />
        </div>

        {/* Bottom: All Projects Preview */}
        <div className="animate-in fade-in">
          <ProjectsClientView initialProjects={mappedProjects} />
        </div>
      </div>
    );
  }

  // ========================================================
  // MODE 2: STUDIO ENGINE (Interactive Control Room)
  // ========================================================
  return (
    <div className="space-y-12 max-w-6xl px-4 sm:px-8 py-6 pb-24 animate-in fade-in duration-200">
      
      {/* Top Header */}
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

          {/* New Featured Case Study Button */}
          <button
            onClick={() => setEditingFeatured({
              title: '',
              tagline: '',
              category: 'Full Stack',
              year: '2026',
              overview: '',
              preview_image: '',
              hover_image: '',
              tech_stack: ['Next.js 16', 'TypeScript', 'PostgreSQL', 'Tailwind CSS'],
              live_url: '',
              github_url: '',
              gradient: 'linear-gradient(135deg, #182848 0%, #4b6cb7 100%)',
              accent_color: '#6366f1',
              key_features: [
                { title: 'Atomic Lock Engine', description: 'Prevents double bookings with strict Redis concurrency guards.' },
                { title: 'Live Dynamic Pricing', description: 'Real-time slot rate calculation based on peak demand matrices.' },
                { title: 'Sub-50ms API Caching', description: 'Edge cached responses with instant purge upon state changes.' },
                { title: 'Audited Financial Ledger', description: 'ACID double-entry transaction integrity for all payouts.' },
              ],
            })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-mono font-medium border border-emerald-500/30 transition-all cursor-pointer shadow-sm"
          >
            <Sparkles size={14} />
            <span>+ New Featured Case Study</span>
          </button>

          {/* New Regular Project Button */}
          <button
            onClick={() => {
              setEditingProject({
                title: '',
                tagline: '',
                category: 'Full Stack',
                year: '2026',
                featured: false,
                overview: '',
                preview_image: '',
                live_url: '',
                github_url: '',
                tech_stack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
              });
              setAlsoAddToFeatured(false);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-tight transition-all shadow-md cursor-pointer"
          >
            <Plus size={15} />
            <span>+ New Project</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: HOMEPAGE FEATURED CASE STUDIES (SEPARATE & UNCOUPLED)
         ========================================================================= */}
      <section className="space-y-4 p-6 sm:p-8 rounded-3xl bg-[#0c0e14]/90 border border-emerald-500/25 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        
        {/* Section Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Star size={15} className="fill-emerald-400" />
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-medium text-white tracking-wide">
                Homepage Featured Case Studies
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono uppercase tracking-wider">
                Independent Collection
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-mono">
              These case studies power the interactive split-scroll showcase on your homepage. Drag cards on desktop or use arrows to order them.
            </p>
          </div>

          <button
            onClick={() => setEditingFeatured({
              title: '',
              tagline: '',
              category: 'Full Stack',
              year: '2026',
              overview: '',
              preview_image: '',
              hover_image: '',
              tech_stack: ['Next.js 16', 'TypeScript', 'PostgreSQL'],
              live_url: '',
              github_url: '',
              gradient: 'linear-gradient(135deg, #182848 0%, #4b6cb7 100%)',
              accent_color: '#6366f1',
              key_features: [
                { title: 'Feature One', description: 'Brief description of feature performance.' },
                { title: 'Feature Two', description: 'Brief description of architectural decisions.' },
                { title: 'Feature Three', description: 'Brief description of reactivity.' },
                { title: 'Feature Four', description: 'Brief description of security guarantees.' },
              ],
            })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-white border border-white/[0.1] transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus size={13} />
            <span>Add Featured</span>
          </button>
        </div>

        {/* Featured Case Studies Cards List */}
        {featuredList.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Sparkles size={28} className="mx-auto text-neutral-600" />
            <p className="text-sm text-neutral-300 font-medium">No featured case studies yet</p>
            <p className="text-xs text-neutral-500 font-mono">
              Create your first homepage showcase card using &ldquo;+ New Featured Case Study&rdquo; above.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {featuredList.map((feat, idx) => (
              <div
                key={feat.id}
                draggable
                onDragStart={() => setDraggedFeatIdx(idx)}
                onDragOver={(e) => { e.preventDefault(); setDragOverFeatIdx(idx); }}
                onDrop={(e) => handleDropFeatured(e, idx)}
                className={`p-4 sm:p-5 rounded-2xl bg-black/50 border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group cursor-move ${
                  dragOverFeatIdx === idx 
                    ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]' 
                    : 'border-white/[0.08] hover:border-white/20'
                }`}
              >
                {/* Left: Reorder Grip & Dual Images Preview */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="flex flex-col items-center gap-1 text-neutral-500 group-hover:text-neutral-300 cursor-grab shrink-0">
                    <GripVertical size={18} />
                    <span className="text-[10px] font-mono font-bold text-neutral-400">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Dual Image Preview Thumbnails */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Main Thumbnail */}
                    <div className="relative w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                      {feat.preview_image ? (
                        <Image
                          src={feat.preview_image}
                          alt={feat.title}
                          fill
                          className="object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-neutral-600">
                          No Thumbnail
                        </div>
                      )}
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[8px] font-mono text-white">
                        Main
                      </span>
                    </div>

                    {/* Hover Image */}
                    <div className="relative w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                      {feat.hover_image ? (
                        <Image
                          src={feat.hover_image}
                          alt={`${feat.title} Hover`}
                          fill
                          className="object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] font-mono text-neutral-600 px-1 text-center">
                          No Hover
                        </div>
                      )}
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[8px] font-mono text-emerald-300">
                        Hover
                      </span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
                        {feat.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-[9px] font-mono text-neutral-400 uppercase">
                        {feat.category}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {feat.year}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-1">
                      {feat.tagline}
                    </p>

                    {/* Tech Badges Preview */}
                    {feat.tech_stack && feat.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {feat.tech_stack.slice(0, 4).map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[9px] font-mono text-neutral-400"
                          >
                            {tech}
                          </span>
                        ))}
                        {feat.tech_stack.length > 4 && (
                          <span className="text-[9px] font-mono text-neutral-500 self-center">
                            +{feat.tech_stack.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Order Arrows & Edit/Delete Controls */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {/* Arrow Reorder Buttons */}
                  <div className="flex items-center bg-white/[0.03] rounded-xl border border-white/[0.06] p-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveFeatured(feat.id, 'up')}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === featuredList.length - 1}
                      onClick={() => handleMoveFeatured(feat.id, 'down')}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => setEditingFeatured(feat)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-white transition-colors cursor-pointer"
                  >
                    <Edit3 size={12} />
                    <span>Edit Featured</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeletingFeaturedId(feat.id)}
                    className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete Featured Case Study"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </section>

      {/* =========================================================================
          SECTION 2: ALL PORTFOLIO PROJECTS & SYSTEMS
         ========================================================================= */}
      <section className="space-y-6">
        
        {/* Section Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-white/[0.06] text-neutral-300 border border-white/[0.08]">
                <FolderGit2 size={15} />
              </span>
              <h2 className="text-xl font-serif font-medium text-white tracking-wide">
                All Portfolio Projects
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-neutral-300 border border-white/[0.08] text-[10px] font-mono">
                {projects.length} Total
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-mono">
              Complete archive of systems and applications displayed in the public /projects directory.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/20 focus:outline-none text-xs text-white placeholder:text-neutral-500 font-mono transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
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

        {/* Regular Projects Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500 font-mono text-xs">
            <Loader2 size={24} className="animate-spin text-white" />
            <span>Loading projects from PostgreSQL...</span>
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
            {filteredProjects.map((p, idx) => (
              <div
                key={p.id}
                draggable
                onDragStart={() => setDraggedProjIdx(idx)}
                onDragOver={(e) => { e.preventDefault(); setDragOverProjIdx(idx); }}
                onDrop={(e) => handleDropProject(e, idx)}
                className={`rounded-3xl bg-[#0c0e14]/80 border transition-all duration-200 backdrop-blur-2xl overflow-hidden flex flex-col justify-between group cursor-move ${
                  dragOverProjIdx === idx 
                    ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]' 
                    : 'border-white/[0.08] hover:border-white/20'
                }`}
              >
                {/* Top Image Preview & Badges */}
                <div className="relative h-48 sm:h-52 w-full bg-neutral-900 overflow-hidden">
                  {p.preview_image ? (
                    <Image
                      src={p.preview_image}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-mono text-neutral-600">
                      No Image Set
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-transparent to-black/30" />

                  {/* Top Left Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-mono text-white border border-white/10 uppercase tracking-wider">
                      {p.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-mono text-neutral-300 border border-white/10">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Reorder Arrows in Corner */}
                  <div className="absolute top-3 right-3 flex items-center bg-black/60 backdrop-blur-md rounded-xl border border-white/10 p-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveProject(p.id, 'up')}
                      className="p-1.5 rounded-lg text-neutral-300 hover:text-white disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === projects.length - 1}
                      onClick={() => handleMoveProject(p.id, 'down')}
                      className="p-1.5 rounded-lg text-neutral-300 hover:text-white disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ChevronDown size={13} />
                    </button>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-white tracking-tight leading-snug">
                        {p.title}
                      </h3>
                      <span className="text-[11px] font-mono text-neutral-500 shrink-0">
                        {p.year || '2026'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {p.tagline || p.overview || 'Engineering project description.'}
                    </p>

                    {/* Tech stack pills */}
                    {p.tech_stack && p.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {p.tech_stack.slice(0, 4).map((tech, tIdx) => (
                          <span
                            key={tIdx}
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
                        <a
                          href={p.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                          title="Open Live URL"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {p.github_url && (
                        <a
                          href={p.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                          title="Open GitHub"
                        >
                          <FaGithub size={14} />
                        </a>
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
                      {/* Quick promote to Featured if not already featured */}
                      <button
                        onClick={() => handlePromoteToFeatured(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-[11px] font-mono text-emerald-300 border border-emerald-500/25 transition-colors cursor-pointer"
                        title="Add to Homepage Featured Case Studies"
                      >
                        <Star size={11} />
                        <span>Feature</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingProject(p);
                          setAlsoAddToFeatured(false);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-white transition-colors cursor-pointer"
                      >
                        <Edit3 size={12} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setDeletingProjectId(p.id)}
                        className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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

      </section>

      {/* =========================================================================
          MODAL 1: EDIT / CREATE REGULAR PROJECT
          (Clean, focused on regular project attributes. Zero featured clutter!)
         ========================================================================= */}
      <AdminModal
        isOpen={Boolean(editingProject)}
        onClose={() => setEditingProject(null)}
        title={editingProject?.id ? 'Edit Portfolio Project' : 'Create New Project'}
        subtitle="Saved directly to PostgreSQL projects table"
        maxWidth="max-w-2xl"
      >
        {editingProject && (
          <form onSubmit={handleSaveProject} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingProject.title || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  placeholder="e.g. Reserva - Facility Management"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Category Domain *
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
                placeholder="e.g. High-throughput facility booking with atomic concurrency locks"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
              />
            </div>

            {/* Preview Image with Cloudinary Upload */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Preview Thumbnail Image
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {editingProject.preview_image ? (
                  <div className="relative w-28 h-18 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                    <Image
                      src={editingProject.preview_image}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-18 rounded-xl bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center text-[10px] font-mono text-neutral-500 shrink-0">
                    No image
                  </div>
                )}

                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={uploadingProjImg}
                      onClick={() => projFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-white border border-white/[0.1] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {uploadingProjImg ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                      <span>{uploadingProjImg ? 'Uploading...' : 'Upload Image'}</span>
                    </button>
                    <input
                      ref={projFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadProjectImage}
                      className="hidden"
                    />
                    <span className="text-[10px] font-mono text-neutral-500">or paste URL below</span>
                  </div>

                  <input
                    type="url"
                    value={editingProject.preview_image || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, preview_image: e.target.value })}
                    placeholder="https://res.cloudinary.com/... or https://images.unsplash.com/..."
                    className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Live URL
                </label>
                <input
                  type="url"
                  value={editingProject.live_url || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, live_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  GitHub Repository URL
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

            {/* Overview */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Architectural Overview
              </label>
              <textarea
                rows={3}
                value={editingProject.overview || ''}
                onChange={(e) => setEditingProject({ ...editingProject, overview: e.target.value })}
                placeholder="High-level engineering overview of the system architecture..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono resize-none"
              />
            </div>

            {/* When creating new project: Option to also configure as Featured Case Study on Homepage */}
            {!editingProject.id && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="also-featured-checkbox"
                  checked={alsoAddToFeatured}
                  onChange={(e) => setAlsoAddToFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-emerald-500/40 bg-black accent-emerald-500 cursor-pointer shrink-0"
                />
                <label htmlFor="also-featured-checkbox" className="text-xs text-emerald-200 cursor-pointer">
                  <span className="font-semibold block">Also add to Homepage Featured Case Studies</span>
                  <span className="text-[11px] text-emerald-300/80">
                    Immediately opens the Featured Case Study setup to collect hover mockup and 4-point right-side text.
                  </span>
                </label>
              </div>
            )}

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-tight transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>{editingProject.id ? 'Save Changes' : (alsoAddToFeatured ? 'Save & Setup Featured' : 'Create Project')}</span>
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* =========================================================================
          MODAL 2: EDIT / CREATE FEATURED CASE STUDY
          (Independent collection. Contains Dual Image uploads + Right-side content.
           NO long-form deep markdown/problem/solution context clutter!)
         ========================================================================= */}
      <AdminModal
        isOpen={Boolean(editingFeatured)}
        onClose={() => setEditingFeatured(null)}
        title={editingFeatured?.id ? 'Edit Homepage Featured Case Study' : 'Create Featured Case Study'}
        subtitle="Configures the interactive dual-screen mockup & right-side showcase on the Homepage"
        maxWidth="max-w-3xl"
      >
        {editingFeatured && (
          <form onSubmit={handleSaveFeatured} className="space-y-6">
            
            {/* 1. Basic Metadata */}
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
                    Card Tagline * (Displayed on left card top bar)
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
                    value={editingFeatured.year || '2026'}
                    onChange={(e) => setEditingFeatured({ ...editingFeatured, year: e.target.value })}
                    placeholder="2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. DUAL IMAGES UPLOAD (Main Thumbnail + Hover Reveal Image) */}
            <div className="space-y-4 p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-semibold">
                  2. Dual Screen Images (Mockup on Hover)
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  Screen 1 default &bull; Screen 2 reveals on hover
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Image 1: Main Preview Thumbnail */}
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
                      <span>{uploadingFeatMain ? 'Uploading...' : 'Upload Screen 1'}</span>
                    </button>
                    <input
                      ref={featMainFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadFeaturedMain}
                      className="hidden"
                    />
                  </div>

                  <input
                    type="url"
                    value={editingFeatured.preview_image || ''}
                    onChange={(e) => setEditingFeatured({ ...editingFeatured, preview_image: e.target.value })}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-neutral-600 font-mono"
                  />
                </div>

                {/* Image 2: Hover Reveal Image */}
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
                      <span>{uploadingFeatHover ? 'Uploading...' : 'Upload Screen 2'}</span>
                    </button>
                    <input
                      ref={featHoverFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadFeaturedHover}
                      className="hidden"
                    />
                  </div>

                  <input
                    type="url"
                    value={editingFeatured.hover_image || ''}
                    onChange={(e) => setEditingFeatured({ ...editingFeatured, hover_image: e.target.value })}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-neutral-600 font-mono"
                  />
                </div>

              </div>
            </div>

            {/* 3. RIGHT-SIDE SHOWCASE CONTENT (Overview, 4 Key Features, Tech Stack) */}
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
                  placeholder="Reserva is a high-throughput facility reservation platform engineered with Next.js, Node.js, and MongoDB. It addresses concurrency bottlenecks through atomic locks and interactive calendars."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono resize-none"
                />
              </div>

              {/* 4 Key Feature Highlights */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                    Key Features Highlights (✦ Exactly 4 Points)
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    Title: 2-4 words &bull; Desc: 12-18 words
                  </span>
                </div>

                <div className="space-y-2.5">
                  {[0, 1, 2, 3].map((fIndex) => {
                    const feat = editingFeatured.key_features?.[fIndex] || { title: '', description: '' };
                    return (
                      <div key={fIndex} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="space-y-1 sm:col-span-1">
                          <span className="text-[10px] font-mono text-neutral-400 font-semibold block">
                            ✦ Point #{fIndex + 1} Title
                          </span>
                          <input
                            type="text"
                            value={feat.title}
                            onChange={(e) => {
                              const updated = [...(editingFeatured.key_features || [])];
                              while (updated.length < 4) updated.push({ title: '', description: '' });
                              updated[fIndex] = { ...updated[fIndex], title: e.target.value };
                              setEditingFeatured({ ...editingFeatured, key_features: updated });
                            }}
                            placeholder="e.g. Atomic Scheduler"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-white font-mono"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <span className="text-[10px] font-mono text-neutral-400 font-semibold block">
                            Point #{fIndex + 1} Description
                          </span>
                          <input
                            type="text"
                            value={feat.description}
                            onChange={(e) => {
                              const updated = [...(editingFeatured.key_features || [])];
                              while (updated.length < 4) updated.push({ title: '', description: '' });
                              updated[fIndex] = { ...updated[fIndex], description: e.target.value };
                              setEditingFeatured({ ...editingFeatured, key_features: updated });
                            }}
                            placeholder="Guarantees a timeslot is only claimed by one user with instant lock guards."
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tech Stack Autocomplete */}
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
                          No technologies added yet.
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
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={editingFeatured.live_url || ''}
                    onChange={(e) => setEditingFeatured({ ...editingFeatured, live_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white font-mono"
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
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                    Client Repo URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={editingFeatured.client_url || ''}
                    onChange={(e) => setEditingFeatured({ ...editingFeatured, client_url: e.target.value })}
                    placeholder="https://github.com/.../client"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                    Server Repo URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={editingFeatured.server_url || ''}
                    onChange={(e) => setEditingFeatured({ ...editingFeatured, server_url: e.target.value })}
                    placeholder="https://github.com/.../server"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white font-mono"
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
                <input
                  type="text"
                  value={editingFeatured.gradient || ''}
                  onChange={(e) => setEditingFeatured({ ...editingFeatured, gradient: e.target.value })}
                  placeholder="linear-gradient(135deg, #182848 0%, #4b6cb7 100%)"
                  className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white font-mono"
                />
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
                <span>{editingFeatured.id ? 'Save Featured Case Study' : 'Create Featured Case Study'}</span>
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
        description="This will remove this case study from the homepage interactive showcase in PostgreSQL. The regular project (if any) remains intact in your portfolio."
        confirmText="Remove from Homepage"
        confirmVariant="danger"
        isLoading={isPending}
        onConfirm={confirmDeleteFeatured}
        onClose={() => setDeletingFeaturedId(null)}
      />

    </div>
  );
}
