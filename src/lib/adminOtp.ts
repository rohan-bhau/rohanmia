import crypto from 'crypto';
import nodemailer from 'nodemailer';

interface AttemptRecord {
  attempts: number;
  consumed: boolean;
}

// In-memory tracker for rate limiting attempts & preventing replay
const attemptTracker = new Map<string, AttemptRecord>();

// Cleanup stale challenges every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of attemptTracker.entries()) {
      const parts = key.split(':');
      const exp = Number(parts[1] || 0);
      if (exp && now > exp) {
        attemptTracker.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

/**
 * Generate cryptographically secure 6-digit OTP and signed challenge token
 */
export function generateAdminOtp(email: string): {
  otp: string;
  challengeToken: string;
  expiresAt: number;
} {
  const secret = process.env.AUTH_SECRET || 'rohan_secret_fallback_key';
  const otp = crypto.randomInt(100000, 1000000).toString();
  const challengeId = crypto.randomBytes(20).toString('hex');
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  const payload = `${challengeId}:${otp}:${expiresAt}:${email.toLowerCase().trim()}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const challengeToken = `${challengeId}.${expiresAt}.${signature}`;

  attemptTracker.set(`${challengeId}:${expiresAt}`, {
    attempts: 0,
    consumed: false,
  });

  return { otp, challengeToken, expiresAt };
}

/**
 * Timing-safe cryptographic OTP verification
 */
export function verifyAdminOtp(
  challengeToken: string,
  inputOtp: string,
  email: string
): { valid: boolean; error?: string } {
  if (!challengeToken || !inputOtp || !email) {
    return { valid: false, error: 'Verification data is missing.' };
  }

  const parts = challengeToken.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Invalid challenge token.' };
  }

  const [challengeId, expiresAtStr, signature] = parts;
  const expiresAt = Number(expiresAtStr);

  if (!expiresAt || isNaN(expiresAt)) {
    return { valid: false, error: 'Malformed challenge token.' };
  }

  if (Date.now() > expiresAt) {
    return { valid: false, error: 'Verification code has expired. Please request a new one.' };
  }

  const trackerKey = `${challengeId}:${expiresAt}`;
  const record = attemptTracker.get(trackerKey) || { attempts: 0, consumed: false };

  if (record.consumed) {
    return { valid: false, error: 'This verification code has already been used.' };
  }

  if (record.attempts >= 3) {
    return { valid: false, error: 'Maximum attempts exceeded. Please restart login.' };
  }

  const secret = process.env.AUTH_SECRET || 'rohan_secret_fallback_key';
  const cleanOtp = inputOtp.trim();
  const normalizedEmail = email.toLowerCase().trim();

  const expectedPayload = `${challengeId}:${cleanOtp}:${expiresAt}:${normalizedEmail}`;
  const expectedSignature = crypto.createHmac('sha256', secret).update(expectedPayload).digest('hex');

  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    record.attempts += 1;
    attemptTracker.set(trackerKey, record);
    const remaining = 3 - record.attempts;
    return {
      valid: false,
      error: remaining > 0 
        ? `Incorrect code. ${remaining} attempt(s) remaining.` 
        : 'Maximum attempts exceeded. Please restart login.',
    };
  }

  // Mark challenge as consumed so it cannot be re-used
  record.consumed = true;
  attemptTracker.set(trackerKey, record);

  return { valid: true };
}

/**
 * Dispatch high-security 2FA OTP Email to Admin
 */
export async function sendAdminLoginOtpEmail(toEmail: string, otp: string): Promise<boolean> {
  const cleanPassword = (process.env.SMTP_PASSWORD || '').replace(/\s+/g, '');
  const smtpUser = process.env.SMTP_USER || toEmail;

  if (!process.env.SMTP_HOST || !cleanPassword) {
    console.error('[OTP EMAIL] SMTP configuration missing in environment variables.');
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Boolean(process.env.SMTP_SECURE === 'true'),
    auth: {
      user: smtpUser,
      pass: cleanPassword,
    },
  });

  const subject = `🔐 ${otp} is your Control Room Verification Code`;

  const textContent = `Rohan Mia | Control Room 2FA Security
===========================================

Your 6-digit verification code is: ${otp}

This code will expire in 5 minutes.

Security Notice:
If you did not initiate this authentication request, someone may have compromised your master password. Please verify your credentials immediately.

- Rohan Mia Security Gateway
`;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Control Room Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #07090e; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 500px; background-color: #0c0e14; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 32px 36px 20px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
              <span style="display: inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #38bdf8; background-color: rgba(56, 189, 248, 0.1); padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(56, 189, 248, 0.2);">
                2FA Identity Verification
              </span>
              <h1 style="margin: 16px 0 4px; font-size: 22px; font-weight: 600; color: #ffffff; letter-spacing: -0.5px;">
                Control Room Access
              </h1>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                Use the one-time code below to complete your login.
              </p>
            </td>
          </tr>

          <!-- OTP Code Box -->
          <tr>
            <td style="padding: 36px 36px 28px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 22px 10px; display: inline-block; min-width: 260px;">
                <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #38bdf8; display: block; text-shadow: 0 0 25px rgba(56, 189, 248, 0.45);">
                  ${otp}
                </span>
              </div>
              
              <p style="margin: 18px 0 0; font-size: 12px; color: #64748b; font-family: ui-monospace, SFMono-Regular, monospace;">
                ⏱️ Valid for <strong>5 minutes</strong> • Single use only
              </p>
            </td>
          </tr>

          <!-- Security Note -->
          <tr>
            <td style="padding: 0 36px 32px;">
              <div style="background-color: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 12px; padding: 14px 16px; font-size: 12px; line-height: 1.5; color: #fda4af;">
                <strong>Security Alert:</strong> If you did not initiate this login, someone entered your master password. Change it immediately.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 18px 36px; background-color: rgba(255, 255, 255, 0.02); border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <span style="font-size: 11px; color: #64748b; font-family: ui-monospace, SFMono-Regular, monospace;">
                Rohan Mia Portfolio &bull; Stealth Studio Gateway
              </span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Rohan Mia Security" <${smtpUser}>`,
      to: toEmail,
      subject,
      text: textContent,
      html: htmlContent,
      headers: {
        'X-Priority': '1',
        'X-Mailer': 'RohanMia-2FA-Gate',
      },
    });
    return true;
  } catch (err: any) {
    console.error('[OTP EMAIL SEND ERROR]', err.message);
    return false;
  }
}
