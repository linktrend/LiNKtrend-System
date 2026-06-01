import { modulePricingLines } from "@/lib/module-pricing";

export function ModulePricingBlock(props: { monthlyUsd: number; compact?: boolean; align?: "start" | "end" }) {
  const lines = modulePricingLines(props.monthlyUsd);
  const align = props.align ?? (props.compact ? "end" : "start");

  if (props.compact) {
    return (
      <div
        className={`space-y-0.5 text-xs tabular-nums text-zinc-700 dark:text-zinc-300 ${align === "end" ? "text-right" : "text-left"}`}
      >
        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{lines.monthly}</p>
        <p className="text-zinc-500 dark:text-zinc-400">{lines.annualPerMonth}</p>
      </div>
    );
  }

  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="text-zinc-500">Monthly</dt>
        <dd className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{lines.monthly}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-zinc-500">Annual</dt>
        <dd className="text-right font-medium tabular-nums text-zinc-800 dark:text-zinc-200">{lines.annualPerMonth}</dd>
      </div>
    </dl>
  );
}
