/** Full glossary — LiNKskills hub only. */
export function LinkskillsGlossaryFull() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 text-xs leading-6 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
      <p>
        <strong>Skill</strong> = packaged procedure folder (SKILL.md, scripts, references, templates).{" "}
        <strong>Tool</strong> = callable API/script/browser action, governed at runtime.{" "}
        <strong>Capability connector</strong> = governed bridge to external software (Odoo, Plane, Zulip, etc.).{" "}
        <strong>Lease</strong> = time-scoped grant to run a capability. <strong>Policy</strong> = rules for capabilities, tools, leases, and approvals.
      </p>
      <p className="mt-2">
        Catalogue screens show <strong>client-visible governance state</strong>. Vendor certification and policy-template internals stay in protected surfaces.
      </p>
    </div>
  );
}

/** One-line reminder on catalogue subpages. */
export function LinkskillsGlossaryBrief(props: { kind: "skills" | "tools" | "connectors" | "leases" }) {
  const copy =
    props.kind === "skills"
      ? "Skills are packaged procedures; they call governed tools and capability connectors at runtime."
      : props.kind === "tools"
        ? "Tools are callable actions; capability leases and policies decide whether they may run."
        : props.kind === "leases"
          ? "A lease is a time-scoped grant to run a capability. Side effects require an executed lease and audit trail."
          : "Connectors are governed bridges to external software — not skills or tools themselves.";
  return <p className="max-w-3xl text-xs text-zinc-600 dark:text-zinc-400">{copy}</p>;
}
