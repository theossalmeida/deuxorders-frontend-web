"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCashApi } from "@/lib/api/cash";
import { useToken } from "./useToken";
import type {
  CashFlowFilters,
  CreateCashFlowEntryInput,
  UpdateCashFlowEntryInput,
} from "@/types/cash";

export function useCashEntries(filters: CashFlowFilters) {
  const token = useToken();
  return useQuery({
    queryKey: ["cash", "entries", filters],
    queryFn: () => createCashApi(token!).list(filters),
    enabled: !!token,
  });
}

export function useCashEntry(id: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["cash", "entries", id],
    queryFn: () => createCashApi(token!).getById(id),
    enabled: !!token && !!id,
  });
}

export function useCashSummary(filters: Omit<CashFlowFilters, "page" | "size" | "includeDeleted">) {
  const token = useToken();
  return useQuery({
    queryKey: ["cash", "summary", filters],
    queryFn: () => createCashApi(token!).summary(filters),
    enabled: !!token,
  });
}

export function useCreateCashEntry() {
  const token = useToken();
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (input: CreateCashFlowEntryInput) =>
      createCashApi(token!).create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cash"] });
      toast.success("Lançamento criado.");
      router.push("/cash");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateCashEntry(id: string) {
  const token = useToken();
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (input: UpdateCashFlowEntryInput) =>
      createCashApi(token!).update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cash"] });
      toast.success("Lançamento atualizado.");
      router.push("/cash");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCashEntry() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      createCashApi(token!).delete(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cash"] });
      toast.success("Lançamento excluído.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
