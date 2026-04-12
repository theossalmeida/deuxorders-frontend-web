"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createProductsApi } from "@/lib/api/products";
import { useToken } from "./useToken";

export function useProducts(params?: { search?: string; status?: boolean }) {
  const token = useToken();
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => createProductsApi(token!).getAll(params),
    enabled: !!token,
  });
}

export function useCreateProduct() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createProductsApi(token!).create(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto criado com sucesso!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateProduct(id: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createProductsApi(token!).update(id, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto atualizado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useToggleProductStatus() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => {
      const api = createProductsApi(token!);
      return active ? api.setActive(id) : api.setInactive(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Status atualizado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteProduct() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => createProductsApi(token!).delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto excluído.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
