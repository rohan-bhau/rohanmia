'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useScrollLock } from '@/hooks/useScrollLock';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  message?: string;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  confirmVariant?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  message,
  confirmLabel,
  confirmText,
  cancelLabel = 'Cancel',
  confirmVariant,
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
  onClose,
}: ConfirmModalProps) {
  useScrollLock(isOpen);

  if (!isOpen) return null;

  const descText = description || message || '';
  const finalConfirmLabel = confirmText || confirmLabel || 'Confirm';
  const handleCancel = onCancel || onClose || (() => {});
  const isDanger = isDestructive || confirmVariant === 'destructive';

  return (
    <AnimatePresence>
      <div className="fixed inset-x-0 top-16 bottom-[88px] md:inset-0 md:left-64 md:top-16 md:bottom-0 z-50 flex items-center justify-center p-4 sm:p-6 overscroll-contain">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCancel}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-2xl bg-[#0e1116] border border-white/[0.08] p-6 shadow-2xl z-10 space-y-4 max-h-full md:max-h-[85vh] overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${isDanger ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <AlertTriangle size={20} />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-base font-semibold text-white">{title}</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">{descText}</p>
            </div>
            <button
              onClick={handleCancel}
              className="text-neutral-400 hover:text-white p-1 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isDanger
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30'
                  : 'bg-white hover:bg-neutral-200 text-black shadow-lg shadow-white/10'
              } disabled:opacity-50`}
            >
              {isLoading ? 'Processing...' : finalConfirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
