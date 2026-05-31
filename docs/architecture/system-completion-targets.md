# LiNKtrend system completion targets

Intended **completed** state per plane and suite family. Use with `docs/architecture/repo-architecture-target.md` before placing new code.

**MVO bar (May 2026):** Principal demo = **LiNKaios Client** + **LiNKtrend Admin** + **LinkSites Suite** end-to-end (Maps or approved online leads → live publish → outreach → subscribe or recycle). Details: `docs/ecosystem/development-plan/05_MVO_Scope_and_Demo_Flow_v2.md`.

## Completion standard

“90–95% complete” means operational for real licensee use with remaining work mostly polish, extra connectors, and hardening — **not** “demo stubs acceptable.”

For **MVO**, only LinkSites + core planes listed below must hit the MVO bar; other suites are explicitly **post-MVO**.

---

## MVO completion (required together)

| Deliverable | Done when |
|-------------|-----------|
| **LiNKaios Client** | Operator runs LinkSites project/issues, sees leases, automations, brain events, traces |
| **LiNKtrend Admin** | Vendor sees tenants, enabled LinkSites suite, capability health, fleet/session signals |
| **LinkSites Suite E2E** | Lead search → site on temp URL → outreach → subscribe/reject recycle — with audit proof |
| **Default capabilities** | Zulip + Plane live enough for demo (not shadow-only for MVO) |
| **External LiNKsites** | Payload publish to `*.linktrend.media` path works with orchestration from this repo |

---

## LiNKaios (control plane)

**Purpose:** Company operating system UI/kernel — Client + Admin.

**MVO:** Cockpit for LinkSites run; project/issue tree; capability lease visibility; automation run status; brain trace; no absorption of peer-plane logic.

**90–95% (post-MVO polish):** Full multi-suite operator views, advanced approvals, deployment health at scale.

---

## LiNKbrain

**Purpose:** Events, institutional memory, Librarian loop, company brain + anonymized world brain where policy allows.

**MVO:** Every meaningful side effect in LinkSites loop writes canonical audit envelope; context bundles for bots; operator-visible trace.

**90–95%:** pgvector retrieval, benchmark loops, full promotion pipelines per `LiNKbrain/source-map.md`.

---

## LinkSkills

**Purpose:** Skills IP, capability permissions, progressive disclosure, leases, idempotency, kill switches.

**MVO:** LinkSites + Zulip + Plane capabilities lease-gated with proof in execute ledger; outreach/publish actions governed.

**90–95%:** Full connector catalog for post-MVO suites; certification pipelines.

---

## LiNKautowork

**Purpose:** Deterministic n8n execution via gateway.

**MVO:** LinkSites workflow pack runs publish checks, CRM/status updates, recycle paths with idempotency and audit.

**90–95%:** Additional suite packs; shadow→live promotion discipline.

---

## LiNKbot

**Purpose:** Role-bound workers via runtime adapters.

**MVO:** LinkSites roles (lead research, build, outreach) execute under leases; delegate deterministic steps to LiNKautowork; emit audit.

**90–95%:** Full role library across suites; Hermes/Agent Zero adapters as needed.

---

## LiNKguard

**Purpose:** Skill IP wipe after use; confidentiality/anonymization per privacy policy; worker cleanup.

**MVO:** Hooks active on LinkSites runs; no skill residue after governed execution.

**90–95%:** Operator dashboards for cleanup policy and incidents.

---

## LinkSites (suite + external repo)

**Purpose:** Website factory commercial loop — first and only MVO suite.

**MVO (combined system + `LiNKsites` repo):**

- Google Maps or approved online lead discovery
- Business/industry identification and template selection
- Custom site generation and **live** publish (`businessname.linktrend.media`)
- **Outreach** to sell website + hosting (not draft-only)
- Subscribe: domain + transfer; Reject: recycle site for next lead

**90–95%:** More templates, content quality, media pipeline — after MVO Principal sign-off.

---

## Post-MVO only (do not block Principal demo)

| Suite / system | Status |
|----------------|--------|
| **LinkApps** | Post-MVO — no completion target for MVO |
| **LEXOS** (litigation et al.) | Post-MVO — separate repo reference |
| **Linktrend Media** | Post-MVO — define spine before build |
| **Accounting / finance / vertical suites** | Post-MVO |

Existing completion notes for LEXOS/LinkApps in prior revisions remain **aspirational** until LinkSites MVO is accepted.

---

## Repo drift rule

Identify owning plane from this document, place files per `repo-architecture-target.md`. If owner is unclear, stop and ask — do not invent suite business workflows.
