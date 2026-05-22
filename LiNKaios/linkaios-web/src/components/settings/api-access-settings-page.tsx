"use client";

import { ApiKeysPanel } from "@/components/settings/api-keys-panel";
import type { IntegrationSecretRow } from "@/components/settings/integration-secrets-actions";

export function ApiAccessSettingsPage(props: {
  initialIntegrationSecrets: IntegrationSecretRow[];
  canManageSecrets: boolean;
}) {
  return (
    <ApiKeysPanel initialRows={props.initialIntegrationSecrets} canManage={props.canManageSecrets} />
  );
}
