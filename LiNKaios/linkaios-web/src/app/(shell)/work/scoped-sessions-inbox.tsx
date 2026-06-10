"use client";

import type { IsAdminBotInput } from "@/lib/agent-fleet-classification";
import { filterAgentIdsForViewScope } from "@/lib/licensor-view-scope";
import { useLicensorScope } from "@/components/role-preview-provider";
import type { SessionThreadRow } from "@/lib/work-sessions";

import { adminSessionsStopPolicy, SessionsInbox } from "./sessions-inbox";

export function ScopedSessionsInbox(props: {
  sessions: SessionThreadRow[];
  agents: IsAdminBotInput[];
  licensorTenantId?: string | null;
  uiMocksDemoAgent?: boolean;
}) {
  const { scope } = useLicensorScope();
  const allowedIds = filterAgentIdsForViewScope(props.agents, scope, {
    licensorTenantId: props.licensorTenantId,
    uiMocksDemoAgent: props.uiMocksDemoAgent,
  });
  const sessions = props.sessions.filter((session) => allowedIds.has(session.agentId));
  return (
    <SessionsInbox
      sessions={sessions}
      stopPolicy={adminSessionsStopPolicy(props.agents, {
        licensorTenantId: props.licensorTenantId,
        uiMocksDemoAgent: props.uiMocksDemoAgent,
      })}
    />
  );
}
