'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useScrollLock } from '@/hooks/useScrollLock';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode;
}

export default function AdminModal({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = 'max-w-2xl',
  children,
}: AdminModalProps) {
  // Lock body scroll when modal is open
  useScrollLock(isOpen);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-x-0 top-16 bottom-[88px] md:inset-0 md:left-64 md:top-16 md:bottom-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overscroll-contain"
        onClick={onClose}
      >
        {/* Modal Window Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          className={`w-full ${maxWidth} bg-[#0c0e14] border border-white/[0.12] rounded-3xl p-4 sm:p-8 shadow-2xl flex flex-col max-h-full md:max-h-[85vh] overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative z-10`}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/[0.08] pb-3 mb-4 sm:pb-4 sm:mb-6 shrink-0">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl text-white font-normal tracking-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] sm:text-xs text-neutral-400 font-mono mt-0.5 sm:mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Close modal (Esc)"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
