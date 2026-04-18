import type { OrderStatus } from "@/types/orders";

export type StatusMeta = {
  label: string;
  bg: string;
  fg: string;
  dot: string;
};

export const STATUS_META: Record<OrderStatus, StatusMeta> = {
  Received: {
    label: "Recebido",
    bg: "bg-sky-50",
    fg: "text-sky-800",
    dot: "bg-sky-500",
  },
  Pending: {
    label: "Pendente",
    bg: "bg-amber-50",
    fg: "text-amber-800",
    dot: "bg-amber-500",
  },
  Preparing: {
    label: "Preparando",
    bg: "bg-orange-50",
    fg: "text-orange-800",
    dot: "bg-orange-500",
  },
  WaitingPickupOrDelivery: {
    label: "Aguardando entrega",
    bg: "bg-violet-50",
    fg: "text-violet-800",
    dot: "bg-violet-500",
  },
  Completed: {
    label: "Concluído",
    bg: "bg-emerald-50",
    fg: "text-emerald-800",
    dot: "bg-emerald-500",
  },
  Canceled: {
    label: "Cancelado",
    bg: "bg-red-50",
    fg: "text-red-700",
    dot: "bg-red-500",
  },
};
