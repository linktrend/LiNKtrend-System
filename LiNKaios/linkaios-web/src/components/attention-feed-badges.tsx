import type { AttentionFeedItem } from "@/lib/work-attention-feed";
import { ATTENTION_QUEUE_BADGE } from "@/lib/ui-theme";

/** Type + optional severity chips for attention / action queue rows (fixed equal widths via `ui-theme`). */
export function AttentionFeedBadges(props: { item: AttentionFeedItem }) {
  const { item } = props;
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className={ATTENTION_QUEUE_BADGE.type}>{item.typeLabel}</span>
      {item.kind === "alert" && item.alertSeverity === "critical" ? (
        <span className={ATTENTION_QUEUE_BADGE.severityCritical}>Critical</span>
      ) : null}
      {item.kind === "alert" && item.alertSeverity === "warning" ? (
        <span className={ATTENTION_QUEUE_BADGE.severityWarning}>Warning</span>
      ) : null}
    </span>
  );
}
