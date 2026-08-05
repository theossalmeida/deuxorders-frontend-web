import { describe, it, expect, vi, beforeEach } from "vitest";

const store = new Map<string, string>();

const cookieJar = {
  get: vi.fn((name: string) => {
    const value = store.get(name);
    return value === undefined ? undefined : { name, value };
  }),
  set: vi.fn((name: string, value: string) => {
    store.set(name, value);
  }),
  delete: vi.fn((name: string) => {
    store.delete(name);
  }),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieJar),
}));

import { setSessionToken, getSessionToken, clearSession } from "@/lib/auth/session";

describe("session cookie storage", () => {
  beforeEach(() => {
    store.clear();
    cookieJar.get.mockClear();
    cookieJar.set.mockClear();
    cookieJar.delete.mockClear();
  });

  it("stores the token under the expected cookie name with hardened options", () => {
    return setSessionToken("jwt-value").then(() => {
      expect(cookieJar.set).toHaveBeenCalledWith(
        "auth_token",
        "jwt-value",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "strict",
          path: "/",
          maxAge: 60 * 60 * 8,
        })
      );
    });
  });

  it("does not mark the cookie secure outside production", () => {
    return setSessionToken("jwt-value").then(() => {
      const [, , options] = cookieJar.set.mock.calls[0];
      expect(options.secure).toBe(false);
    });
  });

  it("returns the stored token", async () => {
    await setSessionToken("jwt-value");
    await expect(getSessionToken()).resolves.toBe("jwt-value");
  });

  it("returns null when no token is stored", async () => {
    await expect(getSessionToken()).resolves.toBeNull();
  });

  it("removes the cookie on clearSession", async () => {
    await setSessionToken("jwt-value");
    await clearSession();
    expect(cookieJar.delete).toHaveBeenCalledWith("auth_token");
    await expect(getSessionToken()).resolves.toBeNull();
  });
});
