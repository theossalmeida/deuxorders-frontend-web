export const CAKE_DOUGHS = [
  "Baunilha",
  "Red Velvet",
  "Chocolate",
  "Limão",
  "Caramelo",
] as const;

export const CAKE_FILLINGS = [
  "brulee",
  "branco",
  "doce de leite",
  "limao",
  "beijinho",
  "chocolate",
  "cream cheese frosting",
] as const;

export const BRIGADEIRO_FLAVORS = [
  "chocolate",
  "brulee",
  "beijinho",
  "limão",
  "churros",
  "casadinho",
] as const;

export const COOKIE_FLAVORS = [
  "churros",
  "cacau",
  "tradicional",
  "brookie",
  "caramelo salgado",
] as const;

export type RecipeKind = "cake" | "brigadeiro" | "cookie" | null;

export type RecipeOptionSource = {
  name: string;
  category?: string | null;
  massa?: string;
  sabor?: string;
};

export function getRecipeKind(item: RecipeOptionSource): RecipeKind {
  const category = normalize(item.category);
  const name = normalize(item.name);

  if (
    category === "bolo" ||
    category === "bolos" ||
    name.includes("cake") ||
    name.includes("bolo") ||
    !!item.massa
  ) {
    return "cake";
  }

  if (category === "brigadeiro" || category === "brigadeiros" || name.includes("brigadeiro")) {
    return "brigadeiro";
  }

  if (category === "cookie" || category === "cookies" || name.includes("cookie")) {
    return "cookie";
  }

  return null;
}

export function splitFillings(value?: string): string[] {
  if (!value) return [];
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getOrderItemRecipeIssue(item: RecipeOptionSource): string | null {
  const kind = getRecipeKind(item);

  if (kind === "cake") {
    if (!item.massa) return `${item.name}: escolha a massa.`;
    if (splitFillings(item.sabor).length === 0) return `${item.name}: escolha ao menos um recheio.`;
  }

  if ((kind === "brigadeiro" || kind === "cookie") && !item.sabor) {
    return `${item.name}: escolha o sabor.`;
  }

  return null;
}

function normalize(value?: string | null): string {
  return value?.trim().toLowerCase() ?? "";
}
