"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

interface CarouselItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  alt: string;
}

// Fast rotation interval as requested (2.5 seconds)
const AUTO_ROTATE_INTERVAL = 2500;

export default function StackedImageCarousel({
  items = [],
}: { items?: CarouselItem[] } = {}) {
  const carouselItems = items;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasItems = carouselItems.length > 0;

  const nextSlide = useCallback(() => {
    if (carouselItems.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % carouselItems.length);
  }, [carouselItems.length]);

  const prevSlide = useCallback(() => {
    if (carouselItems.length === 0) return;
    setActiveIndex(
      (prev) => (prev - 1 + carouselItems.length) % carouselItems.length,
    );
  }, [carouselItems.length]);

  // Auto rotation effect with fast timing
  useEffect(() => {
    if (!hasItems) return;
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, AUTO_ROTATE_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasItems, isPaused, nextSlide]);

  if (!hasItems) {
    return null;
  }

  // Handle drag gesture on desktop / touch
  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    setIsPaused(false);
    const threshold = 35;
    if (info.offset.x < -threshold) {
      nextSlide();
    } else if (info.offset.x > threshold) {
      prevSlide();
    }
  };

  // Click handler to advance on mobile or desktop click
  const handleClick = (index: number) => {
    if (index === activeIndex) {
      nextSlide();
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full max-w-[340px] sm:max-w-[400px] select-none py-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 3D Stack Container - Calibrated to card 4/5 aspect ratio to remove excess vertical gap */}
      <div className="relative h-[260px] sm:h-[320px] md:h-[345px] w-full flex items-center justify-center">
        {carouselItems.map((item, index) => {
          const total = carouselItems.length;
          const rawOffset = (index - activeIndex) % total;
          const normalizedOffset = (rawOffset + total) % total;

          const isCenter = normalizedOffset === 0;
          const isRight = normalizedOffset === 1;
          const isLeft = normalizedOffset === total - 1;

          let translateX = "0%";
          let rotateY = 0;
          let scale = 0.75;
          let zIndex = 0;
          let brightness = "brightness(0.5)";
          let opacity = 0;

          if (isCenter) {
            translateX = "0%";
            rotateY = 0;
            scale = 1.0;
            zIndex = 20;
            brightness = "brightness(1)";
            opacity = 1;
          } else if (isLeft) {
            translateX = "-38%";
            rotateY = 32;
            scale = 0.85;
            zIndex = 10;
            brightness = "brightness(0.6)";
            opacity = 0.85;
          } else if (isRight) {
            translateX = "38%";
            rotateY = -32;
            scale = 0.85;
            zIndex = 10;
            brightness = "brightness(0.6)";
            opacity = 0.85;
          }

          return (
            <motion.div
              key={item.id || index}
              drag={isCenter ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={() => setIsPaused(true)}
              onDragEnd={handleDragEnd}
              onClick={() => handleClick(index)}
              animate={{
                x: translateX,
                scale,
                rotateY,
                opacity,
                zIndex,
              }}
              transition={{
                duration: 0.55,
                ease: [0.23, 1, 0.32, 1],
              }}
              style={{
                perspective: 1000,
                transformStyle: "preserve-3d",
                filter: brightness,
                pointerEvents: isCenter || isLeft || isRight ? "auto" : "none",
              }}
              className={`absolute top-0 bottom-0 aspect-[4/5] w-[200px] sm:w-[250px] md:w-[270px] rounded-[28px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.7)] border border-white/15 cursor-grab active:cursor-grabbing will-change-transform ${
                isCenter ? "ring-1 ring-white/25" : ""
              }`}
            >
              <Image
                src={item.image}
                alt={item.alt || item.title}
                fill
                priority={index === 0}
                className="object-cover object-center pointer-events-none select-none"
                sizes="(max-width: 768px) 240px, 280px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          );
        })}
      </div>

      {/* Dynamic Text Below Cards with Smooth Fade */}
      <div className="text-center mt-3 h-14 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {carouselItems[activeIndex] && (
            <motion.div
              key={carouselItems[activeIndex].id || activeIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-0.5"
            >
              <h3 className="font-serif text-xl sm:text-2xl text-white font-light tracking-wide">
                {carouselItems[activeIndex].title}
              </h3>
              {carouselItems[activeIndex].subtitle && (
                <p className="font-mono text-[11px] sm:text-xs text-neutral-400">
                  {carouselItems[activeIndex].subtitle}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subtle indicator dots */}
      <div className="flex items-center gap-1.5 mt-2">
        {carouselItems.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              activeIndex === i
                ? "w-6 bg-white"
                : "w-1.5 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
