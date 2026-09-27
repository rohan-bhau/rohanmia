'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';
import SmoothScroll from './SmoothScroll';
import AnalyticsTracker from './AnalyticsTracker';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { BookingProvider } from '@/components/booking/BookingContext';
import BookingModal from '@/components/booking/BookingModal';
import CommandPalette from '@/components/layout/CommandPalette';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <BookingProvider>
          <AnalyticsTracker />
          <CommandPalette />
          <BookingModal />
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </BookingProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
