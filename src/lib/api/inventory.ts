import { createApiClient, ItemsResponse, unwrapItemsResponse } from "./client";
import {
  InventoryMaterial,
  InventoryDropdownItem,
  CreateMaterialInput,
  UpdateMaterialInput,
  RestockInput,
  MeasureUnit,
} from "@/types/inventory";

interface InventoryMaterialDto {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
  measureUnit: MeasureUnit;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

function mapMaterial(dto: InventoryMaterialDto): InventoryMaterial {
  return {
    id: dto.id,
    name: dto.name,
    quantity: dto.quantity,
    unitCost: dto.unitCost,
    measureUnit: dto.measureUnit,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function createInventoryApi(token: string) {
  const api = createApiClient(token);

  return {
    getAll: async (params?: { search?: string; status?: boolean; page?: number; size?: number }) => {
      const search = new URLSearchParams();
      if (params?.search) search.set("search", params.search);
      if (params?.status !== undefined) search.set("status", String(params.status));
      if (params?.page !== undefined) search.set("page", String(params.page));
      if (params?.size !== undefined) search.set("size", String(params.size));
      const qs = search.toString();
      const raw = await api.get<InventoryMaterialDto[] | ItemsResponse<InventoryMaterialDto>>(
        `/inventory/all${qs ? `?${qs}` : ""}`
      );
      return unwrapItemsResponse(raw).map(mapMaterial);
    },

    getById: async (id: string) =>
      mapMaterial(await api.get<InventoryMaterialDto>(`/inventory/${id}`)),

    create: async (input: CreateMaterialInput) =>
      mapMaterial(await api.post<InventoryMaterialDto>("/inventory/new", input)),

    update: async (id: string, input: UpdateMaterialInput) =>
      mapMaterial(await api.put<InventoryMaterialDto>(`/inventory/${id}`, input)),

    restock: async (id: string, input: RestockInput) =>
      mapMaterial(await api.post<InventoryMaterialDto>(`/inventory/${id}/restock`, input)),

    setActive: (id: string) => api.patch<void>(`/inventory/${id}/active`),

    setInactive: (id: string) => api.patch<void>(`/inventory/${id}/inactive`),

    getDropdown: async (status?: boolean): Promise<InventoryDropdownItem[]> => {
      const qs = status !== undefined ? `?status=${status}` : "";
      return api.get<InventoryDropdownItem[]>(`/inventory/dropdown${qs}`);
    },
  };
}
