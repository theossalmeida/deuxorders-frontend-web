"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

type FormData = z.infer<typeof schema>;

/**
 * UX-only friction — does NOT provide security.
 * Real rate limit is enforced server-side by checkLoginRateLimit().
 */
const CLIENT_BACKOFF_THRESHOLD = 3;
const BASE_COOLDOWN_MS = 5000;

function sanitizeRedirect(raw: string | null): string {
  if (!raw) return "/dashboard";
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded.startsWith("/") && !decoded.startsWith("//")) return decoded;
  } catch {
    // malformed percent-encoding
  }
  return "/dashboard";
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = sanitizeRedirect(params.get("from"));

  const [attempts, setAttempts] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (cooldownUntil <= Date.now()) {
      setRemaining(0);
      return;
    }
    const id = setInterval(() => {
      const r = Math.ceil((cooldownUntil - Date.now()) / 1000);
      if (r <= 0) {
        setRemaining(0);
        clearInterval(id);
      } else {
        setRemaining(r);
      }
    }, 500);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const isCoolingDown = remaining > 0;
  const isDisabled = isSubmitting || isCoolingDown;

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (isCoolingDown) return;
      setError(null);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.replace(from);
        return;
      }

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (res.status === 429) {
        const retryAfter = Number(res.headers.get("Retry-After") ?? 60);
        setCooldownUntil(Date.now() + retryAfter * 1000);
        toast.error(`Muitas tentativas. Aguarde ${retryAfter}s.`);
        return;
      }

      const body = await res.json().catch(() => ({ message: "Erro desconhecido." }));
      setError(body.message ?? "Erro ao autenticar.");

      if (newAttempts >= CLIENT_BACKOFF_THRESHOLD) {
        const delay = Math.min(BASE_COOLDOWN_MS * 2 ** (newAttempts - CLIENT_BACKOFF_THRESHOLD), 60000);
        setCooldownUntil(Date.now() + delay);
      }
    },
    [attempts, isCoolingDown, from, router]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label
          htmlFor="email"
          className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          E-mail
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          placeholder="voce@deuxcerie.com.br"
          disabled={isDisabled}
          className="h-11 bg-card"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="password"
          className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Senha
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          disabled={isDisabled}
          className="h-11 bg-card"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {(error || isCoolingDown) && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-px" aria-hidden />
          <p className="text-xs text-destructive">
            {isCoolingDown
              ? `Aguarde ${remaining}s antes de tentar novamente.`
              : error}
          </p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isDisabled}
        className="h-11 w-full gap-2 text-sm font-semibold"
      >
        {isSubmitting ? (
          <Loader2 size={14} className="animate-spin" aria-hidden />
        ) : (
          <>Entrar <ArrowRight size={14} aria-hidden /></>
        )}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen md:grid md:grid-cols-2 bg-background">
      {/* Brand canvas — desktop only */}
      <div
        className="relative hidden md:flex flex-col justify-between p-10 text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%)" }}
      >
        <div>
          <div className="font-display text-2xl font-semibold">Deuxcerie</div>
          <div className="mt-1 text-xs font-mono opacity-70">DeuxERP · v2.0</div>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="font-display text-5xl leading-[1.05] tracking-tight">
            Todos os pedidos,<br />
            <span className="italic opacity-85">em um só lugar.</span>
          </div>
          <div className="mt-5 text-sm opacity-75 leading-relaxed">
            Gerencie pedidos, caixa, clientes, produtos e estoque em um só lugar.
          </div>
        </div>

        <div className="text-[11px] font-mono opacity-50">
          © 2026 Deuxcerie · Rio de Janeiro
        </div>

        {/* Decorative rings */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-1/3 h-[420px] w-[420px] rounded-full border border-white/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-1/4 h-[260px] w-[260px] rounded-full border border-white/10"
        />
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-16 md:px-16">
        <div className="w-full max-w-sm">
          {/* Mobile headline */}
          <div className="md:hidden mb-10">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Deuxcerie
            </div>
            <div className="mt-2 font-display text-[44px] leading-[1.02] tracking-tight">
              Bem-vindo<br />
              <span className="italic text-brand">de volta.</span>
            </div>
          </div>

          {/* Desktop headline */}
          <div className="hidden md:block mb-8">
            <div className="text-sm font-semibold tracking-tight">Entre na sua conta</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Acesse o painel do Atelier ERP
            </div>
          </div>

          <Suspense fallback={<div className="h-48" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
