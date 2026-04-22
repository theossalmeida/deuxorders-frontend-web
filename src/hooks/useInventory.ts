"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createInventoryApi } from "@/lib/api/inventory";
import { useToken } from "./useToken";
import { CreateMaterialInput, UpdateMaterialInput, RestockInput } from "@/types/inventory";

export function useInventoryMaterials(params?: { search?: string; status?: boolean }) {
  const token = useToken();
  return useQuery({
    queryKey: ["inventory", params],
    queryFn: () => createInventoryApi(token!).getAll(params),
    enabled: !!token,
    staleTime: 1000 * 60 * 2,
  });
}

export function useInventoryMaterial(id: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["inventory", id],
    queryFn: () => createInventoryApi(token!).getById(id),
    enabled: !!token && !!id,
  });
}

export function useCreateMaterial() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMaterialInput) => createInventoryApi(token!).create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Material criado com sucesso!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateMaterial(id: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMaterialInput) => createInventoryApi(token!).update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Material atualizado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRestockMaterial(id: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RestockInput) => createInventoryApi(token!).restock(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory", id] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Estoque atualizado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useToggleMaterialStatus() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => {
      const api = createInventoryApi(token!);
      return active ? api.setActive(id) : api.setInactive(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["inventory-dropdown"] });
      toast.success("Status atualizado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteMaterial() {
  const token = useToken();
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (id: string) => createInventoryApi(token!).setInactive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Material excluído.");
      router.push("/inventory");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useInventoryDropdown() {
  const token = useToken();
  return useQuery({
    queryKey: ["inventory-dropdown"],
    queryFn: () => createInventoryApi(token!).getDropdown(true),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}
