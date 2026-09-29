'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Filter, 
  Sparkles, 
  Briefcase, 
  Code2, 
  Rocket, 
  User, 
  Heart, 
  Calendar, 
  ArrowUpRight 
} from 'lucide-react';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { useBooking } from '@/components/booking/BookingContext';
import { INITIAL_GUESTBOOK_ENTRIES, GuestbookEntry } from '@/data/guestbook';

const BADGE_CONFIG = {
  Recruiter: {
    label: 'Recruiter / Talent',
    icon: Briefcase,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
  },
  Founder: {
    label: 'Founder / Executive',
    icon: Rocket,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  },
  Engineer: {
    label: 'Software Engineer',
    icon: Code2,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
  },
  Visitor: {
    label: 'Fellow Builder / Visitor',
    icon: User,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  }
};

const STORAGE_KEY = 'rohan_guestbook_signatures';
const LIKES_KEY = 'rohan_guestbook_likes';

export default function GuestbookPage() {
  const { currentTheme } = useThemeAccent();
  const { openBooking } = useBooking();

  const [entries, setEntries] = useState<GuestbookEntry[]>(INITIAL_GUESTBOOK_ENTRIES);
  const [filter, setFilter] = useState<'All' | 'Recruiter' | 'Founder' | 'Engineer' | 'Visitor'>('All');
  const [likes, setLikes] = useState<Record<string, number>>({});

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [badge, setBadge] = useState<GuestbookEntry['badge']>('Visitor');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Hydrate custom entries and likes from localStorage
  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem(STORAGE_KEY);
      if (savedEntries) {
        const parsed = JSON.parse(savedEntries);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEntries([...parsed, ...INITIAL_GUESTBOOK_ENTRIES]);
        }
      }

      const savedLikes = localStorage.getItem(LIKES_KEY);
      if (savedLikes) {
        setLikes(JSON.parse(savedLikes));
      }
    } catch (e) {
      console.warn('LocalStorage hydration note:', e);
    }
  }, []);

  const handleLike = (id: string) => {
    setLikes((prev) => {
      const updated = { ...prev, [id]: (prev[id] || 0) + 1 };
      try {
        localStorage.setItem(LIKES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setErrorMsg('Please enter your name and a brief note.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const newEntry: GuestbookEntry = {
      id: `local-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Software Enthusiast',
      badge,
      message: message.trim(),
      createdAt: 'Just now',
      verified: true
    };

    setTimeout(() => {
      setEntries((prev) => [newEntry, ...prev]);
      try {
        const existing = localStorage.getItem(STORAGE_KEY);
        const currentCustom = existing ? JSON.parse(existing) : [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify([newEntry, ...currentCustom]));
      } catch {}

      setName('');
      setRole('');
      setMessage('');
      setIsSubmitting(false);
      setSubmitSuccess(true);

      setTimeout(() => setSubmitSuccess(false), 4000);
    }, 400);
  };

  const filteredEntries = filter === 'All' 
    ? entries 
    : entries.filter((item) => item.badge === filter);

  return (
    <div className="min-h-screen bg-[#07090e] text-neutral-200 selection:bg-cyan-500/20 selection:text-cyan-300 pt-28 pb-24">
      {/* Background radial glow */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none opacity-20 blur-[130px] rounded-full"
        style={{ background: currentTheme.primary }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-3">
            <span 
              className="inline-block w-2 h-2 rounded-full animate-pulse"
              style={{ background: currentTheme.primary }}
            />
            <span 
              className="text-xs font-mono uppercase tracking-[0.25em]"
              style={{ color: currentTheme.primary }}
            >
              COMMUNITY // LEDGER & VISITOR LOG
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-white mb-4">
            Sign the Ledger
          </h1>
          <p className="text-neutral-400 text-base sm:text-lg max-w-2xl leading-relaxed">
            Notes, feedback, and endorsements from engineering leaders, recruiters, founders, and fellow creators who stopped by. Leave your footprint below!
          </p>
        </div>

        {/* Layout: Signature Card + Ledger Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Form (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-[#0c1017]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden group">
              <div 
                className="absolute top-0 right-0 w-32 h-32 blur-2xl opacity-15 pointer-events-none rounded-full"
                style={{ background: currentTheme.primary }}
              />

              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-white/5">
                <MessageSquare className="w-5 h-5 text-neutral-400" />
                <h2 className="text-lg font-medium text-white">Leave a Note</h2>
              </div>

              {submitSuccess ? (
                <div className="py-10 text-center animate-fade-in">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border"
                    style={{ borderColor: currentTheme.primary, background: `${currentTheme.primary}15` }}
                  >
                    <CheckCircle2 className="w-6 h-6" style={{ color: currentTheme.primary }} />
                  </div>
                  <h3 className="text-white font-medium text-lg mb-1">Signature Recorded!</h3>
                  <p className="text-neutral-400 text-sm max-w-xs mx-auto">
                    Your message has been inscribed into the ledger. Thanks for stopping by!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
                      {errorMsg}
                    </div>
                  )}

                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                      Your Name *
                    </label>
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      required
                      className="w-full bg-[#07090e] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  {/* Role / Org Input */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                      Title / Affiliation
                    </label>
                    <input 
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Engineering Lead @ Stripe"
                      className="w-full bg-[#07090e] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  {/* Badge Category Select */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                      I am a...
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(BADGE_CONFIG) as Array<keyof typeof BADGE_CONFIG>).map((key) => {
                        const isSelected = badge === key;
                        const Icon = BADGE_CONFIG[key].icon;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setBadge(key)}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition-all ${
                              isSelected
                                ? 'bg-white/10 border-white/30 text-white'
                                : 'bg-[#07090e]/60 border-white/5 text-neutral-400 hover:border-white/15'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{key}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                      Message / Feedback *
                    </label>
                    <textarea 
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share a thought, note on the projects, or general greeting..."
                      required
                      className="w-full bg-[#07090e] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/10 cursor-pointer disabled:opacity-50 text-black mt-2"
                    style={{ background: currentTheme.primary }}
                  >
                    {isSubmitting ? (
                      <span>Inscribing note...</span>
                    ) : (
                      <>
                        <span>Sign Guestbook</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Direct Booking Reminder */}
              <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
                <span>Want to talk work?</span>
                <button
                  type="button"
                  onClick={openBooking}
                  className="font-medium hover:underline flex items-center gap-1 transition-colors"
                  style={{ color: currentTheme.primary }}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book 30-min Call</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Ledger Stream (7 Cols) */}
          <div className="lg:col-span-7">
            
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-6 pb-2 border-b border-white/5">
              <span className="text-xs font-mono text-neutral-500 flex items-center gap-1.5 mr-2">
                <Filter className="w-3 h-3" />
                FILTER:
              </span>
              {(['All', 'Recruiter', 'Founder', 'Engineer', 'Visitor'] as const).map((cat) => {
                const count = cat === 'All' ? entries.length : entries.filter(e => e.badge === cat).length;
                const active = filter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      active
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {cat} <span className="opacity-50">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* List of Entries */}
            <div className="space-y-4">
              {filteredEntries.map((entry) => {
                const badgeInfo = BADGE_CONFIG[entry.badge] || BADGE_CONFIG.Visitor;
                const BadgeIcon = badgeInfo.icon;
                const likeCount = likes[entry.id] || 0;

                return (
                  <article
                    key={entry.id}
                    className="p-5 sm:p-6 rounded-2xl bg-[#0c1017]/60 backdrop-blur-md border border-white/5 hover:border-white/10 transition-all duration-300 relative group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        {/* Initial Avatar */}
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm border"
                          style={{
                            borderColor: `${currentTheme.primary}40`,
                            background: `${currentTheme.primary}15`,
                            color: currentTheme.primary
                          }}
                        >
                          {entry.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-medium text-white tracking-tight">
                              {entry.name}
                            </h3>
                            {entry.verified && (
                              <span title="Verified Visitor">
                                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 inline" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-400">
                            {entry.role}
                          </p>
                        </div>
                      </div>

                      {/* Badge Pill */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border ${badgeInfo.color}`}>
                        <BadgeIcon className="w-3 h-3" />
                        <span>{entry.badge}</span>
                      </span>
                    </div>

                    {/* Message Body */}
                    <p className="text-neutral-300 text-sm leading-relaxed pl-13 my-3">
                      &ldquo;{entry.message}&rdquo;
                    </p>

                    {/* Footer / Meta */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-neutral-500 font-mono">
                      <span>{entry.createdAt}</span>

                      {/* Like / Endorse Button */}
                      <button
                        onClick={() => handleLike(entry.id)}
                        className="flex items-center gap-1.5 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer group/like py-1 px-2 rounded-lg hover:bg-white/5"
                        title="Endorse this note"
                      >
                        <Heart className="w-3.5 h-3.5 group-hover/like:fill-red-400 transition-colors" />
                        <span>{likeCount > 0 ? likeCount : 'Appreciate'}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Bottom Invite Box */}
            <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-white font-medium text-sm mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: currentTheme.primary }} />
                  Have a mission-critical project or role?
                </h4>
                <p className="text-xs text-neutral-400 max-w-md">
                  Currently open to Senior Full Stack, Lead Frontend, and Distributed Systems roles globally.
                </p>
              </div>

              <Link
                href="/contact"
                className="px-4 py-2.5 rounded-xl text-xs font-mono font-medium border border-white/15 hover:border-white/30 text-white bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2 flex-shrink-0"
              >
                <span>Get in touch</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
