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

function isBotUser(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;
  if (navigator.webdriver) return true;
  const ua = (navigator.userAgent || '').toLowerCase();
  return /bot|crawler|spider|googlebot|google-inspectiontool|bingbot|yandex|slurp|duckduckbot|baiduspider|headlesschrome/i.test(ua);
}

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Strictly track only public visitor routes and ignore bots/crawlers
    if (!isPublicDestination(pathname) || isBotUser()) {
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

    // Non-blocking deferred dispatch for genuine visitors
    let idleHandle: number | undefined;
    let timerHandle: ReturnType<typeof setTimeout> | undefined;

    if (typeof window.requestIdleCallback === 'function') {
      idleHandle = window.requestIdleCallback(track, { timeout: 3000 });
    } else {
      timerHandle = setTimeout(track, 1000);
    }

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

    return () => {
      if (idleHandle && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleHandle);
      }
      if (timerHandle) {
        clearTimeout(timerHandle);
      }
      clearInterval(interval);
    };
  }, [pathname]);

  return null;
}
