# Ship criteria (program complete)

**MVO = LiNKaios Client + LiNKtrend Admin + LinkSites one-lead full loop.**

Checklist for **Program Definition of Done**. The program is not complete until every item below is satisfied.

---

## 1. System surfaces (Client + Admin)

- [ ] **LiNKaios Client** — licensee can sign in, enable LinkSites Suite, launch a Project, and follow run progress with traces
- [ ] **LiNKtrend Admin** — vendor can operate **full vendor catalogue** (**D4 B**): licensees, Suite publish/visibility, cross-tenant LiNKbot fleet, Capability admin, troubleshoot — with cross-tenant safety
- [ ] Role-based access works for operator approvals (budget, knowledge, side effects) per company policy

## 2. LinkSites end-to-end (one lead)

- [ ] **Lead intake** — one **governed mock** demo lead (**D1 B**); full lease/audit/trace (live Maps post-MVO)
- [ ] **Research & enrichment** — LiNKbot produces provenance-backed context for the lead
- [ ] **Template & build** — website package generated from LiNKsites template guidance (external repo)
- [ ] **Publish** — content synced to Payload CMS; preview/live URL at `businessname.linktrend.media` (or documented MVO equivalent on shared VPS)
- [ ] **Outreach** — governed **draft-only** outreach (**D2 A**) with Principal approval gate; full trace; live send only on explicit approval
- [ ] **Librarian loop** — company knowledge proposal accept/reject/edit **plus** anonymized world brain contribution (**D3 B**; LiNKguard policy)
- [ ] **Trace completeness** — every side-effecting step shows lease + workflow + audit refs in LiNKaios trace view
- [ ] **Close or recycle path** — documented behavior for subscribe/transfer vs recycle unsold site

## 3. Required infrastructure

- [ ] **Supabase** — migrations applied; RLS; brain/kernel schemas exposed to API
- [ ] **Zulip** — project stream/topic messaging for the run (mock send minimum; live when configured)
- [ ] **Plane** — project/task sync for the LinkSites run (mock/shadow minimum; studio secrets via GSM)
- [ ] **LiNKbots** — judgment stages execute through runtime adapter with governance payload
- [ ] **LiNKautowork** — deterministic workflow handles complete for artifact, mirror, Payload sync, checks, CRM/outreach gates
- [ ] **LinkSkills** — capability leases on all gated side effects
- [ ] **LiNKbrain** — audit events for run/stage/lease/workflow lifecycle; memory write proof for MVO path
- [ ] **LiNKguard** — worker session cleanup and IP/confidentiality hooks engaged on bot runs

## 4. Repo boundaries

- [ ] LinkSites **product** assets remain in `/Users/linktrend/Projects/LiNKsites` — integration only in this repo
- [ ] Suite workflow map canonical in `suites/linksites/`

## 5. LiNKdev factory gates

- [ ] Demo command or URL recorded in `LiNKdev/product/reports/<program-id>/STATUS.md`
- [ ] `LiNKdev/factory/scripts/verify.sh` passes at `LINKDEV_TIER=critical` for release scope
- [ ] Per-issue proof manifest where required (`proof-manifest.sh`)
- [ ] Program proof manifest (`program-proof-manifest.sh`)
- [ ] Merge replay traceability (`replay-merge-verify.sh`)
- [ ] No open `linkdev:blocked` issues in STATE
- [ ] **Principal Release OK** (human gate before staging/main)

---

## Demo pointer

Historical step-by-step runbook (pre-reset stub MVO):  
`LiNKdev/product/archive/grounding-legacy/DEMO_RUNBOOK_WEBSITEFACTORY_MVO.md`

Replace with an updated MVO demo section in program STATUS when the full E2E path is wired.
