import { AlertTriangle } from "lucide-react";

/** Actionable integration warning — not a total-outage empty state. */
export function IntegrationWarningBanner(props: {
  title: string;
  reason?: string;
  retryHint?: string;
}) {
  return (
    <div
      className="rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-100"
      role="status"
    >
      <p className="inline-flex items-start gap-2 font-medium">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        {props.title}
      </p>
      {props.reason ? <p className="mt-2 text-amber-900/90 dark:text-amber-100/90">{props.reason}</p> : null}
      {props.retryHint ? (
        <p className="mt-2 text-xs text-amber-800/90 dark:text-amber-200/90">{props.retryHint}</p>
      ) : null}
    </div>
  );
}
