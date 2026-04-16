"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrdersApi, uploadToPresignedUrl } from "@/lib/api/orders";
import { useToken } from "./useToken";
import {
  Order,
  CreateOrderInput,
  UpdateOrderInput,
  OrderStatus,
} from "@/types/orders";

export function useOrders(params?: { page?: number; size?: number; status?: OrderStatus }) {
  const token = useToken();
  
  return useQuery({
    queryKey: ["orders", params, token], 
    // O params agora pode conter o 'size'
    queryFn: () => createOrdersApi(token!).getAll(params),
    enabled: !!token,
  });
}

export function useOrder(id: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const order = await createOrdersApi(token!).getById(id);
      return { ...order, references: order.references ?? [] };
    },
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
  });

  const products = useQuery({
    queryKey: ["products-dropdown"],
    queryFn: () => api!.getProductsDropdown(),
    enabled: !!token,
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
      const objectKeys: string[] = [];

      for (const file of imageFiles) {
        const { uploadUrl, objectKey } = await api.getPresignedUrl({
          fileName: file.name,
          contentType: file.type,
        });
        await uploadToPresignedUrl(uploadUrl, file, file.type);
        objectKeys.push(objectKey);
      }

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders", orderId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

function normalizeOrder(order: Order): Order {
  return { ...order, references: order.references ?? [] };
}

export function useUpdateOrder(id: string) {
  const token = useToken();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateOrderInput) =>
      createOrdersApi(token!).update(id, input),
    onSuccess: (updated: Order) => {
      qc.setQueryData(["orders", id], normalizeOrder(updated));
      qc.invalidateQueries({ queryKey: ["orders"] });
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
      toast.success("Pedido excluído.");
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
      qc.setQueryData(["orders", id], normalizeOrder(updated));
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
      qc.setQueryData(["orders", id], normalizeOrder(updated));
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["cash"] });
      toast.success("Pagamento estornado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
