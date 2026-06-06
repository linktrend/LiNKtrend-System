/**
 * Maps canonical autowork workflow handles to n8n webhook path segments.
 * n8n webhook paths avoid dots; handles stay dotted per CONTRACTS_MVO.md §5.
 */
export function workflowHandleToN8nWebhookPath(handle: string): string {
  return handle.replace(/^autowork\./, "").replace(/\./g, "-");
}

/**
 * n8n 2.14 production webhook URL path: /webhook/{workflowId}/webhook/{handlePath}
 */
export function buildN8n214ProductionWebhookPath(n8nWorkflowId: string, handlePath: string): string {
  return `/webhook/${encodeURIComponent(n8nWorkflowId)}/webhook/${encodeURIComponent(handlePath)}`;
}

export function buildN8nWebhookInvokePath(handle: string, n8nWorkflowId?: string): string {
  const handlePath = workflowHandleToN8nWebhookPath(handle);
  if (n8nWorkflowId) {
    return buildN8n214ProductionWebhookPath(n8nWorkflowId, handlePath);
  }
  return `/webhook/${encodeURIComponent(handlePath)}`;
}

export function n8nWebhookPathToWorkflowHandle(path: string): string | undefined {
  const trimmed = path.replace(/^\/+|\/+$/g, "");
  if (!trimmed) return undefined;
  if (trimmed.startsWith("autowork.")) return trimmed;
  return `autowork.${trimmed.replace(/-/g, ".")}`;
}
