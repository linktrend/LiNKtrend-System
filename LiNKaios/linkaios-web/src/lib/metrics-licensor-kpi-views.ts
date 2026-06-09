import type { MetricsSnapshot } from "@/lib/metrics-snapshot";
import { LICENSEE_REGISTRY } from "@/lib/licensee-registry";
import { type KpiCard, type KpiTone, KPI_CARDS_PER_VIEW } from "@/lib/metrics-kpi-views";

function fmtUsd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function fmtPct(n: number, digits = 1) {
  return `${n.toFixed(digits)}%`;
}

const FIXTURE_SUFFIX = " · fixture until billing + infra feeds are live";

function card(slot: number, label: string, value: string, context: string, tone: KpiTone): KpiCard {
  return { slot, label, value, context: `${context}${FIXTURE_SUFFIX}`, tone };
}

/** Licensor Cost view — platform COGS and margin, not tenant project spend. */
export function buildLicensorCostKpiCards(snapshot: MetricsSnapshot): KpiCard[] {
  const sparse = snapshot.totalTraces === 0;
  const activeLicensees = LICENSEE_REGISTRY.filter((r) => r.status === "active").length;
  const trialing = LICENSEE_REGISTRY.filter((r) => r.status === "trialing").length;
  const platformCogs = snapshot.totalCostUsd * 2.4;
  const stripeRevenueMock = platformCogs * 1.68;
  const grossMargin = stripeRevenueMock > 0 ? ((stripeRevenueMock - platformCogs) / stripeRevenueMock) * 100 : 0;
  const costPerLicensee = activeLicensees > 0 ? platformCogs / activeLicensees : 0;
  const trialBurn = platformCogs * 0.11;
  const topTenant = LICENSEE_REGISTRY.reduce((a, b) => (a.openIssues >= b.openIssues ? a : b));
  const noRunsContext = sparse ? "No run traces in range" : "Trace-derived estimate";

  return [
    card(1, "Platform COGS", sparse ? "—" : fmtUsd(platformCogs), noRunsContext, "neutral"),
    card(
      2,
      "Cost per active licensee",
      sparse || activeLicensees === 0 ? "—" : fmtUsd(costPerLicensee),
      `${activeLicensees} active licensees`,
      costPerLicensee > 800 ? "warn" : "neutral",
    ),
    card(
      3,
      "Gross margin",
      sparse || stripeRevenueMock <= 0 ? "—" : fmtPct(grossMargin),
      "Stripe revenue − platform COGS",
      grossMargin < 45 ? "bad" : grossMargin < 55 ? "warn" : "neutral",
    ),
    card(4, "Stripe revenue", sparse ? "—" : fmtUsd(stripeRevenueMock), "LiNKaios core + suites + brand bundles", "neutral"),
    card(
      5,
      "Trial burn",
      sparse ? "—" : fmtUsd(trialBurn),
      `${trialing} trialing · unbilled model spend`,
      trialBurn > platformCogs * 0.15 ? "warn" : "neutral",
    ),
    card(
      6,
      "Top cost licensee",
      sparse ? "—" : (topTenant.name.split(" ")[0] ?? topTenant.name),
      sparse ? noRunsContext : `Est. ${fmtUsd(platformCogs * 0.38)} · support + margin watch`,
      "neutral",
    ),
    card(
      7,
      "Model spend mix",
      sparse ? "—" : (snapshot.costByModel[0]?.name?.split("/").pop() ?? "—"),
      sparse ? noRunsContext : "Largest model share in window",
      "neutral",
    ),
    card(
      8,
      "Anomaly spend",
      sparse ? "—" : fmtUsd(platformCogs * 0.07),
      "Tenants >30% above 30-day baseline",
      platformCogs * 0.07 > costPerLicensee ? "warn" : "neutral",
    ),
    card(9, "Tokens (platform)", sparse ? "—" : snapshot.totalTokens.toLocaleString(), noRunsContext, "neutral"),
    card(
      10,
      "Wasted cost %",
      sparse || snapshot.totalCostUsd <= 0 ? "—" : fmtPct((snapshot.kpiBase.errorCostUsd / snapshot.totalCostUsd) * 100),
      sparse ? noRunsContext : "Error-like spend / platform COGS",
      "neutral",
    ),
    card(11, "Active licensees", String(activeLicensees), `${LICENSEE_REGISTRY.length} total in registry`, "neutral"),
    card(
      12,
      "Cost trend",
      sparse || snapshot.kpiBase.costTrendPct == null
        ? "—"
        : `${snapshot.kpiBase.costTrendPct > 0 ? "+" : ""}${snapshot.kpiBase.costTrendPct.toFixed(1)}%`,
      sparse ? noRunsContext : snapshot.kpiBase.costTrendLabel || "Period vs prior window",
      snapshot.kpiBase.costTrendPct != null && snapshot.kpiBase.costTrendPct > 12 ? "bad" : "neutral",
    ),
  ].slice(0, KPI_CARDS_PER_VIEW);
}

export const LICENSOR_COST_VIEW_QUESTION = "What does the platform cost us to serve all tenants, and where is margin at risk?";
