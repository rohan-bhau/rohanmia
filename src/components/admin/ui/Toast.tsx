'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    info: (msg: string) => addToast('info', msg),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0d0f13]/95 border border-white/[0.1] backdrop-blur-xl shadow-2xl text-xs sm:text-sm text-white"
            >
              {t.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
              {t.type === 'error' && <AlertCircle size={16} className="text-rose-400 shrink-0" />}
              {t.type === 'info' && <Info size={16} className="text-sky-400 shrink-0" />}
              <span className="flex-1 font-medium leading-snug">{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="text-white/40 hover:text-white p-1 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  const showToast = (msg: string, type: ToastType = 'info') => {
    if (!context) return;
    if (type === 'success') context.toast.success(msg);
    else if (type === 'error') context.toast.error(msg);
    else context.toast.info(msg);
  };
  return {
    toast: context?.toast || {
      success: (_msg: string) => {},
      error: (_msg: string) => {},
      info: (_msg: string) => {},
    },
    showToast,
    success: (msg: string) => context?.toast.success(msg),
    error: (msg: string) => context?.toast.error(msg),
    info: (msg: string) => context?.toast.info(msg),
  };
}
