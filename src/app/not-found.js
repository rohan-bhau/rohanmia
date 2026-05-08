'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import Magnetic from '@/components/shared/Magnetic';

export default function NotFound() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = [...Array(5)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: 5 + Math.random() * 5,
      delay: Math.random() * 5,
      x: Math.random() * 50 - 25
    }));
    setParticles(newParticles);
  }, []);

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
          The coordinates you followed lead to a void. The page you are looking for has been moved or deleted.
        </motion.p>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Magnetic>
            <Link href="/">
              <button className="group flex items-center gap-3 px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_50px_rgba(14,165,233,0.5)] transition-all">
                <Home size={20} />
                <span>Return Base</span>
              </button>
            </Link>
          </Magnetic>
          
          <Magnetic>
            <button 
              onClick={() => window.history.back()}
              className="flex items-center gap-3 px-8 py-4 glass border-white/10 text-white font-bold rounded-2xl hover:bg-white/5 transition-all"
            >
              <ArrowLeft size={20} />
              <span>Previous Sector</span>
            </button>
          </Magnetic>
        </motion.div>

        {/* Decorative Particles */}
        {particles.map((p, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              x: [0, p.x, 0],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay
            }}
            className="absolute w-1 h-1 bg-primary rounded-full blur-[1px]"
            style={{
              top: p.top,
              left: p.left
            }}
          />
        ))}
      </div>
    </div>
  );
}
