'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Calendar, 
  Send, 
  MapPin, 
  Globe, 
  CheckCircle2, 
  Clock, 
  Video, 
  ArrowUpRight,
  Sparkles,
  PhoneCall,
  Loader2
} from 'lucide-react';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { toast } from 'sonner';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { useBooking } from '@/components/booking/BookingContext';
import { sendMessage } from '@/actions/contact';

type ContactTab = 'book' | 'message';

export default function ContactPage() {
  const { currentTheme } = useThemeAccent();
  const { openBooking } = useBooking();
  const [activeTab, setActiveTab] = useState<ContactTab>('book');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'Full Stack Web Platform',
    budget: '$3k - $7k',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendMessage({
        name: formData.name,
        email: formData.email,
        message: `[Topic: ${formData.topic}] [Budget: ${formData.budget}] ${formData.message}`
      });

      if (res && res.success) {
        toast.success('Inquiry sent successfully! Rohan will respond within 24 hours.');
        setFormData({
          name: '',
          email: '',
          topic: 'Full Stack Web Platform',
          budget: '$3k - $7k',
          message: ''
        });
      } else {
        toast.error(res?.error || 'Failed to send message. Please try again or book a call.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Please try again or reach out via email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 sm:pt-36 pb-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div 
        aria-hidden="true"
        className="absolute top-1/4 -right-48 w-96 h-96 rounded-full blur-[160px] opacity-15 pointer-events-none"
        style={{ backgroundColor: currentTheme.primary }}
      />
      <div 
        aria-hidden="true"
        className="absolute top-2/3 -left-48 w-96 h-96 rounded-full blur-[160px] opacity-15 pointer-events-none"
        style={{ backgroundColor: currentTheme.primary }}
      />

      <div className="container mx-auto max-w-6xl space-y-12 sm:space-y-16 relative z-10">
        
        {/* =========================================================================
            1. PAGE HEADER
           ========================================================================= */}
        <div className="text-left space-y-3 max-w-3xl">
          <span 
            className="text-xs font-mono uppercase tracking-[0.25em] font-semibold flex items-center gap-2"
            style={{ color: currentTheme.primary }}
          >
            <PhoneCall size={14} />
            Connect // Collaboration Hub
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal text-white tracking-tight leading-[1.12]">
            Let’s architect something{' '}
            <span 
              className="font-serif italic font-normal text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 20%, ${currentTheme.primary} 85%)`
              }}
            >
              extraordinary
            </span>{' '}
            together.
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
            Whether you want to schedule a 30-minute discovery session for an upcoming product or send a direct project proposal, choose your preferred path below.
          </p>
        </div>

        {/* =========================================================================
            2. MAIN 2-COLUMN HUB
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Interactive Dual-Tab Panel (Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Tab Navigation Pill Bar */}
            <div className="inline-flex p-1.5 rounded-2xl bg-[#0c0e14] border border-white/[0.08] shadow-lg">
              <button
                type="button"
                onClick={() => setActiveTab('book')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer ${
                  activeTab === 'book'
                    ? 'text-white font-semibold shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
                style={{
                  backgroundColor: activeTab === 'book' ? currentTheme.primary : 'transparent',
                  boxShadow: activeTab === 'book' ? `0 0 15px ${currentTheme.primary}40` : undefined,
                }}
              >
                <Calendar size={14} />
                <span>Book a Call (30 Min)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('message')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer ${
                  activeTab === 'message'
                    ? 'text-white font-semibold shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
                style={{
                  backgroundColor: activeTab === 'message' ? currentTheme.primary : 'transparent',
                  boxShadow: activeTab === 'message' ? `0 0 15px ${currentTheme.primary}40` : undefined,
                }}
              >
                <Send size={14} />
                <span>Send Message</span>
              </button>
            </div>

            {/* Tab 1: Book a Call Panel */}
            {activeTab === 'book' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="p-6 sm:p-10 rounded-[2rem] bg-[#0c0e14] border border-white/[0.1] shadow-2xl space-y-8"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold" style={{ color: currentTheme.primary }}>
                    <Video size={15} />
                    <span>In-Site Video Consultation // Google Meet</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
                    Schedule a 30-Minute Discovery Call
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                    Zero external redirects. Select an available slot in your local timezone to discuss system architecture, product requirements, technical feasibility, and development timelines directly with Rohan.
                  </p>
                </div>

                {/* Consultation Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Clock size={12} style={{ color: currentTheme.primary }} />
                      Duration
                    </span>
                    <p className="text-sm font-semibold text-white">30 Minutes</p>
                    <p className="text-[11px] text-zinc-400 font-light">Focused technical discovery</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Globe size={12} style={{ color: currentTheme.primary }} />
                      Timezone
                    </span>
                    <p className="text-sm font-semibold text-white">Asia/Dhaka (UTC+6)</p>
                    <p className="text-[11px] text-zinc-400 font-light">Auto-converts to your local time</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Video size={12} style={{ color: currentTheme.primary }} />
                      Format
                    </span>
                    <p className="text-sm font-semibold text-white">Google Meet</p>
                    <p className="text-[11px] text-zinc-400 font-light">Automated invite &amp; calendar sync</p>
                  </div>
                </div>

                {/* Highlights Checklist */}
                <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-medium block">
                    What we will cover:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-2 text-xs text-zinc-300 font-light">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      <span>Architecture roadmap &amp; tech stack choices</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-300 font-light">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      <span>Concurrency &amp; database locking strategy</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-300 font-light">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      <span>Delivery sprint milestones &amp; budget scoping</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-300 font-light">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      <span>Zero sales pitch — 100% technical clarity</span>
                    </div>
                  </div>
                </div>

                {/* Primary Booking Trigger */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={openBooking}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-xs sm:text-sm font-mono font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
                    style={{
                      backgroundColor: currentTheme.primary,
                      boxShadow: `0 0 25px ${currentTheme.primary}45`,
                    }}
                  >
                    <Calendar size={16} />
                    <span>Open Calendar &amp; Pick a Time</span>
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Tab 2: Send Message Panel */}
            {activeTab === 'message' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="p-6 sm:p-10 rounded-[2rem] bg-[#0c0e14] border border-white/[0.1] shadow-2xl space-y-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold" style={{ color: currentTheme.primary }}>
                    <Send size={14} />
                    <span>Direct Proposal &amp; Inquiry Form</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
                    Send a Project Inquiry
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                    Have an RFC, detailed project requirements, or an engineering role description? Fill out the brief below and I will respond within 24 hours.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-zinc-400 block">
                        Your Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Alex Vance"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.09] text-xs sm:text-sm text-white focus:outline-hidden focus:border-white/30 transition-all font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-zinc-400 block">
                        Email Address <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="alex@company.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.09] text-xs sm:text-sm text-white focus:outline-hidden focus:border-white/30 transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-zinc-400 block">
                        Project / Discussion Topic
                      </label>
                      <select
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#12141c] border border-white/[0.09] text-xs sm:text-sm text-white focus:outline-hidden focus:border-white/30 transition-all font-sans"
                      >
                        <option value="Full Stack Web Platform">Full Stack Web Platform</option>
                        <option value="High-Concurrency Booking System">High-Concurrency Booking System</option>
                        <option value="Architecture Consultation">Architecture Consultation</option>
                        <option value="Full-Time / Contract Engineering Role">Full-Time / Contract Role</option>
                        <option value="Other Technical Inquiry">Other Technical Inquiry</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-zinc-400 block">
                        Anticipated Budget Bracket
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#12141c] border border-white/[0.09] text-xs sm:text-sm text-white focus:outline-hidden focus:border-white/30 transition-all font-sans"
                      >
                        <option value="$1k - $3k">$1,000 — $3,000</option>
                        <option value="$3k - $7k">$3,000 — $7,000</option>
                        <option value="$7k - $15k">$7,000 — $15,000</option>
                        <option value="$15k+">$15,000+ (Enterprise / Retainer)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-zinc-400 block">
                      Project Scope &amp; Context <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell me about what you are building, key technical challenges, or what you'd like to achieve..."
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.09] text-xs sm:text-sm text-white focus:outline-hidden focus:border-white/30 transition-all font-sans resize-none leading-relaxed"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs sm:text-sm font-mono font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: currentTheme.primary,
                        boxShadow: `0 0 25px ${currentTheme.primary}45`,
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Sending Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          <span>Submit Proposal</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

          </div>

          {/* Right Column: Direct Contact Info & Live Status Node (Span 4) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Direct Connect Card */}
            <div className="p-6 rounded-[1.75rem] bg-[#0c0e14] border border-white/[0.09] space-y-5 shadow-xl">
              <div className="space-y-1 border-b border-white/[0.08] pb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">Direct Channel</span>
                <h3 className="text-lg font-bold text-white tracking-tight">Contact Information</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-xl flex items-center justify-center border shrink-0" style={{ backgroundColor: `${currentTheme.primary}15`, borderColor: `${currentTheme.primary}30`, color: currentTheme.primary }}>
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 block uppercase tracking-wider">Direct Email</span>
                    <a href="mailto:rohanmia.org@gmail.com" className="text-xs sm:text-sm font-mono text-white hover:underline">
                      rohanmia.org@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-xl flex items-center justify-center border shrink-0" style={{ backgroundColor: `${currentTheme.primary}15`, borderColor: `${currentTheme.primary}30`, color: currentTheme.primary }}>
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 block uppercase tracking-wider">Location</span>
                    <p className="text-xs sm:text-sm text-zinc-200">
                      Dhaka, Bangladesh (UTC+6)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-xl flex items-center justify-center border shrink-0" style={{ backgroundColor: `${currentTheme.primary}15`, borderColor: `${currentTheme.primary}30`, color: currentTheme.primary }}>
                    <Clock size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 block uppercase tracking-wider">Response Window</span>
                    <p className="text-xs sm:text-sm text-zinc-200">
                      Within 12 — 24 hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5">
                <span className="relative flex size-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-mono text-zinc-300">Open for Q1/Q2 Contracts</span>
              </div>
            </div>

            {/* Social Artifacts Card */}
            <div className="p-6 rounded-[1.75rem] bg-[#0c0e14] border border-white/[0.09] space-y-4 shadow-xl">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">Verified Profiles</span>
              <div className="space-y-2">
                <a
                  href="https://github.com/rohan-bhau"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-xs font-mono text-zinc-300 hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <FaGithub size={15} />
                    <span>github.com/rohan-bhau</span>
                  </div>
                  <ArrowUpRight size={13} className="text-zinc-500 group-hover:text-white transition-colors" />
                </a>

                <a
                  href="https://linkedin.com/in/rohan-bhau"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-xs font-mono text-zinc-300 hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <FaLinkedin size={15} />
                    <span>linkedin.com/in/rohan-bhau</span>
                  </div>
                  <ArrowUpRight size={13} className="text-zinc-500 group-hover:text-white transition-colors" />
                </a>

                <a
                  href="https://x.com/rohan_bhau"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-xs font-mono text-zinc-300 hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <FaXTwitter size={15} />
                    <span>x.com/rohan_bhau</span>
                  </div>
                  <ArrowUpRight size={13} className="text-zinc-500 group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
