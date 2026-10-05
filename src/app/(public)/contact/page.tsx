'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Send, 
  Mail,
  Loader2
} from 'lucide-react';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { toast } from 'sonner';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { sendMessage } from '@/actions/contact';
import CalendlyBooking from '@/components/booking/CalendlyBooking';

type ContactTab = 'book' | 'message';

export default function ContactPage() {
  const { currentTheme } = useThemeAccent();
  const [activeTab, setActiveTab] = useState<ContactTab>('book');

  // Sync URL query params or hash with tab selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      const hash = window.location.hash;
      if (search.includes('send-message') || search.includes('tab=message') || hash === '#message') {
        setActiveTab('message');
      } else if (search.includes('book-call') || search.includes('tab=book') || hash === '#meeting' || hash === '#book') {
        setActiveTab('book');
        setTimeout(() => {
          const el = document.getElementById('meeting');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      }
    }
  }, []);

  const handleTabChange = (tab: ContactTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = tab === 'book' ? '/contact#meeting' : '/contact?tab=message';
      window.history.replaceState(null, '', url);
    }
  };

  // Form State for Send Message
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'Freelance Project',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        topic: formData.topic.trim() || 'General Inquiry',
        message: formData.message.trim()
      });

      if (res && res.success) {
        toast.success('Message sent successfully! Rohan will respond shortly.');
        setFormData({
          name: '',
          email: '',
          topic: 'Freelance Project',
          message: ''
        });
      } else {
        toast.error(res?.error || 'Failed to send message. Please try again or book a call.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 sm:pt-36 pb-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Glows */}
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

      <div className="container mx-auto max-w-5xl space-y-8 sm:space-y-10 relative z-10">
        
        {/* =========================================================================
            1. PAGE HEADER (Clean, minimalist typography)
           ========================================================================= */}
        <div className="text-center space-y-2.5 max-w-3xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">
            Contact
          </p>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white tracking-tight leading-[1.15]">
            Project, Role or{' '}
            <span 
              className="font-serif italic font-normal text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 20%, ${currentTheme.primary} 85%)`
              }}
            >
              Just a Hey?
            </span>
          </h1>
        </div>

        {/* =========================================================================
            2. TOP ACTION & SOCIAL PILL BAR (Matches Screenshot)
           ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Dual Tab Switcher */}
          <div className="inline-flex p-1.5 rounded-2xl bg-[#0e1015] border border-white/[0.08] shadow-xl">
            <button
              type="button"
              onClick={() => handleTabChange('book')}
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
              <span>Book a Call</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('message')}
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

          {/* Social Quick-Access Icons (Right of tabs in screenshot) */}
          <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-[#0e1015] border border-white/[0.08] shadow-xl">
            <a
              href="mailto:rohanmia.org@gmail.com"
              title="Send Direct Email"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <Mail size={15} />
            </a>
            <a
              href="https://linkedin.com/in/rohan-bhau"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn Profile"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <FaLinkedin size={15} />
            </a>
            <a
              href="https://x.com/rohan_bhau"
              target="_blank"
              rel="noopener noreferrer"
              title="X / Twitter"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <FaXTwitter size={15} />
            </a>
            <a
              href="https://github.com/rohan-bhau"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <FaGithub size={15} />
            </a>
          </div>
        </div>

        {/* =========================================================================
            3. TAB CONTENT
           ========================================================================= */}
        <AnimatePresence mode="wait">
          {/* TAB 1: BOOK A CALL (Exact Calendly UI from Screenshot) */}
          {activeTab === 'book' && (
            <motion.div
              id="meeting"
              key="book-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="w-full space-y-8 scroll-mt-28"
            >
              {/* Calendly Booking Card */}
              <CalendlyBooking />
            </motion.div>
          )}

          {/* TAB 2: SEND MESSAGE */}
          {activeTab === 'message' && (
            <motion.div
              key="message-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="max-w-2xl mx-auto w-full"
            >
              <div className="p-6 sm:p-10 rounded-[2rem] bg-[#0c0d12] border border-white/[0.08] shadow-2xl space-y-6">
                <form onSubmit={handleSubmitMessage} className="space-y-5">
                  {/* Row 1: Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-medium">
                        NAME
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Jane Doe"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all font-sans"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-medium">
                        EMAIL
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jane@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* Row 2: Topic Selection */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-medium">
                      TOPIC
                    </label>
                    <div className="relative">
                      <select
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[#111218] border border-white/[0.08] text-xs sm:text-sm text-white focus:outline-none focus:border-white/30 transition-all font-sans appearance-none cursor-pointer pr-10"
                      >
                        <option value="Freelance Project">Freelance Project</option>
                        <option value="Full-Time Role">Full-Time Role</option>
                        <option value="Architecture Consultation">Architecture Consultation</option>
                        <option value="Just Saying Hi">Just Saying Hi</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Message Textarea */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-medium">
                      MESSAGE
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell me about your project, idea, or just say hi..."
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all font-sans resize-none leading-relaxed"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-zinc-200 hover:text-white font-medium text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 shadow-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={15} className="animate-spin text-zinc-300" />
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <span>Send Message</span>
                          <Send size={14} className="text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
