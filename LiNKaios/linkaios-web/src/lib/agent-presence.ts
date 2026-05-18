import type { AgentStatus } from "@linktrend/shared-types";

export type Presence = "online" | "offline" | "paused";

export function presenceFromRegistryStatus(status: AgentStatus): Presence {
  if (status === "active") return "online";
  if (status === "inactive") return "offline";
  return "paused";
}

export function presenceLabel(p: Presence): string {
  switch (p) {
    case "online":
      return "Online";
    case "offline":
      return "Offline";
    case "paused":
      return "Paused";
    default:
      return p;
  }
}

export function fleetPresenceCounts(rows: { status: AgentStatus }[]) {
  let online = 0;
  let offline = 0;
  let paused = 0;
  for (const r of rows) {
    const p = presenceFromRegistryStatus(r.status);
    if (p === "online") online++;
    else if (p === "offline") offline++;
    else paused++;
  }
  return { total: rows.length, online, offline, paused };
}
