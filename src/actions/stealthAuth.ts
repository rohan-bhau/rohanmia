'use server';

import { signIn, signOut } from '@/auth';
import { checkRateLimit, resetRateLimit } from '@/lib/rateLimit';
import { headers } from 'next/headers';

export async function loginToControlRoom(formData: FormData) {
  const headerList = await headers();
  const forwardedFor = headerList.get('x-forwarded-for') || 'local';
  const clientIp = forwardedFor.split(',')[0].trim();
  const rateLimitKey = `admin_login:${clientIp}`;

  // Rate Limiting: Max 5 failed attempts per 15 minutes
  const limitCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
  if (!limitCheck.success) {
    const minutesLeft = Math.ceil(limitCheck.retryAfterSeconds / 60);
    return {
      success: false,
      error: `Too many failed attempts. Security lock active for ${minutesLeft} minute(s).`,
    };
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: 'Access Denied: Invalid credentials.' };
    }

    resetRateLimit(rateLimitKey);
    return { success: true };
  } catch (err: any) {
    if (err?.type === 'CredentialsSignin') {
      return { success: false, error: 'Access Denied: Invalid credentials.' };
    }
    return { success: false, error: 'Authentication error. Please try again.' };
  }
}

export async function logoutFromControlRoom() {
  await signOut({ redirect: false });
  return { success: true };
}
