import Link from "next/link";

import { ModulesGlossary } from "@/components/modules-glossary";
import { ModulesHubFooter } from "@/components/modules-hub-footer";
import { ModulesHubNav } from "@/components/modules-hub-nav";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { modulesStartProjectHref, resolveModulesPageHeader } from "@/lib/modules-page-copy";
import type { AudienceMode } from "@/lib/ui-mocks/modules-catalog-demo";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { BUTTON } from "@/lib/ui-standards";

export function ModulesHubLayout(props: {
  browse: "module" | "project-type";
  audience: AudienceMode;
  moduleId?: string;
  projectTypeId?: string;
  children: React.ReactNode;
}) {
  const header = resolveModulesPageHeader(props);
  const startHref = modulesStartProjectHref({
    moduleId: props.moduleId,
    projectTypeId: props.projectTypeId,
  });

  return (
    <main className="space-y-6">
      <ShellPageHeaderClient
        title={header.title}
        subtitle={header.subtitle}
        actions={
          <Link href={startHref} className={BUTTON.primaryRow}>
            Start project
          </Link>
        }
      />
      <ModulesHubNav browse={props.browse} audience={props.audience} showAudienceToggle={isUiMocksEnabled()} />
      <ModulesGlossary />
      {props.children}
      <ModulesHubFooter />
    </main>
  );
}
