"use client";

import Link from "next/link";
import { useState } from "react";

import { ExternalLink, MessageSquare } from "lucide-react";

import { WorkInboxModal } from "@/components/work-inbox-modal";
import { ADMIN_BASE_PATH } from "@/lib/app-surface";
import { openExternalPopup } from "@/lib/zulip-links";

/** Admin project channels — single Zulip entry + Work Messages inbox (finding 32). */
export function AdminProjectChannelsPanel(props: { projectTitle: string; zulipSiteUrl?: string | null }) {
  const [zulipOpen, setZulipOpen] = useState(false);
  const zulipHref = props.zulipSiteUrl?.trim() || null;

  return (
    <section
      aria-labelledby="admin-project-channels-heading"
      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <h2 id="admin-project-channels-heading" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Project channels
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Governed messaging for this vendor project — one Zulip stream entry and LiNKaios mirror inbox under Work.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setZulipOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <ExternalLink className="mr-1.5 h-4 w-4" aria-hidden />
          Zulip Stream
        </button>
        <Link
          href={`${ADMIN_BASE_PATH}/work/messages`}
          className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          <MessageSquare className="mr-1.5 h-4 w-4" aria-hidden />
          Open inbox
        </Link>
      </div>

      <WorkInboxModal
        open={zulipOpen}
        onClose={() => setZulipOpen(false)}
        title="Zulip Stream"
        subtitle={props.projectTitle}
        actions={
          zulipHref
            ? [
                { label: "Cancel", variant: "secondary" },
                {
                  label: "Open in Zulip ↗",
                  variant: "primary",
                  onClick: () => openExternalPopup(zulipHref),
                },
              ]
            : [{ label: "Close", variant: "secondary" }]
        }
      >
        {zulipHref ? (
          <p>
            Open the governed Zulip stream for this project in a new tab. LiNKaios Work → Messages keeps the mirror
            inbox for operator review.
          </p>
        ) : (
          <p>
            Zulip is not connected for this workspace. Configure <code className="text-xs">ZULIP_SITE_URL</code> to
            enable stream links after project bootstrap completes.
          </p>
        )}
      </WorkInboxModal>
    </section>
  );
}
