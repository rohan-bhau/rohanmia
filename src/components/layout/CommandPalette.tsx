'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Home, 
  Briefcase, 
  User, 
  Layers, 
  BookOpen, 
  Mail, 
  Phone, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  ArrowUpRight, 
  X, 
  MessageSquare, 
  MessageCircle, 
  Send, 
  Award, 
  Laptop, 
  Quote, 
  Link as LinkIcon,
  Loader2,
  Check
} from 'lucide-react';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { sendMessage } from '@/actions/contact';
import { ALL_PROJECTS } from '@/data/projects';
import { toast } from 'sonner';

type PaletteView = 'search' | 'reachout' | 'contact';

interface PageItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  isAction?: boolean;
  action?: () => void;
  desc?: string;
}

const CLOUDINARY_PROFILE_IMAGE = "https://res.cloudinary.com/dzni0yyle/image/upload/v1778155735/portfolio_cms/fcprc2kqkcmxitdibzcn.png";

export default function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PaletteView>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Alternating icon state for Reach Out button (Message vs Phone)
  const [alternateIcon, setAlternateIcon] = useState<'message' | 'call'>('message');

  // Contact / Reach out states
  const [messageDraft, setMessageDraft] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Project Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { accent, setAccent, themes, currentTheme } = useThemeAccent();

  // 1. Listen for CMD+K / CTRL+K and Custom Events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };

    const handleOpenEvent = (e: Event) => {
      const custom = e as CustomEvent<{ view?: PaletteView }>;
      setOpen(true);
      if (custom.detail?.view) {
        setView(custom.detail.view);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleOpenEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleOpenEvent);
    };
  }, [open]);

  // 2. Cycle alternating message/call icon every 1.8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAlternateIcon((prev) => (prev === 'message' ? 'call' : 'message'));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // 3. Strict Scroll Lock: Lock both body & html when open, stop background scrolling completely
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSelectedIndex(0);
      setIsSubmitted(false);
      return;
    }

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Touch event guard for mobile devices
    const preventBackgroundTouch = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-modal-scrollable="true"]')) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', preventBackgroundTouch, { passive: false });

    // Focus input on search view
    if (view === 'search') {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.paddingRight = originalBodyPaddingRight;
      document.removeEventListener('touchmove', preventBackgroundTouch);
    };
  }, [open, view]);

  // Reset selectedIndex on search change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Navigate helper
  const navigateTo = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  // Copy Email handler
  const handleCopyEmail = () => {
    navigator.clipboard.writeText('rohanmia.org@gmail.com');
    toast.success('Direct email copied: rohanmia.org@gmail.com', {
      duration: 2500,
    });
  };

  // Transition from quick message draft to full contact form
  const handleContinueToContact = () => {
    setContactMessage(messageDraft);
    setView('contact');
  };

  // Submit full contact form
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendMessage({
        name: contactName,
        email: contactEmail,
        message: contactSubject ? `[${contactSubject}] ${contactMessage}` : contactMessage,
      });

      if (res?.success) {
        setIsSubmitted(true);
        toast.success('Message sent successfully! Rohan will get back to you shortly.');
        setMessageDraft('');
        setContactMessage('');
        setContactName('');
        setContactEmail('');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch {
      toast.error('Something went wrong. Please email directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pages grid items matching portfolio site structure
  const PAGES: PageItem[] = [
    { name: 'Home', href: '/', icon: Home, desc: 'Portfolio overview & hero' },
    { name: 'About', href: '/about', icon: User, desc: 'Career narrative & principles' },
    { name: 'Work', href: '/projects', icon: Briefcase, desc: 'Selected case studies archive' },
    { name: 'Stack', href: '/tech-stack', icon: Layers, desc: 'Architecture tooling & languages' },
    { name: 'Guestbook', href: '/guestbook', icon: BookOpen, desc: 'Visitor & recruiter notes' },
    { 
      name: 'Book a call', 
      href: '/contact#book-call', 
      icon: Phone, 
      desc: '30 min discovery call'
    },
    { name: 'Links', href: '/links', icon: LinkIcon, desc: 'Social profiles & connect hub' },
    { name: 'Contact', href: '/contact', icon: Mail, desc: 'Direct message & project proposal' },
  ];

  // Search filtering
  const q = searchQuery.trim().toLowerCase();
  const filteredProjects = q
    ? ALL_PROJECTS.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.techStack.some((t) => t.toLowerCase().includes(q))
      )
    : [];

  const filteredPages = q
    ? PAGES.filter((p) => p.name.toLowerCase().includes(q) || p.desc?.toLowerCase().includes(q))
    : [];

  const allFilteredItems = [...filteredProjects, ...filteredPages];

  // Arrow key navigation inside search results
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (allFilteredItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allFilteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allFilteredItems.length) % allFilteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const currentItem = allFilteredItems[selectedIndex];
      if (!currentItem) return;

      if ('slug' in currentItem) {
        navigateTo(`/projects/${currentItem.slug}`);
      } else if (currentItem.isAction && currentItem.action) {
        currentItem.action();
      } else {
        navigateTo(currentItem.href);
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div 
          className="fixed inset-0 z-[100001] flex items-start justify-center pt-16 sm:pt-24 pb-8 px-3 sm:px-4"
          data-lenis-prevent="true"
        >
          {/* Backdrop: clicking outside closes modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container: Calibrated Compact Max-Width (520px) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onWheel={(e) => e.stopPropagation()}
            className="relative w-full max-w-[520px] flex flex-col z-10"
            data-lenis-prevent="true"
          >
            {/* ============================================================== */}
            {/* TOP BAR (Compact, Modern, Zero Theme-Moon per specification)  */}
            {/* ============================================================== */}
            <div className="flex items-center gap-2 mb-2">
              {view === 'search' ? (
                /* Search Input Pill */
                <div 
                  className="flex-1 h-11 rounded-full bg-[#16171b]/90 border border-white/[0.12] hover:border-white/[0.2] px-3.5 flex items-center gap-2.5 backdrop-blur-xl transition-all shadow-lg focus-within:ring-2 focus-within:ring-theme/30"
                  style={{
                    borderColor: searchQuery ? `${currentTheme.primary}60` : undefined,
                  }}
                >
                  <Search size={16} className="text-muted-foreground shrink-0" style={{ color: currentTheme.primary }} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Jump to a project or search..."
                    className="w-full bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-muted-foreground hover:text-white p-1"
                    >
                      <X size={13} />
                    </button>
                  )}
                  <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/[0.06] text-muted-foreground border border-white/[0.08]">
                    ESC
                  </kbd>
                </div>
              ) : (
                /* Reach out / Contact Top Navigation Pill */
                <button
                  onClick={() => setView(view === 'contact' ? 'reachout' : 'search')}
                  className="h-11 px-3.5 rounded-full bg-[#16171b]/90 border border-white/[0.12] hover:border-white/[0.25] flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground hover:text-white transition-all shadow-lg group backdrop-blur-xl"
                >
                  <ArrowLeft size={15} className="text-muted-foreground group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
                  <span>{view === 'contact' ? 'Back' : 'Reach out'}</span>
                </button>
              )}

              {/* Action Buttons Row */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* 1. Alternating Message / Phone Icon Button */}
                {view === 'search' ? (
                  <button
                    onClick={() => setView('reachout')}
                    className="w-11 h-11 rounded-full bg-[#16171b]/90 border border-white/[0.12] hover:border-white/[0.25] flex items-center justify-center text-muted-foreground hover:text-white transition-all hover:scale-105 shadow-lg backdrop-blur-xl relative overflow-hidden group"
                    title="Reach out (Message / Call)"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {alternateIcon === 'message' ? (
                        <motion.div
                          key="icon-message"
                          initial={{ opacity: 0, y: 4, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <MessageCircle size={16} className="group-hover:text-theme transition-colors" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="icon-call"
                          initial={{ opacity: 0, y: 4, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Phone size={16} className="group-hover:text-theme transition-colors" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                ) : (
                  <button
                    onClick={() => setView('search')}
                    className="w-11 h-11 rounded-full bg-[#16171b]/90 border border-white/[0.12] hover:border-white/[0.25] flex items-center justify-center text-muted-foreground hover:text-white transition-all hover:scale-105 shadow-lg backdrop-blur-xl"
                    title="Search Pages & Projects"
                  >
                    <Search size={16} />
                  </button>
                )}

                {/* 2. Close Button (Cross) */}
                <button
                  onClick={() => setOpen(false)}
                  className="w-11 h-11 rounded-full bg-[#16171b]/90 border border-white/[0.12] hover:border-white/[0.25] flex items-center justify-center text-muted-foreground hover:text-white transition-all hover:scale-105 shadow-lg backdrop-blur-xl"
                  title="Close (ESC)"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ============================================================== */}
            {/* FIXED-HEIGHT MODAL MAIN CONTENT CONTAINER (Calibrated h-[420px]) */}
            {/* ============================================================== */}
            <div 
              data-modal-scrollable="true"
              data-lenis-prevent="true"
              className="h-[420px] overflow-y-auto overscroll-contain rounded-3xl bg-[#16171b]/95 border border-white/[0.1] backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-4 sm:p-4.5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full"
            >
              <AnimatePresence mode="wait">
                {/* ----------------------------------------------------------- */}
                {/* VIEW 1: SEARCH & PAGES (Reference Screenshot 1) */}
                {/* ----------------------------------------------------------- */}
                {view === 'search' && (
                  <motion.div
                    key="view-search"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-4"
                  >
                    {searchQuery ? (
                      /* Filtered Results View */
                      <div className="space-y-4">
                        {allFilteredItems.length === 0 ? (
                          <div className="py-12 text-center text-xs text-muted-foreground">
                            No matching projects or pages found for &quot;{searchQuery}&quot;.
                          </div>
                        ) : (
                          <>
                            {filteredProjects.length > 0 && (
                              <div>
                                <div className="flex items-center gap-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80">
                                  <span>Projects ({filteredProjects.length})</span>
                                  <div className="h-px bg-white/[0.08] flex-1" />
                                </div>
                                <div className="space-y-1.5">
                                  {filteredProjects.map((p, idx) => {
                                    const isSelected = selectedIndex === idx;
                                    return (
                                      <button
                                        key={p.slug}
                                        onClick={() => navigateTo(`/projects/${p.slug}`)}
                                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                                          isSelected
                                            ? 'bg-white/[0.08] text-white border border-white/[0.12]'
                                            : 'hover:bg-white/[0.04] text-zinc-300'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <div 
                                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border border-white/10"
                                            style={{ backgroundColor: `${currentTheme.primary}20`, color: currentTheme.primary }}
                                          >
                                            <Briefcase size={14} />
                                          </div>
                                          <div>
                                            <div className="font-semibold text-xs sm:text-sm text-white">{p.title}</div>
                                            <div className="text-[11px] text-muted-foreground line-clamp-1">{p.tagline}</div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-muted-foreground border border-white/[0.08]">
                                            {p.category}
                                          </span>
                                          <ArrowRight size={13} className="text-muted-foreground" />
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {filteredPages.length > 0 && (
                              <div>
                                <div className="flex items-center gap-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80">
                                  <span>Pages & Navigation</span>
                                  <div className="h-px bg-white/[0.08] flex-1" />
                                </div>
                                <div className="space-y-1.5">
                                  {filteredPages.map((page, idx) => {
                                    const globalIdx = filteredProjects.length + idx;
                                    const isSelected = selectedIndex === globalIdx;
                                    const Icon = page.icon;
                                    return (
                                      <button
                                        key={page.name}
                                        onClick={() => {
                                          if (page.isAction && page.action) page.action();
                                          else navigateTo(page.href);
                                        }}
                                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                                          isSelected
                                            ? 'bg-white/[0.08] text-white border border-white/[0.12]'
                                            : 'hover:bg-white/[0.04] text-zinc-300'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-muted-foreground shrink-0">
                                            <Icon size={14} />
                                          </div>
                                          <div>
                                            <div className="font-semibold text-xs sm:text-sm text-white">{page.name}</div>
                                            <div className="text-[11px] text-muted-foreground">{page.desc}</div>
                                          </div>
                                        </div>
                                        <ArrowRight size={13} className="text-muted-foreground" />
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      /* Default Categorized View (Exact Screenshot 1) */
                      <>
                        {/* Section: Pages */}
                        <div>
                          <div className="flex items-center gap-2.5 mb-2 text-xs font-medium text-muted-foreground">
                            <span className="shrink-0 font-medium text-zinc-400">Pages</span>
                            <div className="h-px bg-white/[0.08] flex-1" />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {PAGES.map((item) => {
                              const Icon = item.icon;
                              return (
                                <button
                                  key={item.name}
                                  onClick={() => {
                                    if (item.isAction && item.action) item.action();
                                    else navigateTo(item.href);
                                  }}
                                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.06] text-left transition-all group"
                                >
                                  <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-zinc-400 group-hover:text-theme group-hover:border-theme/40 group-hover:bg-theme/10 transition-all shrink-0">
                                    <Icon size={14} />
                                  </div>
                                  <span className="text-xs sm:text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                                    {item.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Section: Connect */}
                        <div>
                          <div className="flex items-center gap-2.5 mt-3 mb-2 text-xs font-medium text-muted-foreground">
                            <span className="shrink-0 font-medium text-zinc-400">Connect</span>
                            <div className="h-px bg-white/[0.08] flex-1" />
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <a
                              href="https://github.com/rohan-bhau"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-zinc-300 hover:text-white transition-all group"
                            >
                              <div className="flex items-center gap-1.5">
                                <FaGithub size={13} className="group-hover:text-theme transition-colors" />
                                <span>GitHub</span>
                              </div>
                              <ArrowUpRight size={11} className="text-muted-foreground group-hover:text-white transition-colors" />
                            </a>

                            <a
                              href="https://www.linkedin.com/in/rohan-mia/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-zinc-300 hover:text-white transition-all group"
                            >
                              <div className="flex items-center gap-1.5">
                                <FaLinkedin size={13} className="group-hover:text-theme transition-colors" />
                                <span>LinkedIn</span>
                              </div>
                              <ArrowUpRight size={11} className="text-muted-foreground group-hover:text-white transition-colors" />
                            </a>

                            <a
                              href="https://x.com/_Rohan_Bhau"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-zinc-300 hover:text-white transition-all group"
                            >
                              <div className="flex items-center gap-1.5">
                                <FaXTwitter size={12} className="group-hover:text-theme transition-colors" />
                                <span>X (Twitter)</span>
                              </div>
                              <ArrowUpRight size={11} className="text-muted-foreground group-hover:text-white transition-colors" />
                            </a>
                          </div>
                        </div>

                        {/* Section: Theme Accent Selection */}
                        <div>
                          <div className="flex items-center gap-2.5 mt-3 mb-2 text-xs font-medium text-muted-foreground">
                            <span className="shrink-0 font-medium text-zinc-400">Accent Color</span>
                            <div className="h-px bg-white/[0.08] flex-1" />
                          </div>

                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                            {themes.map((t) => {
                              const isActive = accent === t.id;
                              return (
                                <button
                                  key={t.id}
                                  onClick={() => {
                                    setAccent(t.id);
                                    toast.success(`Theme switched to ${t.name}`, {
                                      duration: 1200,
                                    });
                                  }}
                                  className={`flex items-center gap-1.5 p-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                                    isActive
                                      ? 'bg-white/[0.08] border-white/20 text-white'
                                      : 'bg-white/[0.02] border-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                                  }`}
                                >
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{
                                      backgroundColor: t.primary,
                                      boxShadow: isActive ? `0 0 8px ${t.glow}` : undefined,
                                    }}
                                  />
                                  <span className="truncate">{t.name.split(' ')[0]}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* ----------------------------------------------------------- */}
                {/* VIEW 2: REACH OUT (Matches Reference Screenshot 2) */}
                {/* ----------------------------------------------------------- */}
                {view === 'reachout' && (
                  <motion.div
                    key="view-reachout"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3"
                  >
                    {/* Top Card: Send Rohan a message */}
                    <div className="border border-white/[0.08] rounded-2xl p-3.5 bg-white/[0.02] flex flex-col gap-2.5">
                      {/* Avatar & Header */}
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 shrink-0">
                          <Image
                            src={CLOUDINARY_PROFILE_IMAGE}
                            alt="MD Rohan Mia"
                            fill
                            className="object-cover object-top"
                            sizes="32px"
                          />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-white">Send Rohan a message</div>
                          <div className="text-[10px] text-muted-foreground">I read every one</div>
                        </div>
                      </div>

                      {/* Text Input Draft */}
                      <textarea
                        value={messageDraft}
                        onChange={(e) => setMessageDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleContinueToContact();
                          }
                        }}
                        placeholder="Hey Rohan, I have a project idea..."
                        rows={2}
                        className="w-full bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none scrollbar-none"
                        autoFocus
                      />

                      {/* Card Footer Hints & Continue Button */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.06]">
                        <span className="text-[10px] text-muted-foreground/70 font-mono">
                          <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">↵</kbd> to continue · <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">⇧↵</kbd> new line
                        </span>

                        <button
                          onClick={handleContinueToContact}
                          className="px-3 py-1 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-theme/40 text-white flex items-center gap-1.5 transition-all group"
                        >
                          <span>Continue</span>
                          <ArrowRight size={12} className="text-muted-foreground group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>

                    {/* Middle Row: Two Cards Side-by-Side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Left: Book a call */}
                      <button
                        onClick={() => navigateTo('/contact#book-call')}
                        className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-theme/40 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                      >
                        {/* Overlapping Avatars: Rohan (Hero image) + You */}
                        <div className="flex items-center justify-center mb-2">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 shrink-0 z-10">
                            <Image
                              src={CLOUDINARY_PROFILE_IMAGE}
                              alt="Rohan"
                              fill
                              className="object-cover object-top"
                              sizes="32px"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-mono mx-1">+</span>
                          <div className="w-8 h-8 rounded-full bg-white/[0.1] border border-white/20 flex items-center justify-center text-[10px] font-semibold text-white">
                            You
                          </div>
                        </div>

                        <div className="font-semibold text-xs sm:text-sm text-white group-hover:text-theme transition-colors">
                          Book a call
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          30 min · no strings
                        </div>
                      </button>

                      {/* Right: Email me */}
                      <button
                        onClick={handleCopyEmail}
                        className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-theme/40 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-muted-foreground group-hover:text-theme group-hover:bg-theme/10 group-hover:border-theme/30 transition-all mb-2">
                          <Mail size={16} />
                        </div>

                        <div className="font-semibold text-xs sm:text-sm text-white group-hover:text-theme transition-colors">
                          Email me
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          rohanmia.org@gmail.com
                        </div>
                      </button>
                    </div>

                    {/* Bottom Row: Social Links */}
                    <div className="grid grid-cols-3 gap-2">
                      <a
                        href="https://www.linkedin.com/in/rohan-mia/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-zinc-300 hover:text-white transition-all group"
                      >
                        <FaLinkedin size={13} className="group-hover:text-theme transition-colors" />
                        <span>LinkedIn</span>
                      </a>

                      <a
                        href="https://x.com/_Rohan_Bhau"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-zinc-300 hover:text-white transition-all group"
                      >
                        <FaXTwitter size={12} className="group-hover:text-theme transition-colors" />
                        <span>X / Twitter</span>
                      </a>

                      <a
                        href="https://github.com/rohan-bhau"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-zinc-300 hover:text-white transition-all group"
                      >
                        <FaGithub size={13} className="group-hover:text-theme transition-colors" />
                        <span>GitHub</span>
                      </a>
                    </div>
                  </motion.div>
                )}

                {/* ----------------------------------------------------------- */}
                {/* VIEW 3: FULL CONTACT FORM (Step 2 of Reach Out Message) */}
                {/* ----------------------------------------------------------- */}
                {view === 'contact' && (
                  <motion.div
                    key="view-contact"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3"
                  >
                    {isSubmitted ? (
                      /* Success Celebration State */
                      <div className="py-8 text-center space-y-3">
                        <div 
                          className="w-12 h-12 rounded-full mx-auto flex items-center justify-center border shadow-lg"
                          style={{
                            backgroundColor: `${currentTheme.primary}20`,
                            borderColor: `${currentTheme.primary}40`,
                            color: currentTheme.primary,
                          }}
                        >
                          <Check size={24} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">Message Dispatched!</h3>
                          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                            Thank you for reaching out. Rohan will reply to your email within 24 hours.
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <button
                            onClick={() => {
                              setIsSubmitted(false);
                              setView('search');
                              setOpen(false);
                            }}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10 transition-all"
                          >
                            Done & Close
                          </button>
                          <button
                            onClick={() => {
                              setIsSubmitted(false);
                              setView('reachout');
                            }}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-white transition-colors"
                          >
                            Send another
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Contact Form */
                      <form onSubmit={handleContactSubmit} className="space-y-2.5">
                        <div className="border-b border-white/[0.08] pb-1.5">
                          <div className="text-xs sm:text-sm font-semibold text-white">Direct Project Proposal</div>
                          <div className="text-[10px] text-muted-foreground">
                            Fill in your details below. Your draft has been autofilled.
                          </div>
                        </div>

                        {/* Name & Email inputs in 2 columns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-mono text-muted-foreground mb-0.5">
                              Your Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              placeholder="Alex Mercer"
                              className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-theme/60 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-muted-foreground mb-0.5">
                              Your Email *
                            </label>
                            <input
                              type="email"
                              required
                              value={contactEmail}
                              onChange={(e) => setContactEmail(e.target.value)}
                              placeholder="alex@company.com"
                              className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-theme/60 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all"
                            />
                          </div>
                        </div>

                        {/* Subject / Topic */}
                        <div>
                          <label className="block text-[10px] font-mono text-muted-foreground mb-0.5">
                            Topic / Purpose
                          </label>
                          <input
                            type="text"
                            value={contactSubject}
                            onChange={(e) => setContactSubject(e.target.value)}
                            placeholder="e.g. Next.js SaaS MVP, Full-Time Senior Role"
                            className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-theme/60 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all"
                          />
                        </div>

                        {/* Message (Autofilled with messageDraft) */}
                        <div>
                          <label className="block text-[10px] font-mono text-muted-foreground mb-0.5">
                            Message *
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                            placeholder="Tell me about your timeline, tech stack, and goals..."
                            className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-theme/60 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all resize-none"
                          />
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => setView('reachout')}
                            className="text-[11px] text-muted-foreground hover:text-white transition-colors"
                          >
                            ← Edit draft
                          </button>

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            style={{
                              backgroundColor: currentTheme.primary,
                              boxShadow: `0 0 16px ${currentTheme.glow}`,
                            }}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Sending...</span>
                              </>
                            ) : (
                              <>
                                <span>Send Message</span>
                                <Send size={12} />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
