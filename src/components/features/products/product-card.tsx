import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCents } from "@/lib/format";
import { toneFor } from "@/lib/category-tone";
import type { Product } from "@/types/products";

export function ProductCard({ product }: { product: Product }) {
  const tone = toneFor(product.category ?? undefined);

  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        "group overflow-hidden rounded-xl border border-border bg-card transition-opacity",
        !product.status && "opacity-55",
      )}
    >
      <div className="relative aspect-square">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `repeating-linear-gradient(135deg, ${tone}22, ${tone}22 6px, ${tone}11 6px, ${tone}11 12px)`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full opacity-30" style={{ background: tone }} />
            </div>
          </div>
        )}
        {product.category ? (
          <div
            className="absolute left-2 top-2 font-mono text-[9px] font-semibold uppercase tracking-wider"
            style={{ color: tone }}
          >
            {product.category}
          </div>
        ) : null}
        {!product.status ? (
          <div className="absolute right-2 top-2 rounded bg-card px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pausa
          </div>
        ) : null}
      </div>

      <div className="px-3 py-2.5">
        <div className="line-clamp-2 min-h-[2.5em] text-[12px] font-medium leading-snug">
          {product.name}
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <div className="font-mono text-[13px] font-semibold">{formatCents(product.priceCents)}</div>
          <ChevronRight
            size={14}
            className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>
      </div>
    </Link>
  );
}
