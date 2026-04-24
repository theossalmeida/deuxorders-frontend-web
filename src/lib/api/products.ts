import { createApiClient, ItemsResponse, unwrapItemsResponse } from "./client";
import { Product, ProductDropdownItem } from "@/types/products";
import { ProductRecipe, SetRecipeInput, MeasureUnit } from "@/types/inventory";

const MEASURE_UNIT_FROM_INT: Record<number, MeasureUnit> = { 1: "ML", 2: "G", 3: "U" };
function normalizeMeasureUnit(v: MeasureUnit | number): MeasureUnit {
  return typeof v === "number" ? (MEASURE_UNIT_FROM_INT[v] ?? "U") : v;
}

interface ProductDto {
  id: string;
  name: string;
  price: number;
  status: boolean;
  image: string | null;
  description: string | null;
  category: string | null;
  size: string | null;
  hasRecipe: boolean;
}

export interface ProductDropdownDto {
  id: string;
  name: string;
  price: number;
  category: string | null;
  size: string | null;
}

function mapProduct(dto: ProductDto): Product {
  return {
    id: dto.id,
    name: dto.name,
    priceCents: dto.price,
    status: dto.status,
    image: dto.image,
    description: dto.description,
    category: dto.category,
    size: dto.size,
    hasRecipe: dto.hasRecipe ?? false,
  };
}

export function mapProductDropdown(dto: ProductDropdownDto): ProductDropdownItem {
  return {
    id: dto.id,
    name: dto.name,
    priceCents: dto.price,
    category: dto.category,
    size: dto.size,
  };
}

export function createProductsApi(token: string) {
  const api = createApiClient(token);

  return {
    getAll: async (params?: { search?: string; status?: boolean; size?: number }) => {
      const search = new URLSearchParams();
      if (params?.search) search.set("search", params.search);
      if (params?.status !== undefined)
        search.set("status", String(params.status));
      if (params?.size !== undefined) search.set("size", String(params.size));
      const qs = search.toString();
      const raw = await api.get<ProductDto[] | ItemsResponse<ProductDto>>(
        `/products/all${qs ? `?${qs}` : ""}`
      );
      return unwrapItemsResponse(raw).map(mapProduct);
    },

    getById: async (id: string) => mapProduct(await api.get<ProductDto>(`/products/${id}`)),

    create: async (formData: FormData) =>
      mapProduct(await api.postForm<ProductDto>("/products/new", formData)),

    update: async (id: string, formData: FormData) =>
      mapProduct(await api.putForm<ProductDto>(`/products/${id}`, formData)),

    setActive: (id: string) => api.patch<void>(`/products/${id}/active`),

    setInactive: (id: string) => api.patch<void>(`/products/${id}/inactive`),

    deleteImage: (id: string) => api.delete<void>(`/products/${id}/image`),

    delete: (id: string) => api.delete<void>(`/products/${id}`),

    getRecipe: async (productId: string): Promise<ProductRecipe> => {
      const raw = await api.get<ProductRecipe>(`/products/${productId}/recipe`);
      return {
        ...raw,
        items: raw.items.map((item) => ({
          ...item,
          measureUnit: normalizeMeasureUnit(item.measureUnit as MeasureUnit | number),
        })),
      };
    },

    setRecipe: (productId: string, input: SetRecipeInput) =>
      api.put<ProductRecipe>(`/products/${productId}/recipe`, input),
  };
}
