"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCashApi } from "@/lib/api/cash";
import { useToken } from "./useToken";
import type {
  CashFlowEntry,
  CashFlowFilters,
  CreateCashFlowEntryInput,
  UpdateCashFlowEntryInput,
} from "@/types/cash";

export type CashChartPoint = { d: string; in: number; out: number };

function formatChartDay(iso: string): string {
  const [, m, day] = iso.split("-");
  const months = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
  return `${parseInt(day)} ${months[parseInt(m) - 1]}`;
}

function buildChartData(entries: CashFlowEntry[]): CashChartPoint[] {
  const map = new Map<string, { in: number; out: number }>();
  for (const e of entries) {
    if (e.deletedAt) continue;
    const day = e.billingDate.slice(0, 10);
    const acc = map.get(day) ?? { in: 0, out: 0 };
    if (e.type === "Inflow") acc.in += e.amountCents;
    else acc.out += e.amountCents;
    map.set(day, acc);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, v]) => ({ d: formatChartDay(day), in: v.in / 100, out: v.out / 100 }));
}

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

export function useCashFlowChart(filters: Pick<CashFlowFilters, "from" | "to">) {
  const token = useToken();
  return useQuery({
    queryKey: ["cash", "chart", filters],
    queryFn: async () => {
      const result = await createCashApi(token!).list(filters);
      return buildChartData(result.items);
    },
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
