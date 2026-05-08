'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, Loader2, CheckCircle2, AlertCircle, User, Briefcase, MessageSquare } from 'lucide-react';
import { submitTestimonial } from '@/actions/testimonials';
import Magnetic from '@/components/shared/Magnetic';

export default function SubmitTestimonial() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(5);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    content: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await submitTestimonial({ ...formData, rating });
    setLoading(false);
    if (res.success) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full glass p-12 rounded-[3rem] text-center space-y-8 border-primary/20"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Feedback Received</h1>
            <p className="text-gray-400">Thank you for sharing your experience! Your testimonial has been sent for review and will be visible on the portfolio once approved.</p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-8 py-4 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-40 pb-20 px-6 bg-background">
      <div className="container mx-auto max-w-2xl">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
              Share Your <span className="text-primary text-glow">Experience</span>
            </h1>
            <p className="text-gray-500">Your feedback helps me improve and helps others understand the value of our collaboration.</p>
          </div>

          <form onSubmit={handleSubmit} className="glass p-10 rounded-[3rem] border-white/5 space-y-8">
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Global Satisfaction Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110 active:scale-90"
                    >
                      <Star 
                        size={32} 
                        fill={star <= rating ? "#0ea5e9" : "transparent"} 
                        className={star <= rating ? "text-primary shadow-glow" : "text-white/10"} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary italic">
                    <User size={14} /> Full Identity
                  </label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white italic outline-none focus:border-primary transition-all"
                    placeholder="Your Name"
                  />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary italic">
                    <Briefcase size={14} /> Professional Role
                  </label>
                  <input 
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white italic outline-none focus:border-primary transition-all"
                    placeholder="CEO, Lead Dev, etc."
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary italic">
                  <Star size={14} /> Organization (Optional)
                </label>
                <input 
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white italic outline-none focus:border-primary transition-all"
                  placeholder="Company Name"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary italic">
                  <MessageSquare size={14} /> Collaborative Insights
                </label>
                <textarea 
                  required
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm text-white italic outline-none focus:border-primary transition-all resize-none"
                  placeholder="Describe your experience working together..."
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-primary text-white font-black uppercase tracking-[0.4em] italic rounded-[2rem] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              Transmit Testimonial
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
