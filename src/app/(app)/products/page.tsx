"use client";

import { useState, useMemo } from "react";
import { AppHeader } from "@/components/shell/app-header";
import { MobileTopBar } from "@/components/shell/mobile-top-bar";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { ProductsToolbar } from "@/components/features/products/products-toolbar";
import { ProductsGrid } from "@/components/features/products/products-grid";
import { NewProductSheet } from "@/components/features/products/new-product-sheet";
import { useProducts } from "@/hooks/useProducts";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [showInactive, setShowInactive] = useState(false);

  const { data: products = [], isLoading } = useProducts(
    showInactive ? { size: 100 } : { status: true, size: 100 },
  );

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
          subtitle={`${filtered.length} produto${filtered.length !== 1 ? "s" : ""}`}
          actions={
            <NewProductSheet />
          }
        />
      </div>
      <MobileTopBar
        title="Produtos"
        right={<NewProductSheet compact triggerLabel="Novo produto" />}
      />

      <div className="space-y-3 px-4 pt-3 md:px-7 md:pt-5">
        <ProductsToolbar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          categories={categories}
          showInactive={showInactive}
          onShowInactiveChange={setShowInactive}
        />
        {isLoading ? <SkeletonList variant="products" count={8} /> : <ProductsGrid products={filtered} />}
      </div>
    </>
  );
}
