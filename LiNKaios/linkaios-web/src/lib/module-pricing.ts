/** Format module list pricing — monthly list rate and annual per-month equivalent (20% discount). */
export function formatModulePriceMonthly(usd: number): string {
  return `${usd.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })}/mo`;
}

export function moduleAnnualPerMonthUsd(monthlyUsd: number): number {
  return Math.round(monthlyUsd * 0.8);
}

export function modulePricingLines(monthlyUsd: number): { monthly: string; annualPerMonth: string } {
  const annual = moduleAnnualPerMonthUsd(monthlyUsd);
  return {
    monthly: formatModulePriceMonthly(monthlyUsd),
    annualPerMonth: `${formatModulePriceMonthly(annual)} billed annually (20% off)`,
  };
}
