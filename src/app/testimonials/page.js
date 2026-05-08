'use client';

import { motion } from 'framer-motion';
import { MessageSquarePlus, Star } from 'lucide-react';
import Link from 'next/link';
import Magnetic from '@/components/shared/Magnetic';

export default function TestimonialsPage() {
  return (
    <div className="pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-4xl text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">
            Client <span className="text-primary text-glow">Testimonials</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Hear what my clients and partners have to say about our collaborations.
          </p>
        </motion.div>

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass border-white/10 p-16 rounded-[3rem] space-y-8 relative overflow-hidden"
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

          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-gray-400">Want to share your experience?</p>
            <Magnetic>
              <Link href="/contact">
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
      </div>
    </div>
  );
}
