import { NextRequest, NextResponse } from "next/server";
import { checkLoginRateLimit } from "@/lib/rate-limit";
import { setSessionToken } from "@/lib/auth/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

  const upstream = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    const message =
      upstream.status === 401
        ? "Email ou senha incorretos."
        : text || "Erro ao autenticar.";
    return NextResponse.json({ message }, { status: upstream.status });
  }

  const data: { token: string } = await upstream.json();

  await setSessionToken(data.token);

  // Set device fingerprint cookie for rate-limit multi-tab protection.
  // A random ID is issued on first login and lives for 24 h.
  const response = NextResponse.json({ ok: true });
  if (!req.cookies.get("_dfp")) {
    const fp = crypto.randomUUID();
    response.cookies.set("_dfp", fp, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
  }

  return response;
}
