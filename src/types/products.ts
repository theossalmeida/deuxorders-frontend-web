export interface Product {
  id: string;
  name: string;
  price: number;
  status: boolean;
  image: string | null;
  description: string | null;
  category: string | null;
  size: string | null;
}

export interface ProductDropdownItem {
  id: string;
  name: string;
  price: number;
}
