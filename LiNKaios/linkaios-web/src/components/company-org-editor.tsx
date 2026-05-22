import { createBrainOrgNodeFromForm, updateBrainOrgNodeDatesFromForm } from "@/app/(shell)/memory/org-actions";
import { InsetSelect } from "@/components/forms";
import { BUTTON, COMPANY_FORM_ROW, COMPANY_FORM_ROW_TOP, FIELD } from "@/lib/ui-standards";

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
        <form action={createBrainOrgNodeFromForm} className="mt-4 grid gap-4">
          <div className={COMPANY_FORM_ROW}>
            <label htmlFor="org-dimension" className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Category
            </label>
            <input id="org-dimension" name="dimension" required placeholder="e.g. Region" className={FIELD.controlFull} />
          </div>
          <div className={COMPANY_FORM_ROW}>
            <label htmlFor="org-label" className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Team or unit name
            </label>
            <input
              id="org-label"
              name="label"
              required
              placeholder="e.g. Customer success — Americas"
              className={FIELD.controlFull}
            />
          </div>
          <div className={COMPANY_FORM_ROW}>
            <label htmlFor="org-parent" className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Reports under (optional)
            </label>
            <InsetSelect id="org-parent" name="parentId" defaultValue="">
              <option value="">— Top level —</option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  [{n.dimension}] {n.label}
                </option>
              ))}
            </InsetSelect>
          </div>
          <div className={COMPANY_FORM_ROW}>
            <label htmlFor="org-valid-from" className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Valid from
            </label>
            <input id="org-valid-from" name="validFrom" type="date" className={FIELD.controlFull} />
          </div>
          <div className={COMPANY_FORM_ROW}>
            <label htmlFor="org-valid-to" className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Valid to (optional)
            </label>
            <input id="org-valid-to" name="validTo" type="date" className={FIELD.controlFull} />
          </div>
          <div className={COMPANY_FORM_ROW}>
            <span className="hidden sm:block" aria-hidden />
            <button type="submit" className={BUTTON.primaryRow}>
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
                <form action={updateBrainOrgNodeDatesFromForm} className="mt-4 grid gap-4">
                  <input type="hidden" name="id" value={n.id} />
                  <div className={COMPANY_FORM_ROW_TOP}>
                    <label htmlFor={`valid-from-${n.id}`} className="pt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Valid from
                    </label>
                    <input
                      id={`valid-from-${n.id}`}
                      name="validFrom"
                      type="date"
                      defaultValue={n.valid_from?.slice(0, 10)}
                      required
                      className={FIELD.controlFull}
                    />
                  </div>
                  <div className={COMPANY_FORM_ROW_TOP}>
                    <label htmlFor={`valid-to-${n.id}`} className="pt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Valid to
                    </label>
                    <input
                      id={`valid-to-${n.id}`}
                      name="validTo"
                      type="date"
                      defaultValue={n.valid_to?.slice(0, 10) ?? ""}
                      className={FIELD.controlFull}
                    />
                  </div>
                  <div className={COMPANY_FORM_ROW}>
                    <span className="hidden sm:block" aria-hidden />
                    <button type="submit" className={BUTTON.secondaryRow}>
                      Update dates
                    </button>
                  </div>
                </form>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
