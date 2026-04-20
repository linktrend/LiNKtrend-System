import { createBrainOrgNodeFromForm, updateBrainOrgNodeDatesFromForm } from "@/app/(shell)/memory/org-actions";
import { BUTTON, FIELD } from "@/lib/ui-standards";

import type { BrainOrgNodeRow } from "@linktrend/linklogic-sdk";

export function CompanyOrgEditor(props: { nodes: BrainOrgNodeRow[] | null }) {
  const nodes = props.nodes ?? [];

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Add entry</h2>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          <strong>Category</strong> is the type of grouping (for example Region or Department).{" "}
          <strong>Team or unit name</strong> is the label people will see.
        </p>
        <form action={createBrainOrgNodeFromForm} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Category</label>
            <input name="dimension" required placeholder="e.g. Region" className={`mt-1 ${FIELD.control}`} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Team or unit name</label>
            <input
              name="label"
              required
              placeholder="e.g. Customer success — Americas"
              className={`mt-1 ${FIELD.control}`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Reports under (optional)</label>
            <input
              name="parentId"
              placeholder="Pick from an existing entry below if this unit rolls up under another"
              className={`mt-1 ${FIELD.control} text-sm`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Valid from</label>
            <input name="validFrom" type="date" className={`mt-1 ${FIELD.control}`} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Valid to (optional)</label>
            <input name="validTo" type="date" className={`mt-1 ${FIELD.control}`} />
          </div>
          <div className="sm:col-span-2 max-w-xl">
            <button type="submit" className={BUTTON.primaryBlock}>
              Save entry
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Existing entries</h2>
        <ul className="mt-3 space-y-3">
          {nodes.length === 0 ? (
            <li className="text-sm text-zinc-500 dark:text-zinc-400">No entries yet.</li>
          ) : (
            nodes.map((n) => (
              <li
                key={n.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  <span className="text-zinc-500 dark:text-zinc-400">[{n.dimension}]</span> {n.label}
                </p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Effective {n.valid_from} → {n.valid_to ?? "open-ended"}
                </p>
                <form action={updateBrainOrgNodeDatesFromForm} className="mt-3 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="id" value={n.id} />
                  <div>
                    <label className="text-xs text-zinc-500 dark:text-zinc-400">Valid from</label>
                    <input
                      name="validFrom"
                      type="date"
                      defaultValue={n.valid_from?.slice(0, 10)}
                      required
                      className={`mt-0.5 block ${FIELD.controlCompact}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 dark:text-zinc-400">Valid to</label>
                    <input
                      name="validTo"
                      type="date"
                      defaultValue={n.valid_to?.slice(0, 10) ?? ""}
                      className={`mt-0.5 block ${FIELD.controlCompact}`}
                    />
                  </div>
                  <button type="submit" className={`${BUTTON.secondaryRow} text-xs`}>
                    Update dates
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
