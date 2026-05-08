'use client';

import { useTheme } from './Providers';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import Tooltip from './Tooltip';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <Tooltip text="Switch Theme" position="bottom">
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="relative p-3 rounded-full glass border-white/20 hover:border-primary/50 transition-all duration-300 group"
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme}
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
            className="text-primary group-hover:scale-110 transition-transform"
          >
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </motion.div>
        </AnimatePresence>
      </button>
    </Tooltip>
  );
}
