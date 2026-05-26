import type { MetricsSnapshot } from "@/lib/metrics-snapshot";
import { LICENSEE_REGISTRY } from "@/lib/licensee-registry";
import { type KpiCard, type KpiTone, KPI_CARDS_PER_VIEW } from "@/lib/metrics-kpi-views";

function fmtUsd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function fmtPct(n: number, digits = 1) {
  return `${n.toFixed(digits)}%`;
}

function card(slot: number, label: string, value: string, context: string, tone: KpiTone): KpiCard {
  return { slot, label, value, context, tone };
}

/** Licensor Cost view — platform COGS and margin, not tenant project spend. */
export function buildLicensorCostKpiCards(snapshot: MetricsSnapshot): KpiCard[] {
  const activeLicensees = LICENSEE_REGISTRY.filter((r) => r.status === "active").length;
  const trialing = LICENSEE_REGISTRY.filter((r) => r.status === "trialing").length;
  const platformCogs = snapshot.totalCostUsd * 2.4;
  const stripeRevenueMock = platformCogs * 1.68;
  const grossMargin = stripeRevenueMock > 0 ? ((stripeRevenueMock - platformCogs) / stripeRevenueMock) * 100 : 0;
  const costPerLicensee = activeLicensees > 0 ? platformCogs / activeLicensees : 0;
  const trialBurn = platformCogs * 0.11;
  const topTenant = LICENSEE_REGISTRY.reduce((a, b) => (a.openIssues >= b.openIssues ? a : b));

  return [
    card(1, "Platform COGS", fmtUsd(platformCogs), "Infra + models + workflows · all tenants", "neutral"),
    card(
      2,
      "Cost per active licensee",
      activeLicensees > 0 ? fmtUsd(costPerLicensee) : "—",
      `${activeLicensees} active licensees`,
      costPerLicensee > 800 ? "warn" : "neutral",
    ),
    card(
      3,
      "Gross margin",
      fmtPct(grossMargin),
      "Stripe revenue − platform COGS (demo)",
      grossMargin < 45 ? "bad" : grossMargin < 55 ? "warn" : "neutral",
    ),
    card(4, "Stripe revenue", fmtUsd(stripeRevenueMock), "LiNKaios core + suites + brand bundles", "neutral"),
    card(
      5,
      "Trial burn",
      fmtUsd(trialBurn),
      `${trialing} trialing · unbilled model spend`,
      trialBurn > platformCogs * 0.15 ? "warn" : "neutral",
    ),
    card(
      6,
      "Top cost licensee",
      topTenant.name.split(" ")[0] ?? topTenant.name,
      `Est. ${fmtUsd(platformCogs * 0.38)} · support + margin watch`,
      "neutral",
    ),
    card(
      7,
      "Model spend mix",
      snapshot.costByModel[0]?.name?.split("/").pop() ?? "—",
      `${fmtPct(62)} of platform model spend · demo`,
      "neutral",
    ),
    card(
      8,
      "Anomaly spend",
      fmtUsd(platformCogs * 0.07),
      "Tenants >30% above 30-day baseline",
      platformCogs * 0.07 > costPerLicensee ? "warn" : "neutral",
    ),
    card(9, "Tokens (platform)", snapshot.totalTokens.toLocaleString(), "Aggregated across tenants", "neutral"),
    card(
      10,
      "Wasted cost %",
      fmtPct(snapshot.totalCostUsd > 0 ? (snapshot.kpiBase.errorCostUsd / snapshot.totalCostUsd) * 100 : 0),
      "Error-like spend / platform COGS",
      "neutral",
    ),
    card(11, "Active licensees", String(activeLicensees), `${LICENSEE_REGISTRY.length} total in registry`, "neutral"),
    card(
      12,
      "Cost trend",
      snapshot.kpiBase.costTrendPct != null ? `${snapshot.kpiBase.costTrendPct > 0 ? "+" : ""}${snapshot.kpiBase.costTrendPct.toFixed(1)}%` : "—",
      snapshot.kpiBase.costTrendLabel || "Period vs prior window",
      snapshot.kpiBase.costTrendPct != null && snapshot.kpiBase.costTrendPct > 12 ? "bad" : "neutral",
    ),
  ].slice(0, KPI_CARDS_PER_VIEW);
}

export const LICENSOR_COST_VIEW_QUESTION = "What does the platform cost us to serve all tenants, and where is margin at risk?";
