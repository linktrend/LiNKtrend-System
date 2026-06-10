import type { WorkGraphNode } from "@/lib/admin/linkdeveloper/types";

type Props = {
  productRunId: string;
  issues: WorkGraphNode[];
};

export function IssueActionsPanel(props: Props) {
  const issueNodes = props.issues.filter((n) => n.kind === "issue");

  return (
    <div className="space-y-2">
      {issueNodes.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">No issues in work graph yet.</p>
      ) : (
        issueNodes.map((issue) => (
          <div
            key={issue.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
          >
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{issue.title}</span>
            <span className="text-zinc-500">{issue.status}</span>
          </div>
        ))
      )}
    </div>
  );
}
