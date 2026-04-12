const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  token: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  if (res.status === 401) {
    throw new ApiError(401, "Sessão expirada. Faça login novamente.");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text || `Erro ${res.status}`);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}

export function createApiClient(token: string) {
  return {
    get: <T>(path: string) =>
      request<T>(path, token, { method: "GET", headers: { "Content-Type": "application/json" } }),

    post: <T>(path: string, body: unknown) =>
      request<T>(path, token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),

    put: <T>(path: string, body: unknown) =>
      request<T>(path, token, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),

    patch: <T>(path: string, body?: unknown) =>
      request<T>(path, token, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      }),

    delete: <T>(path: string, body?: unknown) =>
      request<T>(path, token, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      }),

    postForm: <T>(path: string, formData: FormData) =>
      request<T>(path, token, {
        method: "POST",
        body: formData,
      }),

    putForm: <T>(path: string, formData: FormData) =>
      request<T>(path, token, {
        method: "PUT",
        body: formData,
      }),
  };
}
