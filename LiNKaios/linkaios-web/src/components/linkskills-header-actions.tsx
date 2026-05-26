"use client";

import Link from "next/link";
import { useState } from "react";

import { LinkskillsRequestModal } from "@/components/linkskills-request-modal";
import { useAppRole } from "@/components/role-preview-provider";
import { useAppSurface } from "@/components/app-surface-provider";
import { canEditLinkskillsCatalogue } from "@/lib/app-roles";
import type { LinkskillsRequestKind } from "@/lib/linkskills-requests";
import { BUTTON } from "@/lib/ui-standards";

function AddOrRequestButton(props: { requestKind: LinkskillsRequestKind; addHref: string; label: string }) {
  const { kind: actorKind, role } = useAppRole();
  const { href } = useAppSurface();
  const canAdd = canEditLinkskillsCatalogue(actorKind, role);
  const [requestOpen, setRequestOpen] = useState(false);

  if (canAdd) {
    return (
      <Link href={href(props.addHref)} className={BUTTON.addRow}>
        {props.label}
      </Link>
    );
  }

  return (
    <>
      <button type="button" className={BUTTON.addRow} onClick={() => setRequestOpen(true)}>
        Request {props.requestKind === "capability" ? "Capability" : props.requestKind === "tool" ? "Tool" : "Skill"}
      </button>
      <LinkskillsRequestModal open={requestOpen} kind={props.requestKind} onClose={() => setRequestOpen(false)} />
    </>
  );
}

export function AddSkillHeaderAction() {
  return <AddOrRequestButton requestKind="skill" addHref="/skills/skills/new" label="Add Skill" />;
}

export function AddToolHeaderAction() {
  return <AddOrRequestButton requestKind="tool" addHref="/skills/tools/discover" label="Add Tool" />;
}

export function AddCapabilityHeaderAction() {
  return <AddOrRequestButton requestKind="capability" addHref="/skills/connectors/discover" label="Add Capability" />;
}
