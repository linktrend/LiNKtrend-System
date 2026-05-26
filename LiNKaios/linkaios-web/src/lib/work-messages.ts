import { buildZulipThreadUrl } from "@/lib/zulip-links";

export type ChannelMessage = {
  id: string;
  sender: string;
  sentAt: string;
  /** Optional message subject — shown in list/detail when present. */
  subject?: string | null;
  preview: string;
  body: string;
  /** Heuristic unread (MVP — no per-user read persistence yet). */
  hasUnread?: boolean;
  /** Opens the native messaging product in a new browser tab. */
  openHref: string;
};

export type ChannelMessageThread = {
  id: string;
  channel: string;
  /** Shown as column 1 tag (Slack, Telegram, Zulip, …) */
  channelTag: string;
  /** Human-readable project or mission name this thread belongs to. */
  projectName?: string | null;
  subject: string;
  preview: string;
  lastActivity: string;
  /** Legacy concatenated transcript; prefer `messages`. */
  detail: string;
  missionId?: string | null;
  messageCount: number;
  messages: ChannelMessage[];
  streamId?: number | string | null;
  topic?: string | null;
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

function bodyFromPayload(payload: unknown): string {
  if (payload == null) return "Inbound channel message (metadata only).";
  if (typeof payload === "object" && payload !== null) {
    const o = payload as Record<string, unknown>;
    if (typeof o.content === "string" && o.content.trim()) return o.content.trim();
    const msg = o.message;
    if (msg && typeof msg === "object") {
      const m = msg as Record<string, unknown>;
      if (typeof m.content === "string" && m.content.trim()) return m.content.trim();
    }
    if (typeof o.preview === "string" && o.preview.trim()) return o.preview.trim();
  }
  return previewFromPayload(payload);
}

function senderFromPayload(payload: unknown): string {
  if (payload == null) return "Unknown sender";
  if (typeof payload === "object" && payload !== null) {
    const o = payload as Record<string, unknown>;
    if (typeof o.sender_full_name === "string" && o.sender_full_name.trim()) return o.sender_full_name.trim();
    if (typeof o.sender_email === "string" && o.sender_email.trim()) return o.sender_email.trim();
    const msg = o.message;
    if (msg && typeof msg === "object") {
      const m = msg as Record<string, unknown>;
      if (typeof m.sender_full_name === "string" && m.sender_full_name.trim()) return m.sender_full_name.trim();
      if (typeof m.sender_email === "string" && m.sender_email.trim()) return m.sender_email.trim();
    }
  }
  return "Unknown sender";
}

type ThreadAcc = ChannelMessageThread & { _rows: ZulipMessageLinkRow[] };

const SETTINGS_FALLBACK = "/settings/platform";

function zulipOpenHref(
  zulipSiteUrl: string | null,
  streamId: number | string | null | undefined,
  topic: string | null | undefined,
  messageId?: string | number | null,
): string {
  if (!zulipSiteUrl || streamId == null) return SETTINGS_FALLBACK;
  return buildZulipThreadUrl(zulipSiteUrl, {
    streamId,
    topic: topic?.trim() || "(no topic)",
    messageId,
  });
}

function subjectFromPayload(payload: unknown): string | null {
  if (payload == null || typeof payload !== "object") return null;
  const o = payload as Record<string, unknown>;
  if (typeof o.subject === "string" && o.subject.trim()) return o.subject.trim();
  const msg = o.message;
  if (msg && typeof msg === "object") {
    const m = msg as Record<string, unknown>;
    if (typeof m.subject === "string" && m.subject.trim()) return m.subject.trim();
  }
  return null;
}

/** Merge HH:MM (or full ISO) from fixture headers with a thread activity date. */
function resolveSentAt(timeOrIso: string, fallbackSentAt?: string): string {
  const direct = new Date(timeOrIso);
  if (!Number.isNaN(direct.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(timeOrIso.trim())) {
    return direct.toISOString();
  }

  const timeMatch = timeOrIso.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?$/i);
  if (!timeMatch || !fallbackSentAt) return timeOrIso;

  const base = new Date(fallbackSentAt);
  if (Number.isNaN(base.getTime())) return timeOrIso;

  let hours = parseInt(timeMatch[1]!, 10);
  const minutes = parseInt(timeMatch[2]!, 10);
  const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
  const meridiem = timeMatch[4]?.toUpperCase();
  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  base.setHours(hours, minutes, seconds, 0);
  return base.toISOString();
}

/** Parse demo / fixture detail blocks (`Sender · time\\nbody`, separated by `---`). */
export function parseDetailIntoMessages(
  detail: string,
  opts: { threadId: string; openHref: string; fallbackSentAt?: string },
): ChannelMessage[] {
  const chunks = detail
    .split(/\n---\n/)
    .map((c) => c.trim())
    .filter(Boolean);

  return chunks.map((chunk, index) => {
    const lines = chunk.split("\n");
    const header = lines[0] ?? `Message ${index + 1}`;
    const body = lines.slice(1).join("\n").trim() || chunk;
    const headerMatch = header.match(/^(.+?)\s·\s(.+)$/);
    const sender = headerMatch?.[1]?.trim() || "Unknown sender";
    const rawSentAt = headerMatch?.[2]?.trim() || opts.fallbackSentAt || "—";
    const sentAt = resolveSentAt(rawSentAt, opts.fallbackSentAt);
    const preview = body.length > 140 ? `${body.slice(0, 140)}…` : body;
    const subjectLine = lines[1]?.startsWith("Subject: ") ? lines[1].slice("Subject: ".length).trim() : null;
    const messageBody = subjectLine ? lines.slice(2).join("\n").trim() || body : body;
    return {
      id: `${opts.threadId}-msg-${index + 1}`,
      sender,
      sentAt,
      subject: subjectLine,
      preview: messageBody.length > 140 ? `${messageBody.slice(0, 140)}…` : messageBody,
      body: messageBody,
      openHref: opts.openHref,
    };
  });
}

export function ensureThreadMessages(thread: ChannelMessageThread): ChannelMessageThread {
  let messages = thread.messages;
  if (messages.length === 0) {
    messages = parseDetailIntoMessages(thread.detail, {
      threadId: thread.id,
      openHref: thread.openHref,
      fallbackSentAt: thread.lastActivity,
    });
  }
  if (thread.hasUnread && messages.length > 0) {
    const lastIdx = messages.length - 1;
    messages = messages.map((m, i) => ({ ...m, hasUnread: i === lastIdx }));
  }
  return {
    ...thread,
    messages,
    messageCount: messages.length || thread.messageCount,
  };
}

export function groupZulipIntoThreads(
  rows: ZulipMessageLinkRow[],
  options?: { zulipSiteUrl?: string | null },
): ChannelMessageThread[] {
  const zulipSiteUrl = options?.zulipSiteUrl ?? null;
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
        messages: [],
        streamId: stream,
        topic,
        openHref: zulipOpenHref(zulipSiteUrl, stream, topic),
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
    const chronological = [...g._rows].reverse();
    const lastMs = new Date(g.lastActivity).getTime();
    const hasUnread = Number.isFinite(lastMs) && Date.now() - lastMs < 36 * 60 * 60 * 1000 && g.messageCount > 0;
    const messages: ChannelMessage[] = chronological.map((r, index) => {
      const body = bodyFromPayload(r.payload);
      const preview = previewFromPayload(r.payload);
      const isLatest = index === chronological.length - 1;
      return {
        id: String(r.id),
        sender: senderFromPayload(r.payload),
        sentAt: r.created_at,
        subject: subjectFromPayload(r.payload),
        preview,
        body,
        hasUnread: hasUnread && isLatest,
        openHref: zulipOpenHref(zulipSiteUrl, g.streamId, g.topic, r.zulip_message_id),
      };
    });

    const detailLines = messages.map((m, i) => `— Message ${i + 1} (${m.sentAt})\n${m.body}`);
    const { _rows: _threadRows, ...rest } = g;
    void _threadRows;

    return ensureThreadMessages({
      ...rest,
      hasUnread,
      messages,
      messageCount: messages.length,
      detail: `Thread with ${messages.length} linked message(s).\n\n` + detailLines.join("\n\n"),
      openHref: zulipOpenHref(zulipSiteUrl, g.streamId, g.topic, chronological[chronological.length - 1]?.zulip_message_id),
    });
  });
}

export function prepareChannelThreads(
  threads: ChannelMessageThread[],
  options?: { zulipSiteUrl?: string | null },
): ChannelMessageThread[] {
  const zulipSiteUrl = options?.zulipSiteUrl ?? null;
  return threads.map((thread) => {
    const enriched = ensureThreadMessages(thread);
    const tag = (thread.channelTag || thread.channel).toLowerCase();
    if (tag !== "zulip" || !zulipSiteUrl || enriched.streamId == null) {
      return {
        ...enriched,
        messages: enriched.messages.map((m) => ({ ...m, openHref: m.openHref || enriched.openHref })),
      };
    }
    const topic = enriched.topic?.trim() || "(no topic)";
    const threadHref = zulipOpenHref(zulipSiteUrl, enriched.streamId, topic);
    return {
      ...enriched,
      openHref: threadHref,
      messages: enriched.messages.map((m) => ({
        ...m,
        openHref: m.openHref.startsWith("http") ? m.openHref : threadHref,
      })),
    };
  });
}
