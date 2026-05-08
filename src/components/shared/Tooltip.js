'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Tooltip({ text, children, position = "top" }) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let x = rect.left + rect.width / 2;
      let y = rect.top;

      if (position === "bottom") y = rect.bottom;
      if (position === "left") {
        x = rect.left;
        y = rect.top + rect.height / 2;
      }
      if (position === "right") {
        x = rect.right;
        y = rect.top + rect.height / 2;
      }

      setCoords({ x, y });
    }
  };

  const handleMouseEnter = () => {
    updateCoords();
    setIsVisible(true);
  };

  const positions = {
    top: "-translate-x-1/2 -translate-y-full mb-4",
    bottom: "-translate-x-1/2 mt-4",
    left: "-translate-x-full -translate-y-1/2 mr-4",
    right: "ml-4 -translate-y-1/2"
  };

  return (
    <>
      <div 
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>

      {mounted && isVisible && createPortal(
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ 
              position: 'fixed', 
              top: coords.y, 
              left: coords.x, 
              zIndex: 99999999,
              pointerEvents: 'none' 
            }}
            className={positions[position]}
          >
            <div className="relative bg-zinc-950/95 border border-white/20 px-4 py-2 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl min-w-max">
              <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap block drop-shadow-sm">
                {text}
              </span>
              <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
