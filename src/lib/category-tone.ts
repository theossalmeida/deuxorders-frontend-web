export const CATEGORY_TONE: Record<string, string> = {
  "Bolos":      "#a8324a",
  "Tortas":     "#d4b14a",
  "Doces":      "#6b3a20",
  "Sobremesas": "#4a2a1a",
  "Salgados":   "#a07a3a",
  "Bebidas":    "#3a7a8a",
};

export const DEFAULT_CATEGORY_TONE = "#9a8a75";

export function toneFor(category?: string | null): string {
  if (!category) return DEFAULT_CATEGORY_TONE;
  return CATEGORY_TONE[category] ?? DEFAULT_CATEGORY_TONE;
}
