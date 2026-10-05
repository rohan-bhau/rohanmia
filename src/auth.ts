import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { verifyAdminOtp } from '@/lib/adminOtp';

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
        // 2FA OTP verification required to authorize admin session
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            otp: z.string().length(6),
            challengeToken: z.string().min(10),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, otp, challengeToken } = parsedCredentials.data;
          const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

          if (!adminEmail) {
            return null;
          }

          const inputEmail = email.trim().toLowerCase();
          if (inputEmail === adminEmail) {
            const result = verifyAdminOtp(challengeToken, otp, adminEmail);
            if (result.valid) {
              return { 
                id: 'admin', 
                email: adminEmail, 
                name: 'Admin', 
                role: 'admin',
                isAdmin: true 
              };
            }
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, profile, account }) {
      if (account) {
        token.provider = account.provider;
      }

      // Only credentials provider can grant admin access
      if (token.provider === 'credentials' && ((user as any)?.role === 'admin' || token.role === 'admin')) {
        token.role = 'admin';
        token.isAdmin = true;
      } else {
        token.role = 'user';
        token.isAdmin = false;
      }

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
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.sub as string) || (token.id as string);
        if (token.picture) session.user.image = token.picture as string;
        if (token.email) session.user.email = token.email as string;
        if (token.name) session.user.name = token.name as string;

        // Double verification: Must be credentials provider AND admin email from env
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const userEmail = (token.email as string || '').trim().toLowerCase();
        const isVerifiedAdmin = 
          Boolean(adminEmail) &&
          token.provider === 'credentials' && 
          token.role === 'admin' && 
          token.isAdmin === true &&
          userEmail === adminEmail;

        session.user.role = isVerifiedAdmin ? 'admin' : 'user';
        session.user.isAdmin = isVerifiedAdmin;
      }
      return session;
    },
  },
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  debug: false,
});
