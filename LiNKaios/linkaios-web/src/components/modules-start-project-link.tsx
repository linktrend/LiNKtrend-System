import Link from "next/link";

import { modulesDetailHref, modulesStartProjectHref } from "@/lib/modules-page-copy";
import { BUTTON } from "@/lib/ui-standards";

/** Module-scoped deep link for Start project flows — reuse on Company modules panel. */
export function ModulesStartProjectLink(props: {
  moduleId: string;
  projectTypeId?: string;
  label?: string;
  className?: string;
}) {
  return (
    <Link
      href={modulesStartProjectHref({ moduleId: props.moduleId, projectTypeId: props.projectTypeId })}
      className={props.className ?? BUTTON.secondaryCompact}
    >
      {props.label ?? "Start project"}
    </Link>
  );
}

/** Catalogue drill-down from subscription rows (Company → Modules hub). */
export function ModulesCatalogLink(props: { moduleId: string; label?: string; className?: string }) {
  return (
    <Link href={modulesDetailHref(props.moduleId)} className={props.className ?? "font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-200"}>
      {props.label ?? "View module"}
    </Link>
  );
}
