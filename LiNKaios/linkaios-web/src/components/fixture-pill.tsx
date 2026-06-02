"use client";

import { StatusPill } from "@/components/ui/status-pill";

/** Small provenance badge for UI mock / fixture rows. */
export function FixturePill(props: { className?: string }) {
  return <StatusPill label="Fixture" tone="warning" className={props.className} />;
}
