import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApiClient, ApiError, unwrapItemsResponse } from "@/lib/api/client";

describe("unwrapItemsResponse", () => {
  it("returns an array response unchanged", () => {
    expect(unwrapItemsResponse([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("unwraps an envelope's items array", () => {
    expect(unwrapItemsResponse({ items: [1, 2] })).toEqual([1, 2]);
  });

  it("returns an empty array when the envelope has no items", () => {
    expect(unwrapItemsResponse({})).toEqual([]);
  });

  it("returns an empty array when items is present but not an array", () => {
    expect(unwrapItemsResponse({ items: undefined })).toEqual([]);
  });
});

type MockResponseOverrides = {
  status: number;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
};

function mockResponse(overrides: MockResponseOverrides): Response {
  return {
    ok: overrides.status >= 200 && overrides.status < 300,
    status: overrides.status,
    json: overrides.json ?? (async () => ({})),
    text: overrides.text ?? (async () => ""),
  } as unknown as Response;
}

describe("createApiClient request handling", () => {
  const token = "test-token";

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("sends the bearer token and parses a successful JSON response", async () => {
    const body = { id: "1" };
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({ status: 200, json: async () => body })
    );

    const result = await createApiClient(token).get<typeof body>("/clients/1");

    expect(result).toEqual(body);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("https://api.test.local/clients/1");
    expect((init!.headers as Record<string, string>).Authorization).toBe(
      `Bearer ${token}`
    );
  });

  it("throws a fixed message ApiError on 401, regardless of the response body", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse({ status: 401 }));

    await expect(createApiClient(token).get("/clients")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Sessão expirada. Faça login novamente.",
    });
  });

  it("surfaces the response body text as the error message for other failures", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({ status: 500, text: async () => "Internal error" })
    );

    await expect(createApiClient(token).get("/clients")).rejects.toMatchObject({
      status: 500,
      message: "Internal error",
    });
  });

  it("falls back to a generic message when the error body is empty", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({ status: 503, text: async () => "" })
    );

    await expect(createApiClient(token).get("/clients")).rejects.toMatchObject({
      status: 503,
      message: "Erro 503",
    });
  });

  it("returns undefined for a 204 response without attempting to parse a body", async () => {
    const json = vi.fn(async () => ({}));
    vi.mocked(fetch).mockResolvedValue(mockResponse({ status: 204, json }));

    const result = await createApiClient(token).delete("/clients/1");

    expect(result).toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });

  it("sends a JSON content type and stringified body for post/put/patch", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse({ status: 200 }));

    await createApiClient(token).post("/clients/new", { name: "Ana" });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect((init!.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/json"
    );
    expect(init!.body).toBe(JSON.stringify({ name: "Ana" }));
  });

  it("does not force a Content-Type for multipart form uploads, letting fetch set the boundary", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse({ status: 200 }));
    const form = new FormData();
    form.append("file", "content");

    await createApiClient(token).postForm("/references", form);

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = init!.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBeUndefined();
    expect(headers.Authorization).toBe(`Bearer ${token}`);
    expect(init!.body).toBe(form);
  });

  it("omits the body for a patch call with no input", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse({ status: 200 }));

    await createApiClient(token).patch("/clients/1/active");

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(init!.body).toBeUndefined();
  });
});

describe("ApiError", () => {
  it("carries the HTTP status and is a real Error instance", () => {
    const error = new ApiError(404, "Not found");
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(404);
    expect(error.message).toBe("Not found");
  });
});
