'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { 
  Cpu, 
  Plus, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Loader2,
  Layers,
  ArrowUpRight,
  FolderPlus,
  Sparkles
} from 'lucide-react';
import { 
  fetchAdminStack, 
  saveAdminTechItem, 
  removeAdminTechItem,
  createAdminTechCategory,
  updateAdminTechCategory,
  removeAdminTechCategory
} from '@/actions/adminStack';
import { DbTechCategoryRow, DbTechItemRow } from '@/lib/db/stack';
import { useToast } from '@/components/admin/ui/Toast';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import AdminModal from '@/components/admin/ui/AdminModal';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { useAdminMode } from '@/components/admin/AdminModeContext';
import TechStackClientView from '@/components/stack/TechStackClientView';
import { getIconForTech } from '@/components/ui/TechBadge';

export default function AdminTechStackPage() {
  const { currentTheme } = useThemeAccent();
  const { showToast } = useToast();
  const { mode: activeMode } = useAdminMode();

  const [categories, setCategories] = useState<DbTechCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCatId, setSelectedCatId] = useState<string>('all');

  // Tech Item Modal State
  const [editingItem, setEditingItem] = useState<Partial<DbTechItemRow> | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Category Modal State
  const [editingCategory, setEditingCategory] = useState<Partial<DbTechCategoryRow> | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const loadStack = async () => {
    setLoading(true);
    const res = await fetchAdminStack();
    if (res.success && res.categories) {
      setCategories(res.categories);
    } else {
      showToast(res.error || 'Failed to load tech stack', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStack();
  }, []);

  const allItems = categories.flatMap(c => c.items || []);
  const displayedCategories = selectedCatId === 'all' 
    ? categories 
    : categories.filter(c => c.id === selectedCatId);

  // Handle Save Tech Item
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name?.trim() || !editingItem?.category_id) {
      showToast('Name and Category are required.', 'error');
      return;
    }

    startTransition(async () => {
      const selectedCategory = categories.find(c => c.id === editingItem.category_id);
      const res = await saveAdminTechItem({
        ...editingItem,
        name: editingItem.name!.trim(),
        category_id: editingItem.category_id!,
        category_name: selectedCategory?.title || '',
      });

      if (res.success) {
        showToast(editingItem.id ? 'Technology updated successfully.' : 'Technology added successfully.', 'success');
        setEditingItem(null);
        loadStack();
      } else {
        showToast(res.error || 'Failed to save technology', 'error');
      }
    });
  };

  // Handle Delete Tech Item
  const confirmDeleteItem = async () => {
    if (!deletingItemId) return;
    startTransition(async () => {
      const res = await removeAdminTechItem(deletingItemId);
      if (res.success) {
        showToast('Technology deleted successfully.', 'success');
        loadStack();
      } else {
        showToast(res.error || 'Failed to delete technology', 'error');
      }
      setDeletingItemId(null);
    });
  };

  // Handle Save Category (Create or Edit)
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.title?.trim()) {
      showToast('Category title is required.', 'error');
      return;
    }

    startTransition(async () => {
      let res;
      if (editingCategory.id) {
        res = await updateAdminTechCategory({
          id: editingCategory.id,
          title: editingCategory.title!.trim(),
          subtitle: editingCategory.subtitle?.trim(),
          description: editingCategory.description?.trim(),
          philosophy: editingCategory.philosophy?.trim(),
          badge: editingCategory.badge?.trim(),
        });
      } else {
        res = await createAdminTechCategory({
          title: editingCategory.title!.trim(),
          subtitle: editingCategory.subtitle?.trim(),
          description: editingCategory.description?.trim(),
          philosophy: editingCategory.philosophy?.trim(),
          badge: editingCategory.badge?.trim(),
        });
      }

      if (res.success) {
        showToast(editingCategory.id ? 'Category updated in PostgreSQL.' : 'New category created in PostgreSQL.', 'success');
        setEditingCategory(null);
        setIsCreatingCategory(false);
        loadStack();
      } else {
        showToast(res.error || 'Failed to save category', 'error');
      }
    });
  };

  // Handle Delete Category
  const confirmDeleteCategory = async () => {
    if (!deletingCategoryId) return;
    startTransition(async () => {
      const res = await removeAdminTechCategory(deletingCategoryId);
      if (res.success) {
        showToast('Category deleted from PostgreSQL.', 'success');
        if (selectedCatId === deletingCategoryId) {
          setSelectedCatId('all');
        }
        loadStack();
      } else {
        showToast(res.error || 'Failed to delete category', 'error');
      }
      setDeletingCategoryId(null);
    });
  };

  // ========================================================
  // MODE 1: SURFACE CANVAS (100% Read-Only Live Preview)
  // ========================================================
  if (activeMode === 'preview') {
    return (
      <div className="relative animate-in fade-in duration-200">
        <TechStackClientView categories={categories} />
      </div>
    );
  }

  // ========================================================
  // MODE 2: STUDIO ENGINE (Interactive Control Room)
  // ========================================================
  return (
    <div className="space-y-8 max-w-6xl px-4 sm:px-8 py-6 pb-20 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1.5">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
            ENGINEERING CAPABILITIES & TOOLING
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white tracking-tight">
            Tech Stack &{' '}
            <span 
              className="font-serif italic font-normal text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${currentTheme.primary} 100%)`
              }}
            >
              Toolchain
            </span>
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            {allItems.length} skill(s) across {categories.length} architectural category domains in PostgreSQL
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <Link
            href="/tech-stack"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-neutral-300 hover:text-white border border-white/[0.08] transition-colors"
          >
            <span>Public View</span>
            <ArrowUpRight size={12} />
          </Link>

          {/* New Category Button */}
          <button
            onClick={() => {
              setEditingCategory({
                title: '',
                subtitle: '',
                description: '',
                philosophy: '',
                badge: '',
              });
              setIsCreatingCategory(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-white border border-white/[0.1] transition-all cursor-pointer"
          >
            <FolderPlus size={14} />
            <span>+ New Category</span>
          </button>

          {/* Add Technology Button */}
          <button
            onClick={() => setEditingItem({
              name: '',
              category_id: categories[0]?.id || '',
              version: '',
              proficiency: 90,
              is_core: true,
              use_case: '',
              docs_url: '',
              brand_color: '#38bdf8',
            })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-tight transition-all shadow-md cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Technology</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCatId('all')}
          style={selectedCatId === 'all' ? {
            borderColor: `${currentTheme.primary}50`,
            backgroundColor: `${currentTheme.primary}15`,
            color: '#ffffff',
            boxShadow: `0 0 12px ${currentTheme.glow}`,
          } : undefined}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap cursor-pointer ${
            selectedCatId === 'all'
              ? 'font-semibold border'
              : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
          }`}
        >
          All Domains ({allItems.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCatId(c.id)}
            style={selectedCatId === c.id ? {
              borderColor: `${currentTheme.primary}50`,
              backgroundColor: `${currentTheme.primary}15`,
              color: '#ffffff',
              boxShadow: `0 0 12px ${currentTheme.glow}`,
            } : undefined}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap cursor-pointer ${
              selectedCatId === c.id
                ? 'font-semibold border'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            {c.title} ({c.items?.length || 0})
          </button>
        ))}
      </div>

      {/* Stack Items Section */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500 font-mono text-xs">
          <Loader2 size={24} className="animate-spin text-white" />
          <span>Loading tech radar from PostgreSQL...</span>
        </div>
      ) : (
        <div className="space-y-10">
          {displayedCategories.map((cat) => (
            <div key={cat.id} className="p-6 rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-xl space-y-6">
              
              {/* Category Header with Edit & Delete */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-neutral-500 font-semibold">{cat.number}</span>
                    <h2 className="text-lg font-serif font-medium text-white tracking-wide">{cat.title}</h2>
                    {cat.badge && (
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-[9px] font-mono text-neutral-400 uppercase">
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  {cat.subtitle && (
                    <p className="text-xs text-neutral-400 font-mono">{cat.subtitle}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setIsCreatingCategory(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-neutral-300 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
                  >
                    <Edit3 size={12} />
                    <span>Edit Domain</span>
                  </button>

                  <button
                    onClick={() => setDeletingCategoryId(cat.id)}
                    className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 size={13} />
                  </button>

                  <button
                    onClick={() => setEditingItem({
                      name: '',
                      category_id: cat.id,
                      version: '',
                      proficiency: 90,
                      is_core: true,
                      use_case: '',
                      docs_url: '',
                      brand_color: '#38bdf8',
                    })}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-mono text-white transition-colors cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* Items Grid */}
              {(!cat.items || cat.items.length === 0) ? (
                <div className="py-8 text-center text-neutral-500 font-mono text-xs">
                  No technologies assigned to this category yet. Click &ldquo;Add Item&rdquo; above.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cat.items.map((item) => {
                    const iconData = getIconForTech(item.name);
                    const BrandIcon = iconData.icon;
                    const brandColor = item.brand_color || iconData.color;

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-white/20 transition-all flex flex-col justify-between group space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div 
                                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
                                style={{ backgroundColor: `${brandColor}15` }}
                              >
                                <BrandIcon size={18} style={{ color: brandColor }} />
                              </div>
                              <div>
                                <h3 className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
                                  <span>{item.name}</span>
                                  {item.is_core && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8px] font-mono border border-amber-500/30">
                                      CORE
                                    </span>
                                  )}
                                </h3>
                                {item.version && (
                                  <span className="text-[10px] font-mono text-neutral-500">
                                    {item.version}
                                  </span>
                                )}
                              </div>
                            </div>

                            <span className="text-[10px] font-mono text-neutral-400">
                              {item.proficiency}%
                            </span>
                          </div>

                          {/* Proficiency Progress Bar */}
                          <div className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${item.proficiency}%`,
                                backgroundColor: brandColor 
                              }}
                            />
                          </div>

                          {item.use_case && (
                            <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                              {item.use_case}
                            </p>
                          )}
                        </div>

                        {/* Actions Footer */}
                        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
                          {item.docs_url ? (
                            <a
                              href={item.docs_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-mono text-neutral-500 hover:text-neutral-300 flex items-center gap-1 transition-colors"
                            >
                              <span>Docs</span>
                              <ExternalLink size={10} />
                            </a>
                          ) : <span />}

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
                              title="Edit Tech"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => setDeletingItemId(item.id)}
                              className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Delete Tech"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          MODAL 1: ADD / EDIT TECHNOLOGY
         ======================================================== */}
      <AdminModal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={editingItem?.id ? 'Edit Technology' : 'Add Technology'}
        subtitle="Saved directly to PostgreSQL tech_items"
        maxWidth="max-w-xl"
      >
        {editingItem && (
          <form onSubmit={handleSaveItem} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Technology Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="e.g. Next.js, PostgreSQL, Docker"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Architectural Category Domain *
                </label>
                <select
                  required
                  value={editingItem.category_id || categories[0]?.id || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, category_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0e14] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white font-mono"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Version
                </label>
                <input
                  type="text"
                  value={editingItem.version || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, version: e.target.value })}
                  placeholder="e.g. v16.0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Proficiency ({editingItem.proficiency ?? 90}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editingItem.proficiency ?? 90}
                  onChange={(e) => setEditingItem({ ...editingItem, proficiency: Number(e.target.value) })}
                  className="w-full accent-white cursor-pointer mt-2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Brand Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editingItem.brand_color || '#38bdf8'}
                    onChange={(e) => setEditingItem({ ...editingItem, brand_color: e.target.value })}
                    className="w-8 h-8 rounded-lg bg-transparent border border-white/20 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingItem.brand_color || '#38bdf8'}
                    onChange={(e) => setEditingItem({ ...editingItem, brand_color: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Production Use Case
              </label>
              <textarea
                rows={2}
                value={editingItem.use_case || ''}
                onChange={(e) => setEditingItem({ ...editingItem, use_case: e.target.value })}
                placeholder="Where and how you leverage this technology in production..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Documentation URL
              </label>
              <input
                type="url"
                value={editingItem.docs_url || ''}
                onChange={(e) => setEditingItem({ ...editingItem, docs_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="is-core-checkbox"
                checked={Boolean(editingItem.is_core)}
                onChange={(e) => setEditingItem({ ...editingItem, is_core: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-emerald-500 cursor-pointer"
              />
              <label htmlFor="is-core-checkbox" className="text-xs text-neutral-300 font-medium cursor-pointer">
                Mark as Core Production Tool (Highlights with CORE badge)
              </label>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-tight transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>Save Technology</span>
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* ========================================================
          MODAL 2: ADD / EDIT CATEGORY
         ======================================================== */}
      <AdminModal
        isOpen={Boolean(editingCategory)}
        onClose={() => setEditingCategory(null)}
        title={editingCategory?.id ? 'Edit Architectural Category' : 'Create New Category Domain'}
        subtitle="Dynamically synchronized with Neon PostgreSQL tech_categories"
        maxWidth="max-w-xl"
      >
        {editingCategory && (
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Category Title *
              </label>
              <input
                type="text"
                required
                value={editingCategory.title || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, title: e.target.value })}
                placeholder="e.g. AI & Machine Learning, Mobile & Embedded"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
              />
              <span className="text-[10px] font-mono text-neutral-500 block">
                Recommended 2-4 words (e.g. &ldquo;Frontend Architecture&rdquo;, &ldquo;Backend &amp; APIs&rdquo;)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={editingCategory.subtitle || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, subtitle: e.target.value })}
                  placeholder="e.g. LLMs, Vector Stores & Autonomous Agents"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Badge / Eyebrow Tag
                </label>
                <input
                  type="text"
                  value={editingCategory.badge || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, badge: e.target.value })}
                  placeholder="e.g. NEURAL ENGINES"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Architectural Philosophy
              </label>
              <textarea
                rows={2}
                value={editingCategory.philosophy || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, philosophy: e.target.value })}
                placeholder="Core architectural principle for this domain..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Detailed Description
              </label>
              <textarea
                rows={2}
                value={editingCategory.description || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                placeholder="Overview of engineering practices in this category..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono resize-none"
              />
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-tight transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>{editingCategory.id ? 'Save Changes' : 'Create Category'}</span>
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Delete Item Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingItemId)}
        title="Delete Technology?"
        description="Are you sure you want to remove this technology from PostgreSQL? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isPending}
        onConfirm={confirmDeleteItem}
        onClose={() => setDeletingItemId(null)}
      />

      {/* Delete Category Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingCategoryId)}
        title="Delete Architectural Category?"
        description="Deleting this category will permanently remove it from Neon PostgreSQL. Technologies under this category will also be removed."
        confirmText="Delete Category"
        confirmVariant="danger"
        isLoading={isPending}
        onConfirm={confirmDeleteCategory}
        onClose={() => setDeletingCategoryId(null)}
      />

    </div>
  );
}
