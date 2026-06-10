/** Normalize operator-facing Chatwoot origin (browser popup target). */
export function normalizeChatwootPublicUrl(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    return url.origin.replace(/\/$/, "");
  } catch {
    return null;
  }
}

/**
 * Operator popup URL for a Chatwoot conversation.
 * Pattern: `{origin}/app/accounts/{accountId}/conversations/{conversationId}`
 */
export function buildChatwootConversationUrl(
  publicBase: string,
  accountId: string,
  conversationId: string,
): string | null {
  const base = normalizeChatwootPublicUrl(publicBase);
  const account = accountId.trim();
  const conversation = conversationId.trim();
  if (!base || !account || !conversation) return null;
  return `${base}/app/accounts/${encodeURIComponent(account)}/conversations/${encodeURIComponent(conversation)}`;
}

/** Resolve browser-safe Chatwoot origin — prefers CHATWOOT_PUBLIC_URL over API base. */
export function resolveChatwootPublicUrl(env: {
  CHATWOOT_PUBLIC_URL?: string;
  CHATWOOT_BASE_URL?: string;
}): string | null {
  return (
    normalizeChatwootPublicUrl(env.CHATWOOT_PUBLIC_URL) ?? normalizeChatwootPublicUrl(env.CHATWOOT_BASE_URL)
  );
}
