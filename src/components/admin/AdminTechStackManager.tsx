'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Loader2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  Code2
} from 'lucide-react';
import { 
  saveAdminTechItem, 
  removeAdminTechItem, 
  reorderAdminTechItems,
  createAdminTechCategory,
  updateAdminTechCategory,
  removeAdminTechCategory,
  reorderAdminTechCategories,
  getAvailableTechSuggestions,
  TechSuggestion
} from '@/actions/adminStack';
import { DbTechCategoryRow } from '@/lib/db/stack';
import { useToast } from '@/components/admin/ui/Toast';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import AdminModal from '@/components/admin/ui/AdminModal';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { getIconForTech } from '@/components/ui/TechBadge';

// Custom Architectural Category SVGs matching public design
const FrontendIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2.5" y="3" width="19" height="14.5" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="5.5" cy="5.75" r="0.8" fill="currentColor" />
    <circle cx="8" cy="5.75" r="0.8" fill="currentColor" />
    <circle cx="10.5" cy="5.75" r="0.8" fill="currentColor" />
    <path d="M2.5 8H21.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
    <rect x="5" y="10.5" width="6" height="4.5" rx="1.2" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1" />
    <path d="M13.5 10.5H19M13.5 13H17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M8.5 21H15.5M12 17.5V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const BackendIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="3" width="18" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="6.5" cy="6" r="1" fill="currentColor" />
    <circle cx="9.5" cy="6" r="1" fill="currentColor" />
    <path d="M14.5 6H18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <rect x="3" y="15" width="18" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="6.5" cy="18" r="1" fill="currentColor" />
    <circle cx="9.5" cy="18" r="1" fill="currentColor" />
    <path d="M14.5 18H18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M8 9V15M16 9V15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 12H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const DatabaseIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <ellipse cx="12" cy="5" rx="8" ry="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.25" />
    <path d="M4 5V12C4 13.65 7.58 15 12 15C16.42 15 20 13.65 20 12V5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 12V19C4 20.65 7.58 22 12 22C16.42 22 20 20.65 20 19V12" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="9.5" r="1" fill="currentColor" />
    <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    <path d="M14.5 9.5H17M14.5 16.5H17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const DevOpsIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2.5L20 7.2V16.8L12 21.5L4 16.8V7.2L12 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M12 21.5V12" stroke="currentColor" strokeWidth="1.5" />
    <path d="M20 7.2L12 12L4 7.2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="2.5" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.2" />
    <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1" strokeDasharray="2.5 2.5" transform="rotate(-30 12 12)" opacity="0.65" />
    <circle cx="19.5" cy="7.5" r="1.2" fill="currentColor" />
  </svg>
);

const WorkflowIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2.5" y="3.5" width="19" height="15" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2.5 8H21.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
    <circle cx="5.5" cy="5.75" r="0.75" fill="currentColor" />
    <circle cx="8" cy="5.75" r="0.75" fill="currentColor" />
    <path d="M6 11.5L8.5 13.5L6 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 15.5H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8.5 20.5H15.5M12 18.5V20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  'Frontend Architecture': FrontendIcon,
  'Backend & APIs': BackendIcon,
  'Data Persistence & Storage': DatabaseIcon,
  'DevOps & Global Infrastructure': DevOpsIcon,
  'Development Workflow & Hardware': WorkflowIcon
};

interface AdminTechStackManagerProps {
  initialCategories: DbTechCategoryRow[];
}

