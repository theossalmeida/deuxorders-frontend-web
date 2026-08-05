import { describe, it, expect } from "vitest";
import {
  getRecipeKind,
  splitFillings,
  getOrderItemRecipeIssue,
} from "@/lib/recipe-options";

describe("getRecipeKind", () => {
  it("detects cake by category, case-insensitively and for singular/plural", () => {
    expect(getRecipeKind({ name: "x", category: "bolo" })).toBe("cake");
    expect(getRecipeKind({ name: "x", category: "Bolos" })).toBe("cake");
  });

  it("detects cake by an English or Portuguese substring in the name", () => {
    expect(getRecipeKind({ name: "Chocolate Cake" })).toBe("cake");
    expect(getRecipeKind({ name: "Bolo de Cenoura" })).toBe("cake");
  });

  it("treats the presence of a massa as decisive, overriding an unrelated category/name", () => {
    expect(
      getRecipeKind({ name: "Sobremesa Especial", category: "Doces", massa: "Baunilha" })
    ).toBe("cake");
  });

  it("detects brigadeiro by category or name substring", () => {
    expect(getRecipeKind({ name: "x", category: "brigadeiro" })).toBe("brigadeiro");
    expect(getRecipeKind({ name: "x", category: "Brigadeiros" })).toBe("brigadeiro");
    expect(getRecipeKind({ name: "Brigadeiro Gourmet" })).toBe("brigadeiro");
  });

  it("detects cookie by category or name substring", () => {
    expect(getRecipeKind({ name: "x", category: "cookie" })).toBe("cookie");
    expect(getRecipeKind({ name: "x", category: "Cookies" })).toBe("cookie");
    expect(getRecipeKind({ name: "Cookie de Nutella" })).toBe("cookie");
  });

  it("returns null when nothing matches", () => {
    expect(getRecipeKind({ name: "Refrigerante", category: "Bebidas" })).toBeNull();
  });

  it("checks cake before brigadeiro/cookie, so an ambiguous name resolves to cake", () => {
    expect(getRecipeKind({ name: "Bolo de Brigadeiro" })).toBe("cake");
  });
});

describe("splitFillings", () => {
  it("returns an empty array for undefined or empty input", () => {
    expect(splitFillings(undefined)).toEqual([]);
    expect(splitFillings("")).toEqual([]);
  });

  it("splits a single value with no separator", () => {
    expect(splitFillings("chocolate")).toEqual(["chocolate"]);
  });

  it("splits on '|' and trims whitespace around each item", () => {
    expect(splitFillings("chocolate|brulee| beijinho ")).toEqual([
      "chocolate",
      "brulee",
      "beijinho",
    ]);
  });

  it("filters out empty segments from doubled or edge pipes", () => {
    expect(splitFillings("chocolate||brulee")).toEqual(["chocolate", "brulee"]);
    expect(splitFillings("|chocolate|")).toEqual(["chocolate"]);
  });
});

describe("getOrderItemRecipeIssue", () => {
  it("requires a massa for a cake item", () => {
    expect(
      getOrderItemRecipeIssue({ name: "Bolo de Chocolate", category: "Bolo" })
    ).toBe("Bolo de Chocolate: escolha a massa.");
  });

  it("requires at least one filling for a cake item once the massa is chosen", () => {
    expect(
      getOrderItemRecipeIssue({
        name: "Bolo de Chocolate",
        category: "Bolo",
        massa: "Chocolate",
        sabor: "",
      })
    ).toBe("Bolo de Chocolate: escolha ao menos um recheio.");
  });

  it("passes a fully-configured cake item", () => {
    expect(
      getOrderItemRecipeIssue({
        name: "Bolo de Chocolate",
        category: "Bolo",
        massa: "Chocolate",
        sabor: "brulee|beijinho",
      })
    ).toBeNull();
  });

  it("requires a sabor for brigadeiro and cookie items", () => {
    expect(
      getOrderItemRecipeIssue({ name: "Brigadeiro Gourmet", category: "Brigadeiro" })
    ).toBe("Brigadeiro Gourmet: escolha o sabor.");
    expect(
      getOrderItemRecipeIssue({ name: "Cookie de Nutella", category: "Cookie" })
    ).toBe("Cookie de Nutella: escolha o sabor.");
  });

  it("passes brigadeiro/cookie items once a sabor is set", () => {
    expect(
      getOrderItemRecipeIssue({
        name: "Brigadeiro Gourmet",
        category: "Brigadeiro",
        sabor: "chocolate",
      })
    ).toBeNull();
  });

  it("does not require massa/sabor for items outside the recipe categories", () => {
    expect(
      getOrderItemRecipeIssue({ name: "Refrigerante", category: "Bebidas" })
    ).toBeNull();
  });
});
