"use client";

import { useEffect, useMemo, useState } from "react";

import type { ChannelMessageThread } from "@/lib/work-messages";
import { FIELD, screenTabLinkClass, TABS } from "@/lib/ui-standards";

type ProductChannel = "zulip" | "slack" | "telegram";

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

type ParsedMessage = { sender: string; time: string; body: string; isBot: boolean };

function parseMessages(detail: string): ParsedMessage[] {
  const blocks = detail.split("---").map((b) => b.trim()).filter(Boolean);
  return blocks.map((block) => {
    const lines = block.split("\n");
    const header = lines[0] ?? "";
    const dotIdx = header.lastIndexOf("·");
    const sender = dotIdx > -1 ? header.slice(0, dotIdx).trim() : header;
    const time = dotIdx > -1 ? header.slice(dotIdx + 1).trim() : "";
    const body = lines.slice(1).join("\n").trim();
    const isBot = !sender.toLowerCase().includes("operator") && !sender.toLowerCase().includes("(human)") &&
      !/^[A-Z][a-z]+ \(/.test(sender) && /[Bb]ot|LiNK/.test(sender);
    return { sender, time, body: body || header, isBot };
  });
}

function rawConversationBody(t: ChannelMessageThread): string {
  const lines = t.detail.split("\n").filter((l) => !l.includes("payload:") && !l.includes("zulip_message_id"));
  const body = lines.join("\n").trim();
  if (body.length > 1200) return `${body.slice(0, 1200)}…`;
  return body || t.preview;
}

function isZulipThread(t: ChannelMessageThread): boolean {
  const tag = (t.channelTag || t.channel || "").toLowerCase();
  return tag === "zulip";
}

const CHANNEL_LABEL: Record<ProductChannel, string> = {
  zulip: "Zulip",
  slack: "Slack",
  telegram: "Telegram",
};

export function WorkMessagesWorkspace(props: {
  threads: ChannelMessageThread[];
  agents: { id: string; display_name: string }[];
  /** mission id → primary LiNKbot id (for filter until per-message routing exists) */
  missionPrimaryAgent: Record<string, string | null>;
}) {
  const [productChannel, setProductChannel] = useState<ProductChannel>("zulip");
  const [agentId, setAgentId] = useState<string>("all");
  const [threadId, setThreadId] = useState<string | null>(null);

  const zulipThreads = useMemo(
    () => props.threads.filter((t) => isZulipThread(t)),
    [props.threads],
  );

  const filteredThreads = useMemo(() => {
    if (productChannel !== "zulip") return [];
    if (agentId === "all") return zulipThreads;
    return zulipThreads.filter((t) => {
      if (!t.missionId) return false;
      const primary = props.missionPrimaryAgent[t.missionId];
      return primary === agentId;
    });
  }, [productChannel, agentId, zulipThreads, props.missionPrimaryAgent]);

  useEffect(() => {
    if (filteredThreads.length === 0) {
      setThreadId(null);
      return;
    }
    const still = filteredThreads.some((t) => t.id === threadId);
    if (!still) setThreadId(filteredThreads[0]!.id);
  }, [filteredThreads, threadId]);

  const selected = filteredThreads.find((t) => t.id === threadId) ?? filteredThreads[0] ?? null;

  return (
    <div className="space-y-5">
      <div className={TABS.row} role="tablist" aria-label="Message channel">
        {(Object.keys(CHANNEL_LABEL) as ProductChannel[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={productChannel === key}
            onClick={() => {
              setProductChannel(key);
              setThreadId(null);
            }}
            className={screenTabLinkClass(productChannel === key)}
          >
            {CHANNEL_LABEL[key]}
          </button>
        ))}
      </div>

      {productChannel === "slack" ? (
        <p className="rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-10 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
          Slack is not wired yet. When the gateway stores Slack threads, they will appear in this tab with the same LiNKbot filter as Zulip.
        </p>
      ) : null}

      {productChannel === "telegram" ? (
        <p className="rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-10 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
          Telegram is not wired yet. When the gateway stores Telegram threads, they will appear in this tab with the same LiNKbot filter as Zulip.
        </p>
      ) : null}

      {productChannel === "zulip" ? (
        <>
          <div className="flex flex-wrap items-end gap-4">
            <label className="block min-w-[12rem] max-w-md flex-1">
              <span className={`${FIELD.label} text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400`}>
                LiNKbot
              </span>
              <select
                className={`mt-1.5 ${FIELD.control}`}
                value={agentId}
                onChange={(e) => {
                  setAgentId(e.target.value);
                  setThreadId(null);
                }}
              >
                <option value="all">All LiNKbots</option>
                {props.agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.display_name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                Filter uses each project&apos;s primary LiNKbot until message-level routing metadata exists.
              </p>
            </label>
          </div>

          {filteredThreads.length === 0 ? (
            <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
              {zulipThreads.length === 0
                ? "No Zulip threads yet."
                : "No threads for this LiNKbot filter — try “All LiNKbots” or another LiNKbot."}
            </p>
          ) : (
            <div className="flex min-h-[32rem] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm lg:flex-row dark:border-zinc-800 dark:bg-zinc-950">

              {/* Left panel — thread list */}
              <div className="flex min-h-0 min-w-0 flex-[1.1] flex-col border-b border-zinc-200 lg:border-b-0 lg:border-r dark:border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Threads — {filteredThreads.length}
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Select to read →</p>
                </div>
                <ul className="max-h-[min(70vh,32rem)] flex-1 overflow-y-auto">
                  {filteredThreads.map((t) => {
                    const active = (threadId ?? selected?.id) === t.id;
                    const unread = Boolean(t.hasUnread);
                    return (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => setThreadId(t.id)}
                          className={
                            "flex w-full items-start gap-2 border-b border-zinc-100 px-4 py-3 text-left text-sm transition dark:border-zinc-800/80 " +
                            (active ? "bg-sky-50/80 dark:bg-sky-950/30" : "hover:bg-zinc-50 dark:hover:bg-zinc-900/60")
                          }
                        >
                          <span
                            className={
                              "mt-1.5 h-2 w-2 shrink-0 rounded-full " +
                              (unread ? "bg-sky-500" : "bg-transparent")
                            }
                            title={unread ? "Unread activity" : undefined}
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-baseline justify-between gap-2">
                              <span className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                                {t.projectName ?? t.subject}
                              </span>
                              <span className="shrink-0 text-[10px] text-zinc-400">{formatRelativeTime(t.lastActivity)}</span>
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-zinc-500 dark:text-zinc-400">
                              {t.projectName ? t.subject : `${t.messageCount} message${t.messageCount === 1 ? "" : "s"}`}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Right panel — thread content */}
              <section className="flex min-h-[12rem] min-w-0 flex-[1.25] flex-col">
                <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Thread content
                  </p>
                  {selected ? (
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      {selected.messageCount} message{selected.messageCount === 1 ? "" : "s"} · {formatRelativeTime(selected.lastActivity)}
                    </p>
                  ) : null}
                </div>
                {selected ? (() => {
                  const messages = parseMessages(selected.detail);
                  return (
                    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                      {messages.length > 0 ? (
                        <ul className="flex flex-col gap-px divide-y divide-zinc-100 dark:divide-zinc-800/80">
                          {messages.map((msg, i) => (
                            <li
                              key={i}
                              className={
                                "flex gap-3 px-4 py-3 " +
                                (msg.isBot
                                  ? "bg-sky-50/30 dark:bg-sky-950/15"
                                  : "bg-white dark:bg-zinc-950")
                              }
                            >
                              <span
                                className={
                                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold " +
                                  (msg.isBot
                                    ? "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300"
                                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300")
                                }
                                aria-hidden
                              >
                                {msg.sender.slice(0, 1).toUpperCase()}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-baseline gap-2">
                                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{msg.sender}</span>
                                  {msg.time ? (
                                    <span className="text-[10px] text-zinc-400">{msg.time}</span>
                                  ) : null}
                                </div>
                                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                                  {msg.body}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="whitespace-pre-wrap p-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                          {rawConversationBody(selected)}
                        </p>
                      )}
                      <div className="border-t border-zinc-100 p-4 dark:border-zinc-800">
                        <a
                          href={selected.openHref}
                          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                          Open in {selected.channel} ↗
                        </a>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="flex flex-1 flex-col items-center justify-center gap-1 p-6 text-center">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No thread selected</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">Choose a thread from the list on the left to read its content.</p>
                  </div>
                )}
              </section>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
