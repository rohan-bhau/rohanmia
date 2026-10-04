'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  SlidersHorizontal
} from 'lucide-react';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { getGalleryImages } from '@/actions/gallery';

interface GalleryItem {
  _id?: string;
  id?: string;
  src: string;
  title: string;
  category: string;
  caption?: string;
  date?: string;
  position?: 'top' | 'center' | 'bottom' | string;
}

// Single, clean, meaningful categories (No '&', no 'workspace')
export const GALLERY_CATEGORIES = [
  'All',
  'Personal',
  'Travel',
  'Work',
  'Moments'
] as const;

// Auto-normalizer for database items mapping cleanly to single categories
function normalizeCategory(rawCat?: string, title?: string): 'Personal' | 'Travel' | 'Work' | 'Moments' {
  const text = `${rawCat || ''} ${title || ''}`.toLowerCase();
  if (
    text.includes('travel') || 
    text.includes('gonobhobon') || 
    text.includes('tour') || 
    text.includes('trip') || 
    text.includes('outdoor')
  ) {
    return 'Travel';
  }
  if (
    text.includes('work') || 
    text.includes('desk') || 
    text.includes('code') || 
    text.includes('dev') || 
    text.includes('setup') || 
    text.includes('gear') || 
    text.includes('hardware')
  ) {
    return 'Work';
  }
  if (
    text.includes('moment') || 
    text.includes('event') || 
    text.includes('refresh')
  ) {
    return 'Moments';
  }
  return 'Personal';
}

// REAL fallback photos ONLY (No Unsplash dummy photos!)
const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'def-1',
    src: '/images/about/hero-profile.png',
    title: 'Personal Focus & Mindset',
    category: 'Personal',
    caption: 'Continuous personal growth, focus, and quiet reflection between deep engineering sprints.',
    date: 'Autumn 2026',
    position: 'top' // Headshot aligned to top so face is never cut off
  },
  {
    id: 'def-2',
    src: '/images/about/gallery-1.jpg',
    title: 'Natore Gonobhobon Exploration',
    category: 'Travel',
    caption: 'Exploring historical heritage and open grounds at Natore Gonobhobon.',
    date: 'August 2026',
    position: 'top' // Portrait photo aligned to top
  },
  {
    id: 'def-3',
    src: '/images/about/gallery-2.jpg',
    title: 'Engineering Desk Setup',
    category: 'Work',
    caption: 'Dual-display setup configured for high-throughput Next.js development and typing ergonomics.',
    date: 'July 2026',
    position: 'center'
  },
  {
    id: 'def-4',
    src: '/images/about/gallery-3.jpg',
    title: 'Everyday Mechanical Hardware',
    category: 'Work',
    caption: 'Tactile mechanical keyboards, high-DPI mouse, and noise-cancelling tools for daily focus.',
    date: 'June 2026',
    position: 'center'
  }
];

