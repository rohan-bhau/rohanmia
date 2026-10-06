'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Eye, 
  Layers, 
  Pencil, 
  FolderGit2, 
  Cpu, 
  SlidersHorizontal,
  Save,
  Camera,
  Plus,
  Trash2,
  ArrowUpRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import Hero from '@/components/home/Hero';
import BentoGrid from '@/components/home/BentoGrid';
import FeaturedCaseStudies from '@/components/home/FeaturedCaseStudies';
import PinnedSocials from '@/components/layout/PinnedSocials';
import { HeroData, BentoCardsData } from '@/lib/constants/homepage';
import { saveHeroData } from '@/actions/adminHero';
import { saveBentoData } from '@/actions/adminBento';
import ImageCropModal from '@/components/admin/ui/ImageCropModal';
import { useToast } from '@/components/admin/ui/Toast';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { useAdminMode } from './AdminModeContext';
import TechBadge from '@/components/ui/TechBadge';
import TechAutocompleteInput from '@/components/ui/TechAutocompleteInput';
import { FEATURED_CASE_STUDIES } from '@/data/projects';

interface AdminHomepageManagerProps {
  heroData: HeroData;
  bentoData: BentoCardsData;
  featuredProjects: any[];
}

export default function AdminHomepageManager({
  heroData,
  bentoData,
  featuredProjects,
}: AdminHomepageManagerProps) {
  const { currentTheme } = useThemeAccent();
  const { toast } = useToast();
  const { mode: activeMode, basePath } = useAdminMode();

  // Form states for Studio Engine
  const [heroForm, setHeroForm] = useState<HeroData>(heroData);
  const [bentoForm, setBentoForm] = useState<BentoCardsData>(bentoData);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [isSavingBento, setIsSavingBento] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);

  // New tag/point temp inputs
  const [newCard1Point, setNewCard1Point] = useState('');
  const [newCard2Tech, setNewCard2Tech] = useState('');
  const [newCard4Tool, setNewCard4Tool] = useState('');

  const handleSaveHeroForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHero(true);
    try {
      await saveHeroData(heroForm);
      toast.success('Hero content committed to database');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update hero');
    } finally {
      setIsSavingHero(false);
    }
  };

  const handleSaveBentoForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBento(true);
    try {
      await saveBentoData(bentoForm);
      toast.success('Bento grid committed to database');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update bento grid');
    } finally {
      setIsSavingBento(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* ========================================================
          MODE 1: SURFACE CANVAS (Clean Live Preview, Non-Editable)
         ======================================================== */}
      {activeMode === 'preview' ? (
        <div className="flex flex-col gap-8 relative animate-in fade-in duration-200">
          <PinnedSocials />
          {/* Read-Only Pure Visitor View (isAdmin={false} ensures no pencil/edit triggers, compactTop={true} removes dead space) */}
          <Hero initialData={heroData} isAdmin={false} compactTop={true} />
          <BentoGrid initialData={bentoData} isAdmin={false} />
          <FeaturedCaseStudies initialProjects={featuredProjects} isAdmin={false} />
        </div>
      ) : (
        /* ========================================================
            MODE 2: STUDIO ENGINE (Comprehensive Editing Dashboard)
           ======================================================== */
        <div className="px-4 sm:px-8 max-w-6xl mx-auto space-y-8 sm:space-y-10 pb-28 md:pb-12 animate-in fade-in duration-200">
          
          {/* 1. HERO SECTION EDITOR */}
          <form onSubmit={handleSaveHeroForm} className="p-6 sm:p-8 rounded-3xl bg-[#0d0f14]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <Layers size={18} style={{ color: currentTheme.primary }} />
                <h3 className="text-base font-serif font-medium text-white tracking-wide">
                  Hero Profile & Bio
                </h3>
              </div>

              <button
                type="submit"
                disabled={isSavingHero}
                style={{ backgroundColor: currentTheme.primary }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium text-white hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save size={13} />
                <span>{isSavingHero ? 'Saving...' : 'Commit Hero'}</span>
              </button>
            </div>

            {/* Profile Picture Uploader Row */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] flex flex-col sm:flex-row items-center gap-5">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl shrink-0 group">
                <Image
                  src={heroForm.profile_image || 'https://res.cloudinary.com/dzni0yyle/image/upload/v1778155735/portfolio_cms/fcprc2kqkcmxitdibzcn.png'}
                  alt="Portrait Preview"
                  fill
                  className="object-cover object-top"
                />
                <button
                  type="button"
                  onClick={() => setCropModalOpen(true)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity text-white text-[10px] font-mono cursor-pointer"
                >
                  <Camera size={18} />
                  <span>Crop/Upload</span>
                </button>
              </div>

              <div className="space-y-2 flex-1 w-full">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-neutral-300">
                    Portrait Picture (1:1 Square Crop)
                  </label>
                  <button
                    type="button"
                    onClick={() => setCropModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <Camera size={12} style={{ color: currentTheme.primary }} />
                    <span>Upload & Square Crop</span>
                  </button>
                </div>
                {heroForm.profile_image ? (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-black/60 border border-white/[0.08] text-[11px] font-mono text-neutral-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="truncate flex-1">{heroForm.profile_image}</span>
                  </div>
                ) : (
                  <p className="text-[11px] font-mono text-neutral-500">
                    No portrait uploaded yet. Click Upload &amp; Square Crop to add.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1.5">Greeting</label>
                <input
                  type="text"
                  value={heroForm.greeting}
                  onChange={(e) => setHeroForm({ ...heroForm, greeting: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={heroForm.name}
                  onChange={(e) => setHeroForm({ ...heroForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1.5">Surname</label>
                <input
                  type="text"
                  value={heroForm.surname}
                  onChange={(e) => setHeroForm({ ...heroForm, surname: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1.5">Rotating Titles (Comma-separated)</label>
              <input
                type="text"
                value={heroForm.rotating_roles.join(', ')}
                onChange={(e) => setHeroForm({ 
                  ...heroForm, 
                  rotating_roles: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-sm text-white focus:outline-none focus:border-white/30 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1.5">Bio Paragraph</label>
              <textarea
                rows={4}
                value={heroForm.bio}
                onChange={(e) => setHeroForm({ ...heroForm, bio: e.target.value })}
                className="w-full min-h-[120px] px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-sm text-white focus:outline-none focus:border-white/30 leading-relaxed [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1.5">Projects CTA Label</label>
                <input
                  type="text"
                  value={heroForm.projects_cta_text}
                  onChange={(e) => setHeroForm({ ...heroForm, projects_cta_text: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1.5">Resume CTA Label</label>
                <input
                  type="text"
                  value={heroForm.resume_cta_text}
                  onChange={(e) => setHeroForm({ ...heroForm, resume_cta_text: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          </form>

          {/* 2. BENTO GRID ARCHITECTURE EDITOR */}
          <form onSubmit={handleSaveBentoForm} className="p-6 sm:p-8 rounded-3xl bg-[#0d0f14]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <Cpu size={18} style={{ color: currentTheme.primary }} />
                <h3 className="text-base font-serif font-medium text-white tracking-wide">
                  Bento Grid Modules
                </h3>
              </div>

              <button
                type="submit"
                disabled={isSavingBento}
                style={{ backgroundColor: currentTheme.primary }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium text-white hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save size={13} />
                <span>{isSavingBento ? 'Saving...' : 'Commit Bento Grid'}</span>
              </button>
            </div>

            {/* Header Titles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1.5">Badge</label>
                <input
                  type="text"
                  value={bentoForm.badge}
                  onChange={(e) => setBentoForm({ ...bentoForm, badge: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1.5">Title Prefix</label>
                <input
                  type="text"
                  value={bentoForm.title_prefix}
                  onChange={(e) => setBentoForm({ ...bentoForm, title_prefix: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1.5">Title Suffix (Italicized)</label>
                <input
                  type="text"
                  value={bentoForm.title_suffix}
                  onChange={(e) => setBentoForm({ ...bentoForm, title_suffix: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            {/* Card 1: Full-Stack Engineering */}
            <div className="p-5 rounded-2xl bg-black/35 border border-white/[0.06] space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentTheme.primary }} />
                Module 1: Full-Stack Engineering (Span 7)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">Tag</label>
                  <input
                    type="text"
                    value={bentoForm.card1.tag}
                    onChange={(e) => setBentoForm({
                      ...bentoForm,
                      card1: { ...bentoForm.card1, tag: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">Headline</label>
                  <input
                    type="text"
                    value={bentoForm.card1.headline}
                    onChange={(e) => setBentoForm({
                      ...bentoForm,
                      card1: { ...bentoForm.card1, headline: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={bentoForm.card1.description}
                  onChange={(e) => setBentoForm({
                    ...bentoForm,
                    card1: { ...bentoForm.card1, description: e.target.value }
                  })}
                  className="w-full min-h-[80px] px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1.5">Feature Points</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {bentoForm.card1.points.map((pt, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] text-xs font-mono text-white border border-white/10">
                      <span>{pt}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const points = bentoForm.card1.points.filter((_, i) => i !== idx);
                          setBentoForm({ ...bentoForm, card1: { ...bentoForm.card1, points } });
                        }}
                        className="text-neutral-400 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 size={11} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCard1Point}
                    onChange={(e) => setNewCard1Point(e.target.value)}
                    placeholder="Add bullet point..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-black/60 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newCard1Point.trim()) {
                          setBentoForm({
                            ...bentoForm,
                            card1: {
                              ...bentoForm.card1,
                              points: [...bentoForm.card1.points, newCard1Point.trim()]
                            }
                          });
                          setNewCard1Point('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCard1Point.trim()) {
                        setBentoForm({
                          ...bentoForm,
                          card1: {
                            ...bentoForm.card1,
                            points: [...bentoForm.card1.points, newCard1Point.trim()]
                          }
                        });
                        setNewCard1Point('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.08] text-xs font-mono text-white hover:bg-white/[0.15] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Featured Project */}
            <div className="p-5 rounded-2xl bg-black/35 border border-white/[0.06] space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentTheme.primary }} />
                Module 2: Featured Project Card (Span 5)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">Tag</label>
                  <input
                    type="text"
                    value={bentoForm.card2.tag}
                    onChange={(e) => setBentoForm({
                      ...bentoForm,
                      card2: { ...bentoForm.card2, tag: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">Project Title</label>
                  <input
                    type="text"
                    value={bentoForm.card2.project_title}
                    onChange={(e) => setBentoForm({
                      ...bentoForm,
                      card2: { ...bentoForm.card2, project_title: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={bentoForm.card2.description}
                  onChange={(e) => setBentoForm({
                    ...bentoForm,
                    card2: { ...bentoForm.card2, description: e.target.value }
                  })}
                  className="w-full min-h-[80px] px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1.5">Tech Badges</label>
                <div className="flex flex-wrap gap-2 mb-2 items-center">
                  {bentoForm.card2.tech_stack.map((tech, idx) => (
                    <div key={idx} className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <TechBadge name={tech} size="sm" />
                      <button
                        type="button"
                        onClick={() => {
                          const tech_stack = bentoForm.card2.tech_stack.filter((_, i) => i !== idx);
                          setBentoForm({ ...bentoForm, card2: { ...bentoForm.card2, tech_stack } });
                        }}
                        className="text-neutral-400 hover:text-rose-400 p-0.5 cursor-pointer transition-colors"
                        title={`Remove ${tech}`}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
                <TechAutocompleteInput
                  onAddTech={(tech) => {
                    if (tech && !bentoForm.card2.tech_stack.includes(tech)) {
                      setBentoForm({
                        ...bentoForm,
                        card2: {
                          ...bentoForm.card2,
                          tech_stack: [...bentoForm.card2.tech_stack, tech]
                        }
                      });
                    }
                  }}
                  placeholder="Add tech badge (e.g. Next.js 16, Redux, Tailwind)..."
                />
              </div>
            </div>

            {/* Card 4: Primary Tech Stack */}
            <div className="p-5 rounded-2xl bg-black/35 border border-white/[0.06] space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentTheme.primary }} />
                Module 4: Primary Tech Stack (Span 4)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">Tag</label>
                  <input
                    type="text"
                    value={bentoForm.card4.tag}
                    onChange={(e) => setBentoForm({
                      ...bentoForm,
                      card4: { ...bentoForm.card4, tag: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={bentoForm.card4.title}
                    onChange={(e) => setBentoForm({
                      ...bentoForm,
                      card4: { ...bentoForm.card4, title: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1.5">Tools & Libraries</label>
                <div className="flex flex-wrap gap-2 mb-2 items-center">
                  {bentoForm.card4.tools.map((tool, idx) => (
                    <div key={idx} className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <TechBadge name={tool} size="sm" />
                      <button
                        type="button"
                        onClick={() => {
                          const tools = bentoForm.card4.tools.filter((_, i) => i !== idx);
                          setBentoForm({ ...bentoForm, card4: { ...bentoForm.card4, tools } });
                        }}
                        className="text-neutral-400 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                        title="Remove tool"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <TechAutocompleteInput
                  onAddTech={(tool) => {
                    if (tool && !bentoForm.card4.tools.includes(tool)) {
                      setBentoForm({
                        ...bentoForm,
                        card4: {
                          ...bentoForm.card4,
                          tools: [...bentoForm.card4.tools, tool]
                        }
                      });
                    }
                  }}
                  placeholder="Add tool/tech (e.g. PostgreSQL, Docker, Git)..."
                />
              </div>
            </div>

            {/* Card 5: Location & Availability */}
            <div className="p-5 rounded-2xl bg-black/35 border border-white/[0.06] space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentTheme.primary }} />
                Module 5: Location & Availability (Span 3)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">Tag</label>
                  <input
                    type="text"
                    value={bentoForm.card5.tag}
                    onChange={(e) => setBentoForm({
                      ...bentoForm,
                      card5: { ...bentoForm.card5, tag: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">Location</label>
                  <input
                    type="text"
                    value={bentoForm.card5.location}
                    onChange={(e) => setBentoForm({
                      ...bentoForm,
                      card5: { ...bentoForm.card5, location: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">Timezone</label>
                  <input
                    type="text"
                    value={bentoForm.card5.timezone}
                    onChange={(e) => setBentoForm({
                      ...bentoForm,
                      card5: { ...bentoForm.card5, timezone: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">Description</label>
                  <input
                    type="text"
                    value={bentoForm.card5.description}
                    onChange={(e) => setBentoForm({
                      ...bentoForm,
                      card5: { ...bentoForm.card5, description: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
            </div>
          </form>

          {/* 3. FEATURED CASE STUDIES HUB (Visual cards with link to project page) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0d0f14]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] flex-wrap gap-4">
              <div className="flex items-center gap-2.5">
                <FolderGit2 size={18} style={{ color: currentTheme.primary }} />
                <div>
                  <h3 className="text-base font-serif font-medium text-white tracking-wide">
                    Curated Case Studies ({featuredProjects.length} Active)
                  </h3>
                  <p className="text-xs font-mono text-neutral-400">
                    To modify, reorder or add case studies, manage them directly in the Projects Studio.
                  </p>
                </div>
              </div>

              <Link
                href={`${basePath}/projects`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium text-white transition-all shadow-md cursor-pointer hover:opacity-90"
                style={{ backgroundColor: currentTheme.primary }}
              >
                <Pencil size={12} />
                <span>Manage in Projects Studio</span>
              </Link>
            </div>

            {/* Featured Projects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {featuredProjects.map((project) => {
                const matchStatic = FEATURED_CASE_STUDIES.find(
                  (p) => p.id === project.id || p.slug === project.slug
                );
                const previewImg = project.previewImage || project.preview_image || matchStatic?.previewImage;
                const hoverImg = project.hoverImage || project.hover_image || matchStatic?.hoverImage || previewImg;
                const gradient = project.gradient || matchStatic?.gradient || 'linear-gradient(145deg, #181924 0%, #0d0f14 100%)';

                return (
                  <div 
                    key={project.id}
                    className="rounded-2xl bg-[#0c0e14]/80 border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col justify-between p-4 group/card hover:bg-white/[0.02] shadow-xl"
                  >
                    <div className="space-y-3">
                      {/* Dual-Screen Mockup on Image Hover (Matches public FeaturedCaseStudies) */}
                      <div 
                        className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-white/10 group/img cursor-pointer p-2.5 sm:p-3 transition-all duration-500"
                        style={{ background: gradient }}
                      >
                        {/* Subtle Contrast Overlay for Platform */}
                        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/25 via-transparent to-black/60 pointer-events-none" />

                        {previewImg ? (
                          <div className="relative w-full h-full flex items-end justify-center z-10">
                            {/* Screen 1 (Default Thumbnail / Tilts back to left on image hover only) */}
                            <div
                              className={`w-full h-full rounded-t-lg rounded-b-sm border-t-2 border-x-2 border-white/40 shadow-[0_15px_35px_rgba(0,0,0,0.7)] overflow-hidden bg-black/90 relative transition-all duration-500 ease-out ${
                                hoverImg
                                  ? 'group-hover/img:-rotate-6 group-hover/img:-translate-x-3 sm:group-hover/img:-translate-x-4 group-hover/img:scale-95 group-hover/img:opacity-85'
                                  : 'group-hover/img:scale-105'
                              }`}
                            >
                              <Image
                                src={previewImg}
                                alt={project.title}
                                fill
                                className="object-cover object-top transition-transform duration-700 group-hover/img:scale-105"
                              />
                            </div>

                            {/* Screen 2 (Secondary Mockup / Slides in front on image hover, tilted right) */}
                            {hoverImg && (
                              <div className="absolute inset-0 w-full h-full rounded-t-lg rounded-b-sm border-t-2 border-x-2 border-white/60 shadow-[0_25px_50px_rgba(0,0,0,0.9)] overflow-hidden bg-black/95 z-20 transition-all duration-500 ease-out opacity-0 translate-y-7 scale-90 pointer-events-none group-hover/img:opacity-100 group-hover/img:translate-y-0 group-hover/img:translate-x-3 sm:group-hover/img:translate-x-4 group-hover/img:rotate-3 group-hover/img:scale-100">
                                <Image
                                  src={hoverImg}
                                  alt={`${project.title} Preview`}
                                  fill
                                  className="object-cover object-top"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-mono text-neutral-500 z-10 relative">
                            No Preview
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono text-neutral-400">{project.category}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-300">{project.year}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-white mt-1 group-hover/card:text-primary transition-colors">
                          {project.title}
                        </h4>
                        <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-snug">
                          {project.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {(project.techStack || project.tech_stack || []).slice(0, 3).map((t: string) => (
                          <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-neutral-400">
                            {t}
                          </span>
                        ))}
                      </div>

                      <Link
                        href={`${basePath}/projects`}
                        className="text-neutral-400 hover:text-white p-1"
                        title="Update in Projects Studio"
                      >
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Hero Image Square Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        onSuccess={async (newUrl) => {
          setHeroForm(prev => ({ ...prev, profile_image: newUrl }));
          await saveHeroData({ profile_image: newUrl });
          toast.success('Hero picture updated and saved to PostgreSQL!');
        }}
      />
    </div>
  );
}
