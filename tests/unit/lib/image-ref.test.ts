import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildRefSrc, extractReferenceObjectKey } from "@/lib/image-ref";

describe("buildRefSrc", () => {
  const original = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.deuxcerie.com.br";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = original;
  });

  it("passes an absolute http(s) URL through unchanged", () => {
    expect(buildRefSrc("https://cdn.example.com/img.png")).toBe(
      "https://cdn.example.com/img.png"
    );
    expect(buildRefSrc("http://cdn.example.com/img.png")).toBe(
      "http://cdn.example.com/img.png"
    );
  });

  it("is case-insensitive when detecting the protocol", () => {
    expect(buildRefSrc("HTTPS://cdn.example.com/img.png")).toBe(
      "HTTPS://cdn.example.com/img.png"
    );
  });

  it("prefixes a relative reference with the API base URL", () => {
    expect(buildRefSrc("orders/abc.png")).toBe(
      "https://api.deuxcerie.com.br/orders/abc.png"
    );
  });

  it("does not treat a value that merely contains 'http' as absolute", () => {
    // A substring check would let something like this slip through unprefixed;
    // the anchored ^https?:// regex must reject it and route it through the
    // relative branch instead.
    expect(buildRefSrc("httpjavascript:alert(1)")).toBe(
      "https://api.deuxcerie.com.br/httpjavascript:alert(1)"
    );
  });
});

describe("extractReferenceObjectKey", () => {
  it("returns a non-absolute reference unchanged", () => {
    expect(extractReferenceObjectKey("orders/abc.png")).toBe("orders/abc.png");
  });

  it("strips the bucket segment and decodes the remaining path", () => {
    expect(
      extractReferenceObjectKey("https://cdn.example.com/bucket/orders/abc%20file.png")
    ).toBe("orders/abc file.png");
  });

  it("falls back to the full URL when there is no nested path beyond the bucket", () => {
    const ref = "https://cdn.example.com/onlyfile.png";
    expect(extractReferenceObjectKey(ref)).toBe(ref);
  });

  it("falls back to the original reference when the URL fails to parse", () => {
    const ref = "https://[invalid";
    expect(extractReferenceObjectKey(ref)).toBe(ref);
  });
});
