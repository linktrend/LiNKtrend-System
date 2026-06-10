import type { ChannelMessageThread } from "@/lib/work-messages";

/** Action queue rows must never navigate to external URLs on row click. */
export function isInternalAttentionHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return false;
  return !/^https?:\/\//i.test(trimmed);
}

/** Normalize attention-feed targets to in-app routes only. */
export function sanitizeAttentionHref(href: string, fallback = "/work"): string {
  const trimmed = href.trim();
  if (!trimmed || !isInternalAttentionHref(trimmed)) return fallback;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

/** Work → Messages deep link for a channel thread (Zulip rows open in-app, not Zulip). */
export function workMessagesThreadHref(thread: ChannelMessageThread): string {
  return `/work/messages?thread=${encodeURIComponent(thread.id)}`;
}
