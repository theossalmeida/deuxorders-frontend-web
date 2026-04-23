"use client";

import { ApiError } from "@/lib/api/client";
import { useSessionToken } from "@/components/providers/QueryProvider";

export function useToken(): string | null {
  return useSessionToken();
}

export function isSessionExpired(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
