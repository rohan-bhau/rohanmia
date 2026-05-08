'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Magnetic from './Magnetic';
import Tooltip from './Tooltip';

const routes = [
  '/',
  '/tech-stack',
  '/qualification',
  '/projects',
  '/about',
  '/skills',
  '/testimonials',
  '/gallery',
  '/contact'
];

export default function FloatingControls() {
  const router = useRouter();
  const pathname = usePathname();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  const currentIndex = routes.indexOf(pathname);
  const prevRoute = currentIndex > 0 ? routes[currentIndex - 1] : null;
  const nextRoute = currentIndex < routes.length - 1 ? routes[currentIndex + 1] : null;

  return (
    <>
    <div className="floating-controls-container">
      {/* Next/Prev Buttons (Bottom Row) */}
      <div className="fixed bottom-8 right-8 z-40 flex gap-8">
        <AnimatePresence>
          {prevRoute && (
            <motion.div
              key="prev-btn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Tooltip text="Previous Page" position="top">
                <Magnetic strength={0.3}>
                  <button
                    onClick={() => router.push(prevRoute)}
                    className="w-16 h-16 rounded-full glass-premium flex items-center justify-center text-foreground hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 group shadow-lg"
                  >
                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                  </button>
                </Magnetic>
              </Tooltip>
            </motion.div>
          )}
          {nextRoute && (
            <motion.div
              key="next-btn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Tooltip text="Next Page" position="top">
                <Magnetic strength={0.3}>
                  <button
                    onClick={() => router.push(nextRoute)}
                    className="w-16 h-16 rounded-full glass-premium flex items-center justify-center text-foreground hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 group shadow-lg"
                  >
                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Magnetic>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll to Top (Beside Chat) */}
      <div className="fixed bottom-28 right-8 z-40">
        <AnimatePresence>
          {showScrollTop && (
            <motion.div
              key="scroll-top"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <Tooltip text="Scroll To Top" position="left">
                <Magnetic strength={0.3}>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="w-14 h-14 rounded-full glass-premium flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-500 shadow-xl border border-primary/20"
                  >
                    <ArrowUp size={24} />
                  </button>
                </Magnetic>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
}
