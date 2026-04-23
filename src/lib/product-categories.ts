export function isCakeCategory(category?: string | null): boolean {
  const normalized = category?.trim().toLowerCase();
  return normalized === "bolo" || normalized === "bolos";
}
