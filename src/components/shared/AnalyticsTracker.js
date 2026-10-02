'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const visitorId = localStorage.getItem('visitor_id') || Math.random().toString(36).substring(7);
    
    if (!localStorage.getItem('visitor_id')) {
      localStorage.setItem('visitor_id', visitorId);
    }

    const track = () => {
      const data = {
        path: pathname,
        visitorId,
        device: window.navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
        browser: window.navigator.userAgent.split(' ')[0],
      };

      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch(() => {});
    };

    track();

    // Heartbeat to track duration (every 10 seconds) - runs silently without triggering router refresh
    const interval = setInterval(() => {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'duration',
          visitorId,
          path: pathname,
          duration: 10,
        }),
        keepalive: true,
      }).catch(() => {});
    }, 10000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}

