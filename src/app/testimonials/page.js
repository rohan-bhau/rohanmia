'use client';

import { motion } from 'framer-motion';
import { MessageSquarePlus, Star, User } from 'lucide-react';
import Link from 'next/link';
import Magnetic from '@/components/shared/Magnetic';
import { getTestimonials } from '@/actions/testimonials';
import { useState, useEffect } from 'react';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const data = await getTestimonials(true);
      setTestimonials(data);
      setLoading(false);
    };
    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <div className="pt-40 flex flex-col items-center justify-center min-h-[60vh] gap-4 opacity-20">
        <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Feedback Node...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-6xl space-y-24">
        <div className="text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold text-white tracking-tighter"
          >
            Client <span className="text-primary text-glow">Testimonials</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Hear what my clients and partners have to say about our collaborations.
          </motion.p>
        </div>

        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative glass-premium p-10 rounded-[3rem] border border-white/5 bg-[#0a0f1a]/40 hover:border-primary/20 transition-all duration-500"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-lg">
                      <User size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">{testimonial.name}</h4>
                      <p className="text-xs font-black text-white/30 uppercase tracking-widest italic">
                        {testimonial.role} {testimonial.company ? `@ ${testimonial.company}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < testimonial.rating ? "#0ea5e9" : "transparent"} 
                        className={i < testimonial.rating ? "text-primary" : "text-white/10"} 
                      />
                    ))}
                  </div>
                </div>

                <p className="text-lg italic text-white/70 leading-relaxed font-medium">
                  "{testimonial.content}"
                </p>

                {/* Decorative Quote Mark */}
                <div className="absolute top-10 right-10 text-primary/5 pointer-events-none">
                  <Star size={120} />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State - Restored to Original Design */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass border-white/10 p-16 rounded-[3rem] text-center space-y-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 -z-10" />
            
            <div className="flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} className="text-gray-700" />
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">Testimonials coming soon.</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                I&apos;m currently working with amazing clients. Once we wrap up some exciting projects, their feedback will appear here.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 pt-4">
              <p className="text-sm text-gray-400">Want to share your experience?</p>
              <Magnetic>
                <Link href="/testimonials/submit">
                  <button className="flex items-center gap-2 px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
                    <MessageSquarePlus size={18} />
                    <span>Share Feedback</span>
                  </button>
                </Link>
              </Magnetic>
            </div>

            {/* Decorative Orbs */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
