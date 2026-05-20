import { LinkskillsGlossaryBrief } from "@/components/linkskills-glossary";
import { LinkskillsHubNav } from "@/components/linkskills-hub-nav";
import { LinkskillsLeasesPanel } from "@/components/linkskills-leases-panel";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";

export const dynamic = "force-dynamic";

export default function SkillsLeasesPage() {
  return (
    <main className="space-y-8">
      <ShellPageHeaderClient
        title="Leases"
        subtitle="Capability lease lifecycle — what LinkSkills granted, denied, or executed for tools, connectors, and side effects."
      />
      <LinkskillsHubNav />
      <LinkskillsGlossaryBrief kind="leases" />
      <LinkskillsLeasesPanel />
    </main>
  );
}
