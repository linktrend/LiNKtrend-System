import { CompanyOrgEditor } from "@/components/company-org-editor";

import type { BrainOrgNodeRow } from "@linktrend/linklogic-sdk";

export function LinkbrainOrgScopePanel(props: { nodes: BrainOrgNodeRow[]; orgMetaError?: string | null }) {
  return (
    <section className="space-y-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Organisation tags define how company memory is grouped and filtered in LiNKbrain. Each entry is a category (for
        example Region or Department) plus a team or unit name. Memory documents can be tagged to these nodes so
        retrieval stays scoped to the right part of the business.
      </p>
      {props.orgMetaError ? <p className="text-sm text-amber-800 dark:text-amber-200">{props.orgMetaError}</p> : null}
      <CompanyOrgEditor nodes={props.nodes} />
    </section>
  );
}
