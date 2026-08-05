import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const nav = vi.hoisted(() => ({
  push: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  useSearchParams: () => nav.searchParams,
}));

const sonner = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock("sonner", () => ({ toast: sonner }));

import LoginPage from "@/app/(auth)/login/page";

function jsonResponse(
  status: number,
  body: unknown,
  headers: Record<string, string> = {}
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (key: string) => headers[key] ?? null },
    json: vi.fn(async () => body),
  } as unknown as Response;
}

function setLocation() {
  const location = { href: "" };
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: location,
  });
  return location;
}

describe("login page flow", () => {
  let location: { href: string };

  beforeEach(() => {
    nav.searchParams = new URLSearchParams();
    nav.push.mockClear();
    sonner.error.mockClear();
    sonner.success.mockClear();
    vi.stubGlobal("fetch", vi.fn());
    location = setLocation();
  });

  async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>, email: string, password: string) {
    await user.type(screen.getByLabelText("E-mail"), email);
    await user.type(screen.getByLabelText("Senha"), password);
    await user.click(screen.getByRole("button", { name: /entrar/i }));
  }

  // Fake timers don't play well with user-event's internal delays, so the
  // cooldown-timer tests drive the form with synchronous fireEvent instead
  // and flush pending promise microtasks manually via advanceTimersByTimeAsync.
  async function fillAndSubmitUnderFakeTimers(email: string, password: string) {
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: email } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: password } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /entrar/i }));
      await vi.advanceTimersByTimeAsync(0);
    });
  }

  it("blocks submission and shows a validation message for an invalid email, without calling the API", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await fillAndSubmit(user, "not-an-email", "secret");

    expect(await screen.findByText("Email inválido")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("logs in and redirects to the sanitized `from` target on success", async () => {
    nav.searchParams = new URLSearchParams({ from: "/orders/123" });
    vi.mocked(fetch).mockResolvedValue(jsonResponse(200, { ok: true }));
    const user = userEvent.setup();
    render(<LoginPage />);

    await fillAndSubmit(user, "ana@deuxcerie.com.br", "secret123");

    await waitFor(() => expect(location.href).toBe("/orders/123"));
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("/api/auth/login");
    expect(JSON.parse(init!.body as string)).toEqual({
      email: "ana@deuxcerie.com.br",
      password: "secret123",
    });
  });

  it("falls back to /dashboard when `from` is an open-redirect attempt", async () => {
    // //evil.com looks relative but is protocol-relative; sanitizeRedirect
    // must reject it rather than honoring an off-site redirect.
    nav.searchParams = new URLSearchParams({ from: "//evil.com" });
    vi.mocked(fetch).mockResolvedValue(jsonResponse(200, { ok: true }));
    const user = userEvent.setup();
    render(<LoginPage />);

    await fillAndSubmit(user, "ana@deuxcerie.com.br", "secret123");

    await waitFor(() => expect(location.href).toBe("/dashboard"));
  });

  it("shows the backend error message on a 401 without engaging a cooldown", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(401, { message: "Email ou senha incorretos." })
    );
    const user = userEvent.setup();
    render(<LoginPage />);

    await fillAndSubmit(user, "ana@deuxcerie.com.br", "wrong-password");

    expect(await screen.findByText("Email ou senha incorretos.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).not.toBeDisabled();
  });

  it("engages the server-driven cooldown and disables the form on 429", async () => {
    vi.useFakeTimers();
    try {
      vi.mocked(fetch).mockResolvedValue(
        jsonResponse(429, {}, { "Retry-After": "60" })
      );
      render(<LoginPage />);

      await fillAndSubmitUnderFakeTimers("ana@deuxcerie.com.br", "secret123");

      expect(sonner.error).toHaveBeenCalledWith(expect.stringContaining("60s"));

      await act(async () => {
        await vi.advanceTimersByTimeAsync(600);
      });

      expect(
        screen.getByText(/Aguarde \d+s antes de tentar novamente\./)
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /entrar/i })).toBeDisabled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("escalates to a client-side cooldown after three consecutive non-429 failures", async () => {
    vi.useFakeTimers();
    try {
      vi.mocked(fetch).mockResolvedValue(
        jsonResponse(401, { message: "Email ou senha incorretos." })
      );
      render(<LoginPage />);

      await fillAndSubmitUnderFakeTimers("ana@deuxcerie.com.br", "wrong-1");
      expect(screen.getByText("Email ou senha incorretos.")).toBeInTheDocument();
      await fillAndSubmitUnderFakeTimers("ana@deuxcerie.com.br", "wrong-2");
      await fillAndSubmitUnderFakeTimers("ana@deuxcerie.com.br", "wrong-3");

      await act(async () => {
        await vi.advanceTimersByTimeAsync(600);
      });

      expect(screen.getByRole("button", { name: /entrar/i })).toBeDisabled();
    } finally {
      vi.useRealTimers();
    }
  });
});
