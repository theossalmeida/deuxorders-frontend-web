import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toneFor } from "@/lib/category-tone";

export function ProductGallery({
  images,
  category,
  onUpload,
}: {
  images: (string | null)[];
  category?: string;
  onUpload?: () => void;
}) {
  const tone = toneFor(category);
  const main = images[0];

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-square overflow-hidden rounded-xl border border-border"
        style={
          !main
            ? {
                background: `repeating-linear-gradient(135deg, ${tone}22, ${tone}22 8px, ${tone}11 8px, ${tone}11 16px)`,
              }
            : undefined
        }
      >
        {main ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={main} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 rounded-full opacity-30" style={{ background: tone }} />
          </div>
        )}
        {category && (
          <div
            className="absolute left-3 top-3 font-mono text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: tone }}
          >
            {category}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => {
          const img = images[i] ?? null;
          const isSelected = i === 0;
          return (
            <button
              key={i}
              type="button"
              onClick={!img ? onUpload : undefined}
              className={cn(
                "aspect-square rounded-lg border flex items-center justify-center text-muted-foreground overflow-hidden",
                isSelected ? "border-brand" : "border-border",
              )}
              style={!img ? { background: `${tone}${isSelected ? "30" : "15"}` } : undefined}
            >
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt="" className="h-full w-full object-cover" />
              ) : i === 3 ? (
                <Plus size={18} />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
