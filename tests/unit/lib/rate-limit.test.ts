import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { checkLoginRateLimit } from "@/lib/rate-limit";

function loginRequest(ip: string, fingerprint?: string): NextRequest {
  const headers: Record<string, string> = { "x-trusted-ip": ip };
  if (fingerprint) headers.cookie = `_dfp=${fingerprint}`;
  return new NextRequest("http://localhost/api/auth/login", { headers });
}

describe("checkLoginRateLimit", () => {
  it("allows requests under the per-key limit", async () => {
    const req = loginRequest("10.0.0.1", "fp-allow");
    const result = await checkLoginRateLimit(req);
    expect(result).toEqual({ allowed: true, retryAfterSeconds: 0 });
  });

  it("blocks a single IP+fingerprint pair after 10 attempts within the window", async () => {
    const ip = "10.0.0.2";
    const fingerprint = "fp-block";

    for (let i = 0; i < 10; i++) {
      const result = await checkLoginRateLimit(loginRequest(ip, fingerprint));
      expect(result.allowed).toBe(true);
    }

    const blocked = await checkLoginRateLimit(loginRequest(ip, fingerprint));
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("falls back to an IP-only key when there is no fingerprint cookie, so deleting it does not grant a fresh bucket", async () => {
    const ip = "10.0.0.3";

    for (let i = 0; i < 10; i++) {
      const result = await checkLoginRateLimit(loginRequest(ip));
      expect(result.allowed).toBe(true);
    }

    // An 11th no-fingerprint request from the same IP consumes the same
    // IP-only bucket rather than getting a new one.
    const blocked = await checkLoginRateLimit(loginRequest(ip));
    expect(blocked.allowed).toBe(false);
  });

  it("caps a single IP at 20 total attempts even across many distinct fingerprints", async () => {
    const ip = "10.0.0.4";

    // Two attempts each from 10 distinct fingerprints exactly exhaust the
    // shared ipLimiter's 20-point budget for this IP, while staying well
    // under each fingerprint's own 10-attempt loginLimiter bucket.
    for (let i = 0; i < 10; i++) {
      const a = await checkLoginRateLimit(loginRequest(ip, `fp-${i}`));
      const b = await checkLoginRateLimit(loginRequest(ip, `fp-${i}`));
      expect(a.allowed).toBe(true);
      expect(b.allowed).toBe(true);
    }

    // The 21st attempt on this IP, even with a brand-new fingerprint (and
    // thus a fresh, unexhausted loginLimiter bucket), is still blocked by
    // the independent ipLimiter cap.
    const blocked = await checkLoginRateLimit(loginRequest(ip, "fp-fresh"));
    expect(blocked.allowed).toBe(false);
  });

  it("keeps separate buckets for different IPs", async () => {
    const first = await checkLoginRateLimit(loginRequest("10.0.0.5", "fp-a"));
    const second = await checkLoginRateLimit(loginRequest("10.0.0.6", "fp-a"));
    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
  });
});
