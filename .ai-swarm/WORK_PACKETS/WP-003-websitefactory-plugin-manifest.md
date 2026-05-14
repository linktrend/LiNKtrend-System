# WP-003 — LiNKaios kernel/plugin manifest using WebsiteFactory

## Objective

Define the **minimum LiNKaios kernel/plugin manifest** needed for the lead-to-preview-site MVO, using **WebsiteFactory** as the first vertical plugin example.

LiNKtrend-System is the LiNKaios control-plane repo. WebsiteFactory is not the core product being built inside LiNKaios; it is the first plugin used to prove LiNKaios tenant/plugin/work/run/status/trace orchestration without absorbing the responsibilities of LiNKbrain, LinkSkills, LiNKautowork, or LinkBot.

## Tasks

1. Define the **LiNKaios core/kernel responsibilities** required for plugins: tenant/plugin registration, manifest loading, work/run orchestration, status/trace surfaces, approvals/routing hooks, and integration visibility.
2. Define the **WebsiteFactory plugin manifest** as the first concrete plugin: plugin id/name, purpose, public surfaces exposed to LiNKaios, stage declarations, configuration surfaces, required capabilities, workflow hooks, audit/memory events, and preview output shape.
3. Document **inputs** (lead record shape or stub equivalent) and **outputs** (preview URL, run id, artifacts, audit references, etc.) as types or schemas in prose.
4. Map each stage of the plugin to the responsible **plane** (LiNKaios for coordination/status, LiNKautowork for deterministic steps, LinkSkills for gated side effects, LiNKbrain for audit/learn events, LinkBot for thin reasoning/delegation only).
5. Explicitly distinguish what **LiNKaios core owns**, what the **WebsiteFactory plugin declares**, and what each external plane owns.
6. List **non-goals** for MVO (features explicitly deferred), including full Payload publishing, Vercel deploy previews, real CRM/Plane integrations, and LEXOS/legal vertical work.
7. Identify **integration points** that require queue entries (`INTEGRATION_QUEUE.md`) and tag each as planned, stubbed, or deferred based on `DECISIONS.md`.

## Acceptance criteria

- [ ] Manifest is complete enough that WP-004 can define contracts without inventing LiNKaios kernel/plugin names or WebsiteFactory stage names.
- [ ] Role bleed checks: manifest explicitly states what LiNKaios core **does not** own and what WebsiteFactory **does not** own (per `ARCHITECTURE_RULES.md`).
- [ ] At least **three** integration points are listed with suggested status (real vs stub).
- [ ] The packet output makes clear that WebsiteFactory is a vertical plugin example, not a replacement for the LiNKaios core/kernel.

## Required proof

- Addendum section or standalone subsection in `AGENT_REPORTS/architect.md` (or owning agent) summarizing manifest + link to any diagram path if created under `.ai-swarm/` only.
- Update `AGENT_COORDINATION.md` → **Current MVO Target** if naming, kernel/plugin framing, or preview definition needs clarification.

## Out of scope

Application code changes; generating production secrets; implementing the plugin/kernel in code; starting WP-004.
