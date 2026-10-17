"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeAccent } from "@/components/theme/ThemeProvider";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delayMs?: number;
}

const emptySubscribe = () => () => {};

export default function Tooltip({
  text,
  children,
  position = "top",
  delayMs = 120,
}: TooltipProps) {
  const { currentTheme } = useThemeAccent();
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const updateCoords = useCallback(() => {
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
  }, [position]);

  const handleMouseEnter = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;
    updateCoords();
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      updateCoords();
      setIsVisible(true);
    }, delayMs);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
  };

  const positions: Record<"top" | "bottom" | "left" | "right", string> = {
    top: "-translate-x-1/2 -translate-y-full mb-2.5",
    bottom: "-translate-x-1/2 mt-2.5",
    left: "-translate-x-full -translate-y-1/2 mr-3",
    right: "ml-3 -translate-y-1/2",
  };

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {isMounted &&
        isVisible &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "fixed",
                top: coords.y,
                left: coords.x,
                zIndex: 99999999,
                pointerEvents: "none",
              }}
              className={positions[position]}
            >
              <div
                className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0a0d14]/95 border border-white/[0.12] shadow-[0_12px_32px_rgba(0,0,0,0.7)] backdrop-blur-2xl min-w-max"
                style={{
                  boxShadow: `0 10px 30px rgba(0,0,0,0.8), 0 0 14px ${currentTheme.glow}`,
                }}
              >
                {/* Glowing Theme Accent Dot */}
                <span
                  className="size-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: currentTheme.primary,
                    boxShadow: `0 0 6px ${currentTheme.primary}`,
                  }}
                />
                <span className="text-[11px] font-sans font-medium text-white/90 tracking-tight whitespace-nowrap drop-shadow-sm select-none">
                  {text}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
