import { describe, it, expect } from "vitest";
import { toneFor, CATEGORY_TONE, DEFAULT_CATEGORY_TONE } from "@/lib/category-tone";

describe("toneFor", () => {
  it("returns the configured tone for a known category", () => {
    expect(toneFor("Bolos")).toBe(CATEGORY_TONE["Bolos"]);
  });

  it("falls back to the default tone for an unknown category", () => {
    expect(toneFor("Sorvetes")).toBe(DEFAULT_CATEGORY_TONE);
  });

  it("falls back to the default tone for null, undefined, and empty string", () => {
    expect(toneFor(null)).toBe(DEFAULT_CATEGORY_TONE);
    expect(toneFor(undefined)).toBe(DEFAULT_CATEGORY_TONE);
    expect(toneFor("")).toBe(DEFAULT_CATEGORY_TONE);
  });

  it("is case-sensitive (no normalization, unlike the product-category matchers)", () => {
    expect(toneFor("bolos")).toBe(DEFAULT_CATEGORY_TONE);
  });
});
