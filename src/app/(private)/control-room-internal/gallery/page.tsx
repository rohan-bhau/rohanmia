"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Image as ImageIcon,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Loader2,
  ArrowUpRight,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  FolderPlus,
  RefreshCw,
} from "lucide-react";
import {
  fetchAdminGallery,
  saveAdminGalleryPhoto,
  removeAdminGalleryPhoto,
  reorderAdminGalleryPhotos,
  fetchAdminGalleryCategories,
  createAdminGalleryCategory,
} from "@/actions/adminGallery";
import { DbGalleryPhotoRow } from "@/lib/db/gallery";
import { useToast } from "@/components/admin/ui/Toast";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import AdminModal from "@/components/admin/ui/AdminModal";
import ImageCropModal from "@/components/admin/ui/ImageCropModal";
import { useThemeAccent } from "@/components/theme/ThemeProvider";

export default function AdminGalleryPage() {
  const { currentTheme } = useThemeAccent();
  const { showToast } = useToast();
  const [photos, setPhotos] = useState<DbGalleryPhotoRow[]>([]);
  const [categories, setCategories] = useState<string[]>([
    "Personal",
    "Travel",
    "Work",
    "Moments",
  ]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Drag and drop state (Desktop)
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Modal State
  const [editingPhoto, setEditingPhoto] =
    useState<Partial<DbGalleryPhotoRow> | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  // Category Creation Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const [isPending, startTransition] = useTransition();

  const loadPhotosAndCategories = useCallback(async () => {
    setLoading(true);
    const [galleryRes, catRes] = await Promise.all([
      fetchAdminGallery(),
      fetchAdminGalleryCategories(),
    ]);

    if (galleryRes.success && galleryRes.photos) {
      setPhotos(galleryRes.photos);
    } else {
      showToast(galleryRes.error || "Failed to fetch gallery photos", "error");
    }

    if (catRes.success && catRes.categories) {
      setCategories(catRes.categories);
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadPhotosAndCategories();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadPhotosAndCategories]);

  // Filtered photos based on active category
  const filteredPhotos =
    activeCategory === "All"
      ? photos
      : photos.filter(
          (p) => p.category.toLowerCase() === activeCategory.toLowerCase(),
        );

  // Save photo handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto?.src?.trim() || !editingPhoto?.title?.trim()) {
      showToast("Image and Title are required.", "error");
      return;
    }

    startTransition(async () => {
      const res = await saveAdminGalleryPhoto({
        id: editingPhoto.id,
        src: editingPhoto.src!.trim(),
        title: editingPhoto.title!.trim(),
        category: editingPhoto.category || "Moments",
        caption: editingPhoto.caption ? editingPhoto.caption.trim() : "",
        date: editingPhoto.date || "2026",
        position: "center",
        sort_order: Number(editingPhoto.sort_order) || photos.length + 1,
      });

      if (res.success) {
        showToast(
          editingPhoto.id ? "Photo updated." : "Photo added.",
          "success",
        );
        setEditingPhoto(null);
        loadPhotosAndCategories();
      } else {
        showToast(res.error || "Failed to save photo", "error");
      }
    });
  };

  // Delete handler
  const confirmDelete = async () => {
    if (!deletingId) return;
    startTransition(async () => {
      const res = await removeAdminGalleryPhoto(deletingId);
      if (res.success) {
        showToast("Photo removed from gallery.", "success");
        setPhotos((prev) => prev.filter((p) => p.id !== deletingId));
      } else {
        showToast(res.error || "Failed to delete photo", "error");
      }
      setDeletingId(null);
    });
  };

  // Create new category handler
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCategoryName.trim();
    if (!clean) return;

    setIsCreatingCategory(true);
    const res = await createAdminGalleryCategory(clean);
    if (res.success && res.category) {
      showToast(`Category "${res.category}" created.`, "success");
      setCategories((prev) =>
        prev.includes(res.category!) ? prev : [...prev, res.category!],
      );
      setNewCategoryName("");
      setIsCategoryModalOpen(false);
    } else {
      showToast(res.error || "Failed to create category", "error");
    }
    setIsCreatingCategory(false);
  };

  // Persist new order
  const persistOrder = async (updatedList: DbGalleryPhotoRow[]) => {
    setPhotos(updatedList);
    const ids = updatedList.map((p) => p.id);
    const res = await reorderAdminGalleryPhotos(ids);
    if (!res.success) {
      showToast("Failed to update photos order", "error");
      loadPhotosAndCategories();
    } else {
      showToast("Order saved.", "success");
    }
  };

  // Drag and drop handlers (Desktop)
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };

  const handleDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIdx) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }

    const draggedItem = filteredPhotos[draggedIdx];
    const targetItem = filteredPhotos[dropIdx];
    if (!draggedItem || !targetItem) return;

    const fromRealIdx = photos.findIndex((p) => p.id === draggedItem.id);
    const toRealIdx = photos.findIndex((p) => p.id === targetItem.id);

    const reordered = [...photos];
    const [moved] = reordered.splice(fromRealIdx, 1);
    reordered.splice(toRealIdx, 0, moved);

    setDraggedIdx(null);
    setDragOverIdx(null);
    persistOrder(reordered);
  };

  // Move position left/right (Mobile & accessibility buttons)
  const handleMove = (id: string, direction: "prev" | "next") => {
    const curIndex = photos.findIndex((p) => p.id === id);
    if (curIndex === -1) return;
    const targetIndex = direction === "prev" ? curIndex - 1 : curIndex + 1;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    const reordered = [...photos];
    const [moved] = reordered.splice(curIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    persistOrder(reordered);
  };

  const allDisplayCategories = ["All", ...categories];

  return (
    <div className="space-y-8 max-w-6xl px-4 sm:px-8 py-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1.5">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
            VISUAL ARCHIVE &amp; MEMORIES
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white tracking-tight">
            Gallery &{" "}
            <span
              className="font-serif italic font-normal text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${currentTheme.primary} 100%)`,
              }}
            >
              Moments
            </span>
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            {photos.length} photograph(s) synchronized &bull; Drag on desktop or
            use arrows on mobile to reorder
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
            type="button"
            onClick={() =>
              setEditingPhoto({
                src: "",
                title: "",
                category: categories[0] || "Moments",
                caption: "",
                date: "2026",
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-tight transition-all shadow-md cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Photograph</span>
          </button>
        </div>
      </div>

      {/* Category Tabs Bar with Right-Side Category Creation Option */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-1 border-b border-white/[0.08] pb-5">
        <div className="flex items-center flex-wrap gap-2.5">
          {allDisplayCategories.map((cat) => {
            const count =
              cat === "All"
                ? photos.length
                : photos.filter(
                    (p) => p.category?.toLowerCase() === cat.toLowerCase(),
                  ).length;
            const isActive = activeCategory.toLowerCase() === cat.toLowerCase();

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-white text-zinc-950 font-bold shadow-md scale-[1.02]"
                    : "bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-zinc-400 hover:text-white"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? "bg-zinc-200 text-zinc-950"
                      : "bg-white/10 text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right side: Add New Category Button */}
        <button
          type="button"
          onClick={() => setIsCategoryModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-xs font-mono text-neutral-300 hover:text-white transition-all cursor-pointer"
        >
          <FolderPlus size={13} style={{ color: currentTheme.primary }} />
          <span>New Category</span>
        </button>
      </div>

      {/* Editorial Gallery Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500 font-mono text-xs">
          <Loader2 size={24} className="animate-spin text-white" />
          <span>Loading gallery archive...</span>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0c0e14]/60 border border-white/[0.08] space-y-2">
          <ImageIcon size={32} className="mx-auto text-neutral-600" />
          <p className="text-sm text-neutral-300 font-medium">
            No photographs in this category
          </p>
          <p className="text-xs text-neutral-500 font-mono">
            Click &quot;Add Photograph&quot; to publish an image.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPhotos.map((photo, index) => {
            const indexStr = String(index + 1).padStart(2, "0");
            const isDragging = draggedIdx === index;
            const isDragOver = dragOverIdx === index;

            return (
              <article
                key={photo.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`group relative flex flex-col space-y-3 transition-all duration-200 select-none ${
                  isDragging ? "opacity-40 scale-95" : ""
                } ${isDragOver ? "ring-2 ring-white/40 rounded-3xl" : ""}`}
              >
                {/* 1. Architectural Header Bar Above Card */}
                <div className="flex items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-3">
                    <div
                      className="cursor-grab active:cursor-grabbing text-neutral-500 hover:text-white p-0.5"
                      title="Drag to reorder photo"
                    >
                      <GripVertical size={14} />
                    </div>

                    <span className="font-mono text-xs font-semibold text-zinc-400 tracking-wider">
                      {indexStr}
                    </span>
                    <div className="h-px w-6 bg-zinc-700/80" />
                    <span
                      className="font-mono text-[11px] uppercase tracking-widest font-semibold"
                      style={{ color: currentTheme.primary }}
                    >
                      {photo.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white/[0.04] rounded-lg border border-white/[0.08] p-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(photo.id, "prev");
                        }}
                        disabled={index === 0}
                        title="Move Left / Earlier"
                        className="p-1 hover:text-white text-neutral-400 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(photo.id, "next");
                        }}
                        disabled={index === filteredPhotos.length - 1}
                        title="Move Right / Later"
                        className="p-1 hover:text-white text-neutral-400 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>

                    {photo.date && (
                      <span className="shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[10px] bg-white/[0.04] border border-white/[0.08] text-zinc-400">
                        {photo.date}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Interactive Image Slab with Hover-Only Reveal Overlay */}
                <div className="relative w-full aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0c0d12] border border-white/[0.08] group-hover:border-white/30 transition-all duration-500 shadow-xl group-hover:shadow-2xl">
                  <Image
                    src={photo.src}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* HOVER-ONLY METADATA & CONTROLS OVERLAY */}
                  <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/95 via-black/50 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5 backdrop-blur-[2px]">
                    {/* Top Row: Edit & Delete Quick Glass Buttons */}
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPhoto(photo);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-white text-white hover:text-black border border-white/20 text-xs font-mono font-medium backdrop-blur-md transition-all shadow-md cursor-pointer"
                        title="Edit Photo"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(photo.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/30 text-xs font-mono font-medium backdrop-blur-md transition-all shadow-md cursor-pointer"
                        title="Delete Photo"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>

                    {/* Bottom: Title & Caption (Only if caption exists!) */}
                    <div className="space-y-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="font-serif font-normal text-xl text-white tracking-tight leading-snug">
                        {photo.title}
                      </h3>

                      {photo.caption && photo.caption.trim() && (
                        <p className="text-xs text-zinc-300 font-light leading-relaxed line-clamp-2">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Edit / Create Photo Modal (Zero Editable URL Input - Pure Upload & Preview) */}
      <AdminModal
        isOpen={Boolean(editingPhoto)}
        onClose={() => setEditingPhoto(null)}
        title={editingPhoto?.id ? "Edit Photograph" : "Add Photograph"}
        subtitle="Crop and save directly to Neon PostgreSQL & Cloudinary"
        maxWidth="max-w-lg"
      >
        {editingPhoto && (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Image Upload Area (No raw text input to prevent typing errors) */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Photograph *
              </label>

              {editingPhoto.src ? (
                <div className="space-y-2">
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-white/20 bg-neutral-950 flex items-center justify-center">
                    <Image
                      src={editingPhoto.src}
                      alt="Uploaded preview"
                      fill
                      unoptimized
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 640px"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCropOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-mono text-white transition-colors cursor-pointer"
                    >
                      <RefreshCw size={12} />
                      <span>Change Photograph</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingPhoto({ ...editingPhoto, src: "" })
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCropOpen(true)}
                  className="w-full h-24 sm:h-32 rounded-2xl border-2 border-dashed border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
                >
                  <div className="p-2.5 rounded-full bg-white/[0.05] group-hover:scale-110 transition-transform">
                    <UploadCloud
                      size={20}
                      style={{ color: currentTheme.primary }}
                    />
                  </div>
                  <span className="text-xs font-medium text-white">
                    Upload &amp; Crop Photograph
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    JPG, PNG, WebP up to 10MB
                  </span>
                </button>
              )}
            </div>

            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingPhoto.title || ""}
                  onChange={(e) =>
                    setEditingPhoto({ ...editingPhoto, title: e.target.value })
                  }
                  placeholder="e.g. Engineering Desk Setup"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Category
                </label>
                <select
                  value={editingPhoto.category || categories[0] || "Moments"}
                  onChange={(e) =>
                    setEditingPhoto({
                      ...editingPhoto,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0e14] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white font-mono"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date / Year */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Date / Year
              </label>
              <input
                type="text"
                value={editingPhoto.date || "2026"}
                onChange={(e) =>
                  setEditingPhoto({ ...editingPhoto, date: e.target.value })
                }
                placeholder="e.g. Autumn 2026"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
              />
            </div>

            {/* Caption / Story */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Caption / Narrative (Optional)
              </label>
              <textarea
                rows={2}
                value={editingPhoto.caption || ""}
                onChange={(e) =>
                  setEditingPhoto({ ...editingPhoto, caption: e.target.value })
                }
                placeholder="Leave blank if no narrative is needed..."
                className="w-full min-h-[55px] px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono resize-none leading-relaxed [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              />
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-tight transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Check size={13} />
                )}
                <span>Save Photograph</span>
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Create New Category Modal */}
      <AdminModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add Gallery Category"
        subtitle="Create a new classification tag stored in PostgreSQL"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Architecture, Setups, Street..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
            />
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingCategory || !newCategoryName.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-tight transition-all cursor-pointer disabled:opacity-50"
            >
              {isCreatingCategory ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              <span>Create Category</span>
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Cloudinary Image Crop Modal */}
      <ImageCropModal
        isOpen={isCropOpen}
        onClose={() => setIsCropOpen(false)}
        onSuccess={(url) => {
          if (editingPhoto) {
            setEditingPhoto({ ...editingPhoto, src: url });
          }
          setIsCropOpen(false);
          showToast("Image uploaded to Cloudinary successfully.", "success");
        }}
        title="Crop & Upload Gallery Photograph"
        subtitle="Crop your photograph and upload directly to Cloudinary CDN."
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Delete Photograph?"
        description="Are you sure you want to remove this photograph? It will be deleted permanently from PostgreSQL."
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
}
