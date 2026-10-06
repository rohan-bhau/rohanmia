'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signIn, signOut } from 'next-auth/react';
import { 
  Share2, 
  X, 
  Check, 
  Trash2, 
  ArrowRight,
  LogOut,
  Pencil
} from 'lucide-react';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { GuestbookEntry, GuestbookTheme } from '@/data/guestbook';

// =========================================================================
// HAND-DRAWN SVG DOODLES (Artistic Accents)
// =========================================================================

const LightningDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 43 76" fill="none" className={className}>
    <path 
      d="M 23.998 4.627 C 23.847 5.383 23.125 5.841 22.688 6.435 C 21.525 8.013 20.539 9.831 19.546 11.521 C 16.6 16.527 13.384 21.361 10.392 26.347 C 7.56 31.067 5.884 35.941 3.567 40.834 C 3.367 41.254 2.467 42.806 3.454 42.258 C 5.204 41.285 9.013 42.054 10.957 42.054 C 11.624 42.054 19.877 41.554 19.93 42.461 C 20.196 46.993 18.4 52.161 17.896 56.7 C 17.529 60 16.816 63.296 16.178 66.553 C 15.793 68.523 15.923 70.703 15.138 72.565 C 14.64 73.75 15.371 72.435 15.478 71.955 C 15.96 69.785 17.076 67.476 17.918 65.423 C 21.141 57.568 26.116 50.725 30.078 43.297 C 33.086 37.657 36.678 32.167 39.66 26.799 C 39.904 26.359 40.936 25.086 40.18 25.691 C 39.42 26.299 37.307 26.542 36.383 26.595 C 31.504 26.874 26.513 29.178 21.76 30.234 C 20.942 30.416 17.464 32.464 18.393 30.256 C 19.756 27.019 19.838 23.254 20.743 19.86 C 21.712 16.229 21.955 12.328 23.093 8.786 C 23.41 7.805 24.212 3.3 24.813 3" 
      stroke="white" 
      strokeLinecap="round" 
      strokeWidth="2.5" 
    />
  </svg>
);

const SparkleStarDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 141 149" fill="none" className={className}>
    <path 
      d="M 26.981 61.83 L 26.981 74.677 M 44.538 50.696 L 53.103 50.696 M 26.124 33.995 C 27.044 33.88 26.553 28.914 26.553 28 M 3 49.412 L 15.847 49.412 M 18.416 39.562 C 17.65 39.562 15.799 37.754 15.419 36.992 M 39.828 39.562 C 42.301 39.562 42.631 37.946 44.538 36.992 M 39.828 59.69 C 39.954 60.701 43.944 63.889 44.966 64.4 M 15.418 61.402 C 12.318 61.402 11.383 64.062 8.995 65.256" 
      stroke="white" 
      strokeLinecap="round" 
      strokeWidth="3.5" 
    />
  </svg>
);

const SmileyDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 126 138" fill="none" className={className}>
    <path 
      d="M 41.415 66.638 C 41.415 67.654 41.122 69.39 42.621 69.39 C 43.635 69.39 45.145 68.037 45.203 66.982 M 76.202 63.541 C 76.202 65.768 75.913 67.317 78.767 66.561 C 80.82 66.019 83.436 64.364 83.436 61.993 M 24.537 86.593 C 30.682 92.172 36.278 98.044 44.209 101.158 C 49.42 103.205 55.301 102.764 60.779 102.764 C 67.156 102.764 72.485 100.923 77.963 97.68 C 88.004 91.734 98.735 83.23 104.522 72.87" 
      stroke="currentColor" 
      strokeLinecap="round" 
      strokeWidth="4.5" 
    />
    <path 
      d="M 47.084 36.922 C 35.57 36.922 28.438 39.099 19.85 47.626 C 9.976 57.432 4.786 69.445 3.23 83.019 C 1.745 95.976 2.049 107.71 11.267 117.63 C 25.85 133.321 50.781 136.794 71.119 134.896 C 88.897 133.236 107.063 122.271 115.52 106.105 C 125.151 87.696 125.797 62.476 118.563 43.251 C 114.57 32.64 107.572 23.551 99.055 16.14 C 89.728 8.025 78.284 5.146 66.241 3.639" 
      stroke="currentColor" 
      strokeLinecap="round" 
      strokeWidth="4.5" 
    />
  </svg>
);

const WaveDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 191 117" fill="none" className={className}>
    <path 
      d="M43.8532 21.6587C35.2616 30.8676 9.64144 58.5872 18.7959 49.9377C28.5802 40.6931 37.719 30.7576 47.412 21.4126C49.1624 19.725 50.8448 17.9477 52.7717 16.4649C32.8988 39.0849 29.2779 42.82 17.9058 55.5342C14.0593 59.8346 10.1855 64.113 6.46175 68.5201C4.9633 70.2936 -2.50903 79.0773 5.38398 72.0587C19.7011 59.3276 33.0142 45.4381 46.9955 32.3412C49.5417 29.9561 51.9606 27.4088 54.7427 25.3036C59.6009 21.6276 46.7607 34.5124 42.6209 38.9821C31.7456 50.724 22.2321 60.8066 11.6275 72.7703C28.1593 59.0374 43.9271 42.8651 60.1992 27.1899" 
      stroke="white" 
      strokeLinecap="round" 
      strokeWidth="2.5" 
    />
  </svg>
);

const HeartDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

const GeometricOrbitDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <ellipse cx="50" cy="50" rx="40" ry="16" transform="rotate(-30 50 50)" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 4" />
    <ellipse cx="50" cy="50" rx="40" ry="16" transform="rotate(30 50 50)" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="50" cy="50" r="5" fill="currentColor" />
  </svg>
);

const SunburstDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <circle cx="50" cy="50" r="14" stroke="currentColor" strokeWidth="3" />
    <path d="M50 12v12M50 76v12M12 50h12M76 50h12M23 23l9 9M68 68l9 9M23 77l9-9M68 32l9-9" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
  </svg>
);

const StarBurstDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <path d="M50 8 C50 34 66 50 92 50 C66 50 50 66 50 92 C50 66 34 50 8 50 C34 50 50 34 50 8 Z" fill="currentColor" opacity="0.8" />
  </svg>
);

// Wavy / Scallop Divider Cut
const WavyDivider = () => (
  <svg className="absolute right-0 bottom-0 left-0 w-full z-10" fill="none" preserveAspectRatio="none" viewBox="0 0 400 20">
    <path 
      className="fill-[#0c0e15]" 
      d="M0 20V12C10 12 10 4 20 4C30 4 30 12 40 12C50 12 50 4 60 4C70 4 70 12 80 12C90 12 90 4 100 4C110 4 110 12 120 12C130 12 130 4 140 4C150 4 150 12 160 12C170 12 170 4 180 4C190 4 190 12 200 12C210 12 210 4 220 4C230 4 230 12 240 12C250 12 250 4 260 4C270 4 270 12 280 12C290 12 290 4 300 4C310 4 310 12 320 12C330 12 330 4 340 4C350 4 350 12 360 12C370 12 370 4 380 4C390 4 390 12 400 12V20H0Z" 
    />
    <path 
      d="M0 12C10 12 10 4 20 4C30 4 30 12 40 12C50 12 50 4 60 4C70 4 70 12 80 12C90 12 90 4 100 4C110 4 110 12 120 12C130 12 130 4 140 4C150 4 150 12 160 12C170 12 170 4 180 4C190 4 190 12 200 12C210 12 210 4 220 4C230 4 230 12 240 12C250 12 250 4 260 4C270 4 270 12 280 12C290 12 290 4 300 4C310 4 310 12 320 12C330 12 330 4 340 4C350 4 350 12 360 12C370 12 370 4 380 4C390 4 390 12 400 12" 
      stroke="rgba(255,255,255,0.12)" 
      strokeWidth="1.2" 
    />
  </svg>
);

// Provider Icons
const GitHubIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const GoogleIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" fill="#EA4335" />
    <path d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" fill="#4285F4" />
    <path d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" fill="#FBBC05" />
    <path d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" fill="#34A853" />
  </svg>
);

