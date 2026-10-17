"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import Magnetic from "@/components/shared/Magnetic";

export default function NotFound() {
  const [particles] = useState(() =>
    [...Array(5)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: 5 + Math.random() * 5,
      delay: Math.random() * 5,
      x: Math.random() * 50 - 25,
    })),
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-6 overflow-hidden relative">
      {/* Background Atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -z-10" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -z-10" />

      <div className="text-center space-y-12 max-w-2xl relative">
        {/* Animated 404 Number */}
        <div className="relative">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12rem] md:text-[18rem] font-bold text-white/5 tracking-tighter leading-none select-none"
          >
            404
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              Lost in <span className="text-primary text-glow">Space?</span>
            </h2>
          </motion.div>
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 text-lg md:text-xl max-w-md mx-auto leading-relaxed"
        >
          The coordinates you followed lead to a void. The page you are looking
          for has been moved or deleted.
        </motion.p>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Magnetic>
            <Link
              href="/"
              className="btn btn-primary flex items-center gap-2 group w-full sm:w-auto"
            >
              <Home className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              <span>Return Home</span>
            </Link>
          </Magnetic>

          <Magnetic>
            <button
              onClick={() => window.history.back()}
              className="btn btn-secondary flex items-center gap-2 group w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Previous Page</span>
            </button>
          </Magnetic>
        </motion.div>

        {/* Terminal aesthetic coordinates */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-12 text-xs font-mono text-gray-400/40 uppercase tracking-widest"
        >
          ERR_PAGE_NOT_FOUND // 0x00000194 // COORD: [UNKNOWN]
        </motion.div>
      </div>

      {/* Floating particles background effect */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              top: p.top,
              left: p.left,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, p.x, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
