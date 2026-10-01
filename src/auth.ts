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
            return { id: 'admin', email, name: 'Admin' };
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
      }
      return session;
    },
    async jwt({ token, user, profile }) {
      if (user) {
        token.id = user.id;
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
        if (user.image) token.picture = user.image;
      }
      if (profile) {
        const p = profile as Record<string, any>;
        const avatar = p.picture || p.avatar_url;
        if (avatar) {
          token.picture = avatar;
        }
      }
      return token;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
});
