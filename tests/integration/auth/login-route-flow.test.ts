import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const store = new Map<string, string>();
const cookieJar = {
  get: vi.fn((name: string) => {
    const value = store.get(name);
    return value === undefined ? undefined : { name, value };
  }),
  set: vi.fn((name: string, value: string) => {
    store.set(name, value);
  }),
  delete: vi.fn((name: string) => store.delete(name)),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieJar),
}));

// checkLoginRateLimit is intentionally left unmocked: this suite exercises
// the real rate-limit + route + session integration, not a stub of it.
import { POST } from "@/app/api/auth/login/route";

function loginRequest(
  ip: string,
  body: unknown,
  opts: { fingerprint?: string; raw?: string } = {}
): NextRequest {
  const headers: Record<string, string> = {
    "x-trusted-ip": ip,
    "Content-Type": "application/json",
  };
  if (opts.fingerprint) headers.cookie = `_dfp=${opts.fingerprint}`;

  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    headers,
    body: opts.raw ?? JSON.stringify(body),
  });
}

function upstreamResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn(async () => body),
    text: vi.fn(async () => (typeof body === "string" ? body : JSON.stringify(body))),
  } as unknown as Response;
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    store.clear();
    cookieJar.set.mockClear();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("rejects a request missing email or password before touching the upstream", async () => {
    const res = await POST(loginRequest("20.0.0.1", { email: "a@b.com" }, { fingerprint: "fp" }));

    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects a malformed JSON body", async () => {
    const res = await POST(
      loginRequest("20.0.0.2", undefined, { fingerprint: "fp", raw: "{not json" })
    );

    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("logs in successfully: sets the session cookie and returns ok", async () => {
    vi.mocked(fetch).mockResolvedValue(upstreamResponse(200, { token: "jwt-abc" }));

    const res = await POST(
      loginRequest(
        "20.0.0.3",
        { email: "ana@deuxcerie.com.br", password: "secret" },
        { fingerprint: "fp" }
      )
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(cookieJar.set).toHaveBeenCalledWith(
      "auth_token",
      "jwt-abc",
      expect.objectContaining({ httpOnly: true })
    );
    const [upstreamUrl] = vi.mocked(fetch).mock.calls[0];
    expect(upstreamUrl).toBe("https://backend.test.local/auth/login");
  });

  it("maps an upstream 401 to a friendly message and never sets a session", async () => {
    vi.mocked(fetch).mockResolvedValue(upstreamResponse(401, "unauthorized"));

    const res = await POST(
      loginRequest(
        "20.0.0.4",
        { email: "ana@deuxcerie.com.br", password: "wrong" },
        { fingerprint: "fp" }
      )
    );

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ message: "Email ou senha incorretos." });
    expect(cookieJar.set).not.toHaveBeenCalled();
  });

  it("returns 503 when the upstream is unreachable", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("ECONNREFUSED"));

    const res = await POST(
      loginRequest(
        "20.0.0.5",
        { email: "ana@deuxcerie.com.br", password: "secret" },
        { fingerprint: "fp" }
      )
    );

    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({
      message: "Serviço temporariamente indisponível.",
    });
  });

  it("returns 502 when the upstream responds ok but with an unparseable body", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn(async () => {
        throw new SyntaxError("Unexpected token");
      }),
      text: vi.fn(async () => ""),
    } as unknown as Response);

    const res = await POST(
      loginRequest(
        "20.0.0.6",
        { email: "ana@deuxcerie.com.br", password: "secret" },
        { fingerprint: "fp" }
      )
    );

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({ message: "Resposta inválida do servidor." });
  });

  it("blocks after 10 attempts from the same IP+fingerprint and never calls the upstream for the blocked one", async () => {
    vi.mocked(fetch).mockResolvedValue(upstreamResponse(401, "no"));
    const ip = "20.0.0.7";
    const fingerprint = "fp-block";

    for (let i = 0; i < 10; i++) {
      const res = await POST(
        loginRequest(ip, { email: "a@b.com", password: "wrong" }, { fingerprint })
      );
      expect(res.status).not.toBe(429);
    }

    const callsBefore = vi.mocked(fetch).mock.calls.length;
    const blocked = await POST(
      loginRequest(ip, { email: "a@b.com", password: "wrong" }, { fingerprint })
    );

    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBeTruthy();
    expect(vi.mocked(fetch).mock.calls.length).toBe(callsBefore);
  });

  it("caps a single IP at 20 attempts even when each request uses a fresh fingerprint", async () => {
    vi.mocked(fetch).mockResolvedValue(upstreamResponse(401, "no"));
    const ip = "20.0.0.8";

    for (let i = 0; i < 10; i++) {
      await POST(loginRequest(ip, { email: "a@b.com", password: "x" }, { fingerprint: `fp-${i}` }));
      await POST(loginRequest(ip, { email: "a@b.com", password: "x" }, { fingerprint: `fp-${i}` }));
    }

    const blocked = await POST(
      loginRequest(ip, { email: "a@b.com", password: "x" }, { fingerprint: "fp-fresh" })
    );
    expect(blocked.status).toBe(429);
  });
});
