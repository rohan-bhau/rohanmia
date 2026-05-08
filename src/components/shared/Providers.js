'use client';

import { SessionProvider } from 'next-auth/react';
import { createContext, useContext, useEffect, useState } from 'react';
import SmoothScroll from './SmoothScroll';
import AnalyticsTracker from './AnalyticsTracker';

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

function CustomThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme, mounted]);

  // Prevent hydration flicker
  if (!mounted) return <div style={{ visibility: 'hidden' }}>{children}</div>;

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <CustomThemeProvider>
        <AnalyticsTracker />
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </CustomThemeProvider>
    </SessionProvider>
  );
}
