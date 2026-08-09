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

const DAY_MS = 24 * 60 * 60 * 1000;
const TIER_MONTH_DAYS = 30;

type TierRange = { minMonths: number; maxMonths: number | null };

const TIER_RANGES: Record<CrmTier, TierRange> = {
  green: { minMonths: 0, maxMonths: 3 },
  yellow: { minMonths: 4, maxMonths: 8 },
  orange: { minMonths: 9, maxMonths: 10 },
  red: { minMonths: 11, maxMonths: null },
};

function daysSince(iso: string, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / DAY_MS));
}

/** green: 0-3mo since last order, yellow: 4-8mo, orange: 9-10mo, red: 11mo+. */
export function getCrmTier(lastOrderDateIso: string, now = new Date()): CrmTier {
  const months = Math.floor(daysSince(lastOrderDateIso, now) / TIER_MONTH_DAYS);
  if (months <= 3) return "green";
  if (months <= 8) return "yellow";
  if (months <= 10) return "orange";
  return "red";
}

/** Win-back messaging only makes sense once a client has started going cold. */
export function isLapsedTier(tier: CrmTier): boolean {
  return tier !== "green";
}

/**
 * Date bounds (lastOrderFrom inclusive, lastOrderTo exclusive) that match getCrmTier's
 * classification, for passing to GET /crm/list so pagination stays accurate when filtered.
 */
export function getTierDateBounds(
  tier: CrmTier,
  now = new Date(),
): { lastOrderFrom?: string; lastOrderTo?: string } {
  const { minMonths, maxMonths } = TIER_RANGES[tier];
  const bounds: { lastOrderFrom?: string; lastOrderTo?: string } = {};

  if (maxMonths !== null) {
    bounds.lastOrderFrom = new Date(
      now.getTime() - (maxMonths + 1) * TIER_MONTH_DAYS * DAY_MS + 1,
    ).toISOString();
  }
  bounds.lastOrderTo = new Date(now.getTime() - minMonths * TIER_MONTH_DAYS * DAY_MS + 1).toISOString();

  return bounds;
}

export function buildWinBackMessage(clientName: string, firstProductName?: string): string {
  const firstName = clientName.trim().split(/\s+/)[0] ?? clientName;
  if (firstProductName) {
    return `Oi *${firstName}*, sentimos sua falta aqui na Deuxcerie, vimos que seu último pedido foi um *${firstProductName}*, por isso estamos te dando 5% de desconto no seu próximo pedido.`;
  }
  return `Oi *${firstName}*, sentimos sua falta aqui na Deuxcerie! Estamos te dando 5% de desconto no seu próximo pedido.`;
}

export function buildWhatsAppLink(mobile: string, message?: string): string {
  const digits = mobile.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
