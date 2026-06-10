import { LinkskillsGlossaryBrief } from "@/components/linkskills-glossary";
import { LinkskillsHubNav } from "@/components/linkskills-hub-nav";
import { LinkskillsLeasesPanel } from "@/components/linkskills-leases-panel";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { parseLicensorScopeParam } from "@/lib/licensor-view-scope";

export const dynamic = "force-dynamic";

export default async function SkillsLeasesPage(props: {
  searchParams: Promise<{ scope?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const viewScope = parseLicensorScopeParam(searchParams.scope);

  return (
    <main className="space-y-8">
      <ShellPageHeaderClient
        title="Leases"
        subtitle="Capability lease lifecycle — what LinkSkills granted, denied, or executed for tools, capabilities, and side effects."
      />
      <LinkskillsHubNav />
      <LinkskillsGlossaryBrief kind="leases" />
      <LinkskillsLeasesPanel viewScope={viewScope} />
    </main>
  );
}
