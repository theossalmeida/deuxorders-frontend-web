// Decode only — no signature verification.
// Used for UX gating only; server enforces authorization.

function base64UrlDecode(seg: string): string {
  const pad = seg.length % 4 === 2 ? "==" : seg.length % 4 === 3 ? "=" : "";
  return atob(seg.replace(/-/g, "+").replace(/_/g, "/") + pad);
}

export function getRoleFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
}
