'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeAccent } from '@/components/theme/ThemeProvider';

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  shape: 'spark' | 'dot' | 'diamond';
}

interface Burst {
  id: number;
  x: number;
  y: number;
  primaryColor: string;
  glowColor: string;
  particles: Particle[];
}

function getThemePalette(primary: string, themeId: string): string[] {
  switch (themeId) {
    case 'cyan':
      return ['#ffffff', '#38bdf8', '#0ea5e9', '#06b6d4', '#67e8f9'];
    case 'violet':
      return ['#ffffff', '#c084fc', '#8b5cf6', '#a855f7', '#e879f9'];
    case 'emerald':
      return ['#ffffff', '#34d399', '#10b981', '#059669', '#6ee7b7'];
    case 'rose':
      return ['#ffffff', '#fb7185', '#f43f5e', '#e11d48', '#fda4af'];
    case 'amber':
      return ['#ffffff', '#fbbf24', '#f59e0b', '#d97706', '#fde047'];
    case 'mono':
      return ['#ffffff', '#f8fafc', '#e2e8f0', '#cbd5e1', '#94a3b8'];
    default:
      return ['#ffffff', primary, '#38bdf8'];
  }
}

export default function ClickBurst() {
  const { currentTheme } = useThemeAccent();
  const [bursts, setBursts] = useState<Burst[]>([]);
  const themeRef = useRef(currentTheme);

  useEffect(() => {
    themeRef.current = currentTheme;
  }, [currentTheme]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInteractive =
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('input') ||
        target.closest('textarea') ||
        window.getComputedStyle(target).cursor === 'pointer';

      if (!isInteractive) return;

      const activeTheme = themeRef.current;
      const palette = getThemePalette(activeTheme.primary, activeTheme.id);
      const id = Date.now() + Math.random();

      const particleCount = 14;
      const particles: Particle[] = Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2 + (Math.random() * 0.3 - 0.15);
        const distance = 42 + Math.random() * 58;
        const color = palette[Math.floor(Math.random() * palette.length)];
        const shapeType: 'spark' | 'dot' | 'diamond' =
          i % 3 === 0 ? 'diamond' : i % 2 === 0 ? 'spark' : 'dot';
        const size = shapeType === 'dot' ? 3.5 + Math.random() * 2.5 : 4.5 + Math.random() * 3.5;

        return {
          id: i,
          angle,
          distance,
          size,
          color,
          delay: Math.random() * 0.04,
          duration: 0.55 + Math.random() * 0.35,
          shape: shapeType,
        };
      });

      const newBurst: Burst = {
        id,
        x: e.clientX,
        y: e.clientY,
        primaryColor: activeTheme.primary,
        glowColor: activeTheme.glow,
        particles,
      };

      setBursts((prev) => [...prev.slice(-4), newBurst]);

      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, 1000);
    };

    window.addEventListener('mousedown', handleClick, { passive: true });
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none"
    >
      <AnimatePresence mode="popLayout">
        {bursts.map((burst) => (
          <div
            key={burst.id}
            className="absolute"
            style={{ left: burst.x, top: burst.y }}
          >
            {/* 1. Luminous Expanding Shockwave Halo */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0.85 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                width: 32,
                height: 32,
                border: `1.5px solid ${burst.primaryColor}`,
                boxShadow: `0 0 16px ${burst.primaryColor}, inset 0 0 8px ${burst.primaryColor}`,
              }}
            />

            {/* 2. Soft Ambient Flash Glow */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0.7 }}
              animate={{ scale: 2.6, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none blur-sm"
              style={{
                width: 24,
                height: 24,
                background: `radial-gradient(circle, ${burst.primaryColor} 0%, transparent 70%)`,
              }}
            />

            {/* 3. Dynamic Themed Particles */}
            {burst.particles.map((p) => {
              const targetX = Math.cos(p.angle) * p.distance;
              const targetY = Math.sin(p.angle) * p.distance;

              return (
                <motion.div
                  key={p.id}
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    scale: 0.6,
                    rotate: p.shape === 'diamond' ? 45 : 0,
                  }}
                  animate={{
                    x: targetX,
                    y: targetY,
                    opacity: [1, 0.9, 0],
                    scale: [0.6, 1.25, 0],
                    rotate: p.shape === 'diamond' ? 45 + 90 : 180,
                  }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`absolute pointer-events-none ${
                    p.shape === 'dot'
                      ? 'rounded-full'
                      : p.shape === 'diamond'
                        ? 'rounded-[1px]'
                        : 'rounded-[1.5px]'
                  }`}
                  style={{
                    width: p.size,
                    height: p.shape === 'spark' ? p.size * 1.5 : p.size,
                    background:
                      p.color === '#ffffff'
                        ? '#ffffff'
                        : `radial-gradient(circle at center, #ffffff 30%, ${p.color} 100%)`,
                    boxShadow: `0 0 8px ${p.color}, 0 0 16px ${burst.glowColor}`,
                    marginLeft: -p.size / 2,
                    marginTop: -p.size / 2,
                    filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.8))',
                  }}
                />
              );
            })}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
