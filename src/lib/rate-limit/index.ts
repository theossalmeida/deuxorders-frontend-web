import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextRequest } from "next/server";

/**
 * Sliding-window rate limiter: 10 points per 60s per key.
 * Key = IP + device fingerprint cookie (prevents multi-tab bypass).
 */
const loginLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
  blockDuration: 60,
});

/**
 * Hard IP-only limiter as a second layer: 20 req/min regardless of fingerprint.
 */
const ipLimiter = new RateLimiterMemory({
  points: 20,
  duration: 60,
  blockDuration: 120,
});

function extractIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export async function checkLoginRateLimit(
  req: NextRequest
): Promise<RateLimitResult> {
  const ip = extractIp(req);
  const fingerprint = req.cookies.get("_dfp")?.value ?? "no-fp";
  const compositeKey = `${ip}__${fingerprint}`;

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
