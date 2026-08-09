export type CrmTier = "green" | "yellow" | "orange" | "red";

export type CrmTierMeta = {
  label: string;
  bg: string;
  fg: string;
  dot: string;
};

export const CRM_TIER_META: Record<CrmTier, CrmTierMeta> = {
  green: { label: "Ativo", bg: "bg-emerald-50", fg: "text-emerald-800", dot: "bg-emerald-500" },
  yellow: { label: "Esfriando", bg: "bg-amber-50", fg: "text-amber-800", dot: "bg-amber-500" },
  orange: { label: "Em risco", bg: "bg-orange-50", fg: "text-orange-800", dot: "bg-orange-500" },
  red: { label: "Inativo", bg: "bg-red-50", fg: "text-red-700", dot: "bg-red-500" },
};

function fullMonthsSince(iso: string): number {
  const last = new Date(iso);
  const now = new Date();
  let months = (now.getFullYear() - last.getFullYear()) * 12 + (now.getMonth() - last.getMonth());
  if (now.getDate() < last.getDate()) months -= 1;
  return Math.max(0, months);
}

/** green: 0-3mo since last order, yellow: 4-8mo, orange: 9-10mo, red: 11mo+. */
export function getCrmTier(lastOrderDateIso: string): CrmTier {
  const months = fullMonthsSince(lastOrderDateIso);
  if (months <= 3) return "green";
  if (months <= 8) return "yellow";
  if (months <= 10) return "orange";
  return "red";
}

/** Win-back messaging only makes sense once a client has started going cold. */
export function isLapsedTier(tier: CrmTier): boolean {
  return tier !== "green";
}

export function buildWinBackMessage(firstProductName?: string): string {
  if (firstProductName) {
    return `Sentimos sua falta aqui na deuxcerie, vimos que seu último pedido foi um *${firstProductName}*, por isso estamos te dando 5% de desconto no seu próximo pedido.`;
  }
  return "Sentimos sua falta aqui na deuxcerie! Estamos te dando 5% de desconto no seu próximo pedido.";
}

export function buildWhatsAppLink(mobile: string, message?: string): string {
  const digits = mobile.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
