export type ChannelMessageThread = {
  id: string;
  channel: string;
  /** Shown as column 1 tag (Slack, Telegram, Zulip, …) */
  channelTag: string;
  subject: string;
  preview: string;
  lastActivity: string;
  detail: string;
  missionId?: string | null;
  messageCount: number;
  /** Heuristic: recent activity without read-state persistence (MVP). */
  hasUnread?: boolean;
  /** In-app or external URL opened by Messages modal "Open" */
  openHref: string;
};

export type ZulipMessageLinkRow = {
  id: string;
  stream_id: number | string | null;
  topic: string | null;
  mission_id: string | null;
  payload: unknown;
  created_at: string;
  zulip_message_id: string;
};

function previewFromPayload(payload: unknown): string {
  if (payload == null) return "Inbound channel message (metadata only).";
  if (typeof payload === "object" && payload !== null && "preview" in payload && typeof (payload as { preview: unknown }).preview === "string") {
    return (payload as { preview: string }).preview;
  }
  const s = JSON.stringify(payload);
  return s.length > 140 ? `${s.slice(0, 140)}…` : s;
}

type ThreadAcc = ChannelMessageThread & { _rows: ZulipMessageLinkRow[] };

export function groupZulipIntoThreads(rows: ZulipMessageLinkRow[]): ChannelMessageThread[] {
  const order: string[] = [];
  const map = new Map<string, ThreadAcc>();

  for (const row of rows) {
    const stream = row.stream_id ?? "unknown";
    const key = `${stream}::${row.topic ?? ""}`;
    let g = map.get(key);
    const topic = row.topic?.trim() || "(no topic)";
    if (!g) {
      g = {
        id: `zulip-${key}`,
        channel: "Zulip",
        channelTag: "Zulip",
        subject: `Stream ${stream} · ${topic}`,
        preview: previewFromPayload(row.payload),
        lastActivity: row.created_at,
        detail: "",
        missionId: row.mission_id,
        messageCount: 0,
        openHref: "/settings/gateway",
        _rows: [],
      };
      map.set(key, g);
      order.push(key);
    }
    g.messageCount += 1;
    g._rows.push(row);
    g.lastActivity = row.created_at;
    g.preview = previewFromPayload(row.payload);
    if (row.mission_id) g.missionId = row.mission_id;
  }

  return order.map((k) => {
    const g = map.get(k)!;
    const lastMs = new Date(g.lastActivity).getTime();
    const hasUnread = Number.isFinite(lastMs) && Date.now() - lastMs < 36 * 60 * 60 * 1000 && g.messageCount > 0;
    const detailLines = g._rows.slice(0, 12).map(
      (r, i) => `— Message ${i + 1} (${r.created_at})\n${previewFromPayload(r.payload)}`,
    );
    const { _rows: _threadRows, ...rest } = g;
    void _threadRows;
    return {
      ...rest,
      hasUnread,
      detail: `Thread with ${g.messageCount} linked message(s).\n\n` + detailLines.join("\n\n"),
    };
  });
}

