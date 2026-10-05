'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BookOpen, 
  Trash2, 
  Loader2, 
  ArrowUpRight, 
  Mail, 
  Heart,
  MessageSquare
} from 'lucide-react';
import { fetchAdminGuestbook, removeAdminGuestbookEntry } from '@/actions/adminGuestbook';
import { DbGuestbookRow } from '@/lib/db/guestbook';
import { useToast } from '@/components/admin/ui/Toast';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import { useThemeAccent } from '@/components/theme/ThemeProvider';

export default function AdminGuestbookPage() {
  const { currentTheme } = useThemeAccent();
  const { showToast } = useToast();
  const [entries, setEntries] = useState<DbGuestbookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadEntries = async () => {
    setLoading(true);
    const res = await fetchAdminGuestbook();
    if (res.success && res.entries) {
      setEntries(res.entries);
    } else {
      showToast(res.error || 'Failed to load guestbook signatures', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const confirmDelete = async () => {
    if (!deletingId) return;
    startTransition(async () => {
      const res = await removeAdminGuestbookEntry(deletingId);
      if (res.success) {
        showToast('Signature removed.', 'success');
        setEntries(prev => prev.filter(e => e.id !== deletingId));
      } else {
        showToast(res.error || 'Failed to delete entry', 'error');
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-8 max-w-6xl pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1.5">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
            COMMUNITY & VISITOR SIGNATURES
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white tracking-tight">
            The{' '}
            <span 
              className="font-serif italic font-normal text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${currentTheme.primary} 100%)`
              }}
            >
              Guestbook
            </span>
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            {entries.length} signature(s) stored in PostgreSQL
          </p>
        </div>

        <Link
          href="/guestbook"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-neutral-300 hover:text-white border border-white/[0.08] transition-colors self-start sm:self-auto"
        >
          <span>Public Wall</span>
          <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500 font-mono text-xs">
          <Loader2 size={24} className="animate-spin text-white" />
          <span>Loading guestbook ledger...</span>
        </div>
      ) : entries.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0c0e14]/60 border border-white/[0.08] space-y-2">
          <BookOpen size={32} className="mx-auto text-neutral-600" />
          <p className="text-sm text-neutral-300 font-medium">No guestbook signatures</p>
          <p className="text-xs text-neutral-500 font-mono">Visitor signatures will appear here dynamically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-5 sm:p-6 rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] hover:border-white/20 backdrop-blur-2xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {entry.avatar ? (
                      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-neutral-800 border border-white/10 shrink-0">
                        <Image src={entry.avatar} alt={entry.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                        {entry.name?.charAt(0) || 'U'}
                      </div>
                    )}

                    <div className="overflow-hidden">
                      <h3 className="text-sm font-semibold text-white tracking-tight truncate">
                        {entry.name}
                      </h3>
                      <p className="text-[11px] font-mono text-neutral-400 truncate">
                        {entry.email}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                    {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                  &ldquo;{entry.message}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] font-mono text-neutral-400 border border-white/[0.06] uppercase">
                    {entry.provider || 'Google'}
                  </span>
                  {entry.likes > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-rose-400">
                      <Heart size={10} className="fill-rose-400" />
                      <span>{entry.likes}</span>
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setDeletingId(entry.id)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Entry"
                >
                  <Trash2 size={13} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Delete Signature?"
        description="Are you sure you want to delete this guestbook signature? It will be removed permanently from the public wall and database."
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeletingId(null)}
      />

    </div>
  );
}
