'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Home, 
  Briefcase, 
  User, 
  Layers, 
  BookOpen, 
  Mail, 
  Calendar, 
  Download, 
  Copy, 
  Check, 
  Palette, 
  ExternalLink,
  Sparkles,
  Command as CmdIcon
} from 'lucide-react';
import { useBooking } from '@/components/booking/BookingContext';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { toast } from 'sonner';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { openBooking } = useBooking();
  const { accent, setAccent, themes, currentTheme } = useThemeAccent();

  // Listen for CMD+K / CTRL+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigateTo = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('rohanmia.org@gmail.com');
    setCopied(true);
    toast.success('Email copied to clipboard: rohanmia.org@gmail.com');
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 800);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100001] flex items-start justify-center pt-24 md:pt-32 px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Dialog Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl rounded-2xl bg-[#0d0f12] border border-white/[0.12] shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden z-10"
            >
              <Command 
                className="w-full flex flex-col font-sans"
                label="Global Command Menu"
              >
                {/* Search Bar Input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-white/[0.02]">
                  <Search size={18} className="text-muted-foreground flex-shrink-0" style={{ color: currentTheme.primary }} />
                  <Command.Input
                    placeholder="Type a command, page, or search..."
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    autoFocus
                  />
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] text-muted-foreground border border-white/[0.08]">
                    ESC
                  </kbd>
                </div>

                {/* Command List */}
                <Command.List className="max-h-[340px] overflow-y-auto p-2 scrollbar-none space-y-4">
                  <Command.Empty className="py-8 text-center text-xs text-muted-foreground">
                    No matching commands or pages found.
                  </Command.Empty>

                  {/* Navigation Group */}
                  <Command.Group heading="Navigation" className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/70 px-2 py-1">
                    <Command.Item
                      onSelect={() => navigateTo('/')}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-white/[0.06] cursor-pointer transition-colors"
                    >
                      <Home size={15} className="text-muted-foreground" />
                      <span>Home / Overview</span>
                    </Command.Item>
                    <Command.Item
                      onSelect={() => navigateTo('/projects')}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-white/[0.06] cursor-pointer transition-colors"
                    >
                      <Briefcase size={15} className="text-muted-foreground" />
                      <span>Engineering Case Studies & Projects</span>
                    </Command.Item>
                    <Command.Item
                      onSelect={() => navigateTo('/about')}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-white/[0.06] cursor-pointer transition-colors"
                    >
                      <User size={15} className="text-muted-foreground" />
                      <span>About Rohan / Engineering Principles</span>
                    </Command.Item>
                    <Command.Item
                      onSelect={() => navigateTo('/tech-stack')}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-white/[0.06] cursor-pointer transition-colors"
                    >
                      <Layers size={15} className="text-muted-foreground" />
                      <span>Tech Stack & System Architecture Tools</span>
                    </Command.Item>
                    <Command.Item
                      onSelect={() => navigateTo('/guestbook')}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-white/[0.06] cursor-pointer transition-colors"
                    >
                      <BookOpen size={15} className="text-muted-foreground" />
                      <span>Visitor & Recruiter Guestbook</span>
                    </Command.Item>
                    <Command.Item
                      onSelect={() => navigateTo('/contact')}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-white/[0.06] cursor-pointer transition-colors"
                    >
                      <Mail size={15} className="text-muted-foreground" />
                      <span>Contact & Project Inquiry</span>
                    </Command.Item>
                  </Command.Group>

                  {/* Quick Actions Group */}
                  <Command.Group heading="Quick Actions" className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/70 px-2 py-1">
                    <Command.Item
                      onSelect={() => {
                        setOpen(false);
                        openBooking();
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-white/[0.06] cursor-pointer transition-colors"
                    >
                      <Calendar size={15} style={{ color: currentTheme.primary }} />
                      <span className="font-semibold" style={{ color: currentTheme.primary }}>Book a 15-Min Discovery Call (In-Site)</span>
                    </Command.Item>
                    <Command.Item
                      onSelect={handleCopyEmail}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-white/[0.06] cursor-pointer transition-colors"
                    >
                      {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} className="text-muted-foreground" />}
                      <span>Copy Direct Email (rohanmia.org@gmail.com)</span>
                    </Command.Item>
                    <Command.Item
                      onSelect={() => {
                        setOpen(false);
                        window.open('https://github.com/rohan-bhau', '_blank');
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-white/[0.06] cursor-pointer transition-colors"
                    >
                      <ExternalLink size={15} className="text-muted-foreground" />
                      <span>Visit GitHub Profile (@rohan-bhau)</span>
                    </Command.Item>
                  </Command.Group>

                  {/* Theme Switcher Group */}
                  <Command.Group heading="Switch Theme Accent" className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/70 px-2 py-1">
                    {themes.map((t) => (
                      <Command.Item
                        key={t.id}
                        onSelect={() => {
                          setAccent(t.id);
                          toast.success(`Theme switched to ${t.name}`);
                          setOpen(false);
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-white/[0.06] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: t.primary, boxShadow: `0 0 8px ${t.glow}` }}
                          />
                          <span>{t.name}</span>
                        </div>
                        {accent === t.id && <span className="text-[10px] font-mono text-muted-foreground">Active</span>}
                      </Command.Item>
                    ))}
                  </Command.Group>
                </Command.List>

                {/* Footer Guide */}
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.08] bg-white/[0.01] text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 font-mono">
                      <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">↑</kbd>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">↓</kbd> to navigate
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono">
                      <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">↵</kbd> to select
                    </span>
                  </div>
                  <span className="font-mono text-[10px]">Rohan Mia OS</span>
                </div>
              </Command>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
