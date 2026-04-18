"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AppHeader } from "@/components/shell/app-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductGallery } from "@/components/features/products/detail/product-gallery";
import { toneFor } from "@/lib/category-tone";
import { useProduct, useToggleProductStatus, useDeleteProduct } from "@/hooks/useProducts";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading } = useProduct(id);

  const { mutate: toggleStatus, isPending: togglingStatus } = useToggleProductStatus();
  const { mutate: deleteProduct, isPending: deleting } = useDeleteProduct();

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

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

  const resolvedName = name || product.name;
  const resolvedPrice = price || product.priceCents / 100;
  const resolvedDescription = description || product.description || "";
  const resolvedCategory = category || product.category || "";
  const tone = toneFor(product.category ?? undefined);
  const images = [product.image, null, null, null] as (string | null)[];
  const margin = resolvedPrice > 0 ? ((resolvedPrice - resolvedPrice * 0.6) / resolvedPrice) * 100 : 0;

  function handleDelete() {
    if (!confirm("Excluir este produto? Esta ação não pode ser desfeita.")) return;
    deleteProduct(product!.id, { onSuccess: () => router.push("/products") });
  }

  return (
    <>
      <div className="hidden md:block">
        <AppHeader
          title={product.name}
          subtitle={`Produtos · ${product.category ?? "Sem categoria"}`}
          actions={
            <>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Switch
                  checked={product.status}
                  disabled={togglingStatus}
                  onCheckedChange={(v) => toggleStatus({ id: product.id, active: v })}
                />
                {product.status ? "Ativo" : "Pausado"}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 size={14} /> Excluir
              </Button>
              <Button size="sm">Salvar alterações</Button>
            </>
          }
        />
      </div>

      <div className="sticky top-0 z-20 flex items-center gap-3 bg-background px-4 pt-14 pb-3 md:hidden">
        <button type="button" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </button>
        <span className="font-semibold">{product.name}</span>
        <div className="ml-auto flex items-center gap-2">
          <Switch
            checked={product.status}
            disabled={togglingStatus}
            onCheckedChange={(v) => toggleStatus({ id: product.id, active: v })}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 px-4 pt-4 pb-8 md:grid-cols-[1fr_1.3fr] md:px-7 md:pt-5">
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

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Informações básicas
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Nome</Label>
                <Input value={resolvedName} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Descrição</Label>
                <Textarea value={resolvedDescription} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Categoria</Label>
                <Input value={resolvedCategory} onChange={(e) => setCategory(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Preço e estoque
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Preço</Label>
                <Input value={resolvedPrice} type="number" step="0.01" onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Custo</Label>
                <Input type="number" step="0.01" className="font-mono" placeholder="0,00" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Margem</Label>
                <Input value={`${margin.toFixed(1)}%`} readOnly className="font-mono bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
