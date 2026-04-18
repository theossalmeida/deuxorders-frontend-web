"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/shell/app-header";
import { MobileTopBar } from "@/components/shell/mobile-top-bar";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { ProductsToolbar } from "@/components/features/products/products-toolbar";
import { ProductsGrid } from "@/components/features/products/products-grid";
import { useProducts } from "@/hooks/useProducts";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const { data: products = [], isLoading } = useProducts();

  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[])).sort(),
    [products],
  );

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === "all" || p.category === category) &&
          (search === "" || p.name.toLowerCase().includes(search.toLowerCase())),
      ),
    [products, category, search],
  );

  return (
    <>
      <div className="hidden md:block">
        <AppHeader
          title="Produtos"
          subtitle={`${products.length} produtos no catálogo`}
          actions={
            <Button size="sm" className="gap-1.5">
              <Plus size={14} /> Novo produto
            </Button>
          }
        />
      </div>
      <MobileTopBar
        title="Produtos"
        right={
          <Button size="sm" className="h-9 gap-1.5">
            <Plus size={14} /> Novo
          </Button>
        }
      />

      <div className="space-y-3 px-4 pt-3 md:px-7 md:pt-5">
        <ProductsToolbar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          categories={categories}
        />
        {isLoading ? <SkeletonList variant="products" count={8} /> : <ProductsGrid products={filtered} />}
      </div>
    </>
  );
}
