# Agent prompt — Execute `docs/LiNKskills-PRD.md` only

Paste the block below into a **new Agent chat** (implementation mode). Repo root: **`LiNKtrend-System`**.

---

## Single source of truth

Read and follow **`docs/LiNKskills-PRD.md`** end-to-end. Do **not** implement org/mission allowlists, Projects → Tools tab, Zulip, or pending-request workflows — those belong to **`docs/LiNKaios-tool-governance-spec.md`** (another agent). If the PRD references those, treat them as **dependencies**: add `TODO` comments or feature flags only where your code would otherwise break the build, and document handoff notes in your PR description.

## Scope you own

1. **Structured metadata `declared_tools`** on skills: stable representation (prefer extending existing skill `metadata` JSON and/or frontmatter parsing in `apps/linkaios-web` / `src/lib/skill-markdown.ts` patterns). Keys must match **`linkaios.tools.name`**.
2. **Validation:** On draft save / approve path, enforce PRD §5.2 (invalid catalog names blocked or warned per PRD default: prefer **hard error** on approve for missing catalog names; on draft save, match product intent in PRD).
3. **LiNKskills UI** (`apps/linkaios-web` routes under **LiNKskills**): Skills catalog/editor surfaces to view and edit `declared_tools`; Tools catalog (**LiNKskills · Tools**) per PRD §6 — draft create/edit, **delete only never-approved tools**, **archive** for approved, read-only “which approved skills declare this tool” aggregate where feasible.
4. **Types:** Extend `packages/shared-types` (or equivalent) so `declared_tools` is typed where skill records are consumed.
5. **Governance contract (read path only):** Where `linklogic-sdk` or `bot-runtime` loads the resolved skill, ensure **declared tool names** are available on the governance payload or an adjacent field **for consumers** that will intersect with allowlists (if the other agent adds intersection later, your job is to **emit** `declared_tools` reliably — do not implement org/mission intersection in this task unless trivially required to avoid duplication; prefer a small exported helper `getDeclaredToolsFromSkill(skill)`).

## Explicitly out of scope

- New Supabase tables for org policy, mission bindings, or `tool_access_requests`.
- `ProjectDetailTabNav` / mission Tools tab / org settings pages.
- Zulip-Gateway changes for deep links.
- Trace emission for `tool.request.*` (unless you touch existing trace calls for skill-only events and that is already in-repo).

## Preconditions

Skim: `services/migrations/011_linkaios_tools.sql`, `apps/linkaios-web/src/app/(shell)/skills/`, `packages/linklogic-sdk/src/resolve-skill.ts`, `packages/linklogic-sdk/src/governance-payload.ts` (read-only understanding of where skill body is attached).

## Verification

Run repo-appropriate lint/typecheck/tests for touched packages. Manually: create skill with `declared_tools` including a real seeded tool name; approve path rejects unknown tool name.

## Deliverable

PR with summary: files changed, any **interface** the LiNKaios agent must call (function names / payload keys), and TODOs for their track.

---

**Start by** listing PRD §§4–6 acceptance bullets and mapping each to a file you will touch, then implement.
