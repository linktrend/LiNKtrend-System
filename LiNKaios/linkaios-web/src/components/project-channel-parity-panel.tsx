import Link from "next/link";
import { Inbox, MessageSquare } from "lucide-react";

import { BUTTON } from "@/lib/ui-standards";

/** Project Zulip + inbox dual-channel parity (Wave 7.4). */
export function ProjectChannelParityPanel(props: {
  projectId: string;
  projectTitle: string;
  zulipStreamUrl?: string | null;
}) {
  const streamHint = props.zulipStreamUrl ?? `project-${props.projectId}`;

  return (
    <section className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Project channels</h2>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
        One Zulip stream per project with topic threads for phases and issues. LiNKaios inbox mirrors approvals
        from both channels.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/work/messages" className={`${BUTTON.secondaryCardAction} inline-flex items-center gap-1.5 !mt-0`}>
          <Inbox className="h-3.5 w-3.5" aria-hidden />
          Open inbox
        </Link>
        {props.zulipStreamUrl ? (
          <a
            href={props.zulipStreamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BUTTON.secondaryCardAction} inline-flex items-center gap-1.5 !mt-0`}
          >
            <MessageSquare className="h-3.5 w-3.5" aria-hidden />
            Open Zulip stream
          </a>
        ) : (
          <span className={`${BUTTON.secondaryCardAction} inline-flex cursor-default items-center gap-1.5 !mt-0 opacity-70`}>
            <MessageSquare className="h-3.5 w-3.5" aria-hidden />
            Zulip stream · {streamHint}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        Project: <span className="font-medium text-zinc-700 dark:text-zinc-300">{props.projectTitle}</span>
      </p>
    </section>
  );
}
