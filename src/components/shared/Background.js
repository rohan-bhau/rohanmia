'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Background() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState([]);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    setMounted(true);
    
    // Generate static particle data
    const p = [...Array(20)].map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      moveY: Math.random() * -100 - 50,
    }));
    setParticles(p);

    // Generate static star data
    const s = [...Array(50)].map(() => ({
      width: Math.random() * 2,
      height: Math.random() * 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      opacity: Math.random() * 0.5,
      duration: Math.random() * 3 + 2,
    }));
    setStars(s);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-background">
      {/* Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 dark:bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 dark:bg-accent/5 blur-[120px]" />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-grid opacity-[0.03] dark:opacity-[0.1]" />

      {/* Floating Particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-foreground rounded-full opacity-10 dark:opacity-20"
          initial={{
            x: p.x + "%",
            y: p.y + "%",
          }}
          animate={{
            y: [null, p.moveY + "px"],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            left: p.x + "%",
            top: p.y + "%",
          }}
        />
      ))}

      {/* Animated Stars (Only in Dark Mode) */}
      <div className="absolute inset-0 hidden dark:block">
        {stars.map((s, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: s.width + "px",
              height: s.height + "px",
              left: s.left + "%",
              top: s.top + "%",
              opacity: s.opacity,
              animationDuration: s.duration + "s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
