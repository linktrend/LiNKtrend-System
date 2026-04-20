"use client";

import { useEffect, useMemo, useState } from "react";

import type { ChannelMessageThread } from "@/lib/work-messages";
import { FIELD, screenTabLinkClass, TABS } from "@/lib/ui-standards";

type ProductChannel = "zulip" | "slack" | "telegram";

function conversationBody(t: ChannelMessageThread): string {
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
              <div className="flex min-h-0 min-w-0 flex-[1.1] flex-col border-b border-zinc-200 lg:border-b-0 lg:border-r dark:border-zinc-800">
                <p className="border-b border-zinc-200 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  Threads ({filteredThreads.length})
                </p>
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
                            "flex w-full flex-col gap-0.5 border-b border-zinc-100 px-4 py-3 text-left text-sm transition dark:border-zinc-800/80 " +
                            (active ? "bg-sky-50/80 dark:bg-sky-950/30" : "hover:bg-zinc-50 dark:hover:bg-zinc-900/60")
                          }
                        >
                          <span className="flex items-start gap-2">
                            {unread ? (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" title="Unread activity" aria-hidden />
                            ) : (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-transparent" aria-hidden />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="line-clamp-2 font-medium text-zinc-900 dark:text-zinc-100">{t.subject}</span>
                              <span className="mt-0.5 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">{t.preview}</span>
                            </span>
                          </span>
                          <span className="pl-4 text-[10px] text-zinc-400">{new Date(t.lastActivity).toLocaleString()}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <section className="flex min-h-[12rem] min-w-0 flex-[1.25] flex-col">
                <p className="border-b border-zinc-200 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  Conversation
                </p>
                {selected ? (
                  <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
                    <div>
                      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{selected.subject}</h2>
                      <p className="mt-1 text-xs text-zinc-500">
                        {selected.channel} · {selected.messageCount} message{selected.messageCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 p-3 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Preview</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{selected.preview}</p>
                    </div>
                    <div className="rounded-lg border border-zinc-100 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Thread</p>
                      <p className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {conversationBody(selected)}
                      </p>
                    </div>
                    <a
                      href={selected.openHref}
                      className="inline-flex w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      Open channel workspace
                    </a>
                  </div>
                ) : (
                  <p className="p-6 text-sm text-zinc-500">Select a thread.</p>
                )}
              </section>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
