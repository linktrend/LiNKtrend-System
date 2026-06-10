import { LiNKsuitegenCandidateActions } from "@/components/admin/linksuitegen-candidate-actions";
import { ShellPageHeader } from "@/components/shell-page-header";
import { getCandidate } from "@/lib/admin/linksuitegen/store";

export default async function AdminLinksuitegenCandidatePage(props: {
  params: Promise<{ candidateId: string }>;
}) {
  const { candidateId } = await props.params;
  const candidate = await getCandidate(candidateId);

  if (!candidate) {
    return (
      <ShellPageHeader title="Candidate not found" subtitle={`No record for ${candidateId}`} />
    );
  }

  return (
    <div className="space-y-6">
      <ShellPageHeader
        title={candidate.display_name}
        subtitle={`${candidate.suite_id} v${candidate.suite_version} — ${candidate.status}`}
      />
      <pre className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs dark:border-zinc-800 dark:bg-zinc-900">
        {JSON.stringify(candidate, null, 2)}
      </pre>
      <LiNKsuitegenCandidateActions candidateId={candidateId} status={candidate.status} />
    </div>
  );
}
