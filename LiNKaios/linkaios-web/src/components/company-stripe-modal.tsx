"use client";

import { useEffect, useId, useRef } from "react";

import { COMPANY_SECTION_COPY } from "@/lib/company-page-copy";
import { STRIPE_PLAN_OPTIONS } from "@/lib/company-fixtures";
import { BUTTON, FIELD } from "@/lib/ui-standards";

export type StripeModalMode = "subscribe" | "cancel";

export function CompanyStripeModal(props: {
  open: boolean;
  mode: StripeModalMode;
  moduleName: string;
  plan: string;
  onPlanChange: (plan: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (props.open) closeRef.current?.focus();
  }, [props.open]);

  if (!props.open) return null;

  const isSubscribe = props.mode === "subscribe";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50 dark:bg-black/60"
        aria-label="Close dialog"
        onClick={props.onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-950"
      >
        <h2 id={titleId} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {COMPANY_SECTION_COPY.modules.stripeStubTitle}
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{COMPANY_SECTION_COPY.modules.stripeStubBody}</p>
        <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">{props.moduleName}</p>

        {isSubscribe ? (
          <label className="mt-4 block">
            <span className={FIELD.label}>{COMPANY_SECTION_COPY.modules.planLabel}</span>
            <select
              value={props.plan}
              onChange={(e) => props.onPlanChange(e.target.value)}
              className={`mt-1 ${FIELD.control}`}
            >
              {STRIPE_PLAN_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
            This will mark the subscription as canceled in the UI preview. No Stripe API call is made.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            ref={closeRef}
            type="button"
            className={BUTTON.secondaryRow}
            onClick={props.onClose}
          >
            Close
          </button>
          <button
            type="button"
            className={isSubscribe ? BUTTON.primaryRow : BUTTON.dangerRow}
            onClick={props.onConfirm}
          >
            {isSubscribe
              ? COMPANY_SECTION_COPY.modules.confirmSubscribe
              : COMPANY_SECTION_COPY.modules.confirmCancel}
          </button>
        </div>
      </div>
    </div>
  );
}
