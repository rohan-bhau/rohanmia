'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import AnimatedLogo from '@/components/shared/AnimatedLogo';
import { loginToControlRoom } from '@/actions/stealthAuth';

export default function StealthLoginGate() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    startTransition(async () => {
      const res = await loginToControlRoom(formData);
      if (res.success) {
        router.refresh();
      } else {
        setError(res.error || 'Access Denied.');
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#07080a] relative overflow-hidden font-sans select-none">
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 max-w-4xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-sky-500/5 blur-[160px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative"
      >
        <div className="rounded-3xl bg-[#0d0f12]/95 border border-white/[0.08] backdrop-blur-2xl p-8 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-inner">
              <AnimatedLogo size={44} animated={true} />
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-sky-400 font-semibold">
                <ShieldCheck size={13} />
                <span>Stealth Access Gate</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
                Control Room
              </h1>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                Authorized identity verification required
              </p>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono flex items-center gap-2.5"
              >
                <AlertCircle size={15} className="shrink-0 text-rose-400" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block font-medium">
                Admin Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rohanmia.org"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-sky-400/50 focus:bg-white/[0.05] focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/40 font-mono transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block font-medium">
                Master Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-sky-400/50 focus:bg-white/[0.05] focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/40 font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || !email || !password}
              className="w-full mt-2 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs sm:text-sm tracking-tight flex items-center justify-center gap-2 shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-98 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin text-black" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Unlock Control Room</span>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="text-center pt-2 border-t border-white/[0.06]">
            <span className="text-[10px] font-mono text-muted-foreground/60">
              IP Rate-Limited • Secure Server Session • Zero Leak
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