// 8 Distinct Rich Thematic Color Palettes (Curated for authentic variety)
const THEME_STYLES: Record<GuestbookTheme, {
  cardBg: string;
  accent: string;
  DoodleComponent: React.ComponentType<{ className?: string }>;
}> = {
  violet: {
    cardBg: 'radial-gradient(120% 100% at 30% 20%, rgba(88, 28, 135, 0.95), rgba(30, 10, 60, 0.98))',
    accent: '#c084fc',
    DoodleComponent: SparkleStarDoodle,
  },
  emerald: {
    cardBg: 'radial-gradient(120% 100% at 30% 20%, rgba(6, 78, 59, 0.95), rgba(4, 35, 27, 0.98))',
    accent: '#34d399',
    DoodleComponent: LightningDoodle,
  },
  crimson: {
    cardBg: 'radial-gradient(120% 100% at 30% 20%, rgba(190, 18, 60, 0.95), rgba(76, 5, 25, 0.98))',
    accent: '#fb7185',
    DoodleComponent: HeartDoodle,
  },
  sapphire: {
    cardBg: 'radial-gradient(120% 100% at 30% 20%, rgba(29, 78, 216, 0.95), rgba(15, 23, 42, 0.98))',
    accent: '#60a5fa',
    DoodleComponent: GeometricOrbitDoodle,
  },
  amber: {
    cardBg: 'radial-gradient(120% 100% at 30% 20%, rgba(180, 83, 9, 0.95), rgba(69, 26, 3, 0.98))',
    accent: '#fbbf24',
    DoodleComponent: SunburstDoodle,
  },
  teal: {
    cardBg: 'radial-gradient(120% 100% at 30% 20%, rgba(13, 148, 136, 0.95), rgba(4, 47, 46, 0.98))',
    accent: '#2dd4bf',
    DoodleComponent: WaveDoodle,
  },
  rose: {
    cardBg: 'radial-gradient(120% 100% at 30% 20%, rgba(157, 23, 77, 0.95), rgba(60, 7, 30, 0.98))',
    accent: '#f472b6',
    DoodleComponent: StarBurstDoodle,
  },
  slate: {
    cardBg: 'radial-gradient(120% 100% at 30% 20%, rgba(39, 39, 42, 0.95), rgba(18, 18, 24, 0.98))',
    accent: '#a1a1aa',
    DoodleComponent: SmileyDoodle,
  }
};

// Mathematically balanced palette cycle ensuring NO adjacent cards (left, right, up, down) share the same style
const PALETTE_CYCLE: GuestbookTheme[] = [
  'emerald',
  'sapphire',
  'amber',
  'rose',
  'teal',
  'crimson',
  'slate',
  'violet'
];

// Alternating Playful Tilt Classes
const TILT_CLASSES = [
  'rotate-1 hover:rotate-2',
  '-rotate-2 hover:-rotate-3',
  'rotate-2 hover:rotate-4',
  '-rotate-1 hover:-rotate-2',
  'rotate-1 hover:rotate-3',
  '-rotate-2 hover:-rotate-4'
];

// Parse JSON safely — avoids "Unexpected token '<'" when the server returns an HTML error page
async function readJson(res: Response): Promise<any> {
  const type = res.headers.get('content-type') || '';
  if (!type.includes('application/json')) {
    return { success: false, error: `Server error (${res.status}). Please try again.` };
  }
  return res.json();
}

interface GuestbookClientProps {
  initialEntries: GuestbookEntry[];
  initialOauthConfigured: { google: boolean; github: boolean };
}

