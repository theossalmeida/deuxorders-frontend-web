"use client";

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
  });

  return data?.token ?? null;
}

export function isSessionExpired(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
