import { StatusPill } from "@/components/ui/status-pill";
import { ATTENTION_FEED_PILL_LABELS } from "@/lib/status-colors";
import type { AttentionFeedItem } from "@/lib/work-attention-feed";

/** Type + optional severity chips for attention / action queue rows (fixed equal widths via StatusPill). */
export function AttentionFeedBadges(props: { item: AttentionFeedItem }) {
  const { item } = props;
  return (
    <span className="flex shrink-0 flex-wrap items-center justify-end gap-2">
      <StatusPill label={item.typeLabel} tone="neutral" equalWidthLabels={ATTENTION_FEED_PILL_LABELS} />
      {item.kind === "alert" && item.alertSeverity === "critical" ? (
        <StatusPill label="Critical" tone="danger" equalWidthLabels={ATTENTION_FEED_PILL_LABELS} />
      ) : null}
      {item.kind === "alert" && item.alertSeverity === "warning" ? (
        <StatusPill label="Warning" tone="warning" equalWidthLabels={ATTENTION_FEED_PILL_LABELS} />
      ) : null}
    </span>
  );
}
