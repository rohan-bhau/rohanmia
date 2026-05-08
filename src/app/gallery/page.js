'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import Tooltip from '@/components/shared/Tooltip';

import { getGalleryImages } from '@/actions/gallery';

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchImages();
    return () => setMounted(false);
  }, []);

  const fetchImages = async () => {
    const data = await getGalleryImages();
    setImages(data);
    setLoading(false);
  };

  // Prevent scroll and hide other UI when lightbox is open
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectedIndex(null);
    };

    if (selectedIndex !== null) {
      document.documentElement.classList.add('lightbox-open');
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    } else {
      document.documentElement.classList.remove('lightbox-open');
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.documentElement.classList.remove('lightbox-open');
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [selectedIndex]);

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (loading && images.length === 0) {
    return (
      <div className="pt-40 flex flex-col items-center justify-center min-h-[60vh] gap-4 opacity-20">
        <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Chronicles...</p>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-20 px-6 bg-background transition-colors duration-500 min-h-screen">
      <style jsx global>{`
        .lightbox-open .chatbot-container,
        .lightbox-open .floating-controls-container,
        .lightbox-open [class*="AruAssistant"],
        .lightbox-open [class*="ChatBox"],
        .lightbox-open [class*="FloatingControls"] {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
      
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col items-center mb-24 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-primary/30" />
            <Camera className="text-primary animate-pulse" size={24} />
            <div className="h-px w-12 bg-primary/30" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl lg:text-8xl font-black text-foreground tracking-tighter uppercase italic text-center"
          >
            Visual <span className="text-glow text-primary">Chronicles</span>
          </motion.h1>
          <p className="text-muted-foreground text-lg italic font-medium opacity-80 text-center max-w-2xl">
            "A technical peek into the workspace, setups, and creative architecture behind the code."
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {images.map((img, i) => (
            <motion.div
              key={img._id || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -12 }}
              className="group relative cursor-pointer"
              onClick={() => setSelectedIndex(i)}
            >
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-card border border-border p-3 transition-all duration-700 hover:border-primary/40 hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                <div className="relative w-full h-full rounded-[2rem] overflow-hidden">
                  <Image 
                    src={img.src} 
                    alt={img.title} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  {/* Overlay Content */}
                  <div className="absolute bottom-8 left-8 right-8 translate-y-10 group-hover:translate-y-0 transition-transform duration-700">
                    <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-2">{img.category}</p>
                    <h3 className="text-foreground font-black text-2xl tracking-tight uppercase italic">{img.title}</h3>
                  </div>
                  
                  {/* Zoom Icon */}
                  <div className="absolute top-8 right-8 w-12 h-12 rounded-2xl glass border border-white/10 flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:rotate-12">
                    <Tooltip text="Expand Image" position="left">
                      <Maximize2 size={20} />
                    </Tooltip>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {images.length === 0 && !loading && (
            <div className="col-span-full h-64 flex items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] text-white/10 font-black uppercase tracking-[0.5em] italic">
              No Visual Chronicles cataloged yet.
            </div>
          )}
        </div>
      </div>

      {/* Portal Lightbox */}
      {mounted && createPortal(
        <AnimatePresence>
          {selectedIndex !== null && images[selectedIndex] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[2000000] gallery-lightbox flex items-center justify-center bg-black overflow-hidden"
              style={{ touchAction: 'none' }}
              onClick={() => setSelectedIndex(null)}
            >
              {/* Close Button - Master Level Priority */}
              <div className="fixed top-6 right-6 md:top-10 md:right-10 z-[2000002]">
                <Tooltip text="Exit View" position="bottom">
                  <div 
                    className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all active:scale-90 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex(null);
                    }}
                  >
                    <X size={32} />
                  </div>
                </Tooltip>
              </div>

              {/* Navigation - Prev */}
              <div className="fixed left-4 md:left-10 z-[2000001]">
                <Tooltip text="Previous" position="right">
                  <div 
                    className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white hover:text-primary transition-all active:scale-90 cursor-pointer"
                    onClick={handlePrev}
                  >
                    <ChevronLeft size={40} />
                  </div>
                </Tooltip>
              </div>

              {/* Navigation - Next */}
              <div className="fixed right-4 md:right-10 z-[2000001]">
                <Tooltip text="Next" position="left">
                  <div 
                    className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white hover:text-primary transition-all active:scale-90 cursor-pointer"
                    onClick={handleNext}
                  >
                    <ChevronRight size={40} />
                  </div>
                </Tooltip>
              </div>

              {/* Main Image View */}
              <motion.div
                key={selectedIndex}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative max-w-[95vw] max-h-[85vh] w-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Image 
                  src={images[selectedIndex].src} 
                  alt={images[selectedIndex].title} 
                  width={1920}
                  height={1080}
                  className="max-w-full max-h-[85vh] object-contain shadow-[0_50px_100px_rgba(0,0,0,0.9)]" 
                  priority
                />

                {/* Info Overlay in Lightbox */}
                <div className="absolute -bottom-20 left-0 right-0 text-center space-y-1">
                  <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">{images[selectedIndex].category}</p>
                  <h3 className="text-white font-black text-2xl tracking-tighter uppercase italic">{images[selectedIndex].title}</h3>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
