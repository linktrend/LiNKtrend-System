"use client";

import { ArrowLeft, ExternalLink, MessageSquare, MessagesSquare } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { WorkEmptyState } from "@/app/(shell)/work/work-empty-state";
import type { ChannelMessage, ChannelMessageThread } from "@/lib/work-messages";
import { InsetSelect } from "@/components/forms";
import { BUTTON, FIELD, FORM, screenTabLinkClass, TABS } from "@/lib/ui-standards";

type ProductChannel = "zulip" | "slack" | "telegram";
type MobilePane = "threads" | "messages" | "detail";

const PANE_HEADER =
  "flex shrink-0 items-center border-b border-zinc-200 bg-zinc-50/80 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/50";
const PANE_HEADER_TITLE = "text-xs font-semibold text-zinc-600 dark:text-zinc-300";
const PANE_SHELL = "flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden";
const LIST_SCROLL = "min-h-0 flex-1 overflow-y-auto overscroll-y-contain";

function threadChannel(t: ChannelMessageThread): ProductChannel | null {
  const tag = (t.channelTag || t.channel || "").toLowerCase();
  if (tag === "zulip" || tag === "slack" || tag === "telegram") return tag;
  return null;
}

const CHANNEL_LABEL: Record<ProductChannel, string> = {
  zulip: "Zulip",
  slack: "Slack",
  telegram: "Telegram",
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function paneTitle(label: string, count?: number): string {
  const text = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
  return count === undefined ? text : `${text} (${count})`;
}

function ExternalPlatformLink(props: { href: string; label: string; className?: string }) {
  const external = props.href.startsWith("http");
  return (
    <a
      href={props.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-label={props.label}
      title={props.label}
      className={
        props.className ??
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      }
    >
      <ExternalLink className="h-4 w-4" aria-hidden />
    </a>
  );
}

function PaneHeader(props: { title: string; action?: ReactNode }) {
  return (
    <div className={PANE_HEADER}>
      <p className={`${PANE_HEADER_TITLE} min-w-0 truncate`}>{props.title}</p>
      {props.action}
    </div>
  );
}

function MessageEntryMeta(props: {
  message: ChannelMessage;
  projectName?: string | null;
  trailing?: ReactNode;
  className?: string;
}) {
  const subject = props.message.subject?.trim();
  const project = props.projectName?.trim() || null;
  return (
    <div className={`flex flex-col gap-0.5 ${props.className ?? ""}`}>
      <span className="flex items-start gap-2">
        {props.message.hasUnread ? (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" title="Unread" aria-hidden />
        ) : (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-transparent" aria-hidden />
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{props.message.sender}</span>
            {props.trailing}
          </span>
          {project ? (
            <span className="mt-0.5 block text-[11px] text-zinc-500 dark:text-zinc-400">{project}</span>
          ) : null}
          <span
            className={`mt-0.5 block min-h-4 text-xs text-zinc-600 dark:text-zinc-400 ${subject ? "line-clamp-2" : "invisible"}`}
          >
            {subject || "\u00A0"}
          </span>
        </span>
      </span>
      <span className="pl-4 text-[10px] text-zinc-400">{formatWhen(props.message.sentAt)}</span>
    </div>
  );
}

export function WorkMessagesWorkspace(props: {
  threads: ChannelMessageThread[];
  agents: { id: string; display_name: string }[];
  missionPrimaryAgent: Record<string, string | null>;
}) {
  const [productChannel, setProductChannel] = useState<ProductChannel>("zulip");
  const [agentId, setAgentId] = useState<string>("all");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [mobilePane, setMobilePane] = useState<MobilePane>("threads");

  const channelThreads = useMemo(
    () => props.threads.filter((t) => threadChannel(t) === productChannel),
    [props.threads, productChannel],
  );

  const filteredThreads = useMemo(() => {
    if (agentId === "all") return channelThreads;
    return channelThreads.filter((t) => {
      if (!t.missionId) return false;
      const primary = props.missionPrimaryAgent[t.missionId];
      return primary === agentId;
    });
  }, [agentId, channelThreads, props.missionPrimaryAgent]);

  const selectedThread = filteredThreads.find((t) => t.id === threadId) ?? filteredThreads[0] ?? null;
  const selectedMessage =
    selectedThread?.messages.find((m) => m.id === messageId) ?? selectedThread?.messages[0] ?? null;

  useEffect(() => {
    if (filteredThreads.length === 0) {
      setThreadId(null);
      setMessageId(null);
      setMobilePane("threads");
      return;
    }
    const stillThread = filteredThreads.some((t) => t.id === threadId);
    const nextThread = stillThread ? threadId! : filteredThreads[0]!.id;
    if (!stillThread) setThreadId(nextThread);

    const thread = filteredThreads.find((t) => t.id === nextThread);
    if (!thread?.messages.length) {
      setMessageId(null);
      return;
    }
    const stillMessage = thread.messages.some((m) => m.id === messageId);
    if (!stillMessage) setMessageId(thread.messages[0]!.id);
  }, [filteredThreads, threadId, messageId]);

  function selectThread(id: string) {
    setThreadId(id);
    setMessageId(null);
    setMobilePane("messages");
  }

  function selectMessage(id: string) {
    setMessageId(id);
    setMobilePane("detail");
  }

  const channelLabel = CHANNEL_LABEL[productChannel];
  const platformOpenHref = selectedMessage?.openHref ?? selectedThread?.openHref ?? "/settings/platform";
  const platformOpenExternal = platformOpenHref.startsWith("http");

  const emptyState =
    filteredThreads.length === 0 ? (
      <WorkEmptyState
        icon={channelThreads.length === 0 ? MessageSquare : MessagesSquare}
        title={channelThreads.length === 0 ? `No ${channelLabel} threads yet` : "No threads for this LiNKbot"}
        description={
          channelThreads.length === 0
            ? `Connect ${channelLabel} in platform settings so project streams appear here.`
            : "Try All LiNKbots or pick another LiNKbot to see matching threads."
        }
        actions={
          channelThreads.length === 0
            ? [
                { kind: "link", label: "Open platform settings", href: "/settings/platform" },
                { kind: "link", label: "View projects", href: "/projects", variant: "secondary" },
              ]
            : [{ kind: "button", label: "Show all LiNKbots", onClick: () => setAgentId("all") }]
        }
      />
    ) : null;

  const gridClass =
    "flex h-[32rem] max-h-[32rem] min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-md ring-1 ring-zinc-950/5 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1.1fr)] lg:grid-rows-1 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-white/10";

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
              setMessageId(null);
              setMobilePane("threads");
            }}
            className={screenTabLinkClass(productChannel === key)}
          >
            {CHANNEL_LABEL[key]}
          </button>
        ))}
      </div>

      <div className="flex w-full items-end gap-3">
        <label className={`block min-w-[12rem] max-w-md ${FORM.fieldStack}`}>
          <span className={`${FIELD.label} text-xs text-zinc-500 dark:text-zinc-400`}>LiNKbot</span>
          <InsetSelect
            fullWidth={false}
            value={agentId}
            onChange={(e) => {
              setAgentId(e.target.value);
              setThreadId(null);
              setMessageId(null);
              setMobilePane("threads");
            }}
          >
            <option value="all">All LiNKbots</option>
            {props.agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.display_name}
              </option>
            ))}
          </InsetSelect>
        </label>
        {selectedThread ? (
          <a
            href={platformOpenHref}
            target={platformOpenExternal ? "_blank" : undefined}
            rel={platformOpenExternal ? "noopener noreferrer" : undefined}
            className={`${BUTTON.secondaryRow} ml-auto inline-flex shrink-0 items-center gap-2`}
          >
            Open in {channelLabel}
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
          </a>
        ) : null}
      </div>

      {emptyState}

      {!emptyState && selectedThread ? (
        <>
          <div className={`hidden ${gridClass}`}>
            <ThreadsPane
              threads={filteredThreads}
              activeThreadId={selectedThread.id}
              onSelect={selectThread}
            />
            <MessagesPane
              thread={selectedThread}
              activeMessageId={selectedMessage?.id ?? null}
              onSelect={setMessageId}
            />
            <MessageDetailPane
              message={selectedMessage}
              projectName={selectedThread.projectName}
              channelLabel={channelLabel}
            />
          </div>

          <div className={`lg:hidden ${gridClass}`}>
            {mobilePane === "threads" ? (
              <ThreadsPane
                threads={filteredThreads}
                activeThreadId={selectedThread.id}
                onSelect={selectThread}
              />
            ) : null}
            {mobilePane === "messages" ? (
              <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
                <MobileBackBar label="Threads" onBack={() => setMobilePane("threads")} />
                <MessagesPane
                  thread={selectedThread}
                  activeMessageId={selectedMessage?.id ?? null}
                  onSelect={selectMessage}
                  hideHeader
                />
              </div>
            ) : null}
            {mobilePane === "detail" && selectedMessage ? (
              <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
                <MobileBackBar label="Messages" onBack={() => setMobilePane("messages")} />
                <MessageDetailPane
                  message={selectedMessage}
                  projectName={selectedThread.projectName}
                  channelLabel={channelLabel}
                  hideHeader
                />
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

function MobileBackBar(props: { label: string; onBack: () => void }) {
  return (
    <div className="flex shrink-0 items-center border-b border-zinc-200 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
      <button
        type="button"
        onClick={props.onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-200"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {props.label}
      </button>
    </div>
  );
}

function threadRowLines(t: ChannelMessageThread): { title: string; projectName: string | null } {
  const topic = t.subject.trim();
  const project = t.projectName?.trim() || null;
  if (project && topic.toLowerCase() === project.toLowerCase()) {
    return { title: topic, projectName: null };
  }
  return { title: topic, projectName: project };
}

function ThreadsPane(props: {
  threads: ChannelMessageThread[];
  activeThreadId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className={`${PANE_SHELL} border-b border-zinc-200 lg:border-b-0 lg:border-r dark:border-zinc-800`}>
      <PaneHeader title={paneTitle("Threads", props.threads.length)} />
      <ul className={LIST_SCROLL}>
        {props.threads.map((t) => {
          const active = props.activeThreadId === t.id;
          const { title, projectName } = threadRowLines(t);
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => props.onSelect(t.id)}
                className={
                  "flex w-full flex-col gap-0.5 border-b border-zinc-100 px-4 py-3 text-left text-sm transition dark:border-zinc-800/80 " +
                  (active
                    ? "bg-sky-50/80 dark:bg-sky-950/30"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900/60")
                }
              >
                <span className="flex items-start gap-2">
                  {t.hasUnread ? (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" title="Unread activity" aria-hidden />
                  ) : (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-transparent" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 font-medium text-zinc-900 dark:text-zinc-100">{title}</span>
                    {projectName ? (
                      <span className="mt-0.5 block text-[11px] text-zinc-500 dark:text-zinc-400">{projectName}</span>
                    ) : null}
                  </span>
                </span>
                <span className="pl-4 text-[10px] text-zinc-400">{formatWhen(t.lastActivity)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MessagesPane(props: {
  thread: ChannelMessageThread;
  activeMessageId: string | null;
  onSelect: (id: string) => void;
  hideHeader?: boolean;
}) {
  return (
    <div className={`${PANE_SHELL} border-b border-zinc-200 lg:border-b-0 lg:border-r dark:border-zinc-800`}>
      {props.hideHeader ? null : (
        <PaneHeader title={paneTitle("Messages", props.thread.messages.length)} />
      )}
      {props.thread.messages.length === 0 ? (
        <p className="p-6 text-sm text-zinc-500">No messages in this thread.</p>
      ) : (
        <ul className={LIST_SCROLL}>
          {props.thread.messages.map((m) => (
            <MessageRow
              key={m.id}
              message={m}
              projectName={props.thread.projectName}
              active={props.activeMessageId === m.id}
              onSelect={() => props.onSelect(m.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function MessageRow(props: {
  message: ChannelMessage;
  projectName?: string | null;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={props.onSelect}
        className={
          "w-full border-b border-zinc-100 px-4 py-3 text-left text-sm transition dark:border-zinc-800/80 " +
          (props.active ? "bg-sky-50/80 dark:bg-sky-950/30" : "hover:bg-zinc-50 dark:hover:bg-zinc-900/60")
        }
      >
        <MessageEntryMeta message={props.message} projectName={props.projectName} />
      </button>
    </li>
  );
}

function MessageDetailPane(props: {
  message: ChannelMessage | null;
  projectName?: string | null;
  channelLabel: string;
  hideHeader?: boolean;
}) {
  return (
    <section className={`${PANE_SHELL} bg-zinc-50/30 dark:bg-zinc-900/20`}>
      {props.hideHeader ? null : <PaneHeader title={paneTitle("Message")} />}
      {props.message ? (
        <>
          <div className="shrink-0 px-4 pt-4">
            <MessageEntryMeta
              message={props.message}
              projectName={props.projectName}
              trailing={
                <ExternalPlatformLink
                  href={props.message.openHref}
                  label={`Open message in ${props.channelLabel}`}
                />
              }
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-4 pt-3">
            <div className="rounded-lg border border-zinc-100 bg-white p-4 text-sm leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
              <p className="whitespace-pre-wrap">{props.message.body}</p>
            </div>
          </div>
        </>
      ) : (
        <p className="p-6 text-sm text-zinc-500">Select a message to read.</p>
      )}
    </section>
  );
}
