import type { AttentionFeedItem } from "@/lib/work-attention-feed";
import type { WorkAlert } from "@/lib/work-alerts";

/** True when a work alert row comes from `src/lib/ui-mocks/*` fixtures. */
export function isUiMockWorkAlert(alert: WorkAlert): boolean {
  if (alert.isFixture) return true;
  if (alert.id.startsWith("demo-alert")) return true;
  return alert.source === "Fixture";
}

export function isUiMockAttentionItem(item: AttentionFeedItem): boolean {
  if (item.isFixture) return true;
  if (item.kind === "alert" && item.id.startsWith("alert-demo-alert")) return true;
  if (item.kind === "message" && item.id.startsWith("msg-demo-channel")) return true;
  if (item.kind === "session" && item.id.includes("demo-lisa")) return true;
  if (item.kind === "session" && item.id.includes("demo-eric")) return true;
  return false;
}
