"use client";

// SECURITY TRADE-OFF (read before changing):
// The session JWT is stored in an httpOnly cookie, but this endpoint exposes it
// to JS so the client can call the backend directly with `Authorization: Bearer`.
// That means httpOnly protects against *nothing* in a post-XSS scenario — any
// script running in this origin can `fetch("/api/auth/token")` and exfiltrate
// the token. CSP (see next.config.ts) is the real defense here; do NOT weaken
// `script-src` without replacing this pattern first.
//
// Long-term: proxy all API calls through Next route handlers that read the
// cookie server-side, and delete /api/auth/token entirely.

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";

export function useToken(): string | null {
  const router = useRouter();

  const { data } = useQuery<{ token: string | null }>({
    queryKey: ["auth-token"],
    queryFn: async () => {
      const res = await fetch("/api/auth/token");
      if (res.status === 401) {
        router.replace("/login");
        return { token: null };
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return data?.token ?? null;
}

export function isSessionExpired(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
