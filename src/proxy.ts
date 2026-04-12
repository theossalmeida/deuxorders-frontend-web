import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout"];
const AUTH_COOKIE = "auth_token";
const FINGERPRINT_COOKIE = "_dfp";

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

/**
 * Sanitizes the ?from= redirect target.
 * Accepts only relative paths to prevent open-redirect attacks.
 */
function sanitizeRedirect(raw: string | null): string {
  if (!raw) return "/dashboard";
  try {
    const decoded = decodeURIComponent(raw);
    // Must start with / but not // (protocol-relative URL like //evil.com)
    if (decoded.startsWith("/") && !decoded.startsWith("//")) return decoded;
  } catch {
    // malformed percent-encoding
  }
  return "/dashboard";
}

/**
 * Decodes the JWT payload without verifying the signature.
 * Used only to check expiry — the backend verifies the signature on every request.
 */
function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof payload.exp !== "number") return false;
    return Date.now() / 1000 > payload.exp;
  } catch {
    return true;
  }
}

export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Inject the real client IP as a trusted header so the rate limiter cannot be
  // spoofed via a user-supplied X-Forwarded-For. On Vercel Edge the platform sets
  // x-real-ip to the socket IP before the request reaches this function.
  const trustedIp =
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ??
    "unknown";

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-trusted-ip", trustedIp);

  // Issue the device fingerprint on every request to /login or /api/auth/login
  // so brute-forcers get a persistent fingerprint even before a successful login.
  const needsFingerprint =
    isPublic(pathname) && !req.cookies.get(FINGERPRINT_COOKIE);

  if (isPublic(pathname)) {
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    if (needsFingerprint) {
      res.cookies.set(FINGERPRINT_COOKIE, crypto.randomUUID(), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
        path: "/",
      });
    }
    return res;
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value;

  if (!token || isJwtExpired(token)) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", sanitizeRedirect(pathname));
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(AUTH_COOKIE);
    return res;
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Exclude Next.js internals, favicon, and all static file extensions served from public/
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpe?g|gif|svg|ico|webp|woff2?|ttf|otf)$).*)"],
};
