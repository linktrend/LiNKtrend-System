# Glossary

Principal-approved terms for LiNKtrend System / LiNKaios. User-facing copy follows `docs/terminology.md`.

| Term | Definition |
|------|------------|
| **LiNKtrend System** | Same as **LiNKaios** — the full product (Client + Admin + all planes) |
| **LiNKaios Client** | Licensee-facing interface for running the business |
| **LiNKtrend Admin** | Vendor/licensor interface for managing many LiNKaios instances |
| **Principal** | Human authority for the business or studio; approves protected actions |
| **Licensee / Client (company)** | Company subscribed to LiNKaios |
| **Suite** | Subscribed business-process package (LinkSites, content creation, etc.) |
| **Module** | Vendor-published recipe inside a Suite (phases, issues, assignee templates) |
| **Project** | Tenant-created live work instance using one or more Modules |
| **Phase** | Stage group inside a Module |
| **Issue** | Atomic governed task with input/output contracts |
| **Assignee** | Executor of an Issue: LiNKbot, Automation (LiNKautowork), or Human |
| **Run** | One pass through project modules; maps to Plane Cycle |
| **Plane** | Bounded subsystem: LiNKaios, LiNKbot, LinkSkills, LiNKautowork, LiNKbrain, LiNKguard |
| **LiNKbot** | Role-bound AI employee runtime (OpenClaw, Agent Zero, Hermes adapters) |
| **LinkSkills** | Skills IP, progressive disclosure, capability leases, permissions |
| **Skill** | Packaged reusable ability (instructions, scripts, references) governed by LinkSkills |
| **LiNKautowork** | Deterministic workflow plane; n8n gateway. UI label: **Automation** |
| **LiNKbrain** | Memory, audit, context assembly, Librarian loop, company + world brain |
| **Librarian** | Specialized LiNKbot that turns run logs into knowledge, improves skills/automations, feeds world brain |
| **World brain** | Anonymized cross-company knowledge pool tagged by industry/process/region |
| **LiNKguard** | Worker security sidecar; wipes skill IP traces, enforces confidentiality |
| **Capability** | Governed integration to external software (UI term). Code: capability connector |
| **Capability connector** | LinkSkills implementation of a Capability (`LiNKskills/capability-connectors/`) |
| **Lease** | LinkSkills grant to perform a side effect through a Capability |
| **LinkSites / LiNKsites** | WebsiteFactory Suite — lead to sold website. Product repo is external |
| **MVO** | Minimum viable outcome: Client + Admin + one LinkSites lead full E2E |
| **Trace** | LiNKaios view joining run, stages, leases, workflows, and audit events |

## Legacy terms (do not use in new copy)

| Avoid | Use instead |
|-------|-------------|
| Mission | Project |
| Vertical plugin | Suite / Module |
| Capability plugin (UI) | Capability |
| Connector (UI) | Capability |
| Workflow (for n8n in UI) | Automation |
| PRISM Defender (UI) | LiNKguard |
