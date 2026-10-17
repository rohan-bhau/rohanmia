'use client';

import React from 'react';
import { ReactLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.includes('control-room-internal');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, syncTouch: true }}>
      {children}
    </ReactLenis>
  );
}
