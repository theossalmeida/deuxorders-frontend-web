"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppHeader } from "@/components/shell/app-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductGallery } from "@/components/features/products/detail/product-gallery";
import { formatBRL } from "@/lib/format";
import { toneFor } from "@/lib/category-tone";
import { useProducts } from "@/hooks/useProducts";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: products = [], isLoading } = useProducts();
  const product = products.find((p) => p.id === id);

  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price ?? 0);
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState(product?.category ?? "");

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 pt-4 md:px-7">
        <Skeleton className="h-12 rounded-xl" />
        <div className="grid gap-4 md:grid-cols-[1fr_1.3fr]">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <p className="text-muted-foreground">Produto não encontrado.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    );
  }

  const tone = toneFor(product.category ?? undefined);
  const images = [product.image, null, null, null] as (string | null)[];

  const margin =
    price > 0 ? ((price - (price * 0.6)) / price) * 100 : 0;

  return (
    <>
      <div className="hidden md:block">
        <AppHeader
          title={product.name}
          subtitle={`Produtos · ${product.category ?? "Sem categoria"}`}
          actions={
            <>
              <Button variant="outline" size="sm">
                Duplicar
              </Button>
              <Button size="sm">Salvar alterações</Button>
            </>
          }
        />
      </div>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex items-center gap-3 bg-background px-4 pt-14 pb-3 md:hidden">
        <button type="button" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </button>
        <span className="font-semibold">{product.name}</span>
      </div>

      <div className="grid gap-4 px-4 pt-4 pb-8 md:grid-cols-[1fr_1.3fr] md:px-7 md:pt-5">
        {/* Left: gallery + performance */}
        <div className="space-y-4">
          <ProductGallery images={images} category={product.category ?? undefined} />

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Desempenho · este mês
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-muted-foreground">Vendidos</div>
                <div className="font-mono text-[22px] font-semibold">—</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">Receita</div>
                <div className="font-mono text-[22px] font-semibold">—</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: info cards */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Informações básicas
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Nome
                </Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Descrição
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Categoria
                </Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Preço e estoque
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Preço
                </Label>
                <Input
                  value={price}
                  type="number"
                  step="0.01"
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Custo
                </Label>
                <Input type="number" step="0.01" className="font-mono" placeholder="0,00" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Margem
                </Label>
                <Input
                  value={`${margin.toFixed(1)}%`}
                  readOnly
                  className="font-mono bg-muted"
                />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: product.status ? "var(--ok)" : "var(--muted-foreground)" }}
              />
              <span className="text-xs text-muted-foreground">
                {product.status ? "Produto ativo e visível no catálogo." : "Produto pausado."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
