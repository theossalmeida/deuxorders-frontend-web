export interface Product {
  id: string;
  name: string;
  priceCents: number;
  status: boolean;
  image: string | null;
  description: string | null;
  category: string | null;
  size: string | null;
  hasRecipe: boolean;
}

export interface ProductDropdownItem {
  id: string;
  name: string;
  priceCents: number;
}