export default function GalleryPage() {
  const { currentTheme } = useThemeAccent();
  const [items, setItems] = useState<GalleryItem[]>(DEFAULT_GALLERY_ITEMS);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch images from database: display ONLY database images (no dummy images merged)
  useEffect(() => {
    let isSubscribed = true;

    async function loadGallery() {
      try {
        const dbImages = await getGalleryImages();
        if (isSubscribed) {
          if (Array.isArray(dbImages) && dbImages.length > 0) {
            const formattedDb: GalleryItem[] = dbImages.map((img: any) => {
              const cat = normalizeCategory(img.category, img.title);
              // Auto-align portraits and personal photos to 'top' so faces are never cut off
              const autoPos = cat === 'Personal' || cat === 'Travel' ? 'top' : 'center';
              return {
                _id: img._id,
                id: img._id,
                src: img.src,
                title: img.title || 'Untitled Moment',
                category: cat,
                caption: img.caption || 'Captured during travels, engineering workflows, and personal focus.',
                date: img.createdAt ? new Date(img.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2026',
                position: img.position || autoPos
              };
            });
            // Show ONLY the user's uploaded images from database!
            setItems(formattedDb);
          } else {
            setItems(DEFAULT_GALLERY_ITEMS);
          }
        }
      } catch (err) {
        console.warn('Using curated gallery fallback:', err);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }

    loadGallery();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Categories list: Fixed clean pills (All + Single Categories)
  const categories = useMemo(() => {
    return Array.from(GALLERY_CATEGORIES);
  }, []);

  // Filter items by selected category
  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return items;
    return items.filter(
      (item) => item.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [items, activeCategory]);

  // Keyboard navigation for Lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
      }
    },
    [lightboxIndex, filteredItems.length]
  );

  // Bulletproof Page Scroll Lock (Freezes document completely when modal is open)
  useEffect(() => {
    if (lightboxIndex !== null) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [lightboxIndex, handleKeyDown]);

  const activePhoto = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div className="pt-32 md:pt-36 pb-28 px-4 sm:px-6 min-h-screen relative overflow-hidden">
      
      {/* Background ambient lighting matching project style */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute -top-36 left-1/2 -translate-x-1/2 w-[850px] h-[350px] opacity-15 blur-[140px] rounded-full pointer-events-none"
          style={{ backgroundColor: currentTheme.primary }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl space-y-12">
        
        {/* =========================================================================
            HEADER SECTION (Matches Project Title & Typography Style)
           ========================================================================= */}
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <span 
              className="text-xs font-mono uppercase tracking-widest font-semibold flex items-center gap-1.5"
              style={{ color: currentTheme.primary }}
            >
              <Camera size={13} />
              Visual Archive
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-white leading-tight">
            Moments, Setups &amp;{' '}
            <span 
              className="font-serif italic font-normal text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 20%, ${currentTheme.primary} 85%)`
              }}
            >
              Explorations
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed">
            A curated visual chronicle of personal moments, travels, engineering work, and memories.
          </p>
        </div>

        {/* =========================================================================
            CATEGORY FILTER TABS (Single Meaningful Words: All, Personal, Travel, Work, Moments)
           ========================================================================= */}
        <div className="flex items-center flex-wrap gap-2.5 pt-2 border-b border-white/[0.08] pb-6">
          {categories.map((cat) => {
            const count = cat === 'All' ? items.length : items.filter((i) => i.category.toLowerCase() === cat.toLowerCase()).length;
            const isActive = activeCategory.toLowerCase() === cat.toLowerCase();

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-white text-zinc-950 font-bold shadow-md scale-[1.02]'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-zinc-400 hover:text-white'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-zinc-200 text-zinc-950' : 'bg-white/10 text-zinc-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            ARCHITECTURAL EDITORIAL GALLERY GRID
            - Every card has identical, balanced proportions (No big/small mismatch)
            - Architectural metadata bar above each card (Index, Line, Category, Date)
            - Image is 100% clean by default (No text overlay)
            - On Hover: Smooth zoom + dark glass reveal with Title & Caption
           ========================================================================= */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-9"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => {
              const indexStr = String(index + 1).padStart(2, '0');

              return (
                <motion.article
                  layout
                  key={item._id || item.id || index}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  onClick={() => setLightboxIndex(index)}
                  className="group relative flex flex-col space-y-3 cursor-pointer"
                >
                  {/* 1. Architectural Header Bar Above Card (Matches ProjectCard.tsx) */}
                  <div className="flex items-center justify-between gap-3 px-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold text-zinc-400 tracking-wider">
                        {indexStr}
                      </span>
                      <div className="h-px w-6 bg-zinc-700/80" />
                      <span 
                        className="font-mono text-[11px] uppercase tracking-widest font-semibold"
                        style={{ color: currentTheme.primary }}
                      >
                        {item.category}
                      </span>
                    </div>

                    {item.date && (
                      <span className="shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[10px] bg-white/[0.04] border border-white/[0.08] text-zinc-400">
                        {item.date}
                      </span>
                    )}
                  </div>

                  {/* 2. Interactive Image Slab with Hover-Only Overlay */}
                  <div className="relative w-full aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0c0d12] border border-white/[0.08] group-hover:border-white/25 transition-all duration-500 shadow-xl group-hover:shadow-2xl">
                    
                    {/* Clean Photo: 100% unobstructed when not hovering */}
                    <Image
                      src={item.src}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      style={{
                        objectPosition: item.position || (item.category === 'Personal' || item.category === 'Travel' ? 'top' : 'center')
                      }}
                      loading={index < 6 ? 'eager' : 'lazy'}
                    />

                    {/* Expand icon watermark at top-right (subtle indicator) */}
                    <div className="absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105">
                      <Maximize2 size={13} />
                    </div>

                    {/* =============================================================
                        HOVER-ONLY METADATA OVERLAY (Completely invisible by default)
                       ============================================================= */}
                    <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 sm:p-6 backdrop-blur-[2px]">
                      
                      <div className="space-y-1.5 translate-y-3 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                        <h3 className="font-serif font-normal text-xl sm:text-2xl text-white tracking-tight leading-snug">
                          {item.title}
                        </h3>

                        {item.caption && (
                          <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed line-clamp-2 pt-0.5 opacity-90">
                            {item.caption}
                          </p>
                        )}
                      </div>

                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredItems.length === 0 && !isLoading && (
          <div className="py-24 text-center space-y-3 border border-dashed border-white/10 rounded-2xl p-8 max-w-md mx-auto">
            <SlidersHorizontal className="w-8 h-8 text-zinc-500 mx-auto" />
            <h3 className="text-base font-semibold text-white">No photos in this category</h3>
            <p className="text-xs text-zinc-400">
              Try selecting another category tab to view more moments.
            </p>
            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className="mt-2 text-xs font-semibold underline text-white hover:text-zinc-300"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          FULLSCREEN LIGHTBOX MODAL (RENDERED VIA PORTAL DIRECTLY TO BODY)
          - z-[999999999] so Navbar and Chatbot CANNOT appear on top of it!
          - Prominent Close Button at fixed top-6 right-6 with clear X icon
          - Document body locked via position: fixed so website CANNOT scroll
          - Adjusted max-h so Title and Caption ALWAYS fully fit on screen
         ========================================================================= */}
      {isMounted && activePhoto && lightboxIndex !== null && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 w-screen h-screen z-[999999999] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden"
          >
            {/* Prominent High-Visibility Floating Close Button (Fixed Top-Right) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(null);
              }}
              className="fixed top-5 right-5 sm:top-6 sm:right-6 z-[9999999999] w-12 h-12 rounded-full bg-zinc-900/95 hover:bg-zinc-800 active:scale-90 border border-white/25 text-white flex items-center justify-center shadow-2xl backdrop-blur-2xl transition-all hover:border-white/50 cursor-pointer"
              aria-label="Close"
            >
              <X size={22} strokeWidth={2.5} className="text-white" />
            </button>

            {/* Top Bar: Counter & Category */}
            <div 
              className="flex items-center gap-3 z-20 max-w-5xl w-full mx-auto pt-2 pl-2 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <span 
                className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 border border-white/15"
                style={{ color: currentTheme.primary }}
              >
                {activePhoto.category}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {lightboxIndex + 1} / {filteredItems.length}
              </span>
            </div>

            {/* Middle: Main Photo & Navigation Arrows */}
            {/* min-h-0 allows flex child to shrink properly without pushing bottom elements off-screen */}
            <div className="relative flex-1 flex items-center justify-center my-2 sm:my-3 w-full min-h-0">
              {/* Previous Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : filteredItems.length - 1);
                }}
                className="absolute left-2 sm:left-8 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90 cursor-pointer shadow-2xl"
                aria-label="Previous"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Active Image: Scaled to max 58vh/64vh so title & caption have plenty of vertical room */}
              <motion.div
                key={activePhoto.src}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-h-[58vh] sm:max-h-[64vh] max-w-4xl w-full h-full flex items-center justify-center p-2"
              >
                <img
                  src={activePhoto.src}
                  alt={activePhoto.title}
                  className="max-h-[58vh] sm:max-h-[64vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/15 select-none"
                />
              </motion.div>

              {/* Next Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex < filteredItems.length - 1 ? lightboxIndex + 1 : 0);
                }}
                className="absolute right-2 sm:right-8 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90 cursor-pointer shadow-2xl"
                aria-label="Next"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Bottom Bar: Title & Caption (shrink-0 ensures it is ALWAYS 100% visible on screen) */}
            <div 
              className="max-w-xl mx-auto w-full text-center space-y-1 z-20 pb-4 sm:pb-6 px-4 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg sm:text-2xl font-serif font-normal text-white tracking-tight">
                {activePhoto.title}
              </h2>
              {activePhoto.caption && (
                <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed max-w-lg mx-auto">
                  {activePhoto.caption}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
