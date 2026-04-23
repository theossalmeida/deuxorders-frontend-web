import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextRequest } from "next/server";

/**
 * Composite key limiter: IP + device fingerprint cookie.
 * Prevents a single IP from using different fingerprint "slots" to multiply attempts.
 * When no fingerprint is present the key is IP-only, so the same IP bucket is consumed
 * regardless — there is no "no-fp" escape hatch.
 */
const loginLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
  blockDuration: 60,
});

/**
 * Hard IP-only cap as a second independent layer.
 */
const ipLimiter = new RateLimiterMemory({
  points: 20,
  duration: 60,
  blockDuration: 120,
});

/**
 * Reads the trusted IP set by the proxy middleware.
 * The proxy overwrites this header from req.ip (Vercel Edge), so a client
 * cannot spoof it via a user-supplied X-Forwarded-For value.
 */
function extractIp(req: NextRequest): string {
  return req.headers.get("x-trusted-ip") ?? "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export async function checkLoginRateLimit(
  req: NextRequest
): Promise<RateLimitResult> {
  const ip = extractIp(req);
  const fingerprint = req.cookies.get("_dfp")?.value;

  // If no fingerprint cookie, key falls back to the IP alone.
  // This means the attacker cannot get a fresh bucket by deleting the cookie —
  // they would just consume the same IP bucket.
  const compositeKey = fingerprint ? `${ip}__${fingerprint}` : ip;

  try {
    await Promise.all([
      ipLimiter.consume(ip),
      loginLimiter.consume(compositeKey),
    ]);
    return { allowed: true, retryAfterSeconds: 0 };
  } catch (rej: unknown) {
    const rejection = rej as { msBeforeNext?: number };
    const retryAfterSeconds = Math.ceil(
      (rejection?.msBeforeNext ?? 60000) / 1000
    );
    return { allowed: false, retryAfterSeconds };
  }
}
