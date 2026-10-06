'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Strictly track authentic public portfolio destinations
function isPublicDestination(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === '/') return true;
  if (pathname.startsWith('/about')) return true;
  if (pathname.startsWith('/projects')) return true;
  if (pathname.startsWith('/tech-stack')) return true;
  if (pathname.startsWith('/gallery')) return true;
  if (pathname.startsWith('/guestbook')) return true;
  if (pathname.startsWith('/links')) return true;
  if (pathname.startsWith('/contact')) return true;
  return false;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Strictly track only public visitor routes - never track private admin or API paths
    if (!isPublicDestination(pathname)) {
      return;
    }

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
