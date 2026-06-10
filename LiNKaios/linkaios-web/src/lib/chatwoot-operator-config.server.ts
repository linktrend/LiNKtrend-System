import "server-only";

import { loadEnv } from "@linktrend/shared-config";

import { resolveChatwootPublicUrl } from "@/lib/chatwoot-links";

export type ChatwootOperatorConfig = {
  publicUrl: string | null;
  accountId: string | null;
};

/** Browser popup targets for Open in Chatwoot actions. */
export function getChatwootOperatorConfig(): ChatwootOperatorConfig {
  const env = loadEnv();
  return {
    publicUrl: resolveChatwootPublicUrl(env),
    accountId: env.CHATWOOT_ACCOUNT_ID?.trim() ?? null,
  };
}
