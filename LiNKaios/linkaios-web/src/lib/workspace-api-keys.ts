/**
 * @deprecated LiNKaios does not issue workspace API keys from Settings.
 * External provider credentials live in `integration_secrets` — see Settings → API Access.
 */

export type WorkspaceApiKeyRow = {
  id: string;
  label: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
};
