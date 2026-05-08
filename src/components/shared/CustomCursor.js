'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const [isPointer, setIsPointer] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth springs for the outer ring (lag effect)
  const springConfig = { damping: 25, stiffness: 250 };
  const ringX = useSpring(cursorX, springConfig);
  const ringY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const target = e.target;
      setIsPointer(
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.closest('a')
      );
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[5000000] hidden md:block custom-cursor">
      {/* Outer Ring */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isPointer ? 60 : 32,
          height: isPointer ? 60 : 32,
          borderWidth: isPointer ? 2 : 1.5,
          borderColor: 'var(--primary)',
          opacity: 0.5,
        }}
        className="fixed top-0 left-0 rounded-full border border-primary shadow-[0_0_15px_var(--primary-glow)]"
      />

      {/* Center Dot */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isPointer ? 8 : 6,
          height: isPointer ? 8 : 6,
        }}
        className="fixed top-0 left-0 rounded-full bg-primary shadow-[0_0_10px_var(--primary-glow)]"
      />
    </div>
  );
}
