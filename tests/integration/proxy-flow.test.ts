import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

function base64Url(value: string): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function makeJwt(payload: Record<string, unknown>): string {
  const header = base64Url(JSON.stringify({ alg: "none" }));
  const body = base64Url(JSON.stringify(payload));
  return `${header}.${body}.sig`;
}

function request(
  path: string,
  opts: { cookies?: Record<string, string>; headers?: Record<string, string> } = {}
): NextRequest {
  const headers: Record<string, string> = { ...opts.headers };
  const cookieHeader = Object.entries(opts.cookies ?? {})
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  if (cookieHeader) headers.cookie = cookieHeader;
  return new NextRequest(`http://localhost${path}`, { headers });
}

describe("proxy middleware", () => {
  it("redirects the root path to /dashboard", () => {
    const res = proxy(request("/"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/dashboard");
  });

  it("issues a device fingerprint cookie on a first visit to /login", () => {
    const res = proxy(request("/login"));
    const cookie = res.cookies.get("_dfp");
    expect(cookie).toBeDefined();
    expect(cookie!.value).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it("does not reissue the fingerprint cookie once one already exists", () => {
    const res = proxy(request("/login", { cookies: { _dfp: "existing-fp" } }));
    expect(res.cookies.get("_dfp")).toBeUndefined();
  });

  it("also skips auth entirely for the public login API routes", () => {
    const res = proxy(request("/api/auth/login"));
    // A redirect location header would indicate the auth guard kicked in.
    expect(res.headers.get("location")).toBeNull();
  });

  it("redirects a protected path with no auth cookie to /login, preserving the target", () => {
    const res = proxy(request("/orders"));
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("from")).toBe("/orders");
  });

  it("redirects and clears the cookie when the auth token is expired", () => {
    const expired = makeJwt({ exp: Math.floor(Date.now() / 1000) - 60 });
    const res = proxy(request("/orders", { cookies: { auth_token: expired } }));

    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(res.cookies.get("auth_token")?.value).toBe("");
  });

  it("redirects when the auth token cannot be decoded at all", () => {
    const res = proxy(request("/orders", { cookies: { auth_token: "garbage" } }));
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/login");
  });

  it("passes protected requests through when the token is valid and unexpired", () => {
    const valid = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    const res = proxy(request("/orders", { cookies: { auth_token: valid } }));

    expect(res.headers.get("location")).toBeNull();
  });

  it("passes through a token with no exp claim (treated as non-expiring)", () => {
    const valid = makeJwt({ sub: "user-1" });
    const res = proxy(request("/orders", { cookies: { auth_token: valid } }));

    expect(res.headers.get("location")).toBeNull();
  });

  it("prefers x-real-ip over x-forwarded-for when trusting the client IP", () => {
    const valid = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    const res = proxy(
      request("/orders", {
        cookies: { auth_token: valid },
        headers: { "x-real-ip": "9.9.9.9", "x-forwarded-for": "1.1.1.1, 2.2.2.2" },
      })
    );
    expect(res.headers.get("x-middleware-request-x-trusted-ip")).toBe("9.9.9.9");
  });

  it("falls back to the last x-forwarded-for hop when x-real-ip is absent", () => {
    const valid = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    const res = proxy(
      request("/orders", {
        cookies: { auth_token: valid },
        headers: { "x-forwarded-for": "1.1.1.1, 2.2.2.2" },
      })
    );
    expect(res.headers.get("x-middleware-request-x-trusted-ip")).toBe("2.2.2.2");
  });
});
