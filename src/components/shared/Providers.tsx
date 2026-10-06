'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';
import SmoothScroll from './SmoothScroll';
import AnalyticsTracker from './AnalyticsTracker';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { BookingProvider } from '@/components/booking/BookingContext';
import BookingModal from '@/components/booking/BookingModal';
import CommandPalette from '@/components/layout/CommandPalette';
import { ToastProvider } from '@/components/admin/ui/Toast';

import { AccentColor } from '@/types/theme';

export default function Providers({ 
  children,
  initialAccent = 'cyan'
}: { 
  children: React.ReactNode;
  initialAccent?: AccentColor;
}) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <ThemeProvider initialAccent={initialAccent}>
        <BookingProvider>
          <ToastProvider>
            <AnalyticsTracker />
            <CommandPalette />
            <BookingModal />
            <SmoothScroll>
              {children}
            </SmoothScroll>
          </ToastProvider>
        </BookingProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
