"use client";

import { useState } from "react";

import { useAppRole } from "@/components/role-preview-provider";
import { WorkInboxModal } from "@/components/work-inbox-modal";
import {
  submitLinkskillsRequest,
  type LinkskillsRequestKind,
} from "@/lib/linkskills-requests";
import { FIELD, FORM } from "@/lib/ui-standards";

export function LinkskillsRequestModal(props: {
  open: boolean;
  kind: LinkskillsRequestKind;
  onClose: () => void;
  defaultTitle?: string;
}) {
  const { role } = useAppRole();
  const [title, setTitle] = useState(props.defaultTitle ?? "");
  const [summary, setSummary] = useState("");
  const [detail, setDetail] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const kindLabel = props.kind === "capability" ? "capability" : props.kind === "tool" ? "tool" : "skill";

  function resetAndClose() {
    setErr(null);
    props.onClose();
  }

  return (
    <WorkInboxModal
      open={props.open}
      title={`Request ${kindLabel}`}
      subtitle="Licensees cannot add catalogue items directly. Your request is sent to the licensor team via Work → Alerts."
      onClose={resetAndClose}
      actions={[
        { label: "Cancel", variant: "secondary", onClick: resetAndClose },
        {
          label: "Submit request",
          variant: "primary",
          onClick: () => {
            if (!title.trim()) {
              setErr("A short title is required.");
              return;
            }
            if (!summary.trim()) {
              setErr("Describe why you need this.");
              return;
            }
            submitLinkskillsRequest({
              kind: props.kind,
              title,
              summary,
              detail: detail.trim() || summary.trim(),
              requestedBy: `Licensee ${role}`,
            });
            window.dispatchEvent(
              new CustomEvent("linkaios-toast", {
                detail: `Your ${kindLabel} request was sent. Track it in Work → Alerts.`,
              }),
            );
            setTitle("");
            setSummary("");
            setDetail("");
            setErr(null);
          },
        },
      ]}
    >
      <div className="space-y-4">
        <label className={FORM.fieldStack}>
          <span className={`${FIELD.label} text-xs text-zinc-600 dark:text-zinc-400`}>Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`e.g. QuickBooks invoice sync ${kindLabel}`}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className={FORM.fieldStack}>
          <span className={`${FIELD.label} text-xs text-zinc-600 dark:text-zinc-400`}>Why you need it</span>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            placeholder="Business context, workflow, and urgency"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className={FORM.fieldStack}>
          <span className={`${FIELD.label} text-xs text-zinc-600 dark:text-zinc-400`}>Extra detail (optional)</span>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={4}
            placeholder="Links, module name, example operations, compliance notes"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        {err ? <p className="text-sm text-red-700 dark:text-red-300">{err}</p> : null}
      </div>
    </WorkInboxModal>
  );
}
