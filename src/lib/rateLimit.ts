// Lightweight, in-memory sliding window rate limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Checks if an identifier (e.g. IP or email) has exceeded max attempts within windowMs.
 * @param key unique identifier (e.g., "login:127.0.0.1")
 * @param maxAttempts maximum allowed attempts (e.g., 5)
 * @param windowMs window duration in milliseconds (e.g., 15 * 60 * 1000 = 15 min)
 * @returns { success: boolean, remaining: number, retryAfterSeconds: number }
 */
export function checkRateLimit(key: string, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { success: false, remaining: 0, retryAfterSeconds };
  }

  record.count += 1;
  return { success: true, remaining: maxAttempts - record.count, retryAfterSeconds: 0 };
}

export function resetRateLimit(key: string) {
  rateLimitMap.delete(key);
}
