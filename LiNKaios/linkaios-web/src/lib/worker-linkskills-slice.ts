export type WorkerLinkskillsSlice = "skills" | "connectors" | "tools";

export function workerLinkskillsSliceFromSearchParams(sp: { slice?: string | string[] }): WorkerLinkskillsSlice {
  const raw = Array.isArray(sp.slice) ? sp.slice[0] : sp.slice;
  if (raw === "connectors" || raw === "tools") return raw;
  return "skills";
}
