import { createApiClient, ItemsResponse, unwrapItemsResponse } from "./client";
import { Product, ProductDropdownItem } from "@/types/products";

interface ProductDto {
  id: string;
  name: string;
  price: number;
  status: boolean;
  image: string | null;
  description: string | null;
  category: string | null;
  size: string | null;
}

export interface ProductDropdownDto {
  id: string;
  name: string;
  price: number;
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
  };
}

export function mapProductDropdown(dto: ProductDropdownDto): ProductDropdownItem {
  return { id: dto.id, name: dto.name, priceCents: dto.price };
}

export function createProductsApi(token: string) {
  const api = createApiClient(token);

  return {
    getAll: async (params?: { search?: string; status?: boolean }) => {
      const search = new URLSearchParams();
      if (params?.search) search.set("search", params.search);
      if (params?.status !== undefined)
        search.set("status", String(params.status));
      const qs = search.toString();
      const raw = await api.get<ProductDto[] | ItemsResponse<ProductDto>>(
        `/products/all?size=100${qs ? `&${qs}` : ""}`
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
  };
}
