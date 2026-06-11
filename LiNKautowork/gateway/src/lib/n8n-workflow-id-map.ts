import { workflowHandleToN8nWebhookPath } from "./workflow-handle-path.js";

let cachedMap: Map<string, string> | undefined;

function indexWorkflowId(map: Map<string, string>, key: string, workflowId: string): void {
  map.set(key, workflowId);
  if (key.startsWith("autowork.")) {
    map.set(workflowHandleToN8nWebhookPath(key), workflowId);
  }
}

function loadMap(): Map<string, string> {
  if (cachedMap) {
    return cachedMap;
  }

  cachedMap = new Map();
  const raw = process.env.N8N_WORKFLOW_IDS?.trim();
  if (!raw) {
    return cachedMap;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string" && value.length > 0) {
        indexWorkflowId(cachedMap, key, value);
      }
    }
  } catch {
    // Ignore invalid JSON; callers fall back to legacy short webhook paths.
  }

  return cachedMap;
}

/**
 * Resolves a published n8n workflow UUID for a canonical handle or webhook path segment.
 * Keys in `N8N_WORKFLOW_IDS` may be dotted handles (`autowork.*`) or dashed webhook paths.
 */
export function resolveN8nWorkflowId(handle: string): string | undefined {
  const map = loadMap();
  return map.get(handle) ?? map.get(workflowHandleToN8nWebhookPath(handle));
}

/** Clears the in-memory cache so env changes are picked up in tests. */
export function clearN8nWorkflowIdMapForTesting(): void {
  cachedMap = undefined;
}
