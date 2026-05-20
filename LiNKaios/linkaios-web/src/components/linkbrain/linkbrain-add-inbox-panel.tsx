import { createQuickNoteDraftAction, uploadBrainBinaryFromForm } from "@/app/(shell)/memory/brain-actions";
import type { BrainScope } from "@linktrend/linklogic-sdk";

/** Quick note + binary upload — always creates Inbox drafts (never auto-publishes). */
export function LinkbrainAddInboxPanel(props: {
  scope: BrainScope;
  contextLabel: string;
  returnTab: "project" | "agent" | "company";
  legalEntityId: string;
  missionId?: string;
  agentId?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Add knowledge → Inbox</h3>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
        Adding to: <strong>{props.contextLabel}</strong>. Items stay in Inbox until you approve them — they are not
        recorded in LiNKbrain automatically.
      </p>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <form action={createQuickNoteDraftAction} className="space-y-2">
          <input type="hidden" name="scope" value={props.scope} />
          {props.missionId ? <input type="hidden" name="missionId" value={props.missionId} /> : null}
          {props.agentId ? <input type="hidden" name="agentId" value={props.agentId} /> : null}
          <input type="hidden" name="returnTab" value={props.returnTab} />
          <input type="hidden" name="legalEntityId" value={props.legalEntityId} />
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Quick note</label>
          <textarea
            name="noteBody"
            rows={4}
            placeholder="Short note (markdown)"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">Sensitivity</label>
          <select name="sensitivity" className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950">
            <option value="internal">internal</option>
            <option value="public">public</option>
            <option value="confidential">confidential</option>
            <option value="restricted">restricted</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Save to Inbox
          </button>
        </form>

        <form action={uploadBrainBinaryFromForm} encType="multipart/form-data" className="space-y-2">
          <input type="hidden" name="scope" value={props.scope} />
          {props.missionId ? <input type="hidden" name="missionId" value={props.missionId} /> : null}
          {props.agentId ? <input type="hidden" name="agentId" value={props.agentId} /> : null}
          <input type="hidden" name="returnTab" value={props.returnTab} />
          <input type="hidden" name="legalEntityId" value={props.legalEntityId} />
          <input type="hidden" name="sensitivity" value="internal" />
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">File upload</label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">PDF, images, plain text, or markdown (up to 25 MiB).</p>
          <input type="file" name="file" required className="block w-full text-sm" />
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          >
            Upload to Inbox
          </button>
        </form>
      </div>
    </div>
  );
}
