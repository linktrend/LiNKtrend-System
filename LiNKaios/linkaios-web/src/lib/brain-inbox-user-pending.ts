const STORAGE_KEY = "linkaios.brainInboxUserPending";

export const EVENT_BRAIN_INBOX_USER_PENDING_CHANGED = "linkaios-brain-inbox-user-pending-changed";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(EVENT_BRAIN_INBOX_USER_PENDING_CHANGED));
}

export function isBrainInboxUserPending(versionId: string): boolean {
  return readIds().includes(versionId);
}

export function markBrainInboxUserPending(versionId: string) {
  const ids = readIds();
  if (ids.includes(versionId)) return;
  writeIds([...ids, versionId]);
}
