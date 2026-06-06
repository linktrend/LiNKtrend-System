"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { ProductRunStatusPill } from "@/components/linkdeveloper/product-run-status-pill";
import { DomainStatusPill } from "@/components/ui/status-pill";
import { UiButton } from "@/components/ui/button-bridge";
import { LINKDEVELOPER_ADMIN_ROUTES } from "@/lib/admin/linkdeveloper/routes";
import {
  approveLinkdeveloperIssueAction,
  denyLinkdeveloperIssueAction,
} from "@/lib/admin/linkdeveloper/server-actions";
import { CouncilGateSummary } from "@/components/council/council-gate-summary";
import type { LinkdeveloperApprovalRow } from "@/lib/admin/linkdeveloper/server-data";
import Link from "next/link";

function ApprovalRow(props: { row: LinkdeveloperApprovalRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
      <td className="px-4 py-3">
        <Link
          href={LINKDEVELOPER_ADMIN_ROUTES.productRun(props.row.product_run_id)}
          className="font-medium text-sky-700 hover:underline dark:text-sky-300"
        >
          {props.row.product_run_name}
        </Link>
        <div className="mt-1">
          <ProductRunStatusPill status={props.row.product_run_status} />
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">{props.row.issue_title}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{props.row.issue_key}</p>
      </td>
      <td className="px-4 py-3">
        <DomainStatusPill domain="approval" status={props.row.issue_status} />
        <div className="mt-2 max-w-md">
          <CouncilGateSummary
            report={props.row.council_report}
            gate={props.row.council_gate}
            compact
          />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <UiButton
            type="button"
            buttonKey="approveRow"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await approveLinkdeveloperIssueAction(props.row.issue_id, { notes: "Approved from inbox" });
                router.refresh();
              })
            }
          >
            Approve
          </UiButton>
          <UiButton
            type="button"
            buttonKey="rejectOutlineRow"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await denyLinkdeveloperIssueAction(props.row.issue_id, {
                  reason: "Changes requested",
                });
                router.refresh();
              })
            }
          >
            Deny
          </UiButton>
        </div>
      </td>
    </tr>
  );
}

export function ApprovalsInboxTable(props: { rows: LinkdeveloperApprovalRow[] }) {
  if (props.rows.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        No decision packets waiting. Products awaiting approval show here when issues are ready or blocked.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
        <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-3">Product run</th>
            <th className="px-4 py-3">Decision packet</th>
            <th className="px-4 py-3">Status & council</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
          {props.rows.map((row) => (
            <ApprovalRow key={`${row.product_run_id}-${row.issue_id}`} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
