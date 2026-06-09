"use client";

import type { AgentRuntimeSettings } from "@/lib/agent-runtime-settings";
import { AgentModelsForm } from "@/components/agent-models-form";
import { AgentSettingsForm } from "@/components/agent-settings-form";
import { useAppRole } from "@/components/role-preview-provider";
import { canConfigureLinkbot } from "@/lib/app-roles";

export function WorkerRoleAwareModelsForm(props: { agentId: string; initial: AgentRuntimeSettings; forceReadonly?: boolean }) {
  const { kind, role } = useAppRole();
  const readOnly = props.forceReadonly === true || !canConfigureLinkbot(kind, role);
  return <AgentModelsForm agentId={props.agentId} initial={props.initial} readonly={readOnly} />;
}

export function WorkerRoleAwareSettingsForm(props: {
  agentId: string;
  displayName?: string;
  registryStatus?: string;
  initial: AgentRuntimeSettings;
  forceReadonly?: boolean;
  lifecycleSlot?: React.ReactNode;
}) {
  const { kind, role } = useAppRole();
  const readOnly = props.forceReadonly === true || !canConfigureLinkbot(kind, role);
  return (
    <AgentSettingsForm
      agentId={props.agentId}
      displayName={props.displayName}
      registryStatus={props.registryStatus}
      initial={props.initial}
      readonly={readOnly}
      lifecycleSlot={props.lifecycleSlot}
    />
  );
}
