'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClickBurst() {
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      // Only fire for interactive elements
      const target = e.target;
      const isInteractive = 
        target.closest('button') || 
        target.closest('a') || 
        target.closest('[role="button"]') ||
        window.getComputedStyle(target).cursor === 'pointer';

      if (!isInteractive) return;

      const id = Date.now();
      const colors = ['#a855f7', '#ec4899', '#06b6d4']; // Purple, Pink, Cyan
      
      const newBurst = {
        id,
        x: e.clientX,
        y: e.clientY,
        particles: Array.from({ length: 12 }).map((_, i) => ({
          id: i,
          angle: (i / 12) * Math.PI * 2 + (Math.random() * 0.4),
          distance: 60 + Math.random() * 80,
          size: 6 + Math.random() * 10,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 0.1,
          duration: 0.8 + Math.random() * 0.4
        }))
      };

      setBursts(prev => [...prev, newBurst]);

      setTimeout(() => {
        setBursts(prev => prev.filter(b => b.id !== id));
      }, 1500);
    };

    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {bursts.map(burst => (
          <div 
            key={burst.id} 
            className="absolute" 
            style={{ left: burst.x, top: burst.y }}
          >
            {burst.particles.map(p => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 45 }}
                animate={{ 
                  x: Math.cos(p.angle) * p.distance, 
                  y: Math.sin(p.angle) * p.distance,
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0],
                  rotate: 45 + (Math.random() * 90)
                }}
                transition={{ 
                  duration: p.duration, 
                  delay: p.delay,
                  ease: [0.16, 1, 0.3, 1] 
                }}
                className="absolute rounded-[2px]"
                style={{ 
                  width: p.size, 
                  height: p.size,
                  background: `radial-gradient(circle at center, white, ${p.color})`,
                  boxShadow: `0 0 15px ${p.color}, 0 0 30px ${p.color}44`,
                  marginLeft: -p.size/2,
                  marginTop: -p.size/2,
                  filter: 'blur(0.5px)'
                }}
              />
            ))}
            
            {/* Center Energy Pulse */}
            <motion.div
              initial={{ scale: 0, opacity: 0.8, filter: 'blur(0px)' }}
              animate={{ scale: 4, opacity: 0, filter: 'blur(20px)' }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute w-10 h-10 bg-white/30 rounded-full -ml-5 -mt-5"
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
