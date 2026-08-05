import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins static class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values from conditional class expressions", () => {
    expect(cn("a", false && "b", undefined, null, "c")).toBe("a c");
  });

  it("resolves conflicting Tailwind utilities, keeping the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("merges non-conflicting classes from arrays and objects", () => {
    expect(cn(["a", "b"], { c: true, d: false })).toBe("a b c");
  });

  it("lets a later conditional override an earlier conflicting utility", () => {
    expect(cn("text-sm", true && "text-lg")).toBe("text-lg");
  });
});
