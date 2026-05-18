import type { WorkAlert } from "@/lib/work-alerts";
import type { ChannelMessageThread } from "@/lib/work-messages";
import type { SessionThreadRow } from "@/lib/work-sessions";

/** Unified queue for Overview + All Work (routing only; no new execution paths). */
export type AttentionFeedItem = {
  id: string;
  kind: "alert" | "message" | "session" | "brain";
  /** Operator-facing type label for list rows. */
  typeLabel: "Alert" | "Message" | "Session" | "LiNKbrain";
  title: string;
  subtitle?: string;
  href: string;
  alertSeverity?: WorkAlert["severity"];
};

type Sortable = AttentionFeedItem & { _sort: [number, number] };

function alertSeverityRank(sev: WorkAlert["severity"]): number {
  if (sev === "critical") return 0;
  if (sev === "warning") return 1;
  return 2;
}

function sessionPriorityBand(s: SessionThreadRow): number {
  if (s.displayStatus === "waiting") return 4;
  return 6;
}

/**
 * Priority: critical alerts → warnings → informational alerts → messages → sessions waiting →
 * LiNKbrain inbox → other sessions. Within each band, newest first.
 */
export function buildAttentionFeed(input: {
  alerts: WorkAlert[];
  messages: ChannelMessageThread[];
  sessions: SessionThreadRow[];
  brainDraftCount: number;
}): AttentionFeedItem[] {
  const out: Sortable[] = [];

  const alertsSorted = [...input.alerts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  for (const a of alertsSorted) {
    const sevRank = alertSeverityRank(a.severity);
    out.push({
      id: `alert-${a.id}`,
      kind: "alert",
      typeLabel: "Alert",
      title: a.title,
      subtitle: a.summary.trim() ? a.summary.trim().slice(0, 140) : undefined,
      href: "/work/alerts",
      alertSeverity: a.severity,
      _sort: [sevRank, -new Date(a.createdAt).getTime()],
    });
  }

  const msgs = [...input.messages].sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  for (const m of msgs.slice(0, 8)) {
    out.push({
      id: `msg-${m.id}`,
      kind: "message",
      typeLabel: "Message",
      title: `${m.channel}: ${m.subject}`,
      subtitle: m.preview?.trim() ? m.preview.trim().slice(0, 120) : undefined,
      href: m.openHref?.trim() ? m.openHref : "/work/messages",
      _sort: [3, -new Date(m.lastActivity).getTime()],
    });
  }

  const waitingSessions = input.sessions.filter((s) => s.displayStatus === "waiting");
  const otherSessions = input.sessions.filter((s) => s.displayStatus !== "waiting");
  const sessWaitingSorted = [...waitingSessions].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
  for (const s of sessWaitingSorted) {
    out.push({
      id: `sess-${s.id}`,
      kind: "session",
      typeLabel: "Session",
      title: `${s.agentName} — ${s.sessionTitle}`,
      subtitle: s.preview.trim() ? s.preview.trim().slice(0, 120) : undefined,
      href: s.openHref,
      _sort: [4, -new Date(s.startedAt).getTime()],
    });
  }

  if (input.brainDraftCount > 0) {
    out.push({
      id: "brain-inbox",
      kind: "brain",
      typeLabel: "LiNKbrain",
      title: "LiNKbrain inbox",
      subtitle: `${input.brainDraftCount} draft(s) awaiting triage`,
      href: "/memory?tab=inbox",
      _sort: [5, 0],
    });
  }

  const sessOtherSorted = [...otherSessions].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
  for (const s of sessOtherSorted) {
    out.push({
      id: `sess-${s.id}`,
      kind: "session",
      typeLabel: "Session",
      title: `${s.agentName} — ${s.sessionTitle}`,
      subtitle: s.preview.trim() ? s.preview.trim().slice(0, 120) : undefined,
      href: s.openHref,
      _sort: [sessionPriorityBand(s), -new Date(s.startedAt).getTime()],
    });
  }

  out.sort((a, b) => {
    const d = a._sort[0]! - b._sort[0]!;
    if (d !== 0) return d;
    return a._sort[1]! - b._sort[1]!;
  });

  return out.map(({ _sort: _, ...row }) => row);
}
