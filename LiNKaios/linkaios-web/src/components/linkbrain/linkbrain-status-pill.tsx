import { StatusPill, type StatusPillProps } from "@/components/ui/status-pill";
import type { StatusTone } from "@/lib/status-colors";

/** @deprecated Prefer {@link StatusPill} with tone directly — kept for LiNKbrain call sites. */
export function LinkbrainStatusPill(props: { label: string; tone?: "pending" | "published" | "draft" }) {
  const toneMap: Record<NonNullable<typeof props.tone>, StatusTone> = {
    pending: "warning",
    published: "success",
    draft: "neutral",
  };
  const tone: StatusTone = props.tone ? toneMap[props.tone] : "warning";
  return <StatusPill label={props.label} tone={tone} equalWidth />;
}

export type { StatusPillProps };
