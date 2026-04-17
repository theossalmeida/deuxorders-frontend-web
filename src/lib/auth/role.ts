// Decode only — no signature verification.
// Used for UX gating only; server enforces authorization.

function base64UrlDecode(seg: string): string {
  const pad = seg.length % 4 === 2 ? "==" : seg.length % 4 === 3 ? "=" : "";
  return atob(seg.replace(/-/g, "+").replace(/_/g, "/") + pad);
}

function decodePayload(token: string | null): Record<string, unknown> | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
}

export function getRoleFromToken(token: string | null): string | null {
  const p = decodePayload(token);
  return (p?.role as string) ?? null;
}

export function getUserFromToken(token: string | null): { name: string; email: string } {
  const p = decodePayload(token);
  return {
    name: (p?.name as string) || (p?.sub as string) || "Usuário",
    email: (p?.email as string) || "",
  };
}
