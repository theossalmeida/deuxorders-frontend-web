import { describe, it, expect } from "vitest";
import { getRoleFromToken, getUserFromToken } from "@/lib/auth/role";

function base64Url(value: string): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function makeToken(payload: Record<string, unknown>): string {
  const header = base64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const body = base64Url(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe("getRoleFromToken", () => {
  it("decodes the role claim from a well-formed token", () => {
    expect(getRoleFromToken(makeToken({ role: "admin" }))).toBe("admin");
  });

  it.each(["a", "ab", "abc", "abcd", "abcde"])(
    "round-trips payloads of varying byte length correctly (base64url padding: %s)",
    (role) => {
      expect(getRoleFromToken(makeToken({ role }))).toBe(role);
    }
  );

  it("returns null for a null token", () => {
    expect(getRoleFromToken(null)).toBeNull();
  });

  it("returns null for a token with fewer than two segments", () => {
    expect(getRoleFromToken("not-a-jwt")).toBeNull();
  });

  it("returns null when the payload segment is not valid base64/JSON", () => {
    expect(getRoleFromToken("a.###.c")).toBeNull();
  });

  it("returns null when the payload has no role claim", () => {
    expect(getRoleFromToken(makeToken({ sub: "user-1" }))).toBeNull();
  });
});

describe("getUserFromToken", () => {
  it("reads name and email from the payload", () => {
    expect(getUserFromToken(makeToken({ name: "Ana", email: "ana@x.com" }))).toEqual({
      name: "Ana",
      email: "ana@x.com",
    });
  });

  it("falls back to the sub claim when name is absent", () => {
    expect(getUserFromToken(makeToken({ sub: "user-123" }))).toEqual({
      name: "user-123",
      email: "",
    });
  });

  it("falls back to a default display name and empty email for an empty payload", () => {
    expect(getUserFromToken(makeToken({}))).toEqual({ name: "Usuário", email: "" });
  });

  it("falls back to defaults for a null token", () => {
    expect(getUserFromToken(null)).toEqual({ name: "Usuário", email: "" });
  });
});
