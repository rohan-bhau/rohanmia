import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    error: '/guestbook',
  },
  callbacks: {
    authorized() {
      // In our stealth architecture, session gating is handled internally
      // inside /control-room-internal without exposing public /login redirects
      return true;
    },
  },
  providers: [],
  trustHost: true,
};
