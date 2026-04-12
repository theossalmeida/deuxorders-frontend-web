"use client";

import { Suspense } from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

type FormData = z.infer<typeof schema>;

const MAX_CLIENT_ATTEMPTS = 5;
const BASE_COOLDOWN_MS = 5000;

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") ?? "/dashboard";

  const [attempts, setAttempts] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [remaining, setRemaining] = useState(0);

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
  const isBlocked = attempts >= MAX_CLIENT_ATTEMPTS && isCoolingDown;

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (isCoolingDown) return;

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
      toast.error(body.message ?? "Erro ao autenticar.");

      if (newAttempts >= 3) {
        const delay = Math.min(BASE_COOLDOWN_MS * 2 ** (newAttempts - 3), 60000);
        setCooldownUntil(Date.now() + delay);
      }
    },
    [attempts, isCoolingDown, from, router]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-white/90">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          placeholder="seu@email.com"
          disabled={isSubmitting || isBlocked}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-300">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-white/90">
          Senha
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          disabled={isSubmitting || isBlocked}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-red-300">{errors.password.message}</p>
        )}
      </div>

      {isCoolingDown && (
        <div className="flex items-center gap-2 rounded-md border border-red-400/30 bg-red-500/20 px-3 py-2">
          <AlertTriangle className="h-4 w-4 text-red-300 shrink-0" />
          <p className="text-xs text-red-200">
            Aguarde <span className="font-bold">{remaining}s</span> antes de tentar novamente.
          </p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-white text-[#581629] hover:bg-white/90 font-bold"
        disabled={isSubmitting || isBlocked}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#581629" }}>
      <div className="w-full max-w-sm px-6">
        <div className="flex flex-col items-center mb-8">
          <span className="text-white text-4xl font-bold tracking-tight">DeuxOrders</span>
          <span className="text-white/60 text-sm mt-1">Gestão de pedidos Deuxcerie</span>
        </div>

        <Suspense fallback={<div className="h-48" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
