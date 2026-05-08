'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { trackPageView, updatePageDuration } from '@/actions/analytics';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const visitorId = localStorage.getItem('visitor_id') || Math.random().toString(36).substring(7);
    
    if (!localStorage.getItem('visitor_id')) {
      localStorage.setItem('visitor_id', visitorId);
    }

    const track = async () => {
      const data = {
        path: pathname,
        visitorId,
        device: window.navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
        browser: window.navigator.userAgent.split(' ')[0],
      };

      await trackPageView(data);
    };

    track();

    // Heartbeat to track duration (every 10 seconds)
    const interval = setInterval(() => {
      updatePageDuration(visitorId, pathname, 10);
    }, 10000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
