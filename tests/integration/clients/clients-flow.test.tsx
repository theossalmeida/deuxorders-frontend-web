import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { useClients, useCreateClient } from "@/hooks/useClients";
import { QueryProvider } from "@/components/providers/QueryProvider";

const sonner = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock("sonner", () => ({ toast: sonner }));

function wrapper({ children }: { children: ReactNode }) {
  return <QueryProvider sessionToken="test-token">{children}</QueryProvider>;
}

function useClientsFlow() {
  return { list: useClients(), create: useCreateClient() };
}

describe("clients list + create flow", () => {
  beforeEach(() => {
    sonner.error.mockClear();
    sonner.success.mockClear();
  });

  it("fetches the list, and a successful create invalidates it and triggers a refetch", async () => {
    let clients = [{ id: "1", name: "Ana", mobile: "11999990000", status: true }];
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      const method = init?.method ?? "GET";

      if (url.startsWith("https://api.test.local/clients/all") && method === "GET") {
        return {
          ok: true,
          status: 200,
          json: async () => ({ items: clients }),
        } as Response;
      }

      if (url === "https://api.test.local/clients/new" && method === "POST") {
        const input = JSON.parse(init!.body as string);
        const created = { id: "2", name: input.name, mobile: input.mobile, status: true };
        clients = [...clients, created];
        return { ok: true, status: 200, json: async () => created } as Response;
      }

      throw new Error(`Unexpected fetch: ${method} ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useClientsFlow(), { wrapper });

    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    expect(result.current.list.data).toHaveLength(1);

    const getCallsBefore = fetchMock.mock.calls.filter(
      ([, init]) => (init?.method ?? "GET") === "GET"
    ).length;

    await act(async () => {
      await result.current.create.mutateAsync({ name: "Nova Cliente", mobile: "11988887777" });
    });

    expect(sonner.success).toHaveBeenCalledWith("Cliente criado com sucesso!");

    await waitFor(() => {
      const getCallsAfter = fetchMock.mock.calls.filter(
        ([, init]) => (init?.method ?? "GET") === "GET"
      ).length;
      expect(getCallsAfter).toBeGreaterThan(getCallsBefore);
    });

    await waitFor(() => expect(result.current.list.data).toHaveLength(2));
  });

  it("surfaces the API error message on a failed create and leaves the cached list untouched", async () => {
    const clients = [{ id: "1", name: "Ana", mobile: "11999990000", status: true }];
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      const method = init?.method ?? "GET";

      if (url.startsWith("https://api.test.local/clients/all") && method === "GET") {
        return { ok: true, status: 200, json: async () => ({ items: clients }) } as Response;
      }

      if (url === "https://api.test.local/clients/new" && method === "POST") {
        return { ok: false, status: 400, text: async () => "Telefone inválido." } as Response;
      }

      throw new Error(`Unexpected fetch: ${method} ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useClientsFlow(), { wrapper });
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));

    await act(async () => {
      await result.current.create
        .mutateAsync({ name: "Nova Cliente", mobile: "invalid" })
        .catch(() => {});
    });

    expect(sonner.error).toHaveBeenCalledWith("Telefone inválido.");
    expect(sonner.success).not.toHaveBeenCalled();
    expect(result.current.list.data).toHaveLength(1);
  });
});
