import { describe, it, expect } from "vitest";
import {
  isCakeCategory,
  isBrigadeiroCategory,
  isCookieCategory,
} from "@/lib/product-categories";

describe("isCakeCategory", () => {
  it("matches singular and plural, case-insensitively, with surrounding whitespace", () => {
    expect(isCakeCategory("bolo")).toBe(true);
    expect(isCakeCategory("Bolos")).toBe(true);
    expect(isCakeCategory("  BOLO  ")).toBe(true);
  });

  it("rejects unrelated categories and empty/nullish input", () => {
    expect(isCakeCategory("brigadeiro")).toBe(false);
    expect(isCakeCategory("")).toBe(false);
    expect(isCakeCategory(null)).toBe(false);
    expect(isCakeCategory(undefined)).toBe(false);
  });

  it("does not match a substring occurrence, only the whole normalized value", () => {
    expect(isCakeCategory("bolo de pote")).toBe(false);
  });
});

describe("isBrigadeiroCategory", () => {
  it("matches singular and plural, case-insensitively", () => {
    expect(isBrigadeiroCategory("Brigadeiro")).toBe(true);
    expect(isBrigadeiroCategory("brigadeiros")).toBe(true);
  });

  it("rejects unrelated categories", () => {
    expect(isBrigadeiroCategory("bolo")).toBe(false);
    expect(isBrigadeiroCategory(null)).toBe(false);
  });
});

describe("isCookieCategory", () => {
  it("matches singular and plural, case-insensitively", () => {
    expect(isCookieCategory("Cookie")).toBe(true);
    expect(isCookieCategory("cookies")).toBe(true);
  });

  it("rejects unrelated categories", () => {
    expect(isCookieCategory("bolo")).toBe(false);
    expect(isCookieCategory(undefined)).toBe(false);
  });
});

describe("category matchers are mutually exclusive", () => {
  it.each(["bolo", "bolos", "brigadeiro", "brigadeiros", "cookie", "cookies"])(
    "only one matcher accepts %s",
    (category) => {
      const matches = [
        isCakeCategory(category),
        isBrigadeiroCategory(category),
        isCookieCategory(category),
      ].filter(Boolean);
      expect(matches).toHaveLength(1);
    }
  );
});