export default function AdminTechStackManager({ initialCategories }: AdminTechStackManagerProps) {
  const { currentTheme } = useThemeAccent();
  const { showToast } = useToast();

  // Instantaneous 0ms initial state (pre-rendered from server)
  const [categories, setCategories] = useState<DbTechCategoryRow[]>(initialCategories);

  // Suggestions for single-input autocomplete
  const [allSuggestions, setAllSuggestions] = useState<TechSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Tech Item Modal State
  const [editingItem, setEditingItem] = useState<{
    id?: string;
    name: string;
    category_id: string;
    docs_url?: string;
    brand_color?: string;
  } | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Drag and drop state for Tech items inside a category
  const [draggedTechInfo, setDraggedTechInfo] = useState<{ catId: string; itemIdx: number } | null>(null);
  const [dragOverTechInfo, setDragOverTechInfo] = useState<{ catId: string; itemIdx: number } | null>(null);

  // Category Modal State
  const [editingCategory, setEditingCategory] = useState<Partial<DbTechCategoryRow> | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  // Load suggestions in background without blocking render
  useEffect(() => {
    getAvailableTechSuggestions().then((sugg) => {
      setAllSuggestions(sugg || []);
    });
  }, []);

  // Filtered suggestions based on user input
  const filteredSuggestions = useMemo(() => {
    if (!editingItem?.name?.trim()) return [];
    const q = editingItem.name.toLowerCase().trim();
    return allSuggestions
      .filter(s => s.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [editingItem?.name, allSuggestions]);

  // Save Tech Item (Optimistic 0ms update)
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name?.trim() || !editingItem?.category_id) {
      showToast('Name and Category are required.', 'error');
      return;
    }

    const selectedCat = categories.find(c => c.id === editingItem.category_id);
    const iconData = getIconForTech(editingItem.name.trim());
    const brandColor = editingItem.brand_color || iconData.color || '#38bdf8';
    const itemId = editingItem.id || `tech_${Date.now()}`;

    const newItemData = {
      id: itemId,
      category_id: editingItem.category_id,
      category_name: selectedCat?.title || '',
      name: editingItem.name.trim(),
      version: '',
      description: '',
      proficiency: 95,
      is_core: true,
      use_case: '',
      production_project: '',
      docs_url: editingItem.docs_url?.trim() || '',
      brand_color: brandColor,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 0ms Optimistic UI update
    setCategories(prev => prev.map(c => {
      if (c.id === editingItem.category_id) {
        const existingIdx = (c.items || []).findIndex(i => i.id === editingItem.id);
        let updatedItems;
        if (existingIdx !== -1) {
          updatedItems = [...(c.items || [])];
          updatedItems[existingIdx] = { ...updatedItems[existingIdx], ...newItemData };
        } else {
          updatedItems = [...(c.items || []), newItemData];
        }
        return { ...c, items: updatedItems };
      }
      return c;
    }));

    showToast(editingItem.id ? 'Technology updated.' : 'Technology added.', 'success');
    setEditingItem(null);

    // Save in background
    startTransition(async () => {
      const res = await saveAdminTechItem({
        id: itemId,
        name: newItemData.name,
        category_id: newItemData.category_id,
        category_name: newItemData.category_name,
        docs_url: newItemData.docs_url,
        brand_color: newItemData.brand_color,
      });
      if (!res.success) {
        showToast(res.error || 'Failed to persist in database', 'error');
      }
    });
  };

  // Delete Tech Item (Optimistic 0ms update)
  const confirmDeleteItem = async () => {
    if (!deletingItemId) return;
    const targetId = deletingItemId;
    setDeletingItemId(null);

    // Optimistic UI removal
    setCategories(prev => prev.map(c => ({
      ...c,
      items: (c.items || []).filter(i => i.id !== targetId)
    })));
    showToast('Technology deleted.', 'success');

    startTransition(async () => {
      const res = await removeAdminTechItem(targetId);
      if (!res.success) {
        showToast(res.error || 'Failed to delete from database', 'error');
      }
    });
  };

  // Move Tech Item Prev/Next (Optimistic 0ms order change)
  const handleMoveTechItem = async (catId: string, itemId: string, direction: 'prev' | 'next') => {
    const cat = categories.find(c => c.id === catId);
    if (!cat || !cat.items) return;

    const items = [...cat.items];
    const curIdx = items.findIndex(i => i.id === itemId);
    if (curIdx === -1) return;

    const targetIdx = direction === 'prev' ? curIdx - 1 : curIdx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const [moved] = items.splice(curIdx, 1);
    items.splice(targetIdx, 0, moved);

    // 0ms Optimistic UI update
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, items } : c));

    const ids = items.map(i => i.id);
    startTransition(async () => {
      await reorderAdminTechItems(ids);
    });
  };

  // Drag and Drop Tech Item inside category (Optimistic 0ms)
  const handleDropTechItem = async (catId: string, dropIdx: number) => {
    if (!draggedTechInfo || draggedTechInfo.catId !== catId || draggedTechInfo.itemIdx === dropIdx) {
      setDraggedTechInfo(null);
      setDragOverTechInfo(null);
      return;
    }

    const cat = categories.find(c => c.id === catId);
    if (!cat || !cat.items) return;

    const items = [...cat.items];
    const [moved] = items.splice(draggedTechInfo.itemIdx, 1);
    items.splice(dropIdx, 0, moved);

    // 0ms Instant update
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, items } : c));
    setDraggedTechInfo(null);
    setDragOverTechInfo(null);

    const ids = items.map(i => i.id);
    startTransition(async () => {
      await reorderAdminTechItems(ids);
    });
  };

  // Save Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.title?.trim()) {
      showToast('Category title is required.', 'error');
      return;
    }

    const title = editingCategory.title.trim();
    const subtitle = editingCategory.subtitle?.trim() || '';
    const isEdit = Boolean(editingCategory.id);
    const catId = editingCategory.id || `cat-${Date.now()}`;

    // Optimistic UI update
    if (isEdit) {
      setCategories(prev => prev.map(c => c.id === catId ? { ...c, title, subtitle } : c));
    } else {
      const nextNum = String(categories.length + 1).padStart(2, '0');
      setCategories(prev => [...prev, {
        id: catId,
        number: nextNum,
        title,
        subtitle,
        description: '',
        philosophy: '',
        badge: '',
        sort_order: categories.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: [],
      }]);
    }

    showToast(isEdit ? 'Category updated.' : 'New category added at the end.', 'success');
    setEditingCategory(null);

    startTransition(async () => {
      if (isEdit) {
        await updateAdminTechCategory({ id: catId, title, subtitle });
      } else {
        await createAdminTechCategory({ id: catId, title, subtitle });
      }
    });
  };

  // Delete Category
  const confirmDeleteCategory = async () => {
    if (!deletingCategoryId) return;
    const targetId = deletingCategoryId;
    setDeletingCategoryId(null);

    setCategories(prev => prev.filter(c => c.id !== targetId));
    showToast('Category deleted from PostgreSQL.', 'success');

    startTransition(async () => {
      await removeAdminTechCategory(targetId);
    });
  };

  // Move Category Up or Down (0ms Instant sequence update: 01, 02, 03... strictly preserved!)
  const handleMoveCategory = async (catId: string, direction: 'up' | 'down') => {
    const curIdx = categories.findIndex(c => c.id === catId);
    if (curIdx === -1) return;
    const targetIdx = direction === 'up' ? curIdx - 1 : curIdx + 1;
    if (targetIdx < 0 || targetIdx >= categories.length) return;

    const reordered = [...categories];
    const [moved] = reordered.splice(curIdx, 1);
    reordered.splice(targetIdx, 0, moved);

    // Re-assign strict sequential numbers 01, 02, 03...
    const updatedWithNumbers = reordered.map((c, i) => ({
      ...c,
      number: String(i + 1).padStart(2, '0'),
      sort_order: i + 1,
    }));

    // 0ms Instant UI update
    setCategories(updatedWithNumbers);

    const ids = updatedWithNumbers.map(c => c.id);
    startTransition(async () => {
      await reorderAdminTechCategories(ids);
    });
  };

  return (
    <div className="min-h-screen pt-4 sm:pt-6 pb-20 px-4 sm:px-6 relative bg-[#07090e]">
      
      {/* Background radial ambient lights */}
      <div 
        aria-hidden="true"
        className="absolute top-10 right-1/4 w-[450px] h-[450px] rounded-full blur-[180px] opacity-10 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: currentTheme.primary }}
      />
      <div 
        aria-hidden="true"
        className="absolute top-1/2 -left-36 w-[400px] h-[400px] rounded-full blur-[170px] opacity-10 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: currentTheme.primary }}
      />

      <div className="container mx-auto max-w-6xl space-y-14 relative z-10">
        
        {/* =========================================================================
            HEADER (Clean, No extra badge pills, Smaller Title, Right-Side Buttons)
           ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-white tracking-tight leading-snug">
              The tools, engines &amp;{' '}
              <span 
                className="font-serif italic font-normal text-transparent bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(135deg, #ffffff 15%, ${currentTheme.primary} 85%)`
                }}
              >
                architectural systems
              </span>{' '}
              powering my work.
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
              Curated production technologies and toolchains. Add or reorder categories while preserving strict sequence.
            </p>
          </div>

          {/* Right-Side Action Buttons: Add Category & Add Tech Stack */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto flex-wrap">
            <button
              onClick={() => setEditingCategory({
                title: '',
                subtitle: '',
              })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-white border border-white/[0.1] transition-all cursor-pointer shadow-sm"
            >
              <FolderPlus size={14} />
              <span>+ Add Category</span>
            </button>

            <button
              onClick={() => {
                setEditingItem({
                  name: '',
                  category_id: categories[0]?.id || '',
                  docs_url: '',
                  brand_color: '',
                });
                setShowSuggestions(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs font-mono tracking-tight transition-all shadow-md cursor-pointer"
            >
              <Plus size={14} />
              <span>+ Add Tech Stack</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            CATEGORIES LIST (Exact Surface Canvas Visuals + Hover Edit/Remove & Reorder)
           ========================================================================= */}
        <div className="space-y-16">
          {categories.map((category, catIdx) => {
            const CategoryIcon = CATEGORY_ICONS[category.title] || Code2;
            const items = category.items || [];
            const seqNumber = String(catIdx + 1).padStart(2, '0');

            return (
              <div 
                key={category.id || category.title} 
                id={(category.title || '').toLowerCase().replace(/\s+/g, '-')}
                className="flex flex-col lg:flex-row items-stretch border-t border-white/[0.08] pt-10 pb-10 group/cat"
              >
                
                {/* LEFT COLUMN: Fixed Sequence Number, Title & Category Reorder Controls */}
                <div className="lg:w-[360px] xl:w-[390px] shrink-0 lg:pr-8 xl:pr-10">
                  <div className="sticky top-20 sm:top-24 space-y-3">
                    
                    {/* Top Row: Sequential Number + Up/Down Order Arrows + Edit Category */}
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs sm:text-sm font-semibold text-zinc-500 tracking-wider block">
                        {seqNumber}
                      </span>

                      {/* Category Order Arrows & Actions */}
                      <div className="flex items-center gap-1 bg-white/[0.03] p-0.5 rounded-xl border border-white/[0.06]">
                        <button
                          type="button"
                          disabled={catIdx === 0}
                          onClick={() => handleMoveCategory(category.id, 'up')}
                          className="p-1 rounded-lg text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          title="Move Category Up"
                        >
                          <ChevronUp size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={catIdx === categories.length - 1}
                          onClick={() => handleMoveCategory(category.id, 'down')}
                          className="p-1 rounded-lg text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          title="Move Category Down"
                        >
                          <ChevronDown size={13} />
                        </button>

                        <div className="w-px h-3 bg-white/10 mx-0.5" />

                        <button
                          type="button"
                          onClick={() => setEditingCategory(category)}
                          className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          title="Edit Category Name"
                        >
                          <Edit3 size={11} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingCategoryId(category.id)}
                          className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Category Icon & Title */}
                    <div className="flex items-start gap-3.5">
                      <div 
                        className="size-10 sm:size-11 rounded-2xl flex items-center justify-center border shrink-0 mt-0.5 transition-transform duration-300"
                        style={{
                          backgroundColor: `${currentTheme.primary}12`,
                          borderColor: `${currentTheme.primary}25`,
                          color: currentTheme.primary,
                          boxShadow: `0 4px 20px ${currentTheme.primary}15, inset 0 1px 0 rgba(255,255,255,0.08)`
                        }}
                      >
                        <CategoryIcon size={21} />
                      </div>

                      <div>
                        <h2 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-tight leading-[1.18] line-clamp-2">
                          {category.title}
                        </h2>
                        {category.subtitle && (
                          <p className="text-[11px] font-mono text-zinc-400 pt-1 leading-snug">
                            {category.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick Add Tech to this Category */}
                    <button
                      onClick={() => {
                        setEditingItem({
                          name: '',
                          category_id: category.id,
                          docs_url: '',
                          brand_color: '',
                        });
                        setShowSuggestions(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-[11px] font-mono text-neutral-400 hover:text-white border border-white/[0.06] transition-colors cursor-pointer"
                    >
                      <Plus size={11} />
                      <span>Add tech here</span>
                    </button>

                  </div>
                </div>

                {/* MIDDLE DIVIDER */}
                <div aria-hidden="true" className="hidden lg:block w-[1px] border-r border-dashed border-white/10 shrink-0 self-stretch" />

                {/* RIGHT COLUMN: Floating Tech Cards with Hand Grab Cursor & Hover Controls */}
                <div className="flex-1 lg:pl-8 xl:pl-10 mt-8 lg:mt-0">
                  {items.length === 0 ? (
                    <div className="py-12 text-center rounded-2xl border border-dashed border-white/10 text-xs font-mono text-neutral-500">
                      No technologies in this category yet. Click &ldquo;Add tech here&rdquo; to add.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      {items.map((item, itemIdx) => {
                        const iconData = getIconForTech(item.name);
                        const BrandIcon = iconData.icon;
                        const iconColor = item.brand_color || iconData.color;

                        const isOver = dragOverTechInfo?.catId === category.id && dragOverTechInfo?.itemIdx === itemIdx;

                        return (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={() => setDraggedTechInfo({ catId: category.id, itemIdx })}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDragOverTechInfo({ catId: category.id, itemIdx });
                            }}
                            onDrop={() => handleDropTechItem(category.id, itemIdx)}
                            className={`group relative p-6 rounded-2xl transition-all duration-300 ease-out flex flex-col items-center justify-center text-center min-h-[130px] sm:min-h-[145px] select-none cursor-grab active:cursor-grabbing ${
                              isOver
                                ? 'bg-[#121622] border-2 border-indigo-400 scale-[1.02]'
                                : 'bg-transparent border border-transparent hover:bg-[#0d1017]/90 hover:border-white/15 hover:backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.75)]'
                            }`}
                          >
                            {/* Ambient Brand Color Radial Glow */}
                            <div 
                              aria-hidden="true"
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                              style={{
                                background: `radial-gradient(circle at 50% 45%, ${iconColor}22 0%, transparent 70%)`
                              }}
                            />

                            {/* Hairline Glass Highlight Line */}
                            <div 
                              aria-hidden="true"
                              className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                            />

                            {/* HOVER CONTROLS (Top Right: Move Prev, Next, Edit, Remove) */}
                            <div className="absolute top-2 right-2 z-30 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {/* Order Prev / Next Buttons */}
                              <div className="flex items-center bg-black/85 rounded-lg border border-white/15 p-0.5 shadow-md">
                                <button
                                  type="button"
                                  disabled={itemIdx === 0}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleMoveTechItem(category.id, item.id, 'prev');
                                  }}
                                  className="p-1 rounded text-neutral-300 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                                  title="Move Left"
                                >
                                  <ChevronLeft size={11} />
                                </button>
                                <button
                                  type="button"
                                  disabled={itemIdx === items.length - 1}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleMoveTechItem(category.id, item.id, 'next');
                                  }}
                                  className="p-1 rounded text-neutral-300 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                                  title="Move Right"
                                >
                                  <ChevronRight size={11} />
                                </button>
                              </div>

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingItem({
                                    id: item.id,
                                    name: item.name,
                                    category_id: item.category_id,
                                    docs_url: item.docs_url,
                                    brand_color: item.brand_color,
                                  });
                                  setShowSuggestions(false);
                                }}
                                className="p-1.5 rounded-lg bg-black/85 hover:bg-white text-neutral-300 hover:text-black border border-white/20 shadow-md transition-all cursor-pointer"
                                title={`Edit ${item.name}`}
                              >
                                <Edit3 size={11} />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDeletingItemId(item.id);
                                }}
                                className="p-1.5 rounded-lg bg-black/85 hover:bg-rose-500 text-neutral-300 hover:text-white border border-white/20 shadow-md transition-all cursor-pointer"
                                title={`Delete ${item.name}`}
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>

                            {/* CENTERED: Free-Floating Brand SVG Icon */}
                            <div className="relative z-10 mb-3 flex items-center justify-center">
                              <BrandIcon 
                                size={40} 
                                style={{ color: iconColor }}
                                className="transition-all duration-400 ease-out group-hover:scale-115 group-hover:-translate-y-1 group-hover:drop-shadow-[0_6px_20px_rgba(255,255,255,0.25)]"
                              />
                              <div 
                                className="absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-400 pointer-events-none"
                                style={{ backgroundColor: iconColor }}
                              />
                            </div>

                            {/* CENTERED: Tech Name */}
                            <div className="relative z-10 text-center max-w-full px-1">
                              <h3 className="text-sm sm:text-base font-medium text-zinc-300 group-hover:text-white transition-colors tracking-tight truncate">
                                {item.name}
                              </h3>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* =========================================================================
          MODAL 1: ADD / EDIT TECH STACK ITEM
          (Single input for name with inline suggestions. Hidden scrollbars!)
         ========================================================================= */}
      <AdminModal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={editingItem?.id ? 'Edit Technology' : 'Add Tech Stack Card'}
        subtitle="Only the card name, category, and link are required."
        maxWidth="max-w-md"
      >
        {editingItem && (
          <form onSubmit={handleSaveItem} className="space-y-4">
            
            {/* Tech Name with Single Input & Hidden Scrollbar Suggestions Dropdown */}
            <div className="space-y-1.5 relative">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Technology Name *
              </label>
              <input
                type="text"
                required
                autoFocus
                value={editingItem.name}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  const val = e.target.value;
                  const iconData = getIconForTech(val);
                  setEditingItem({
                    ...editingItem,
                    name: val,
                    brand_color: iconData.color || editingItem.brand_color || '#38bdf8'
                  });
                  setShowSuggestions(true);
                }}
                placeholder="Type tech name (e.g. Next.js, PostgreSQL, Docker)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
              />

              {/* Suggestions List Dropdown (Scrollbar strictly hidden!) */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div 
                  className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-[#0c0e14] border border-white/[0.15] shadow-2xl p-1.5 space-y-0.5 max-h-48 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  {filteredSuggestions.map((sugg, sIdx) => {
                    const iconData = getIconForTech(sugg.name);
                    const Icon = iconData.icon;
                    return (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => {
                          setEditingItem({
                            ...editingItem,
                            name: sugg.name,
                            brand_color: sugg.brand_color || iconData.color || '#38bdf8'
                          });
                          setShowSuggestions(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.08] text-xs font-mono text-white text-left transition-colors cursor-pointer"
                      >
                        <Icon size={16} style={{ color: sugg.brand_color || iconData.color }} />
                        <span className="font-medium">{sugg.name}</span>
                        {sugg.category_name && (
                          <span className="text-[10px] text-neutral-500 ml-auto">
                            {sugg.category_name}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Category Domain *
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

            {/* Documentation / Website Link */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Docs / Website Link (Optional)
              </label>
              <input
                type="url"
                value={editingItem.docs_url || ''}
                onChange={(e) => setEditingItem({ ...editingItem, docs_url: e.target.value })}
                placeholder="https://nextjs.org/docs"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
              />
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs font-mono tracking-tight transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>{editingItem.id ? 'Save Changes' : 'Add Tech Card'}</span>
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* =========================================================================
          MODAL 2: ADD / EDIT CATEGORY (Clean, zero unnecessary helper texts)
         ========================================================================= */}
      <AdminModal
        isOpen={Boolean(editingCategory)}
        onClose={() => setEditingCategory(null)}
        title={editingCategory?.id ? 'Edit Category' : 'Add New Category'}
        subtitle="Manage architectural category domains"
        maxWidth="max-w-md"
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
                autoFocus
                value={editingCategory.title || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, title: e.target.value })}
                placeholder="e.g. AI & Machine Learning, Cloud & Infrastructure"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                Subtitle (Optional)
              </label>
              <input
                type="text"
                value={editingCategory.subtitle || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, subtitle: e.target.value })}
                placeholder="e.g. LLMs, Vector Stores & Agent Frameworks"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:outline-none text-xs text-white placeholder:text-neutral-600 font-mono"
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs font-mono tracking-tight transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>{editingCategory.id ? 'Save Category' : 'Create Category'}</span>
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Delete Item Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingItemId)}
        title="Delete Technology Card?"
        description="Are you sure you want to remove this technology card from PostgreSQL?"
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isPending}
        onConfirm={confirmDeleteItem}
        onClose={() => setDeletingItemId(null)}
      />

      {/* Delete Category Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingCategoryId)}
        title="Delete Category Domain?"
        description="Deleting this category will remove it and its associated tech cards from PostgreSQL."
        confirmText="Delete Category"
        confirmVariant="danger"
        isLoading={isPending}
        onConfirm={confirmDeleteCategory}
        onClose={() => setDeletingCategoryId(null)}
      />

    </div>
  );
}
