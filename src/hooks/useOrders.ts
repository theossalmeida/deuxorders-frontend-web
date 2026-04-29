"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createDashboardApi } from "@/lib/api/dashboard";
import { createOrdersApi, uploadToPresignedUrl, OrderUpdateResult } from "@/lib/api/orders";
import { useToken } from "./useToken";
import {
  Order,
  CreateOrderInput,
  UpdateOrderInput,
  OrderStatus,
} from "@/types/orders";
import type { DashboardFilters } from "@/types/dashboard";

type ExportFormat = "csv" | "pdf";

export function useOrders(params?: {
  page?: number;
  size?: number;
  status?: OrderStatus;
  from?: string;
  to?: string;
  search?: string;
}) {
  const token = useToken();

  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => createOrdersApi(token!).getAll(params),
    enabled: !!token,
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function useExportOrders(filters: DashboardFilters) {
  const token = useToken();

  return useMutation({
    mutationFn: async (format: ExportFormat) => {
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");
      const blob = await createDashboardApi(token).exportOrders(filters, format);
      return { blob, format };
    },
    onSuccess: ({ blob, format }) => {
      downloadBlob(blob, `pedidos_${new Date().toISOString().slice(0, 10)}.${format}`);
      toast.success(`Exportação ${format.toUpperCase()} iniciada.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useOrder(id: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => createOrdersApi(token!).getById(id),
    enabled: !!token && !!id,
  });
}

export function useOrdersDropdownData() {
  const token = useToken();
  const api = token ? createOrdersApi(token) : null;

  const clients = useQuery({
    queryKey: ["clients-dropdown"],
    queryFn: () => api!.getClientsDropdown(),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });

  const products = useQuery({
    queryKey: ["products-dropdown"],
    queryFn: () => api!.getProductsDropdown(),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });

  return { clients, products };
}

export function useCreateOrder() {
  const token = useToken();
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      input,
      imageFiles,
    }: {
      input: Omit<CreateOrderInput, "references">;
      imageFiles: File[];
    }) => {
      const api = createOrdersApi(token!);

      const objectKeys = await Promise.all(
        imageFiles.map(async (file) => {
          const { uploadUrl, objectKey } = await api.getPresignedUrl({
            fileName: file.name,
            contentType: file.type,
          });
          await uploadToPresignedUrl(uploadUrl, file, file.type);
          return objectKey;
        }),
      );

      return api.create({ ...input, references: objectKeys.length ? objectKeys : undefined });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Pedido criado com sucesso!");
      router.push("/orders");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCancelOrderItem(orderId: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) =>
      createOrdersApi(token!).cancelItem(orderId, productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders", orderId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteReference(orderId: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (objectKey: string) =>
      createOrdersApi(token!).deleteReference(orderId, objectKey),
    onSuccess: (updated) => {
      qc.setQueryData(["orders", orderId], updated);
      qc.invalidateQueries({ queryKey: ["orders", orderId] });
      toast.success("Referência removida.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateOrder(id: string) {
  const token = useToken();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateOrderInput) =>
      createOrdersApi(token!).update(id, input),
    onSuccess: (result: OrderUpdateResult) => {
      qc.setQueryData(["orders", id], result.order);
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      result.warnings.forEach((w) => toast.warning(w));
      toast.success("Pedido atualizado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCompleteOrder() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => createOrdersApi(token!).complete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Pedido concluído.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCancelOrder() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => createOrdersApi(token!).cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Pedido cancelado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteOrder() {
  const token = useToken();
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (id: string) => createOrdersApi(token!).delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Pedido cancelado.");
      router.push("/orders");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMarkOrderAsPaid(id: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => createOrdersApi(token!).markAsPaid(id),
    onSuccess: (updated: Order) => {
      qc.setQueryData(["orders", id], updated);
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["cash"] });
      toast.success("Pedido marcado como pago.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUnmarkOrderAsPaid(id: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => createOrdersApi(token!).unmarkAsPaid(id, reason),
    onSuccess: (updated: Order) => {
      qc.setQueryData(["orders", id], updated);
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["cash"] });
      toast.success("Pagamento estornado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
