'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccentColor, THEME_OPTIONS, ThemeOption } from '@/types/theme';

interface ThemeContextType {
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  themes: ThemeOption[];
  currentTheme: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'rohan_portfolio_accent';

export function ThemeProvider({ 
  children,
  initialAccent = 'cyan'
}: { 
  children: React.ReactNode;
  initialAccent?: AccentColor;
}) {
  const [accent, setAccentState] = useState<AccentColor>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as AccentColor;
        if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
          return saved;
        }
      } catch {}
    }
    return initialAccent;
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as AccentColor;
      if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
        if (saved !== accent) {
          setAccentState(saved);
        }
        document.documentElement.setAttribute('data-accent', saved);
        document.cookie = `${STORAGE_KEY}=${saved}; path=/; max-age=31536000; SameSite=Lax`;
      } else {
        document.documentElement.setAttribute('data-accent', initialAccent);
      }
    } catch {
      document.documentElement.setAttribute('data-accent', initialAccent);
    }
  }, [initialAccent]);

  const setAccent = (newAccent: AccentColor) => {
    setAccentState(newAccent);
    try {
      localStorage.setItem(STORAGE_KEY, newAccent);
      document.cookie = `${STORAGE_KEY}=${newAccent}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.setAttribute('data-accent', newAccent);
    } catch {
      // ignore storage failure
    }
  };

  const currentTheme = THEME_OPTIONS.find((t) => t.id === accent) || THEME_OPTIONS[0];

  return (
    <ThemeContext.Provider value={{ accent, setAccent, themes: THEME_OPTIONS, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeAccent() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeAccent must be used within a ThemeProvider');
  }
  return context;
}
