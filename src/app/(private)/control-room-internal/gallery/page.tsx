'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Image as ImageIcon, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Loader2,
  ArrowUpRight,
  Calendar,
  Tag
} from 'lucide-react';
import { fetchAdminGallery, saveAdminGalleryPhoto, removeAdminGalleryPhoto } from '@/actions/adminGallery';
import { DbGalleryPhotoRow } from '@/lib/db/gallery';
import { useToast } from '@/components/admin/ui/Toast';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import AdminModal from '@/components/admin/ui/AdminModal';
import { useThemeAccent } from '@/components/theme/ThemeProvider';

export default function AdminGalleryPage() {
  const { currentTheme } = useThemeAccent();
  const { showToast } = useToast();
  const [photos, setPhotos] = useState<DbGalleryPhotoRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [editingPhoto, setEditingPhoto] = useState<Partial<DbGalleryPhotoRow> | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadPhotos = async () => {
    setLoading(true);
    const res = await fetchAdminGallery();
    if (res.success && res.photos) {
      setPhotos(res.photos);
    } else {
      showToast(res.error || 'Failed to fetch gallery photos', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto?.src?.trim() || !editingPhoto?.title?.trim()) {
      showToast('Image URL and Title are required.', 'error');
      return;
    }

    startTransition(async () => {
      const res = await saveAdminGalleryPhoto({
        id: editingPhoto.id,
        src: editingPhoto.src!.trim(),
        title: editingPhoto.title!.trim(),
        category: editingPhoto.category || 'Moments',
        caption: editingPhoto.caption || '',
        date: editingPhoto.date || '2026',
        position: editingPhoto.position || 'center',
        sort_order: Number(editingPhoto.sort_order) || 0,
      });

      if (res.success) {
        showToast(editingPhoto.id ? 'Photo updated.' : 'Photo added.', 'success');
        setEditingPhoto(null);
        loadPhotos();
      } else {
        showToast(res.error || 'Failed to save photo', 'error');
      }
    });
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    startTransition(async () => {
      const res = await removeAdminGalleryPhoto(deletingId);
      if (res.success) {
        showToast('Photo removed from gallery.', 'success');
        loadPhotos();
      } else {
        showToast(res.error || 'Failed to delete photo', 'error');
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
            VISUAL ARCHIVE & MEMORIES
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white tracking-tight">
            Gallery &{' '}
            <span 
              className="font-serif italic font-normal text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${currentTheme.primary} 100%)`
              }}
            >
              Moments
            </span>
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            {photos.length} photograph(s) synchronized in PostgreSQL
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/gallery"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-neutral-300 hover:text-white border border-white/[0.08] transition-colors"
          >
            <span>Public Gallery</span>
            <ArrowUpRight size={12} />
          </Link>

          <button
            onClick={() => setEditingPhoto({
              src: '',
              title: '',
              category: 'Moments',
              caption: '',
              date: '2026',
              position: 'center',
            })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-tight transition-all shadow-md cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Photograph</span>
          </button>
        </div>
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500 font-mono text-xs">
          <Loader2 size={24} className="animate-spin text-white" />
          <span>Loading gallery archive...</span>
        </div>
      ) : photos.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0c0e14]/60 border border-white/[0.08] space-y-2">
          <ImageIcon size={32} className="mx-auto text-neutral-600" />
          <p className="text-sm text-neutral-300 font-medium">No gallery photos found</p>
          <p className="text-xs text-neutral-500 font-mono">Add your first photo using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {photos.map((p) => (
            <div
              key={p.id}
              className="rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] hover:border-white/20 backdrop-blur-2xl overflow-hidden flex flex-col justify-between group transition-all"
            >
              <div className="relative h-60 w-full bg-neutral-900 overflow-hidden">
                <Image
                  src={p.src}
                  alt={p.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-transparent to-black/20" />

                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-mono text-white border border-white/10 uppercase tracking-wider">
                    {p.category}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <h3 className="font-semibold text-white tracking-tight text-base">
                      {p.title}
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-500">
                      {p.date}
                    </span>
                  </div>
                  {p.caption && (
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {p.caption}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-500">
                    Pos: {p.position || 'center'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingPhoto(p)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => setDeletingId(p.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      <AdminModal
        isOpen={Boolean(editingPhoto)}
        onClose={() => setEditingPhoto(null)}
        title={editingPhoto?.id ? 'Edit Photograph' : 'Add Photograph'}
        subtitle="Save to Neon PostgreSQL gallery"
        maxWidth="max-w-lg"
      >
        {editingPhoto && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Image Source URL (Cloudinary preferred) *
              </label>
              <input
                type="url"
                required
                value={editingPhoto.src || ''}
                onChange={(e) => setEditingPhoto({ ...editingPhoto, src: e.target.value })}
                placeholder="https://res.cloudinary.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingPhoto.title || ''}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                  placeholder="e.g. Dhaka Studio Nights"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Category
                </label>
                <input
                  type="text"
                  value={editingPhoto.category || 'Moments'}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, category: e.target.value })}
                  placeholder="Moments, Studio, Travels..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Year / Date
                </label>
                <input
                  type="text"
                  value={editingPhoto.date || '2026'}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, date: e.target.value })}
                  placeholder="e.g. 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Focal Alignment
                </label>
                <select
                  value={editingPhoto.position || 'center'}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, position: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0e14] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white font-mono"
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Caption / Story
              </label>
              <textarea
                rows={2}
                value={editingPhoto.caption || ''}
                onChange={(e) => setEditingPhoto({ ...editingPhoto, caption: e.target.value })}
                placeholder="Memories behind the photograph..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono resize-none"
              />
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-tight transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>Save Photo</span>
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Delete Photograph?"
        description="Are you sure you want to remove this photo from your gallery? This action is permanent in PostgreSQL."
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeletingId(null)}
      />

    </div>
  );
}
