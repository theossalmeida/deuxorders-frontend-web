import { ProductCard } from "./product-card";
import { EmptyState } from "@/components/data/empty-state";
import type { Product } from "@/types/products";

export function ProductsGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <EmptyState title="Nenhum produto encontrado" />;
  }

  return (
    <div className="grid grid-cols-2 gap-2 pb-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
