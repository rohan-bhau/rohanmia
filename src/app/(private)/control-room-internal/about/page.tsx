'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Briefcase, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Check, 
  X, 
  Loader2,
  GraduationCap,
  Layers,
  ImageIcon,
  Calendar,
  UploadCloud
} from 'lucide-react';
import { fetchAdminAbout, saveAdminAbout } from '@/actions/adminAbout';
import { uploadImage } from '@/actions/upload';
import { DbAboutContentRow } from '@/lib/db/content';
import { useToast } from '@/components/admin/ui/Toast';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import AdminModal from '@/components/admin/ui/AdminModal';
import ImageCropModal from '@/components/admin/ui/ImageCropModal';
import TechBadge from '@/components/ui/TechBadge';
import TechAutocompleteInput from '@/components/ui/TechAutocompleteInput';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { useAdminMode } from '@/components/admin/AdminModeContext';
import AboutClient from '@/app/(public)/about/AboutClient';

function formatMonthYear(ym: string) {
  if (!ym) return '';
  const trimmed = ym.trim();
  const parts = trimmed.split('-');
  if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
    const [y, m] = parts;
    const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    if (!isNaN(date.getTime())) {
      return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    }
  }
  return trimmed;
}

function computePeriodString(startDate?: string, endDate?: string, isCurrent?: boolean, fallback?: string): string {
  if (!startDate) return fallback || '';
  const startStr = formatMonthYear(startDate);
  if (isCurrent) {
    return `${startStr} — Present`;
  }
  if (endDate) {
    return `${startStr} — ${formatMonthYear(endDate)}`;
  }
  return startStr;
}

function DatePickerInput({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "e.g. 2024-01 or Jan 2024"
}: {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  const hiddenInputRef = React.useRef<HTMLInputElement>(null);

  const openCalendar = () => {
    if (hiddenInputRef.current) {
      if (typeof hiddenInputRef.current.showPicker === 'function') {
        hiddenInputRef.current.showPicker();
      } else {
        hiddenInputRef.current.focus();
      }
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
          <Calendar size={13} className="text-cyan-400" />
          <span>{label}</span>
        </label>
      )}
      <div className="relative flex items-center">
        <input
          type="text"
          required={required}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-3 pr-10 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30 disabled:opacity-40 disabled:cursor-not-allowed font-mono"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={openCalendar}
          title="Open calendar picker"
          className="absolute right-2 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Calendar size={14} />
        </button>
        {/* Hidden native month picker to open OS calendar popup */}
        <input
          ref={hiddenInputRef}
          type="month"
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only opacity-0 pointer-events-none absolute right-0"
          value={value && value.match(/^\d{4}-\d{2}$/) ? value : ''}
          onChange={(e) => {
            if (e.target.value) {
              onChange(e.target.value);
            }
          }}
        />
      </div>
    </div>
  );
}

