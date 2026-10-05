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
  ArrowUpRight
} from 'lucide-react';
import { fetchAdminStack, saveAdminTechItem, removeAdminTechItem } from '@/actions/adminStack';
import { DbTechCategoryRow, DbTechItemRow } from '@/lib/db/stack';
import { useToast } from '@/components/admin/ui/Toast';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import AdminModal from '@/components/admin/ui/AdminModal';
import { useThemeAccent } from '@/components/theme/ThemeProvider';

export default function AdminTechStackPage() {
  const { currentTheme } = useThemeAccent();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<DbTechCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCatId, setSelectedCatId] = useState<string>('all');

  // Modal State
  const [editingItem, setEditingItem] = useState<Partial<DbTechItemRow> | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name?.trim() || !editingItem?.category_id) {
      showToast('Name and Category are required.', 'error');
      return;
    }

    startTransition(async () => {
      const res = await saveAdminTechItem({
        ...editingItem,
        name: editingItem.name!.trim(),
        category_id: editingItem.category_id!,
      });

      if (res.success) {
        showToast(editingItem.id ? 'Technology updated.' : 'Technology added.', 'success');
        setEditingItem(null);
        loadStack();
      } else {
        showToast(res.error || 'Failed to save technology', 'error');
      }
    });
  };

  // Handle Delete
  const confirmDelete = async () => {
    if (!deletingId) return;
    startTransition(async () => {
      const res = await removeAdminTechItem(deletingId);
      if (res.success) {
        showToast('Technology deleted.', 'success');
        loadStack();
      } else {
        showToast(res.error || 'Failed to delete technology', 'error');
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
            {allItems.length} skill(s) across {categories.length} architectural category domains
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tech-stack"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-neutral-300 hover:text-white border border-white/[0.08] transition-colors"
          >
            <span>Public View</span>
            <ArrowUpRight size={12} />
          </Link>

          <button
            onClick={() => setEditingItem({
              name: '',
              category_id: categories[0]?.id || 'frontend',
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
            <span>Add Skill</span>
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
          className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
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
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
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
            <div key={cat.id} className="space-y-4">
              
              {/* Category Domain Banner */}
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-semibold" style={{ color: currentTheme.primary }}>
                    {cat.number}
                  </span>
                  <h2 className="text-base font-semibold text-white tracking-tight">
                    {cat.title}
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-neutral-500">
                  {cat.items?.length || 0} technologies
                </span>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {(cat.items || []).map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-[#0c0e14]/75 border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between group space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.brand_color || '#38bdf8' }}
                          />
                          <h3 className="text-sm font-semibold text-white tracking-tight">
                            {item.name}
                          </h3>
                        </div>

                        {item.version && (
                          <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] font-mono text-neutral-400 border border-white/[0.06]">
                            v{item.version}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {item.use_case || item.description || 'Core technology skill.'}
                      </p>
                    </div>

                    {/* Proficiency bar & actions */}
                    <div className="space-y-3 pt-3 border-t border-white/[0.04]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                          <span>Proficiency</span>
                          <span>{item.proficiency || 90}%</span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${item.proficiency || 90}%`,
                              backgroundColor: item.brand_color || '#38bdf8'
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        {item.docs_url ? (
                          <Link
                            href={item.docs_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-mono text-neutral-500 hover:text-white flex items-center gap-1 transition-colors"
                          >
                            <span>Docs</span>
                            <ExternalLink size={10} />
                          </Link>
                        ) : (
                          <span className="text-[10px] font-mono text-neutral-600">Core</span>
                        )}

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => setDeletingId(item.id)}
                            className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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

            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      <AdminModal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={editingItem?.id ? 'Edit Technology' : 'Add Technology'}
        subtitle="Update database radar entries"
        maxWidth="max-w-lg"
      >
        {editingItem && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="e.g. Next.js 16"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Category Domain *
                </label>
                <select
                  value={editingItem.category_id || categories[0]?.id || 'frontend'}
                  onChange={(e) => setEditingItem({ ...editingItem, category_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0e14] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white font-mono"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Version
                </label>
                <input
                  type="text"
                  value={editingItem.version || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, version: e.target.value })}
                  placeholder="e.g. 16.2"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Proficiency % ({editingItem.proficiency || 90}%)
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={editingItem.proficiency || 90}
                  onChange={(e) => setEditingItem({ ...editingItem, proficiency: Number(e.target.value) })}
                  className="w-full accent-emerald-500 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Brand Color Hex
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editingItem.brand_color || '#38bdf8'}
                    onChange={(e) => setEditingItem({ ...editingItem, brand_color: e.target.value })}
                    className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingItem.brand_color || '#38bdf8'}
                    onChange={(e) => setEditingItem({ ...editingItem, brand_color: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                  Docs / Official URL
                </label>
                <input
                  type="url"
                  value={editingItem.docs_url || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, docs_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Use Case & Production Implementation
              </label>
              <textarea
                rows={2}
                value={editingItem.use_case || ''}
                onChange={(e) => setEditingItem({ ...editingItem, use_case: e.target.value })}
                placeholder="Primary full-stack application foundation..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono resize-none"
              />
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
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
                <span>Save Technology</span>
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Delete Technology?"
        description="Are you sure you want to remove this technology from your radar? This deletes it permanently from the PostgreSQL database."
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeletingId(null)}
      />

    </div>
  );
}
