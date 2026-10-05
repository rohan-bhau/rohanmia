'use server';

import { signIn, signOut } from '@/auth';
import { checkRateLimit, resetRateLimit } from '@/lib/rateLimit';
import { generateAdminOtp, sendAdminLoginOtpEmail } from '@/lib/adminOtp';
import { headers } from 'next/headers';
import bcrypt from 'bcryptjs';

/**
 * Helper to get client IP and verify rate limiting
 */
async function getClientIp() {
  const headerList = await headers();
  const forwardedFor = headerList.get('x-forwarded-for') || 'local';
  return forwardedFor.split(',')[0].trim();
}

function isLocalIp(clientIp: string): boolean {
  return (
    !clientIp ||
    clientIp === 'local' ||
    clientIp === 'localhost' ||
    clientIp === '127.0.0.1' ||
    clientIp === '::1' ||
    clientIp.includes('127.0.0.1') ||
    clientIp.includes('::ffff:127.0.0.1')
  );
}

export async function loginToControlRoom(formData: FormData) {
  return initiateAdminLogin(formData);
}

/**
 * Step 1: Validate Email + Password and dispatch 6-digit 2FA OTP to Admin Email
 */
export async function initiateAdminLogin(formData: FormData) {
  const clientIp = await getClientIp();
  const rateLimitKey = `admin_login:${clientIp}`;

  if (!isLocalIp(clientIp)) {
    const limitCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
    if (!limitCheck.success) {
      const minutesLeft = Math.ceil(limitCheck.retryAfterSeconds / 60);
      return {
        success: false,
        error: `Too many attempts. Security lockout active for ${minutesLeft} minute(s).`,
      };
    }
  }

  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const password = (formData.get('password') as string || '').trim();

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminHash = process.env.ADMIN_PASSWORD_HASH?.trim();

  if (!adminEmail || !adminHash) {
    return { success: false, error: 'Server authentication configuration is missing.' };
  }

  if (email !== adminEmail) {
    return { success: false, error: 'Access Denied: Invalid credentials.' };
  }

  const isPasswordMatch = await bcrypt.compare(password, adminHash);
  if (!isPasswordMatch) {
    return { success: false, error: 'Access Denied: Invalid credentials.' };
  }

  // Credentials verified! Generate 6-digit OTP and send to Admin Email
  const { otp, challengeToken } = generateAdminOtp(adminEmail);
  const emailSent = await sendAdminLoginOtpEmail(adminEmail, otp);

  if (!emailSent) {
    return {
      success: false,
      error: 'Could not send verification email. Please check your SMTP settings.',
    };
  }

  return {
    success: true,
    requireOtp: true,
    challengeToken,
    email: adminEmail,
  };
}

/**
 * Step 1.5: Resend OTP if needed
 */
export async function resendAdminOtp(email: string) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail || email.trim().toLowerCase() !== adminEmail) {
    return { success: false, error: 'Invalid request.' };
  }

  const { otp, challengeToken } = generateAdminOtp(adminEmail);
  const emailSent = await sendAdminLoginOtpEmail(adminEmail, otp);

  if (!emailSent) {
    return { success: false, error: 'Failed to resend verification email.' };
  }

  return {
    success: true,
    challengeToken,
  };
}

/**
 * Step 2: Verify 6-digit OTP and create authenticated NextAuth Admin Session
 */
export async function verifyOtpAndLogin(formData: FormData) {
  const clientIp = await getClientIp();
  const rateLimitKey = `admin_login:${clientIp}`;

  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const otp = (formData.get('otp') as string || '').trim();
  const challengeToken = (formData.get('challengeToken') as string || '').trim();

  if (!email || !otp || !challengeToken) {
    return { success: false, error: 'Verification code is required.' };
  }

  if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    return { success: false, error: 'Please enter a valid 6-digit code.' };
  }

  try {
    const result = await signIn('credentials', {
      email,
      otp,
      challengeToken,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: 'Invalid or expired verification code.' };
    }

    resetRateLimit(rateLimitKey);
    return { success: true };
  } catch (err: any) {
    if (err?.message === 'NEXT_REDIRECT' || err?.digest?.includes('NEXT_REDIRECT')) {
      resetRateLimit(rateLimitKey);
      return { success: true };
    }
    if (err?.type === 'CredentialsSignin' || err?.message?.includes('CredentialsSignin')) {
      return { success: false, error: 'Invalid or expired verification code.' };
    }
    return { success: false, error: 'Authentication failed. Please try again.' };
  }
}

/**
 * Sign out of Control Room
 */
export async function logoutFromControlRoom() {
  await signOut({ redirect: false });
  return { success: true };
}
