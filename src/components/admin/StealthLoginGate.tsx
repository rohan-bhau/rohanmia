'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Loader2, KeyRound, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import AnimatedLogo from '@/components/shared/AnimatedLogo';
import { initiateAdminLogin, verifyOtpAndLogin, resendAdminOtp } from '@/actions/stealthAuth';
import { useThemeAccent } from '@/components/theme/ThemeProvider';

export default function StealthLoginGate() {
  const { currentTheme } = useThemeAccent();
  
  // Step: 'credentials' | 'otp'
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');

  // Step 1 State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 State
  const [challengeToken, setChallengeToken] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Common State
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Step 1: Submit Credentials
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    startTransition(async () => {
      const res = await initiateAdminLogin(formData);
      if (res.success && res.requireOtp && res.challengeToken) {
        setChallengeToken(res.challengeToken);
        setStep('otp');
        setResendCooldown(30);
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 150);
      } else {
        setError(res.error || 'Access Denied: Invalid credentials.');
      }
    });
  };

  // Handle Step 2: Single Digit Changes & Paste
  const handleOtpChange = (index: number, val: string) => {
    // If pasting a full 6-digit code
    if (val.length > 1) {
      const pasted = val.replace(/\D/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) {
          newOtp[i] = pasted[i] || '';
        }
        setOtp(newOtp);
        const focusIdx = Math.min(pasted.length, 5);
        otpInputsRef.current[focusIdx]?.focus();
      }
      return;
    }

    const cleanVal = val.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Auto-advance to next box
    if (cleanVal && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle Step 2: Submit OTP
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('otp', fullOtp);
    formData.append('challengeToken', challengeToken);

    startTransition(async () => {
      const res = await verifyOtpAndLogin(formData);
      if (res.success) {
        window.location.reload();
      } else {
        setError(res.error || 'Invalid verification code.');
      }
    });
  };

  // Handle Resend OTP
  const handleResend = () => {
    if (resendCooldown > 0 || isPending) return;
    setError(null);
    setResendStatus(null);

    startTransition(async () => {
      const res = await resendAdminOtp(email);
      if (res.success && res.challengeToken) {
        setChallengeToken(res.challengeToken);
        setResendCooldown(45);
        setResendStatus('A new code has been dispatched to your email.');
        setTimeout(() => setResendStatus(null), 4000);
      } else {
        setError(res.error || 'Failed to resend code. Please try again.');
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-transparent text-neutral-200 relative overflow-hidden font-sans select-none">
      
      {/* Background Subtle Ambient Glow matching /about page */}
      <div 
        aria-hidden="true"
        className="fixed top-24 left-1/2 -translate-x-1/2 w-[650px] h-[400px] rounded-full blur-[140px] opacity-15 pointer-events-none"
        style={{ backgroundColor: currentTheme?.primary || '#0ea5e9' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-2xl p-8 sm:p-10 shadow-2xl space-y-7 relative overflow-hidden">
          
          {/* Top Subtle Border Highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Logo & Heading */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex items-center justify-center">
              <AnimatedLogo size={46} animated={true} />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-white">
                Control{' '}
                <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
                  Room
                </span>
              </h1>
              <p className="text-xs text-neutral-400 font-mono">
                {step === 'credentials'
                  ? 'Authorized identity verification'
                  : 'Two-Factor Authentication (2FA)'}
              </p>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono flex items-center gap-2.5"
              >
                <AlertCircle size={15} className="shrink-0 text-rose-400" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resend Status Message */}
          <AnimatePresence mode="wait">
            {resendStatus && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-mono flex items-center gap-2"
              >
                <CheckCircle2 size={14} className="shrink-0 text-sky-400" />
                <span>{resendStatus}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === 'credentials' ? (
              /* ================= STEP 1: CREDENTIALS ================= */
              <motion.form
                key="step-credentials"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleCredentialsSubmit}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@domain.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:bg-white/[0.05] focus:outline-none text-sm text-white placeholder:text-neutral-600 font-mono transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-medium">
                    Master Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/30 focus:bg-white/[0.05] focus:outline-none text-sm text-white placeholder:text-neutral-600 font-mono transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending || !email || !password}
                  className="w-full mt-3 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm tracking-tight flex items-center justify-center gap-2 shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-black" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <span>Next: Send Security Code</span>
                  )}
                </button>
              </motion.form>
            ) : (
              /* ================= STEP 2: 2FA OTP ================= */
              <motion.form
                key="step-otp"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleOtpSubmit}
                className="space-y-5"
              >
                <div className="space-y-2 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px] font-mono">
                    <KeyRound size={12} />
                    <span>One-Time Code Sent</span>
                  </div>
                  <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                    Check your authorized email inbox for the 6-digit verification code.
                  </p>
                </div>

                {/* 6 Digit Inputs */}
                <div className="flex items-center justify-between gap-2 sm:gap-2.5">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-14 sm:w-13 sm:h-14 rounded-xl bg-white/[0.04] border border-white/[0.12] focus:border-sky-400 focus:bg-white/[0.08] focus:outline-none text-center font-mono text-xl sm:text-2xl font-bold text-white transition-all shadow-inner"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials');
                      setError(null);
                    }}
                    className="inline-flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={12} />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || isPending}
                    className="inline-flex items-center gap-1 hover:text-sky-300 disabled:opacity-50 disabled:hover:text-neutral-400 transition-colors"
                  >
                    <RefreshCw size={11} className={isPending ? 'animate-spin' : ''} />
                    <span>
                      {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}
                    </span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isPending || otp.join('').length !== 6}
                  className="w-full mt-2 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm tracking-tight flex items-center justify-center gap-2 shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-black" />
                      <span>Validating 2FA Code...</span>
                    </>
                  ) : (
                    <span>Verify & Unlock Control Room</span>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
}
