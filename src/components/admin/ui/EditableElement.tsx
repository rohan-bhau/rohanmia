'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import AdminModal from '@/components/admin/ui/AdminModal';
import { useThemeAccent } from '@/components/theme/ThemeProvider';

interface EditableElementProps {
  isAdmin?: boolean;
  label: string;
  value: string;
  type?: 'text' | 'textarea' | 'tags';
  placeholder?: string;
  onSave: (newValue: string) => Promise<{ success: boolean; error?: string }>;
  children: React.ReactNode;
  className?: string;
  modalWidth?: 'max-w-md' | 'max-w-lg' | 'max-w-xl';
}

export default function EditableElement({
  isAdmin = false,
  label,
  value,
  type = 'text',
  placeholder,
  onSave,
  children,
  className = '',
  modalWidth = 'max-w-lg',
}: EditableElementProps) {
  const { currentTheme } = useThemeAccent();
  const [isOpen, setIsOpen] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Long press tracking for mobile devices
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const handleTouchStart = useCallback(() => {
    if (!isAdmin) return;
    isLongPressRef.current = false;
    touchTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(50); } catch (_) {}
      }
      setEditValue(value);
      setErrorMessage(null);
      setIsOpen(true);
    }, 550);
  }, [isAdmin, value]);

  const handleTouchEnd = useCallback(() => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    // If the user scrolls or moves their finger, cancel the long press
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  }, []);

  const handleOpenDesktop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditValue(value);
    setErrorMessage(null);
    setIsOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      const res = await onSave(editValue);
      if (res.success) {
        setIsOpen(false);
      } else {
        setErrorMessage(res.error || 'Failed to save changes');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving data');
    } finally {
      setSaving(false);
    }
  };

  // If visitor mode, render pure unadorned children without any listeners
  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        className={`group/editable relative inline-block transition-all ${className}`}
      >
        {children}

        {/* Desktop Hover Edit Pencil Badge */}
        <button
          type="button"
          onClick={handleOpenDesktop}
          title={`Edit ${label}`}
          style={{
            borderColor: `${currentTheme.primary}60`,
            boxShadow: `0 0 16px ${currentTheme.glow}`,
          }}
          className="hidden md:flex opacity-0 group-hover/editable:opacity-100 transition-all duration-200 absolute -top-3 -right-3 z-30 p-1.5 rounded-full bg-[#0d0f14] border text-white hover:scale-110 active:scale-95 cursor-pointer shadow-xl items-center justify-center"
        >
          <Pencil size={12} style={{ color: currentTheme.primary }} />
        </button>

        {/* Subtle hover outline indicator in admin mode */}
        <div 
          className="pointer-events-none absolute -inset-1 rounded-xl border border-transparent group-hover/editable:border-dashed opacity-0 group-hover/editable:opacity-60 transition-opacity duration-200"
          style={{ borderColor: currentTheme.primary }}
        />
      </div>

      {/* Edit Modal */}
      <AdminModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={label}
        subtitle="Saved changes will immediately synchronize across Neon PostgreSQL and public pages."
        maxWidth={modalWidth}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
              {errorMessage}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
              {label} Content
            </label>

            {type === 'textarea' ? (
              <textarea
                rows={4}
                required
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono resize-y"
              />
            ) : type === 'tags' ? (
              <div>
                <input
                  type="text"
                  required
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Comma separated: item 1, item 2, item 3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                />
                <span className="text-[10px] font-mono text-neutral-500 block mt-1">
                  Separate each item with a comma.
                </span>
              </div>
            ) : (
              <input
                type="text"
                required
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
              />
            )}
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                backgroundColor: currentTheme.primary,
                color: currentTheme.contrastText,
                boxShadow: `0 0 18px ${currentTheme.glow}`,
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs tracking-tight transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </AdminModal>
    </>
  );
}
