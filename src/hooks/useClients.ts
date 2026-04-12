"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClientsApi } from "@/lib/api/clients";
import { useToken } from "./useToken";
import { CreateClientInput, UpdateClientInput } from "@/types/clients";

export function useClients(params?: { search?: string; status?: boolean }) {
  const token = useToken();
  return useQuery({
    queryKey: ["clients", params],
    queryFn: () => createClientsApi(token!).getAll(params),
    enabled: !!token,
  });
}

export function useCreateClient() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClientInput) => createClientsApi(token!).create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["clients-dropdown"] });
      toast.success("Cliente criado com sucesso!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateClient(id: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateClientInput) => createClientsApi(token!).update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente atualizado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useToggleClientStatus() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => {
      const api = createClientsApi(token!);
      return active ? api.setActive(id) : api.setInactive(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Status atualizado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteClient() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => createClientsApi(token!).delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente excluído.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
