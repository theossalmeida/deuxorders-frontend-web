"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCents } from "@/lib/format";
import { toneFor } from "@/lib/category-tone";
import { buildRefSrc } from "@/lib/image-ref";
import { useToggleProductStatus } from "@/hooks/useProducts";
import type { Product } from "@/types/products";

export function ProductCard({ product }: { product: Product }) {
  const tone = toneFor(product.category ?? undefined);
  const { mutate: toggleStatus, isPending } = useToggleProductStatus();

  return (
    <div className={cn("group relative overflow-hidden rounded-xl border border-border bg-card transition-opacity", !product.status && "opacity-55")}>
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square">
          {product.image ? (
            <Image
              src={buildRefSrc(product.image)}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 200px"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{ background: `repeating-linear-gradient(135deg, ${tone}22, ${tone}22 6px, ${tone}11 6px, ${tone}11 12px)` }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full opacity-30" style={{ background: tone }} />
              </div>
            </div>
          )}
          {product.category ? (
            <div className="absolute left-2 top-2 font-mono text-[9px] font-semibold uppercase tracking-wider" style={{ color: tone }}>
              {product.category}
            </div>
          ) : null}
        </div>
        <div className="px-3 py-2.5">
          <div className="line-clamp-2 min-h-[2.5em] text-[12px] font-medium leading-snug pr-6">
            {product.name}
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <div className="font-mono text-[13px] font-semibold">
              {formatCents(product.priceCents)}
            </div>
            {product.hasRecipe ? (
              <BookOpen size={12} className="text-muted-foreground/60" aria-label="Possui receita" />
            ) : null}
          </div>
        </div>
      </Link>

      <button
        type="button"
        disabled={isPending}
        onClick={() => toggleStatus({ id: product.id, active: !product.status })}
        className={cn(
          "absolute right-2 top-2 h-5 w-5 rounded-full border text-[8px] font-bold transition-colors",
          product.status
            ? "border-ok/40 bg-ok/10 text-ok hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40"
            : "border-muted-foreground/30 bg-card text-muted-foreground hover:bg-ok/10 hover:text-ok hover:border-ok/40",
        )}
        title={product.status ? "Pausar produto" : "Ativar produto"}
      >
        {product.status ? "●" : "○"}
      </button>
    </div>
  );
}
