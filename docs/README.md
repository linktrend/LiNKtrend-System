# LiNKtrend documentation

Product and engineering documentation for **LiNKtrend System** — the AI-native company operating system marketed and operated as **LiNKaios**.

## Read first (canonical order)

1. **`LiNKdev/product/grounding/PRINCIPAL_PRODUCT_DEFINITION.md`** — Principal-approved product truth (May 2026). **LiNKdev** agents execute against this file plus active issues; do not treat chat or IDE memory as authority.
2. **`docs/terminology.md`** — Approved vocabulary: LiNKtrend System = LiNKaios, Suite → Module → Phase → Issue, Capabilities, MVO scope.
3. **`docs/architecture/repo-architecture-target.md`** — What this monorepo owns vs external repos; planes as LiNKaios components.
4. **`docs/architecture/system-completion-targets.md`** — Per-plane completion targets; MVO = LiNKaios Client + LiNKtrend Admin + LinkSites end-to-end.
5. **`docs/ecosystem/design/00_LiNKtrend_AI_Agent_Ecosystem_Overview.md`** — Readable ecosystem narrative.
6. **`docs/ecosystem/development-plan/05_MVO_Scope_and_Demo_Flow_v2.md`** — MVO demo bar (complete commercial loop; not phased).

**Planner** reads grounding files per Principal instruction (not the full `docs/` tree by default). **LiNKdev** execution agents read `read_first` on the active issue, then the paths above as needed.

## Directory map

| Path | Purpose |
|------|---------|
| **`terminology.md`** | Hierarchy, Capabilities, forbidden legacy UI terms |
| **`architecture/`** | Repo ownership and system completion targets |
| **`ecosystem/design/`** | Design narratives and component boundaries |
| **`ecosystem/development-plan/`** | Execution method, work packets, MVO flow (**`05_`** is MVO authority) |
| **`archive/product-legacy/`** | Frozen pre-ecosystem PRDs and handoffs — reference only; do not edit for active work |

## What this repo is

**LiNKtrend System** is one product: **LiNKaios** — an AI-native company operating system with:

- **LiNKaios Client** — licensee company workspace (suites, projects, operators, traces).
- **LiNKtrend Admin** — vendor/licensor control (tenants, suites, capabilities, fleet).

Execution **planes** (LiNKbrain, LinkSkills, LiNKautowork, LiNKbots, LiNKguard) are **components of LiNKaios**, not separate products sold on their own in the MVO story.

**Suites** (business process packages) live under `suites/` in this repo. **LinkSites** site build, Payload CMS, and VPS publish mechanics live in the **external** `LiNKsites` repo; this monorepo owns suite orchestration, capability leases, and LiNKaios integration.

## MVO (May 2026)

MVO is **not phased**. It is complete when Principal can evaluate a demo of:

- Full **LiNKaios Client** + **LiNKtrend Admin**
- End-to-end **LinkSites Suite**: lead discovery (e.g. Google Maps or approved online source) → industry/template selection → custom site → **live publish** (`businessname.linktrend.media` via Payload + VPS) → **outreach** to sell site + hosting → subscribe (domain + transfer) or reject (recycle site for next lead)

**Out of MVO:** LinkApps, LEXOS, and other suites — post-MVO only.

## Audience

- **Principal** — evaluates the demo and approves product direction.
- **LiNKdev** — implements against `LiNKdev/product/grounding/` and active issues.

## Archive

Historical PRDs, session handoffs, and superseded agent prompts: **`docs/archive/product-legacy/`** (and **`docs/archive/product-legacy/prompts/`**). Do not use them as active product truth.