export default function AdminAboutPage() {
  const { currentTheme } = useThemeAccent();
  const { showToast } = useToast();
  const { mode } = useAdminMode();
  const [content, setContent] = useState<DbAboutContentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [editBioOpen, setEditBioOpen] = useState(false);
  const [bioForm, setBioForm] = useState({
    eyebrow: '',
    heading_title: '',
    heading_highlight: '',
    bio_paragraphs: ['', '', ''],
  });

  const [editingExperience, setEditingExperience] = useState<any | null>(null);
  const [deletingExpIdx, setDeletingExpIdx] = useState<number | null>(null);
  const [newSkillInput, setNewSkillInput] = useState('');

  const [editingEdu, setEditingEdu] = useState<any | null>(null);
  const [deletingEduIdx, setDeletingEduIdx] = useState<number | null>(null);

  const [editingCarouselItem, setEditingCarouselItem] = useState<any | null>(null);
  const [deletingCarouselIdx, setDeletingCarouselIdx] = useState<number | null>(null);
  const [carouselCropOpen, setCarouselCropOpen] = useState(false);
  const [uploadingCarouselImage, setUploadingCarouselImage] = useState(false);
  const carouselFileInputRef = React.useRef<HTMLInputElement>(null);

  const addSkillToExperience = (skillName: string) => {
    if (!skillName.trim() || !editingExperience) return;
    const toAdd = skillName.split(',').map(s => s.trim()).filter(Boolean);
    const existing = Array.isArray(editingExperience.skills)
      ? editingExperience.skills
      : String(editingExperience.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    const unique = Array.from(new Set([...existing, ...toAdd]));
    setEditingExperience({ ...editingExperience, skills: unique });
    setNewSkillInput('');
  };

  const removeSkillFromExperience = (indexToRemove: number) => {
    if (!editingExperience) return;
    const existing = Array.isArray(editingExperience.skills)
      ? editingExperience.skills
      : String(editingExperience.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    const updated = existing.filter((_: string, idx: number) => idx !== indexToRemove);
    setEditingExperience({ ...editingExperience, skills: updated });
  };

  const handleCarouselFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCarouselImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadImage(formData);
      if (res.success && res.url) {
        setEditingCarouselItem((prev: any) => ({ ...prev, image: res.url }));
        showToast('Image uploaded to Cloudinary successfully!', 'success');
      } else {
        showToast(res.error || 'Failed to upload image to Cloudinary', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error uploading image', 'error');
    } finally {
      setUploadingCarouselImage(false);
      if (carouselFileInputRef.current) {
        carouselFileInputRef.current.value = '';
      }
    }
  };

  const loadData = async () => {
    setLoading(true);
    const res = await fetchAdminAbout();
    if (res.success && res.content) {
      setContent(res.content);
      setBioForm({
        eyebrow: res.content.eyebrow || '',
        heading_title: res.content.heading_title || '',
        heading_highlight: res.content.heading_highlight || '',
        bio_paragraphs: res.content.bio_paragraphs && res.content.bio_paragraphs.length > 0 
          ? [...res.content.bio_paragraphs] 
          : ['', '', ''],
      });
    } else {
      showToast(res.error || 'Failed to load about content', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Biography Narrative
  const handleSaveBio = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveAdminAbout({
        eyebrow: bioForm.eyebrow,
        heading_title: bioForm.heading_title,
        heading_highlight: bioForm.heading_highlight,
        bio_paragraphs: bioForm.bio_paragraphs.filter(p => p.trim().length > 0),
      });

      if (res.success && res.content) {
        setContent(res.content);
        setEditBioOpen(false);
        showToast('Biography updated successfully.', 'success');
      } else {
        showToast(res.error || 'Failed to save biography', 'error');
      }
    });
  };

  // Save Career Experience
  const handleSaveExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExperience) return;

    startTransition(async () => {
      if (!content) { showToast('Existing data not loaded yet. Reload and try again.', 'error'); return; }
      const currentExps = [...(content.career_experiences || [])];
      
      const computedPeriod = computePeriodString(
        editingExperience.start_date,
        editingExperience.end_date,
        editingExperience.is_current,
        editingExperience.period
      ) || editingExperience.period || 'Present';

      const expData = {
        id: editingExperience.id || `exp-${Date.now()}`,
        period: computedPeriod,
        start_date: editingExperience.start_date || '',
        end_date: editingExperience.is_current ? '' : (editingExperience.end_date || ''),
        is_current: Boolean(editingExperience.is_current),
        is_remote: Boolean(editingExperience.is_remote),
        company: editingExperience.company,
        role: editingExperience.role,
        location: editingExperience.location || '',
        description: editingExperience.description || '',
        achievements: Array.isArray(editingExperience.achievements)
          ? editingExperience.achievements
          : String(editingExperience.achievements || '').split('\n').filter(Boolean),
        skills: Array.isArray(editingExperience.skills)
          ? editingExperience.skills
          : String(editingExperience.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      };

      if (editingExperience._index !== undefined) {
        currentExps[editingExperience._index] = expData;
      } else {
        currentExps.unshift(expData);
      }

      const res = await saveAdminAbout({ career_experiences: currentExps });
      if (res.success && res.content) {
        setContent(res.content);
        setEditingExperience(null);
        showToast('Experience saved successfully.', 'success');
      } else {
        showToast(res.error || 'Failed to save experience', 'error');
      }
    });
  };

  // Delete Experience
  const confirmDeleteExp = async () => {
    if (deletingExpIdx === null || !content) return;
    startTransition(async () => {
      const currentExps = content.career_experiences.filter((_, idx) => idx !== deletingExpIdx);
      const res = await saveAdminAbout({ career_experiences: currentExps });
      if (res.success && res.content) {
        setContent(res.content);
        setDeletingExpIdx(null);
        showToast('Experience deleted.', 'success');
      } else {
        showToast(res.error || 'Failed to delete experience', 'error');
      }
    });
  };

  // Save Education
  const handleSaveEdu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEdu) return;

    startTransition(async () => {
      if (!content) { showToast('Existing data not loaded yet. Reload and try again.', 'error'); return; }
      const currentEdu = [...(content.education || [])];
      if (editingEdu._index !== undefined) {
        currentEdu[editingEdu._index] = {
          period: editingEdu.period,
          degree: editingEdu.degree,
          institution: editingEdu.institution,
          location: editingEdu.location,
          tag: editingEdu.tag,
          description: editingEdu.description,
        };
      } else {
        currentEdu.push({
          period: editingEdu.period,
          degree: editingEdu.degree,
          institution: editingEdu.institution,
          location: editingEdu.location,
          tag: editingEdu.tag,
          description: editingEdu.description,
        });
      }

      const res = await saveAdminAbout({ education: currentEdu });
      if (res.success && res.content) {
        setContent(res.content);
        setEditingEdu(null);
        showToast('Education credential saved.', 'success');
      } else {
        showToast(res.error || 'Failed to save education credential', 'error');
      }
    });
  };

  // Delete Education
  const confirmDeleteEdu = async () => {
    if (deletingEduIdx === null || !content) return;
    startTransition(async () => {
      const currentEdu = content.education.filter((_, idx) => idx !== deletingEduIdx);
      const res = await saveAdminAbout({ education: currentEdu });
      if (res.success && res.content) {
        setContent(res.content);
        setDeletingEduIdx(null);
        showToast('Education credential deleted.', 'success');
      } else {
        showToast(res.error || 'Failed to delete education credential', 'error');
      }
    });
  };

  // Save Carousel Item
  const handleSaveCarouselItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCarouselItem) return;

    startTransition(async () => {
      if (!content) { showToast('Existing data not loaded yet. Reload and try again.', 'error'); return; }
      const currentItems = [...(content.carousel_items || [])];
      const itemData = {
        id: editingCarouselItem.id || `carousel-${Date.now()}`,
        title: editingCarouselItem.title || '',
        subtitle: editingCarouselItem.subtitle || '',
        image: editingCarouselItem.image || '',
        alt: editingCarouselItem.alt || editingCarouselItem.title || '',
      };

      if (editingCarouselItem._index !== undefined) {
        currentItems[editingCarouselItem._index] = itemData;
      } else {
        currentItems.push(itemData);
      }

      const res = await saveAdminAbout({ carousel_items: currentItems });
      if (res.success && res.content) {
        setContent(res.content);
        setEditingCarouselItem(null);
        showToast('Carousel slide saved successfully.', 'success');
      } else {
        showToast(res.error || 'Failed to save slide', 'error');
      }
    });
  };

  // Delete Carousel Item
  const confirmDeleteCarouselItem = async () => {
    if (deletingCarouselIdx === null || !content) return;
    startTransition(async () => {
      const currentItems = (content.carousel_items || []).filter((_, idx) => idx !== deletingCarouselIdx);
      const res = await saveAdminAbout({ carousel_items: currentItems });
      if (res.success && res.content) {
        setContent(res.content);
        setDeletingCarouselIdx(null);
        showToast('Carousel slide deleted.', 'success');
      } else {
        showToast(res.error || 'Failed to delete slide', 'error');
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-neutral-400 font-mono text-xs gap-2">
        <Loader2 size={16} className="animate-spin text-white" />
        <span>Loading About Editorial Panel...</span>
      </div>
    );
  }

  if (mode === 'preview') {
    return (
      <div className="animate-in fade-in duration-200">
        <AboutClient content={content || undefined} compactTop={true} />
      </div>
    );
  }

  return (
    <div className="space-y-16 max-w-5xl pb-16 relative pt-4 px-4 sm:px-8 mx-auto">
      
      {/* Ambient background glow matching selected theme */}
      <div 
        aria-hidden="true"
        className="fixed top-20 left-1/2 -translate-x-1/2 w-[700px] h-[380px] rounded-full blur-[140px] opacity-15 pointer-events-none -z-10 transition-colors duration-700"
        style={{ backgroundColor: currentTheme.primary }}
      />

      {/* 1. HERO BIOGRAPHY (Editorial visitor style with edit trigger) */}
      <section className="relative rounded-[32px] bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-2xl p-8 sm:p-12 shadow-2xl space-y-8 overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block">
              {content?.eyebrow || 'MORE ABOUT ME'}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal text-white tracking-tight leading-[1.12]">
              {content?.heading_title || "I'm Rohan, a"}{' '}
              <span 
                className="font-serif italic font-normal text-transparent bg-clip-text transition-all duration-500"
                style={{
                  backgroundImage: `linear-gradient(135deg, #ffffff 30%, ${currentTheme.primary} 100%)`
                }}
              >
                {content?.heading_highlight || 'creative engineer'}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditBioOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-all shadow-md cursor-pointer"
            >
              <Edit3 size={13} />
              <span>Edit Biography</span>
            </button>
            <Link
              href="/about"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 hover:text-white transition-colors"
              title="View Public About Page"
            >
              <ExternalLink size={15} />
            </Link>
          </div>
        </div>

        {/* Bio Story Paragraphs */}
        <div className="space-y-4 text-base sm:text-lg text-neutral-300 font-light leading-relaxed max-w-3xl">
          {content?.bio_paragraphs?.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      </section>

      {/* 2. CAREER EXPERIENCE SECTION (Matching visitor scroll rail layout) */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-white/[0.06] pb-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block">
              THE EXPERIENCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-white tracking-tight mt-1">
              Experience That Brings{' '}
              <span 
                className="font-serif italic text-transparent bg-clip-text transition-all duration-500"
                style={{
                  backgroundImage: `linear-gradient(135deg, #ffffff 30%, ${currentTheme.primary} 100%)`
                }}
              >
                Ideas to Life
              </span>
            </h2>
          </div>

          <button
            onClick={() => {
              setNewSkillInput('');
              setEditingExperience({
                period: '',
                start_date: '',
                end_date: '',
                is_current: false,
                is_remote: false,
                company: '',
                role: '',
                location: '',
                description: '',
                achievements: [],
                skills: [],
              });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white text-xs font-medium transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Experience</span>
          </button>
        </div>

        {/* Experiences Stream */}
        <div className="flex flex-col divide-y divide-white/10 border-t border-b border-white/10">
          {content?.career_experiences?.map((exp, idx) => {
            const isRemote = Boolean(exp.is_remote ?? exp.location?.toLowerCase().includes('remote'));

            return (
              <article 
                key={idx}
                className="relative grid grid-cols-1 md:grid-cols-[340px_1fr] p-6 sm:p-8 items-start gap-6 hover:bg-white/[0.01] transition-colors group"
              >
                {/* Left Column: Period & Company */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <time className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-400 block">
                      {exp.period}
                    </time>
                    {isRemote && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Remote
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div 
                      className="size-8.5 rounded-lg flex items-center justify-center font-mono font-bold text-xs border border-white/10 bg-neutral-900/90 shadow-sm shrink-0"
                      style={{ color: currentTheme.primary }}
                    >
                      <Briefcase size={16} />
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-white font-medium tracking-tight">
                      {exp.company}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-neutral-400 font-mono mt-1">
                    {exp.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="shrink-0" />
                        <span>{exp.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={12} className="shrink-0" />
                      <span>Full-time {isRemote ? '· Remote Role' : '· On-Site / Hybrid'}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Role & Achievements */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-serif text-2xl text-white font-medium tracking-tight">
                      {exp.role}
                    </h4>

                    {/* Inline Action Controls */}
                    <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setNewSkillInput('');
                          const isCurrent = exp.is_current ?? (exp.period?.toLowerCase().includes('present') || false);
                          const isExpRemote = Boolean(exp.is_remote ?? exp.location?.toLowerCase().includes('remote'));
                          setEditingExperience({
                            ...exp,
                            _index: idx,
                            start_date: exp.start_date || '',
                            end_date: exp.end_date || '',
                            is_current: isCurrent,
                            is_remote: isExpRemote,
                            location: exp.location || '',
                          });
                        }}
                        className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                        title="Edit Experience"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingExpIdx(idx)}
                        className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Experience"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                <p className="text-sm text-neutral-300 font-light leading-relaxed">
                  {exp.description}
                </p>

                {/* Achievements List */}
                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {exp.achievements.map((ach: string, achIdx: number) => (
                      <div key={achIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
                        <span className="shrink-0 select-none" style={{ color: currentTheme.primary }}>✦</span>
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills tags */}
                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                    {exp.skills.map((skill: string) => (
                      <TechBadge key={skill} name={skill} size="sm" />
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
        </div>
      </section>

      {/* 3. EDUCATION CREDENTIALS */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-white/[0.06] pb-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block">
              ACADEMIC BACKGROUND
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-white tracking-tight mt-1">
              Education &amp;{' '}
              <span 
                className="font-serif italic text-transparent bg-clip-text transition-all duration-500"
                style={{
                  backgroundImage: `linear-gradient(135deg, #ffffff 30%, ${currentTheme.primary} 100%)`
                }}
              >
                Credentials
              </span>
            </h2>
          </div>

          <button
            onClick={() => setEditingEdu({
              period: '',
              degree: '',
              institution: '',
              location: '',
              tag: '',
              description: '',
            })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white text-xs font-medium transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Credential</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content?.education?.map((edu, idx) => (
            <div
              key={idx}
              className="p-7 rounded-[28px] bg-[#0c1017]/70 border border-white/[0.08] hover:border-white/15 transition-all backdrop-blur-md flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <time className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    {edu.period}
                  </time>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full border border-white/10 text-neutral-300 bg-white/[0.03]">
                      {edu.tag || 'Academic'}
                    </span>
                    <button
                      onClick={() => setEditingEdu({ ...edu, _index: idx })}
                      className="p-1 text-neutral-400 hover:text-white transition-colors"
                      title="Edit Credential"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => setDeletingEduIdx(idx)}
                      className="p-1 text-neutral-400 hover:text-rose-400 transition-colors"
                      title="Delete Credential"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-2xl text-white font-medium tracking-tight">
                    {edu.degree}
                  </h3>
                  <p className="text-sm font-sans font-medium mt-1" style={{ color: currentTheme.primary }}>
                    {edu.institution}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                  <MapPin size={12} className="shrink-0" />
                  <span>{edu.location}</span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed pt-2 border-t border-white/5">
                  {edu.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HERO 3D STACKED CAROUSEL SLIDES (Hero Right Side Images) */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-white/[0.06] pb-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block">
              HERO RIGHT SIDE 3D CAROUSEL
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-white tracking-tight mt-1">
              Interactive Image{' '}
              <span 
                className="font-serif italic text-transparent bg-clip-text transition-all duration-500"
                style={{
                  backgroundImage: `linear-gradient(135deg, #ffffff 30%, ${currentTheme.primary} 100%)`
                }}
              >
                Cards Stack
              </span>
            </h2>
          </div>

          <button
            onClick={() => setEditingCarouselItem({
              title: '',
              subtitle: '',
              image: '',
              alt: '',
            })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white text-xs font-medium transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Slide Card</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(content?.carousel_items || []).map((item: any, idx: number) => (
            <div 
              key={item.id || idx}
              className="p-4 rounded-2xl bg-[#0c1017]/70 border border-white/[0.08] hover:border-white/15 transition-all backdrop-blur-md flex flex-col justify-between group space-y-3"
            >
              {/* Thumbnail preview */}
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-neutral-900 border border-white/10 group-hover:border-white/20 transition-all">
                <Image
                  src={item.image}
                  alt={item.alt || item.title || 'Slide image'}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <h4 className="font-serif text-sm font-medium leading-tight">{item.title}</h4>
                  <p className="font-mono text-[10px] text-neutral-300 truncate">{item.subtitle}</p>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-[10px] text-neutral-500 uppercase">
                  Slide #{idx + 1}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingCarouselItem({ ...item, _index: idx })}
                    className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit Slide"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => setDeletingCarouselIdx(idx)}
                    className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Slide"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          MODALS
         ========================================================================= */}

      {/* Edit Biography Modal */}
      <AdminModal
        isOpen={editBioOpen}
        onClose={() => setEditBioOpen(false)}
        title="Edit Biography Narrative"
        subtitle="Narrative bio paragraphs and headings"
      >
        <form onSubmit={handleSaveBio} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-neutral-400">Eyebrow</label>
              <input
                type="text"
                value={bioForm.eyebrow}
                onChange={(e) => setBioForm({ ...bioForm, eyebrow: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-neutral-400">Title Prefix</label>
              <input
                type="text"
                value={bioForm.heading_title}
                onChange={(e) => setBioForm({ ...bioForm, heading_title: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-neutral-400">Highlight</label>
              <input
                type="text"
                value={bioForm.heading_highlight}
                onChange={(e) => setBioForm({ ...bioForm, heading_highlight: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-mono text-neutral-400 block">
              Bio Story Paragraphs (1 to 3)
            </label>
            {bioForm.bio_paragraphs.map((p, idx) => (
              <textarea
                key={idx}
                rows={2}
                value={p}
                placeholder={`Paragraph ${idx + 1}...`}
                onChange={(e) => {
                  const newP = [...bioForm.bio_paragraphs];
                  newP[idx] = e.target.value;
                  setBioForm({ ...bioForm, bio_paragraphs: newP });
                }}
                className="w-full min-h-[58px] sm:min-h-[75px] px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-neutral-200 focus:outline-none focus:border-white/30 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden leading-relaxed"
              />
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setEditBioOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs text-neutral-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPending && <Loader2 size={13} className="animate-spin" />}
              <span>Save Biography</span>
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Edit / Add Experience Modal */}
      <AdminModal
        isOpen={!!editingExperience}
        onClose={() => setEditingExperience(null)}
        title={editingExperience?._index !== undefined ? 'Edit Career Experience' : 'Add Career Experience'}
        subtitle="Manage timeline role, achievements, and tech stack"
      >
        {editingExperience && (
          <form onSubmit={handleSaveExperience} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-neutral-400">Company Name *</label>
                <input
                  type="text"
                  required
                  value={editingExperience.company || ''}
                  onChange={(e) => setEditingExperience({ ...editingExperience, company: e.target.value })}
                  placeholder="Company or Organization"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-neutral-400">Role Title *</label>
                <input
                  type="text"
                  required
                  value={editingExperience.role || ''}
                  onChange={(e) => setEditingExperience({ ...editingExperience, role: e.target.value })}
                  placeholder="e.g. Full-Stack Developer & Builder"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            {/* Start Date & End Date with Calendar & Manual Typing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DatePickerInput
                label="Start Date (Month & Year) *"
                required
                value={editingExperience.start_date || ''}
                onChange={(val) => setEditingExperience({ ...editingExperience, start_date: val })}
                placeholder="e.g. 2024-01 or Jan 2024"
              />

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
                    <Calendar size={13} className="text-cyan-400" />
                    <span>End Date</span>
                  </span>
                  <label className="inline-flex items-center gap-1.5 text-[11px] font-mono text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingExperience.is_current)}
                      onChange={(e) => setEditingExperience({ 
                        ...editingExperience, 
                        is_current: e.target.checked,
                        end_date: e.target.checked ? '' : editingExperience.end_date
                      })}
                      className="rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                    <span>Present / Current</span>
                  </label>
                </div>
                <DatePickerInput
                  disabled={Boolean(editingExperience.is_current)}
                  value={editingExperience.end_date || ''}
                  onChange={(val) => setEditingExperience({ ...editingExperience, end_date: val })}
                  placeholder={editingExperience.is_current ? 'Present' : 'e.g. 2025-06 or Jun 2025'}
                />
              </div>
            </div>

            {/* Calculated period preview + Remote Role Checkbox */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-neutral-400">Display Period:</span>
                <span className="text-xs font-mono font-semibold text-white px-2.5 py-0.5 rounded bg-white/10">
                  {computePeriodString(editingExperience.start_date, editingExperience.end_date, editingExperience.is_current, editingExperience.period) || 'Select Dates'}
                </span>
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(editingExperience.is_remote)}
                  onChange={(e) => setEditingExperience({ ...editingExperience, is_remote: e.target.checked })}
                  className="rounded border-emerald-500/40 bg-emerald-500/10 text-emerald-400 focus:ring-0 cursor-pointer size-4"
                />
                <span className="font-medium">Remote Job / Position</span>
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-neutral-400">Location</label>
              <input
                type="text"
                value={editingExperience.location || ''}
                onChange={(e) => setEditingExperience({ ...editingExperience, location: e.target.value })}
                placeholder="e.g. Dhaka, Bangladesh or Remote"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-neutral-400">Role Summary</label>
              <textarea
                rows={3}
                value={editingExperience.description || ''}
                onChange={(e) => setEditingExperience({ ...editingExperience, description: e.target.value })}
                placeholder="Overview of your responsibilities and engineering achievements..."
                className="w-full min-h-[85px] px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-neutral-400">Key Achievements (One per line)</label>
              <textarea
                rows={4}
                value={Array.isArray(editingExperience.achievements) ? editingExperience.achievements.join('\n') : editingExperience.achievements || ''}
                onChange={(e) => setEditingExperience({ ...editingExperience, achievements: e.target.value })}
                placeholder="Lead System Architecture: Scaled Next.js 16 platform&#10;Type Safety: Enforced end-to-end Zod schemas"
                className="w-full min-h-[100px] px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              />
            </div>

            {/* Technologies with Live Icons & Badges */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-neutral-400">Technologies &amp; Tools</label>
                <span className="text-[11px] text-neutral-500 font-mono">Real Brand Icons &bull; Press Enter or comma to add</span>
              </div>

              {/* Live Interactive Badges with Icons */}
              <div className="flex flex-wrap gap-2 p-2.5 rounded-xl bg-black/40 border border-white/[0.08] min-h-[46px] items-center">
                {(() => {
                  const skills = Array.isArray(editingExperience.skills)
                    ? editingExperience.skills
                    : String(editingExperience.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean);

                  if (skills.length === 0) {
                    return (
                      <span className="text-xs text-neutral-600 font-mono italic">
                        No technologies added yet. Type below to add with brand icons.
                      </span>
                    );
                  }

                  return skills.map((skill: string, sIdx: number) => (
                    <div key={sIdx} className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <TechBadge name={skill} size="sm" />
                      <button
                        type="button"
                        onClick={() => removeSkillFromExperience(sIdx)}
                        className="text-neutral-400 hover:text-rose-400 p-0.5 cursor-pointer transition-colors"
                        title={`Remove ${skill}`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ));
                })()}
              </div>

              {/* Input for adding new technologies with live autocomplete */}
              <TechAutocompleteInput
                onAddTech={(tech) => addSkillToExperience(tech)}
                placeholder="Type tech name (e.g. Next.js, PostgreSQL, Docker)..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setEditingExperience(null)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isPending && <Loader2 size={13} className="animate-spin" />}
                <span>Save Experience</span>
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Edit / Add Education Modal */}
      <AdminModal
        isOpen={!!editingEdu}
        onClose={() => setEditingEdu(null)}
        title={editingEdu?._index !== undefined ? 'Edit Credential' : 'Add Credential'}
        subtitle="Academic certifications and institution milestones"
        maxWidth="max-w-xl"
      >
        {editingEdu && (
          <form onSubmit={handleSaveEdu} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-neutral-400">Degree / Certificate *</label>
              <input
                type="text"
                required
                value={editingEdu.degree || ''}
                onChange={(e) => setEditingEdu({ ...editingEdu, degree: e.target.value })}
                placeholder="e.g. B.Sc. in Computer Science & Engineering"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-neutral-400">Institution *</label>
                <input
                  type="text"
                  required
                  value={editingEdu.institution || ''}
                  onChange={(e) => setEditingEdu({ ...editingEdu, institution: e.target.value })}
                  placeholder="e.g. State University of Bangladesh"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-neutral-400">Period *</label>
                <input
                  type="text"
                  required
                  value={editingEdu.period || ''}
                  onChange={(e) => setEditingEdu({ ...editingEdu, period: e.target.value })}
                  placeholder="e.g. 2019 — 2023"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-neutral-400">Location</label>
                <input
                  type="text"
                  value={editingEdu.location || ''}
                  onChange={(e) => setEditingEdu({ ...editingEdu, location: e.target.value })}
                  placeholder="e.g. Dhaka, Bangladesh"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-neutral-400">Tag / Level</label>
                <input
                  type="text"
                  value={editingEdu.tag || ''}
                  onChange={(e) => setEditingEdu({ ...editingEdu, tag: e.target.value })}
                  placeholder="e.g. Undergraduate Degree"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-neutral-400">Description</label>
              <textarea
                rows={3}
                value={editingEdu.description || ''}
                onChange={(e) => setEditingEdu({ ...editingEdu, description: e.target.value })}
                placeholder="e.g. Focus on Software Engineering, Distributed Systems & Database Architecture..."
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setEditingEdu(null)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isPending && <Loader2 size={13} className="animate-spin" />}
                <span>Save Credential</span>
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Delete Confirmation Modals */}
      <ConfirmModal
        isOpen={deletingExpIdx !== null}
        title="Delete Career Experience"
        message="Are you sure you want to remove this career milestone? This change will reflect immediately in the database."
        confirmText="Delete Experience"
        isDestructive={true}
        isLoading={isPending}
        onConfirm={confirmDeleteExp}
        onCancel={() => setDeletingExpIdx(null)}
      />

      <ConfirmModal
        isOpen={deletingEduIdx !== null}
        title="Delete Education Credential"
        message="Are you sure you want to delete this educational milestone?"
        confirmText="Delete Credential"
        isDestructive={true}
        isLoading={isPending}
        onConfirm={confirmDeleteEdu}
        onCancel={() => setDeletingEduIdx(null)}
      />

      {/* Edit / Add Carousel Slide Modal */}
      <AdminModal
        isOpen={!!editingCarouselItem}
        onClose={() => setEditingCarouselItem(null)}
        title={editingCarouselItem?._index !== undefined ? 'Edit Carousel Slide' : 'Add Carousel Slide'}
        subtitle="Hero 3D stacked image slide card"
        maxWidth="max-w-lg"
      >
        {editingCarouselItem && (
          <form onSubmit={handleSaveCarouselItem} className="space-y-4">
            {/* Image Preview & Upload Row */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="relative size-20 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                {editingCarouselItem.image ? (
                  <Image
                    src={editingCarouselItem.image}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">
                    <ImageIcon size={20} />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={carouselFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCarouselFileUpload}
                  />
                  <button
                    type="button"
                    disabled={uploadingCarouselImage}
                    onClick={() => carouselFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {uploadingCarouselImage ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={13} />
                        <span>Upload File</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCarouselCropOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-mono inline-flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
                  >
                    <ImageIcon size={13} />
                    <span>Crop &amp; Upload</span>
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400 font-mono">
                  Direct Cloudinary upload &bull; Auto-saves URL to database
                </p>
              </div>
            </div>

            {editingCarouselItem.image ? (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-neutral-400">
                <Check size={13} className="text-emerald-400 shrink-0" />
                <span className="truncate flex-1">{editingCarouselItem.image}</span>
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-neutral-400">Slide Title *</label>
                <input
                  type="text"
                  required
                  value={editingCarouselItem.title || ''}
                  onChange={(e) => setEditingCarouselItem({ ...editingCarouselItem, title: e.target.value })}
                  placeholder="e.g. Creative Engineering"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-neutral-400">Subtitle (Optional)</label>
                <input
                  type="text"
                  value={editingCarouselItem.subtitle || ''}
                  onChange={(e) => setEditingCarouselItem({ ...editingCarouselItem, subtitle: e.target.value })}
                  placeholder="e.g. Full-Stack Developer & Builder"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-neutral-400">Alt Text</label>
              <input
                type="text"
                value={editingCarouselItem.alt || ''}
                onChange={(e) => setEditingCarouselItem({ ...editingCarouselItem, alt: e.target.value })}
                placeholder="Image description"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setEditingCarouselItem(null)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isPending && <Loader2 size={13} className="animate-spin" />}
                <span>Save Slide</span>
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Carousel Crop Modal */}
      <ImageCropModal
        isOpen={carouselCropOpen}
        onClose={() => setCarouselCropOpen(false)}
        title="Upload & Crop Slide Image"
        subtitle="Crop your slide image and upload directly to Cloudinary."
        onSuccess={(newUrl) => {
          setEditingCarouselItem((prev: any) => ({ ...prev, image: newUrl }));
          setCarouselCropOpen(false);
          showToast('Image uploaded to Cloudinary successfully!', 'success');
        }}
      />

      {/* Delete Carousel Item Modal */}
      <ConfirmModal
        isOpen={deletingCarouselIdx !== null}
        title="Delete Carousel Slide"
        message="Are you sure you want to remove this 3D carousel slide?"
        confirmText="Delete Slide"
        isDestructive={true}
        isLoading={isPending}
        onConfirm={confirmDeleteCarouselItem}
        onCancel={() => setDeletingCarouselIdx(null)}
      />

    </div>
  );
}
