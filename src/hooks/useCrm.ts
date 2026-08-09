"use client";

import { useQuery } from "@tanstack/react-query";
import { createCrmApi } from "@/lib/api/crm";
import { useToken } from "./useToken";

export function useCrmList(params?: {
  search?: string;
  page?: number;
  size?: number;
  lastOrderFrom?: string;
  lastOrderTo?: string;
}) {
  const token = useToken();

  return useQuery({
    queryKey: ["crm", params],
    queryFn: () => createCrmApi(token!).getList(params),
    enabled: !!token,
  });
}
