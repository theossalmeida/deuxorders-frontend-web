import { NextRequest, NextResponse } from "next/server";
import { checkLoginRateLimit } from "@/lib/rate-limit";
import { setSessionToken } from "@/lib/auth/session";

// BACKEND_URL is server-only and read at runtime (unlike NEXT_PUBLIC_* which
// are baked at build time), so it can be changed in Vercel without a rebuild.
const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rateLimit = await checkLoginRateLimit(req);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        message: `Muitas tentativas. Tente novamente em ${rateLimit.retryAfterSeconds} segundos.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
          "X-RateLimit-Limit": "10",
        },
      }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 400 });
  }

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email e senha são obrigatórios." },
      { status: 400 }
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    console.error("[login] backend fetch failed:", err);
    return NextResponse.json(
      { message: "Serviço temporariamente indisponível." },
      { status: 503 }
    );
  }

  if (!upstream.ok) {
    // Drain the body so the connection can be released; never forward the bytes
    // to the client — backend errors may contain stack traces, SQL fragments, etc.
    await upstream.text().catch(() => "");
    const message =
      upstream.status === 401
        ? "Email ou senha incorretos."
        : upstream.status === 429
          ? "Muitas tentativas no backend."
          : "Não foi possível autenticar no momento.";
    return NextResponse.json({ message }, { status: upstream.status });
  }

  let data: { token: string };
  try {
    data = await upstream.json();
  } catch {
    return NextResponse.json({ message: "Resposta inválida do servidor." }, { status: 502 });
  }

  await setSessionToken(data.token);

  // The _dfp fingerprint cookie is issued by the proxy on the first visit to /login,
  // so it is already present by the time a login attempt is made.
  // No further cookie work needed here.
  return NextResponse.json({ ok: true });
}
