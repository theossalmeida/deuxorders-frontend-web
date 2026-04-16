import { createApiClient } from "./client";
import type {
  CashFlowEntry,
  CashFlowFilters,
  CashFlowSummary,
  CreateCashFlowEntryInput,
  PaginatedCashEntries,
  UpdateCashFlowEntryInput,
} from "@/types/cash";

function buildCashParams(filters: CashFlowFilters): string {
  const p = new URLSearchParams();
  if (filters.from) p.set("from", filters.from);
  if (filters.to) p.set("to", filters.to);
  if (filters.type) p.set("type", filters.type);
  if (filters.category) p.set("category", filters.category);
  if (filters.source) p.set("source", filters.source);
  if (filters.includeDeleted) p.set("includeDeleted", "true");
  if (filters.page) p.set("page", String(filters.page));
  if (filters.size) p.set("size", String(filters.size));
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

export function createCashApi(token: string) {
  const api = createApiClient(token);
  return {
    list: (filters: CashFlowFilters) =>
      api.get<PaginatedCashEntries>(`/cash/entries${buildCashParams(filters)}`),

    getById: (id: string) =>
      api.get<CashFlowEntry>(`/cash/entries/${id}`),

    create: (input: CreateCashFlowEntryInput) =>
      api.post<CashFlowEntry>("/cash/entries", input),

    update: (id: string, input: UpdateCashFlowEntryInput) =>
      api.put<CashFlowEntry>(`/cash/entries/${id}`, input),

    delete: (id: string, reason: string) =>
      api.delete<void>(`/cash/entries/${id}`, { reason }),

    summary: (filters: Omit<CashFlowFilters, "page" | "size" | "includeDeleted">) =>
      api.get<CashFlowSummary>(`/cash/summary${buildCashParams(filters)}`),

    auditLog: (entryId: string) =>
      api.get<unknown[]>(`/cash/audit/${entryId}`),
  };
}
