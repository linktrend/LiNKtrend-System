import { getZulipSiteUrlFromEnv } from "@/lib/zulip-links";

export type WorkMessagingChannelConfig = {
  zulip: boolean;
  slack: boolean;
  telegram: boolean;
};

/** Which Work → Messages channel tabs to show (Zulip is always listed; others only when configured). */
export function resolveWorkMessagingChannelConfig(): WorkMessagingChannelConfig {
  return {
    zulip: true,
    slack: process.env.SLACK_MESSAGING_ENABLED?.trim() === "1",
    telegram: process.env.TELEGRAM_MESSAGING_ENABLED?.trim() === "1",
  };
}

export function isZulipMessagingConfigured(): boolean {
  return Boolean(getZulipSiteUrlFromEnv());
}
