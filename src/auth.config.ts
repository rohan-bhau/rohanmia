import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    error: '/guestbook',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const user = auth?.user as any;
      const isAdmin = user?.role === 'admin' || user?.id === 'admin';
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      
      if (isOnAdmin) {
        if (isAdmin) return true;
        return false; // Redirect to login
      }
      return true;
    },
  },
  providers: [], // Configured in src/auth.ts
  trustHost: true,
};
