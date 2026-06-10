"use client";

import { Suspense } from "react";

import { AlertsInbox } from "./alerts-inbox";

type AlertsInboxProps = Parameters<typeof AlertsInbox>[0];

/** Suspense boundary required for {@link AlertsInbox} (`useSearchParams`). */
export function AlertsInboxBoundary(props: AlertsInboxProps) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading alerts…</p>}>
      <AlertsInbox {...props} />
    </Suspense>
  );
}
