export function isCakeCategory(category?: string | null): boolean {
  const normalized = category?.trim().toLowerCase();
  return normalized === "bolo" || normalized === "bolos";
}

export function isBrigadeiroCategory(category?: string | null): boolean {
  const normalized = category?.trim().toLowerCase();
  return normalized === "brigadeiro" || normalized === "brigadeiros";
}

export function isCookieCategory(category?: string | null): boolean {
  const normalized = category?.trim().toLowerCase();
  return normalized === "cookie" || normalized === "cookies";
}
