'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';
import Magnetic from '@/components/shared/Magnetic';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result.error) {
        setError('Invalid credentials. Please try again.');
        setLoading(false);
      } else {
        router.push('/admin');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-[#000205] font-sans selection:bg-primary/30">
      {/* Cinematic Nebula Engine */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full bg-primary/5 blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full bg-accent/5 blur-[160px] animate-pulse" style={{ animationDelay: '4s' }} />
        
        {/* Subtle Floating Particles - Only render on client to avoid hydration mismatch */}
        {isMounted && [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.1, y: Math.random() * 1000 }}
            animate={{ 
              y: [0, -1000],
              opacity: [0, 0.2, 0]
            }}
            transition={{ 
              duration: Math.random() * 20 + 20, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 20
            }}
            className="absolute w-[1px] h-[1px] bg-white rounded-full"
            style={{ left: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[1150px] relative z-10"
      >
        <Magnetic intensity={0.03}>
          <div className="relative group perspective-1000">
            {/* Holographic Reflection Sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2s] ease-in-out pointer-events-none" />
            
            {/* Main Bento Deck */}
            <div className="relative bg-[#05080d]/40 backdrop-blur-[150px] rounded-[4.5rem] shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] border border-white/5 overflow-hidden flex flex-col md:flex-row">
              
              {/* Left Deck: Intelligence & Protocols */}
              <div className="hidden md:flex flex-[1.3] p-16 bg-white/[0.01] border-r border-white/5 flex-col justify-between relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(14,165,233,0.08),transparent_70%)]" />
                
                {/* Decoration: Circuit Lines */}
                <div className="absolute top-10 left-10 w-20 h-20 border-t border-l border-white/10 rounded-tl-3xl" />
                <div className="absolute bottom-10 right-10 w-20 h-20 border-b border-r border-white/10 rounded-br-3xl" />

                <div className="space-y-16 relative z-10">
                  <div className="flex items-center gap-6">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(14,165,233,0.2)]"
                    >
                      <ShieldCheck size={32} strokeWidth={1.5} />
                    </motion.div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] italic">Security Protocol</h3>
                      </div>
                      <p className="text-[9px] font-mono text-primary/80 uppercase tracking-widest">Verification Required</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h2 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-[0.8] flex flex-col">
                      <span>Neural</span>
                      <span className="text-primary text-glow translate-x-4">Gateway</span>
                    </h2>
                    <p className="text-sm text-white/20 max-w-[360px] leading-relaxed font-medium italic border-l-2 border-primary/20 pl-6 py-2">
                      Accessing the administrative terminal requires high-level clearance and encrypted personnel identification.
                    </p>
                  </div>

                  {/* Active Widget Grid */}
                  <div className="grid grid-cols-2 gap-y-10 gap-x-12 pt-10">
                    {[
                      { label: "Core Sync", val: "STABLE", color: "text-primary" },
                      { label: "Encryption", val: "AES-256", color: "text-white" },
                      { label: "Neural Link", val: "ACTIVE", color: "text-primary" },
                      { label: "Data Path", val: "SECURE", color: "text-white" }
                    ].map((stat, idx) => (
                      <div key={idx} className="space-y-3 group/stat">
                        <div className="flex items-center gap-2">
                          <div className={`w-1 h-1 rounded-full bg-primary group-hover/stat:scale-150 transition-transform`} />
                          <span className="text-[9px] font-black text-white/10 uppercase tracking-widest group-hover/stat:text-white/30 transition-colors">{stat.label}</span>
                        </div>
                        <p className={`font-mono text-xs tracking-tighter ${stat.color} opacity-60 group-hover:opacity-100 transition-opacity`}>{stat.val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-8 h-[1px] bg-white/10" />
                  <div className="text-[9px] font-black text-white/10 uppercase tracking-[0.8em] italic">
                    Nexus Command Deck V.4
                  </div>
                </div>
              </div>

              {/* Right Deck: Secure Entry */}
              <div className="flex-1 p-12 md:p-24 space-y-16 bg-white/[0.01]">
                <div className="space-y-4">
                  <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.6em] italic text-glow">Initialization Protocol</h4>
                  <div className="space-y-1">
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-tight">
                      Sign <span className="text-white/10">In</span>
                    </h1>
                    <div className="w-12 h-1 bg-primary/40 rounded-full" />
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-12">
                  <div className="space-y-8">
                    {/* Premium Input: Email */}
                    <div className="space-y-3 group/input">
                      <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em] ml-2 group-focus-within/input:text-primary transition-colors italic">
                        Personnel Email ID
                      </label>
                      <div className="relative overflow-hidden rounded-2xl">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-primary transition-colors z-10">
                          <Mail size={18} strokeWidth={1.5} />
                        </div>
                        <input
                          required
                          type="email"
                          className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-6 pl-16 pr-8 text-white text-sm focus:outline-none focus:border-primary/30 focus:bg-white/[0.05] transition-all font-medium placeholder:text-white/5 italic relative z-0"
                          placeholder="admin@rohanmia.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/0 to-transparent group-focus-within/input:via-primary/50 transition-all duration-1000" />
                      </div>
                    </div>

                    {/* Premium Input: Password */}
                    <div className="space-y-3 group/input">
                      <div className="flex justify-between items-center px-2">
                        <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em] group-focus-within/input:text-primary transition-colors italic">
                          Security Protocol
                        </label>
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[8px] font-black text-white/20 uppercase tracking-widest hover:text-primary transition-colors"
                        >
                          {showPassword ? 'Mask' : 'Reveal'}
                        </button>
                      </div>
                      <div className="relative overflow-hidden rounded-2xl">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-primary transition-colors z-10">
                          <Lock size={18} strokeWidth={1.5} />
                        </div>
                        <input
                          required
                          type={showPassword ? "text" : "password"}
                          className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-6 pl-16 pr-8 text-white text-sm focus:outline-none focus:border-primary/30 focus:bg-white/[0.05] transition-all font-medium placeholder:text-white/5 tracking-[0.4em] relative z-0"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/0 to-transparent group-focus-within/input:via-primary/50 transition-all duration-1000" />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl flex items-center gap-4"
                    >
                      <div className="w-1.5 h-6 bg-red-500/40 rounded-full" />
                      <p className="text-red-500 text-[9px] font-black uppercase tracking-widest italic">{error}</p>
                    </motion.div>
                  )}

                  <Magnetic intensity={0.15}>
                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full py-7 bg-primary text-white font-black uppercase italic tracking-[0.4em] rounded-2xl shadow-[0_25px_60px_rgba(14,165,233,0.35)] hover:shadow-[0_30px_80px_rgba(14,165,233,0.5)] transition-all flex items-center justify-center gap-4 relative overflow-hidden group/btn disabled:opacity-80"
                    >
                      <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-700 ease-[0.16, 1, 0.3, 1]" />
                      
                      <span className="relative z-10 group-hover:text-primary transition-colors duration-500 flex items-center gap-4">
                        {loading ? (
                          <div className="flex items-center gap-4">
                            <Loader2 size={24} className="animate-spin" />
                            <span className="text-[10px] tracking-[0.6em] animate-pulse">Syncing...</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-scan" />
                          </div>
                        ) : (
                          <>
                            Enter Nexus
                            <div className="w-6 h-[1px] bg-current opacity-30 group-hover:w-10 transition-all duration-500" />
                          </>
                        )}
                      </span>
                    </button>
                  </Magnetic>
                </form>

                <div className="text-center pt-8 border-t border-white/5">
                  <button 
                    onClick={() => router.push('/')}
                    className="text-white/10 text-[8px] font-black uppercase tracking-[0.4em] hover:text-primary transition-colors inline-flex items-center gap-3 group"
                  >
                    <span className="group-hover:-translate-x-3 transition-transform duration-500">←</span> Exit Command Center
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Magnetic>
      </motion.div>
    </div>
  );
}
