'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  Globe2, 
  Layers, 
  Code2, 
  Workflow, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import ColorSwitcher from '@/components/theme/ColorSwitcher';
import TechBadge from '@/components/ui/TechBadge';
import { BentoCardsData } from '@/lib/constants/homepage';
import { saveBentoData } from '@/actions/adminBento';
import EditableElement from '@/components/admin/ui/EditableElement';
import { useToast } from '@/components/admin/ui/Toast';

interface BentoGridProps {
  initialData?: BentoCardsData;
  isAdmin?: boolean;
}

const emptyBentoData: BentoCardsData = {
  badge: '',
  title_prefix: '',
  title_suffix: '',
  card1: { tag: '', headline: '', description: '', points: [] },
  card2: { tag: '', project_title: '', description: '', link_url: '', tech_stack: [] },
  card4: { tag: '', title: '', description: '', tools: [] },
  card5: { tag: '', location: '', description: '', timezone: '' },
};

export default function BentoGrid({ initialData, isAdmin = false }: BentoGridProps) {
  const { currentTheme } = useThemeAccent();
  const toastContext = useToast();
  const showToast = toastContext?.showToast || ((_msg: string, _type?: any) => {});

  const [data, setData] = useState<BentoCardsData>(initialData || emptyBentoData);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleSaveNested = async (updater: (prev: BentoCardsData) => BentoCardsData) => {
    const updated = updater(data);
    setData(updated);
    const res = await saveBentoData(updated);
    if (res.success) {
      showToast('Card updated successfully', 'success');
      return { success: true };
    } else {
      showToast(res.error || 'Failed to update', 'error');
      return { success: false, error: res.error };
    }
  };

  return (
    <section className="py-14 px-6">
      <div className="container mx-auto max-w-6xl">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-3">
          <div className="space-y-1.5">
            <EditableElement
              isAdmin={isAdmin}
              label="Overview Badge"
              value={data.badge}
              onSave={(val) => handleSaveNested(prev => ({ ...prev, badge: val }))}
            >
              <span 
                className="text-xs font-mono uppercase tracking-widest font-semibold flex items-center gap-1.5"
                style={{ color: currentTheme.primary }}
              >
                <Sparkles size={13} />
                {data.badge}
              </span>
            </EditableElement>

            <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-foreground">
              <EditableElement
                isAdmin={isAdmin}
                label="Title Prefix"
                value={data.title_prefix}
                onSave={(val) => handleSaveNested(prev => ({ ...prev, title_prefix: val }))}
              >
                <span>{data.title_prefix}</span>
              </EditableElement>{' '}
              
              <EditableElement
                isAdmin={isAdmin}
                label="Title Suffix (Italic)"
                value={data.title_suffix}
                onSave={(val) => handleSaveNested(prev => ({ ...prev, title_suffix: val }))}
              >
                <span 
                  className="font-serif italic font-normal text-transparent bg-clip-text" 
                  style={{ backgroundImage: `linear-gradient(135deg, #ffffff, ${currentTheme.primary})` }}
                >
                  {data.title_suffix}
                </span>
              </EditableElement>
            </h2>
          </div>
        </div>

        {/* Bento Grid (12 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Bento Card 1: What I Build (Span 7) */}
          <div className="md:col-span-7 p-7 rounded-3xl bg-[#0d0f12] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-300">
            {/* Ambient Accent Glow */}
            <div 
              className="absolute -top-20 -left-20 w-52 h-52 rounded-full blur-[100px] opacity-15 pointer-events-none transition-all duration-700"
              style={{ backgroundColor: currentTheme.primary }}
            />

            <div className="space-y-3 relative z-10">
              <EditableElement
                isAdmin={isAdmin}
                label="Card 1 Tag"
                value={data.card1.tag}
                onSave={(val) => handleSaveNested(prev => ({ ...prev, card1: { ...prev.card1, tag: val } }))}
              >
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Code2 size={14} style={{ color: currentTheme.primary }} />
                  {data.card1.tag}
                </span>
              </EditableElement>

              <EditableElement
                isAdmin={isAdmin}
                label="Card 1 Headline"
                value={data.card1.headline}
                onSave={(val) => handleSaveNested(prev => ({ ...prev, card1: { ...prev.card1, headline: val } }))}
              >
                <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                  {data.card1.headline}
                </h3>
              </EditableElement>

              <EditableElement
                isAdmin={isAdmin}
                label="Card 1 Description"
                value={data.card1.description}
                type="textarea"
                onSave={(val) => handleSaveNested(prev => ({ ...prev, card1: { ...prev.card1, description: val } }))}
              >
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {data.card1.description}
                </p>
              </EditableElement>
            </div>

            {/* Practical Capabilities Points */}
            <div className="pt-6 mt-6 border-t border-white/[0.06] relative z-10 text-xs">
              <EditableElement
                isAdmin={isAdmin}
                label="Card 1 Bullet Points"
                value={data.card1.points.join(', ')}
                type="tags"
                onSave={(val) => {
                  const points = val.split(',').map(s => s.trim()).filter(Boolean);
                  return handleSaveNested(prev => ({ ...prev, card1: { ...prev.card1, points } }));
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {data.card1.points.map((pt: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 size={14} style={{ color: currentTheme.primary }} className="flex-shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </EditableElement>
            </div>
          </div>

          {/* Bento Card 2: Featured Project (Span 5) */}
          <div className="md:col-span-5 p-7 rounded-3xl bg-[#0d0f12] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-300">
            <div 
              className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none transition-all duration-700"
              style={{ backgroundColor: currentTheme.primary }}
            />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <EditableElement
                  isAdmin={isAdmin}
                  label="Card 2 Tag"
                  value={data.card2.tag}
                  onSave={(val) => handleSaveNested(prev => ({ ...prev, card2: { ...prev.card2, tag: val } }))}
                >
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Workflow size={14} style={{ color: currentTheme.primary }} />
                    {data.card2.tag}
                  </span>
                </EditableElement>

                <Link
                  href={data.card2.link_url || '/projects'}
                  className="p-1 rounded-full bg-white/[0.05] border border-white/10 text-muted-foreground group-hover:text-foreground transition-colors"
                >
                  <ArrowUpRight size={13} />
                </Link>
              </div>

              <div className="space-y-1">
                <EditableElement
                  isAdmin={isAdmin}
                  label="Featured Project Title"
                  value={data.card2.project_title}
                  onSave={(val) => handleSaveNested(prev => ({ ...prev, card2: { ...prev.card2, project_title: val } }))}
                >
                  <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {data.card2.project_title}
                  </h4>
                </EditableElement>

                <EditableElement
                  isAdmin={isAdmin}
                  label="Featured Project Description"
                  value={data.card2.description}
                  type="textarea"
                  onSave={(val) => handleSaveNested(prev => ({ ...prev, card2: { ...prev.card2, description: val } }))}
                >
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {data.card2.description}
                  </p>
                </EditableElement>
              </div>
            </div>

            {/* Tech badges */}
            <div className="pt-5 relative z-10">
              <EditableElement
                isAdmin={isAdmin}
                label="Card 2 Tech Badges"
                value={data.card2.tech_stack.join(', ')}
                type="tags"
                onSave={(val) => {
                  const tech_stack = val.split(',').map(s => s.trim()).filter(Boolean);
                  return handleSaveNested(prev => ({ ...prev, card2: { ...prev.card2, tech_stack } }));
                }}
              >
                <div className="flex flex-wrap gap-1.5">
                  {data.card2.tech_stack.map((tech: string) => (
                    <TechBadge key={tech} name={tech} />
                  ))}
                </div>
              </EditableElement>
            </div>
          </div>

          {/* Bento Card 3: Theme Customizer (Span 5) */}
          <div className="md:col-span-5">
            <ColorSwitcher variant="bento" className="h-full" />
          </div>

          {/* Bento Card 4: Tech Stack (Span 4) */}
          <div className="md:col-span-4 p-7 rounded-3xl bg-[#0d0f12] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <EditableElement
                  isAdmin={isAdmin}
                  label="Card 4 Tag"
                  value={data.card4.tag}
                  onSave={(val) => handleSaveNested(prev => ({ ...prev, card4: { ...prev.card4, tag: val } }))}
                >
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Layers size={14} style={{ color: currentTheme.primary }} />
                    {data.card4.tag}
                  </span>
                </EditableElement>

                <Link
                  href="/tech-stack"
                  className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground flex items-center gap-0.5"
                >
                  View All <ArrowUpRight size={11} />
                </Link>
              </div>

              <div className="space-y-1">
                <EditableElement
                  isAdmin={isAdmin}
                  label="Card 4 Title"
                  value={data.card4.title}
                  onSave={(val) => handleSaveNested(prev => ({ ...prev, card4: { ...prev.card4, title: val } }))}
                >
                  <h4 className="text-base font-bold text-foreground">
                    {data.card4.title}
                  </h4>
                </EditableElement>

                <EditableElement
                  isAdmin={isAdmin}
                  label="Card 4 Description"
                  value={data.card4.description}
                  onSave={(val) => handleSaveNested(prev => ({ ...prev, card4: { ...prev.card4, description: val } }))}
                >
                  <p className="text-xs text-muted-foreground">
                    {data.card4.description}
                  </p>
                </EditableElement>
              </div>

              {/* Stack Pills */}
              <div className="pt-1">
                <EditableElement
                  isAdmin={isAdmin}
                  label="Card 4 Tools List"
                  value={data.card4.tools.join(', ')}
                  type="tags"
                  onSave={(val) => {
                    const tools = val.split(',').map(s => s.trim()).filter(Boolean);
                    return handleSaveNested(prev => ({ ...prev, card4: { ...prev.card4, tools } }));
                  }}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {data.card4.tools.map((tool: string) => (
                      <TechBadge key={tool} name={tool} />
                    ))}
                  </div>
                </EditableElement>
              </div>
            </div>

            <Link
              href="/tech-stack"
              className="pt-4 text-[11px] font-mono text-muted-foreground/70 group-hover:text-primary transition-colors flex items-center gap-1"
            >
              <span>Explore tech stack page</span>
              <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* Bento Card 5: Location & Collaboration (Span 3) */}
          <div className="md:col-span-3 p-7 rounded-3xl bg-[#0d0f12] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <EditableElement
                  isAdmin={isAdmin}
                  label="Card 5 Tag"
                  value={data.card5.tag}
                  onSave={(val) => handleSaveNested(prev => ({ ...prev, card5: { ...prev.card5, tag: val } }))}
                >
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Globe2 size={14} style={{ color: currentTheme.primary }} />
                    {data.card5.tag}
                  </span>
                </EditableElement>

                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="space-y-1">
                <EditableElement
                  isAdmin={isAdmin}
                  label="Location"
                  value={data.card5.location}
                  onSave={(val) => handleSaveNested(prev => ({ ...prev, card5: { ...prev.card5, location: val } }))}
                >
                  <h4 className="text-base font-bold text-foreground">
                    {data.card5.location}
                  </h4>
                </EditableElement>

                <EditableElement
                  isAdmin={isAdmin}
                  label="Location Description"
                  value={data.card5.description}
                  type="textarea"
                  onSave={(val) => handleSaveNested(prev => ({ ...prev, card5: { ...prev.card5, description: val } }))}
                >
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {data.card5.description}
                  </p>
                </EditableElement>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06]">
              <EditableElement
                isAdmin={isAdmin}
                label="Timezone & Availability"
                value={data.card5.timezone}
                onSave={(val) => handleSaveNested(prev => ({ ...prev, card5: { ...prev.card5, timezone: val } }))}
              >
                <span className="text-[11px] font-mono text-muted-foreground">
                  Timezone: {data.card5.timezone}
                </span>
              </EditableElement>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
