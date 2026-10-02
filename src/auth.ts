import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { authConfig } from './auth.config';
import { z } from 'zod';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || process.env.GITHUB_SECRET || '',
    }),
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            return { id: 'admin', email, name: 'Admin', role: 'admin' };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.sub as string) || (token.id as string);
        if (token.picture) session.user.image = token.picture as string;
        if (token.email) session.user.email = token.email as string;
        if (token.name) session.user.name = token.name as string;
        session.user.role = (token.role as string) || 'user';
        session.user.isAdmin = token.role === 'admin';
      }
      return session;
    },
    async jwt({ token, user, profile, account }) {
      if (user) {
        token.id = user.id;
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
        if (user.image) token.picture = user.image;
        token.role = (user as any)?.role === 'admin' || user?.id === 'admin' ? 'admin' : 'user';
      }
      if (profile) {
        const p = profile as Record<string, any>;
        const avatar = p.picture || p.avatar_url;
        if (avatar) {
          token.picture = avatar;
        }
      }
      // Strict security barrier: OAuth accounts (Google/GitHub) from Guestbook are ALWAYS role 'user'
      if (account && (account.provider === 'google' || account.provider === 'github')) {
        token.role = 'user';
      }
      return token;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  debug: false,
});

