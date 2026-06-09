/** Zulip hash operand encoding — see https://zulip.com/api/zulip-urls */

export function encodeZulipHashOperand(value: string): string {
  return encodeURIComponent(value)
    .replace(/%/g, ".")
    .replace(/\(/g, ".28")
    .replace(/\)/g, ".29")
    .replace(/\./g, ".2E");
}

export function normalizeZulipSiteUrl(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    return url.origin.replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function getZulipSiteUrlFromEnv(): string | null {
  return normalizeZulipSiteUrl(process.env.ZULIP_SITE_URL);
}

export type ZulipThreadLinkParams = {
  streamId: number | string;
  topic: string;
  /** When set, anchors the narrow to a specific message (permanent link). */
  messageId?: string | number | null;
};

/**
 * Builds a shareable Zulip web URL for a channel topic or a message within it.
 * Zulip documents topic links and message permalinks via `#narrow/…` hashes.
 */
export function buildZulipThreadUrl(siteUrl: string, params: ZulipThreadLinkParams): string | null {
  const base = normalizeZulipSiteUrl(siteUrl);
  if (!base) return null;

  const streamId = String(params.streamId);
  const topic = params.topic.trim() || "(no topic)";
  const encodedTopic = encodeZulipHashOperand(topic);
  const hash = params.messageId
    ? `#narrow/channel/${streamId}/topic/${encodedTopic}/with/${String(params.messageId)}`
    : `#narrow/channel/${streamId}/topic/${encodedTopic}`;

  return `${base}/${hash}`;
}

/** Opens an external URL in a new browser tab (popup-safe for operator workflows). */
export function openExternalPopup(url: string): void {
  if (typeof window === "undefined" || !url.startsWith("http")) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

/** @deprecated Use openExternalPopup */
export const openZulipExternalUrl = openExternalPopup;