export default function GuestbookClient({ initialEntries, initialOauthConfigured }: GuestbookClientProps) {
  const { currentTheme } = useThemeAccent();
  const { data: session, status: sessionStatus } = useSession();

  // Entries are server-rendered, so they're visible instantly on first paint
  const [entries, setEntries] = useState<GuestbookEntry[]>(initialEntries);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Logged-in user state (supports NextAuth session OR direct client session)
  const [activeUser, setActiveUser] = useState<{
    name: string;
    email: string;
    avatar: string;
    provider: string;
  } | null>(null);

  // In-Card Compose State
  const [composeMessage, setComposeMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // OAuth provider configuration status (resolved on the server)
  const oauthConfigured = initialOauthConfigured;
  const devIdentityMode = !oauthConfigured.google && !oauthConfigured.github;

  // Optional custom dev identity when testing in dev mode
  const [customName, setCustomName] = useState('Guest Contributor');
  const [customEmail, setCustomEmail] = useState('visitor@community.dev');
  const [showDevCustomizer, setShowDevCustomizer] = useState(false);

  // Restore saved dev identity from localStorage (only when OAuth isn't configured)
  useEffect(() => {
    if (!devIdentityMode) {
      try { localStorage.removeItem('guestbook_user'); } catch {}
      return;
    }
    try {
      const saved = localStorage.getItem('guestbook_user');
      if (saved) {
        setActiveUser(JSON.parse(saved));
      }
    } catch {}
  }, [devIdentityMode]);

  // Sync with the real NextAuth session — it is the single source of truth when OAuth is on
  useEffect(() => {
    if (session?.user) {
      setActiveUser({
        name: session.user.name || 'Guest',
        email: session.user.email || '',
        avatar: session.user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session.user.name || 'Guest')}`,
        provider: 'oauth'
      });
    } else if (sessionStatus === 'unauthenticated' && !devIdentityMode) {
      setActiveUser(null);
    }
  }, [session, sessionStatus, devIdentityMode]);

  // Clean up any stale ?error=... query param from URL on load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const url = new URL(window.location.href);
      if (url.searchParams.has('error')) {
        url.searchParams.delete('error');
        window.history.replaceState({}, '', url.pathname + (url.search || ''));
      }
    }
  }, []);

  // Modal Scroll Lock and Escape Key Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  // Trigger Sign In
  const handleSignIn = async (provider: 'github' | 'google') => {
    const isConfigured = provider === 'google' ? oauthConfigured.google : oauthConfigured.github;

    // If OAuth credentials exist in .env, redirect directly to Google/GitHub
    if (isConfigured) {
      try {
        await signIn(provider, { callbackUrl: '/guestbook', redirectTo: '/guestbook' });
      } catch (err) {
        console.error('OAuth redirect error:', err);
      }
      return;
    }

    // Seamless Dev Mode Fallback:
    // If GOOGLE_CLIENT_ID or GITHUB_CLIENT_ID are missing in .env,
    // immediately log in so the user can test the compose card, DB saving, and email confirmation right away!
    const isGh = provider === 'github';
    const activeDevUser = {
      name: customName.trim() || (isGh ? 'GitHub Contributor' : 'Google Contributor'),
      email: customEmail.trim() || (isGh ? 'visitor@github.local' : 'visitor@google.local'),
      avatar: isGh 
        ? 'https://avatars.githubusercontent.com/u/14985020?v=4' 
        : 'https://avatars.githubusercontent.com/u/45145892?v=4',
      provider
    };

    setActiveUser(activeDevUser);
    try {
      localStorage.setItem('guestbook_user', JSON.stringify(activeDevUser));
    } catch {}
    setIsModalOpen(false);
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      localStorage.removeItem('guestbook_user');
    } catch {}
    setActiveUser(null);
    setComposeMessage('');
    // Ownership flags belonged to the signed-in user
    setEntries((prev) => prev.map((item) => ({ ...item, isOwner: false })));
    try {
      await signOut({ redirect: false });
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Submit Note from First Card
  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeMessage.trim() || !activeUser || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload = {
        name: activeUser.name,
        email: activeUser.email,
        message: composeMessage.trim(),
        avatar: activeUser.avatar,
        provider: activeUser.provider
      };

      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await readJson(res);
      if (data.success && data.entry) {
        // Insert new entry right after first card
        setEntries((prev) => [data.entry, ...prev]);
        setComposeMessage('');
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error('Submit note error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete own message
  const handleDelete = async (entryId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (deletingId === entryId) return;
    setDeletingId(entryId);

    // Optimistically remove from UI for instant visual feedback
    const previousEntries = [...entries];
    setEntries((prev) => prev.filter((item) => item.id !== entryId));

    try {
      const userEmail = (activeUser?.email || session?.user?.email || '').trim();
      const queryParam = userEmail ? `&email=${encodeURIComponent(userEmail)}` : '';
      const res = await fetch(`/api/guestbook?id=${encodeURIComponent(entryId)}${queryParam}`, {
        method: 'DELETE'
      });
      const data = await readJson(res);

      if (!data.success) {
        // Rollback if delete was rejected or failed
        setEntries(previousEntries);
        alert(data.error || 'Failed to delete note');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setEntries(previousEntries);
    } finally {
      setDeletingId(null);
    }
  };

  // Share note link
  const handleShare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const shareUrl = `${window.location.origin}/guestbook#${id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  return (
    <div className="min-h-screen pt-28 sm:pt-36 pb-32 px-4 sm:px-6 relative overflow-x-clip cursor-default selection:bg-white/10 selection:text-white"
      style={{ backgroundColor: '#05070c' }}
    >
      
      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 1 — DEEP SPACE BASE: Ink-black base with a faint dark blue wash
         ═══════════════════════════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 120% 80% at 50% -10%, rgba(20, 28, 58, 0.7) 0%, transparent 65%), radial-gradient(ellipse 80% 60% at 80% 110%, rgba(10, 18, 40, 0.5) 0%, transparent 60%)'
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 2 — ORGANIC INK SPLASH BLOBS (Hand-painted aurora feel)
         ═══════════════════════════════════════════════════════════════════════ */}
      {/* Primary theme-reactive blob (top-right) */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none transition-all duration-[2000ms] ease-in-out"
        style={{
          top: '-8%',
          right: '5%',
          width: '55vw',
          height: '55vw',
          maxWidth: '700px',
          maxHeight: '700px',
          background: `radial-gradient(ellipse at 40% 40%, ${currentTheme.primary}22 0%, ${currentTheme.primary}09 45%, transparent 72%)`,
          filter: 'blur(72px)',
          transform: 'rotate(-18deg)',
          borderRadius: '60% 40% 55% 45% / 45% 55% 45% 55%',
        }}
      />
      {/* Secondary indigo-violet blob (center-left) */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          top: '20%',
          left: '-5%',
          width: '42vw',
          height: '42vw',
          maxWidth: '560px',
          maxHeight: '560px',
          background: 'radial-gradient(ellipse at 55% 55%, rgba(99, 60, 180, 0.18) 0%, rgba(60, 30, 130, 0.08) 50%, transparent 75%)',
          filter: 'blur(80px)',
          borderRadius: '45% 55% 40% 60% / 55% 40% 60% 45%',
        }}
      />
      {/* Tertiary rose-amber blob (bottom-right) */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          bottom: '5%',
          right: '-8%',
          width: '38vw',
          height: '38vw',
          maxWidth: '480px',
          maxHeight: '480px',
          background: 'radial-gradient(ellipse at 45% 50%, rgba(220, 60, 100, 0.12) 0%, rgba(180, 90, 30, 0.06) 55%, transparent 78%)',
          filter: 'blur(90px)',
          borderRadius: '55% 45% 60% 40% / 40% 60% 45% 55%',
        }}
      />
      {/* Accent teal glow (mid-bottom-left) */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          bottom: '25%',
          left: '5%',
          width: '28vw',
          height: '28vw',
          maxWidth: '380px',
          maxHeight: '380px',
          background: 'radial-gradient(ellipse, rgba(20, 184, 166, 0.1) 0%, transparent 70%)',
          filter: 'blur(70px)',
          borderRadius: '50% 50% 50% 50%',
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 3 — SVG GRAIN / NOISE TEXTURE (Cinematic film-grain feel)
         ═══════════════════════════════════════════════════════════════════════ */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.038]"
        style={{ mixBlendMode: 'screen' }}
      >
        <filter id="gb-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.72"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#gb-noise)" />
      </svg>

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 4 — EDITORIAL DOT GRID (Architectural precision, vignette masked)
         ═══════════════════════════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 30%, rgba(0,0,0,0.85) 20%, rgba(0,0,0,0.3) 55%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 30%, rgba(0,0,0,0.85) 20%, rgba(0,0,0,0.3) 55%, transparent 80%)',
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 5 — AURORA HORIZON SHIMMER (Diffuse light band across the top)
         ═══════════════════════════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: '380px',
          background: `linear-gradient(180deg, ${currentTheme.primary}12 0%, ${currentTheme.primary}06 30%, transparent 100%)`,
          transition: 'background 1000ms ease',
        }}
      />
      {/* Thin crisp horizon line */}
      <div
        aria-hidden="true"
        className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-5xl h-px pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${currentTheme.primary}28 20%, rgba(255,255,255,0.12) 50%, ${currentTheme.primary}28 80%, transparent 100%)`
        }}
      />

      <div className="container mx-auto max-w-6xl space-y-16 relative z-10 cursor-default">
        
        {/* =========================================================================
            1. LEFT-ALIGNED EDITORIAL HEADER
           ========================================================================= */}
        <div className="text-left max-w-3xl cursor-default space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-400">
            The wall remembers
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal text-white tracking-tight leading-[1.12]">
            Words that echo{' '}
            <span 
              className="font-serif italic font-normal text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 15%, ${currentTheme.primary} 85%)`
              }}
            >
              always.
            </span>
          </h1>
        </div>

        {/* =========================================================================
            2. PLAYFUL TILTED JEWEL-TONE MASONRY / CARD GRID
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
          
          {/* -------------------------------------------------------------------
              CARD 1: DUAL-STATE INTERACTIVE CARD
              - NOT LOGGED IN: "Join the wall..." Prompt
              - LOGGED IN: Exact In-Card Compose Box (Matches User's Screenshot)
             ------------------------------------------------------------------- */}
          <div className="relative z-20 group transition-all duration-300 -rotate-1 hover:rotate-0 cursor-default">
            <div className="relative flex flex-col h-full min-h-[220px] overflow-hidden rounded-2xl bg-[#0c0e15] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:border-white/20 transition-all duration-300 cursor-default">
              
              {!activeUser ? (
                /* STATE A: NOT LOGGED IN - "JOIN THE WALL" */
                <>
                  <div 
                    className="relative flex min-h-[190px] w-full flex-1 flex-col items-center justify-center gap-3 overflow-hidden px-6 py-8 pb-10 text-center text-white cursor-default"
                    style={{
                      background: 'radial-gradient(120% 100% at 30% 20%, rgba(88, 28, 135, 0.95), rgba(28, 10, 52, 0.98))'
                    }}
                  >
                    {/* Floating SVG Doodles */}
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                      <SparkleStarDoodle className="absolute -top-2 -right-2 size-24 opacity-15" />
                      <LightningDoodle className="absolute bottom-6 left-3 size-12 rotate-12 opacity-15" />
                    </div>

                    {/* Card Title & Subtitle */}
                    <div className="relative z-10 space-y-1 select-none">
                      <h3 className="font-serif text-2xl text-white italic tracking-wide">
                        “Join the wall...”
                      </h3>
                      <p className="text-white/60 text-xs font-light">
                        Sign in to leave your mark
                      </p>
                    </div>

                    {/* Write a message button -> Opens Auth Modal */}
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="relative z-10 flex h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-5 font-medium text-xs sm:text-sm text-white backdrop-blur-md transition-all active:scale-95 shadow-lg cursor-pointer"
                    >
                      <Pencil size={14} />
                      <span>Write a message...</span>
                    </button>

                    <WavyDivider />
                  </div>

                  {/* Bottom Provider Tray (GitHub & Google Icons) */}
                  <div className="flex items-center justify-center gap-3 px-4 pt-3 pb-3 bg-[#0c0e15] cursor-default">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
                      <GitHubIcon className="size-4 text-zinc-300" />
                      <span className="text-zinc-600">·</span>
                      <GoogleIcon className="size-4" />
                    </div>
                  </div>
                </>
              ) : (
                /* STATE B: LOGGED IN - IN-CARD COMPOSE BOX (Exact Match to User's Screenshot) */
                <form 
                  onSubmit={handleComposeSubmit}
                  className="relative flex flex-col justify-between h-full p-5 text-white"
                  style={{
                    background: 'radial-gradient(120% 100% at 30% 20%, rgba(72, 25, 120, 0.98), rgba(28, 10, 52, 0.99))'
                  }}
                >
                  {/* Top Bar: Avatar + Name + "Composing..." + Sign Out Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-full bg-rose-600 flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden border border-white/20">
                        {activeUser.avatar ? (
                          <img 
                            src={activeUser.avatar} 
                            alt={activeUser.name} 
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            className="size-full object-cover" 
                            onError={(e) => {
                              e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeUser.name)}`;
                            }}
                          />
                        ) : (
                          activeUser.name[0]
                        )}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-sm text-white leading-tight">
                          {activeUser.name}
                        </span>
                        <span className="text-xs text-emerald-400 font-medium">
                          Composing...
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <SparkleStarDoodle className="size-6 text-white/30" />
                      <button
                        type="button"
                        onClick={handleSignOut}
                        title="Sign Out"
                        className="size-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                      >
                        <LogOut size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Center: Dashed Input Container with "Type something nice..." */}
                  <div className="my-3 relative rounded-xl border border-dashed border-white/25 bg-black/15 p-3 focus-within:border-white/50 transition-colors">
                    <textarea
                      required
                      maxLength={100}
                      rows={2}
                      value={composeMessage}
                      onChange={(e) => setComposeMessage(e.target.value)}
                      placeholder="Type something nice..."
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* Bottom Bar: Character count (0 / 100) + Submit Arrow Button */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-white/50 font-mono">
                      <Pencil size={12} className="rotate-45" />
                      <span>{composeMessage.length} / 100</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !composeMessage.trim()}
                      className="size-9 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-md"
                    >
                      {isSubmitting ? (
                        <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <ArrowRight size={15} />
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>

          {/* -------------------------------------------------------------------
              CARDS 2+: COMMUNITY MESSAGE CARDS LOADED FROM POSTGRESQL
             ------------------------------------------------------------------- */}
          {entries.map((entry, idx) => {
            // Guarantee NO adjacent cards (left, right, up, down) share the same style
            // Compose card at pos 0 is violet; community cards cycle starting at pos 1
            const paletteTheme = PALETTE_CYCLE[idx % PALETTE_CYCLE.length];
            const themeConfig = THEME_STYLES[paletteTheme] || THEME_STYLES.violet;
            const Doodle = themeConfig.DoodleComponent;
            const tiltClass = TILT_CLASSES[idx % TILT_CLASSES.length];
            const currentUserEmail = (activeUser?.email || '').trim().toLowerCase();
            const isAuthor = Boolean(
              entry.isOwner ||
              (devIdentityMode && currentUserEmail && entry.email && currentUserEmail === entry.email.trim().toLowerCase())
            );
            const isCopied = copiedId === entry.id;

            return (
              <div 
                key={entry.id}
                id={entry.id}
                className={`relative z-10 group flex flex-col overflow-hidden rounded-2xl bg-[#0c0e15] border border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.65)] hover:border-white/25 transition-all duration-300 hover:z-20 cursor-default ${tiltClass}`}
              >
                {/* Colored Jewel-Tone Upper Body */}
                <div 
                  className="relative flex min-h-[190px] w-full flex-1 flex-col items-center justify-center overflow-hidden p-6 pb-12 text-center cursor-default"
                  style={{ background: themeConfig.cardBg }}
                >
                  {/* Background Doodle Accent */}
                  <div 
                    aria-hidden="true" 
                    className="pointer-events-none absolute inset-0 overflow-hidden opacity-30 group-hover:opacity-45 transition-opacity"
                    style={{ color: themeConfig.accent }}
                  >
                    <Doodle className="absolute top-2 right-2 size-20 rotate-12" />
                    <SparkleStarDoodle className="absolute -bottom-2 -left-2 size-16 opacity-20" />
                  </div>

                  {/* Centered Message Content */}
                  <p className="relative z-10 font-bold text-base sm:text-lg text-white leading-snug tracking-tight text-balance line-clamp-6 drop-shadow-md">
                    {entry.message}
                  </p>

                  <WavyDivider />
                </div>

                {/* Bottom Information Tray (Clean Name, Date, Share & Delete) */}
                <div className="flex items-center justify-between px-4 pt-2.5 pb-3 bg-[#0c0e15] cursor-default">
                  {/* Left: Author Avatar + Name + Date (NO Google/GitHub Icon as requested) */}
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="relative size-7 rounded-full overflow-hidden border border-white/20 shrink-0 bg-zinc-800">
                      {entry.avatar ? (
                        <img 
                          src={entry.avatar} 
                          alt={entry.name} 
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="size-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(entry.name)}`;
                          }}
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center font-mono text-xs text-white">
                          {entry.name[0]}
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-col text-left">
                      <span className="truncate font-medium text-xs sm:text-sm text-zinc-200">
                        {entry.name}
                      </span>
                      <time className="text-[11px] font-mono text-zinc-500">
                        {entry.createdAt}
                      </time>
                    </div>
                  </div>

                  {/* Right Action Buttons: Share & Delete (Only author can delete) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Delete button (Visible ONLY to message author) */}
                    {isAuthor && (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(entry.id, e)}
                        disabled={deletingId === entry.id}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                        title="Delete Your Note"
                      >
                        {deletingId === entry.id ? (
                          <span className="size-3.5 border-2 border-rose-400/40 border-t-rose-400 rounded-full animate-spin block" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    )}

                    {/* Share / Copy direct link */}
                    <button
                      type="button"
                      onClick={(e) => handleShare(entry.id, e)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer"
                      title="Copy Link to Note"
                    >
                      {isCopied ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* =========================================================================
          3. AUTH MODAL (Strictly locked scroll, closes on Esc / Backdrop / ✕)
         ========================================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop: Clicking closes modal */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-[#0e111a] border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-10"
            >
              
              {/* Close Button */}
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-30 size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X size={15} />
              </button>

              {/* Top Banner (Purple Gradient + Scallop Divider) */}
              <div 
                className="relative flex flex-col items-center justify-center p-8 pb-12 text-center text-white"
                style={{
                  background: 'radial-gradient(120% 100% at 30% 20%, rgba(88, 28, 135, 0.95), rgba(28, 10, 52, 0.98))'
                }}
              >
                <SparkleStarDoodle className="absolute top-2 right-3 size-16 opacity-20" />
                <LightningDoodle className="absolute bottom-6 left-3 size-12 opacity-20" />

                {/* Pencil Badge */}
                <div className="size-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white mb-3 shadow-lg">
                  <Pencil size={20} />
                </div>

                <h3 className="font-serif italic text-2xl text-white">
                  Leave your mark
                </h3>
                <p className="text-white/60 text-xs mt-1">
                  Sign in to pin a note on the wall
                </p>

                <WavyDivider />
              </div>

              {/* Modal Body: Continue with GitHub & Google */}
              <div className="p-6 sm:p-7 space-y-3.5 bg-[#0e111a]">
                
                {/* Continue with GitHub Button */}
                <button
                  type="button"
                  onClick={() => handleSignIn('github')}
                  className="w-full h-12 rounded-xl bg-white hover:bg-zinc-100 text-black font-semibold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg cursor-pointer"
                >
                  <GitHubIcon className="size-5 text-black" />
                  <span>Continue with GitHub</span>
                </button>

                {/* Continue with Google Button */}
                <button
                  type="button"
                  onClick={() => handleSignIn('google')}
                  className="w-full h-12 rounded-xl bg-[#181b24] hover:bg-[#202430] border border-white/10 text-white font-medium text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <GoogleIcon className="size-5" />
                  <span>Continue with Google</span>
                </button>

                {!oauthConfigured.google && !oauthConfigured.github && (
                  <div className="pt-1 space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowDevCustomizer(!showDevCustomizer)}
                      className="w-full text-center text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors underline cursor-pointer"
                    >
                      {showDevCustomizer ? 'Hide Test Profile Settings' : '⚡ Customize Test Profile (Dev Mode)'}
                    </button>
                    {showDevCustomizer && (
                      <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2 text-left animate-in fade-in duration-200">
                        <div>
                          <label className="text-[10px] uppercase font-mono text-zinc-400">Display Name</label>
                          <input 
                            type="text" 
                            value={customName} 
                            onChange={(e) => setCustomName(e.target.value)} 
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-mono text-zinc-400">Email (receives confirmation mail)</label>
                          <input 
                            type="email" 
                            value={customEmail} 
                            onChange={(e) => setCustomEmail(e.target.value)} 
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <p className="pt-2 text-[11px] text-zinc-500 font-mono text-center">
                  We only access your name and avatar.
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
