"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AddLinkbotOpenButton } from "@/components/add-linkbot";
import { useAppSurface } from "@/components/app-surface-provider";
import { useAppRole } from "@/components/role-preview-provider";
import { useMemoryPath } from "@/hooks/use-memory-href";
import {
  canAddExtraLinkbot,
  canCreateProject,
  canEditLinkskillsCatalogue,
  canSubscribeOrPreviewSuite,
  type AppActorKind,
  type AppRoleTier,
} from "@/lib/app-roles";
import { BUTTON } from "@/lib/ui-standards";

function requestApprovalNotice(label: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("linkaios-toast", {
      detail: `Your ${label} request was sent to an Admin or Super Admin for approval. Track it in Work.`,
    }),
  );
}

function titleCaseLabel(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Primary add action — enabled for admins; users get request flow. */
export function RoleGatedAddButton(props: {
  href: string;
  label: string;
  requestLabel: string;
  className?: string;
  title?: string;
  allowed?: (kind: AppActorKind, role: AppRoleTier) => boolean;
}) {
  const { kind, role } = useAppRole();
  const allowed = props.allowed ? props.allowed(kind, role) : canEditLinkskillsCatalogue(kind, role);

  if (allowed) {
    return (
      <Link href={props.href} className={props.className ?? BUTTON.addRow} title={props.title}>
        {props.label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={props.className ?? BUTTON.addRow}
      title="Requires Admin or Super Admin approval"
      onClick={() => requestApprovalNotice(props.requestLabel)}
    >
      Request {titleCaseLabel(props.requestLabel)}
    </button>
  );
}

export function AddProjectHeaderAction() {
  const { href: appHref } = useAppSurface();
  return (
    <RoleGatedAddButton
      href={appHref("/projects/new")}
      label="Add Project"
      requestLabel="project"
      allowed={canCreateProject}
      title="Creates a governed project in your workspace"
    />
  );
}

export function AddLinkbotHeaderAction(props: { className?: string }) {
  const { kind, role } = useAppRole();
  const allowed = canAddExtraLinkbot(kind, role);

  if (allowed) {
    return <AddLinkbotOpenButton className={props.className ?? BUTTON.addRow}>Add LiNKbot</AddLinkbotOpenButton>;
  }

  return (
    <button
      type="button"
      className={props.className ?? BUTTON.addRow}
      onClick={() => requestApprovalNotice("extra LiNKbot")}
    >
      Request LiNKbot
    </button>
  );
}

export function AddKnowledgeHeaderAction(props: { collective?: boolean }) {
  const hrefForPath = useMemoryPath();
  const base = hrefForPath("/memory/drafts/new");
  const href = props.collective ? `${base}?scope=company&collective=1` : base;
  return (
    <Link
      href={href}
      className={BUTTON.addRow}
      title={
        props.collective
          ? "Adds a draft to the vendor collective Inbox — triage before shared LiNKbrain records it"
          : "Creates a draft in Inbox — Admin or Super Admin must approve before LiNKbrain records it"
      }
    >
      Add Knowledge
    </Link>
  );
}

export function ModuleAccessRequestPanel(props: { suiteName: string; mode: "preview" | "subscribe" }) {
  const { href: appHref } = useAppSurface();
  const { kind, role } = useAppRole();
  const router = useRouter();

  if (canSubscribeOrPreviewSuite(kind, role)) {
    return null;
  }

  const label = props.mode === "preview" ? "preview access" : "subscription";

  return (
    <section className="mx-auto max-w-lg space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Request {props.mode === "preview" ? "preview" : "subscription"}
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {props.suiteName} {label} must be approved by an Admin or Super Admin before activation. Preview and paid
        plans can auto-renew at period end, so the User role cannot self-activate checkout.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={BUTTON.primaryCompact}
          onClick={() => {
            requestApprovalNotice(`${props.suiteName} ${label}`);
            router.push(appHref("/work"));
          }}
        >
          Submit request
        </button>
      </div>
    </section>
  );
}
