/**
 * Maps canonical autowork workflow handles to n8n webhook path segments.
 * n8n webhook paths avoid dots; handles stay dotted per CONTRACTS_MVO.md §5.
 */
export function workflowHandleToN8nWebhookPath(handle: string): string {
  return handle.replace(/^autowork\./, "").replace(/\./g, "-");
}

export function n8nWebhookPathToWorkflowHandle(path: string): string | undefined {
  const trimmed = path.replace(/^\/+|\/+$/g, "");
  if (!trimmed) return undefined;
  if (trimmed.startsWith("autowork.")) return trimmed;
  return `autowork.${trimmed.replace(/-/g, ".")}`;
}
