'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';
import SmoothScroll from './SmoothScroll';
import AnalyticsTracker from './AnalyticsTracker';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <AnalyticsTracker />
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </ThemeProvider>
    </SessionProvider>
  );
}
