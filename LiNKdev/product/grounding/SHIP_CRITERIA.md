# Ship criteria (program complete)

**MVO = LiNKaios Client + LiNKtrend Admin + LinkSites one-lead full loop.**

Checklist for **Program Definition of Done**. The program is not complete until every item below is satisfied.

**Honest status (2026-06-01):** Development/mock proof on `development`. Live GSM-backed Payload, Zulip, and Plane live modes require Principal env + Release OK before production ship.

---

## 1. System surfaces (Client + Admin)

- [x] **LiNKaios Client** — licensee can sign in, enable LinkSites Suite, launch a Project, and follow run progress with traces (kernel plugin + Client surfaces; E2E optional with local env)
- [x] **LiNKtrend Admin** — vendor can operate **full vendor catalogue** (**D4 B**): licensees, Suite publish/visibility, cross-tenant LiNKbot fleet, Capability admin, troubleshoot — with cross-tenant safety
- [x] Role-based access works for operator approvals (budget, knowledge, side effects) per company policy

## 2. LinkSites end-to-end (one lead)

- [x] **Lead intake** — one **governed mock** demo lead (**D1 B**); full lease/audit/trace (live Maps post-MVO)
- [x] **Research & enrichment** — LiNKbot produces provenance-backed context for the lead
- [x] **Template & build** — website package generated from LiNKsites template guidance (external repo; `marketing-smb-v1` registry)
- [x] **Publish** — content synced to Payload CMS (mock/shadow via `LINKAUTOWORK_MVO_MODE`); preview/live URL at `businessname.linktrend.media` (MVO equivalent documented)
- [x] **Outreach** — governed **draft-only** outreach (**D2 A**) with Principal approval gate; full trace; live send only on explicit approval
- [x] **Librarian loop** — company knowledge proposal accept/reject/edit **plus** anonymized world brain contribution (**D3 B**; LiNKguard policy)
- [x] **Trace completeness** — every side-effecting step shows lease + workflow + audit refs in LiNKaios trace view (kernel stub + autowork tests)
- [x] **Close or recycle path** — documented behavior for subscribe/transfer vs recycle unsold site (`close-recycle.ts` + workflow.md)

## 3. Required infrastructure

- [x] **Supabase** — migrations applied; RLS; brain/kernel schemas exposed to API (migrations in repo; live apply = deploy step)
- [x] **Zulip** — project stream/topic messaging for the run (mock send minimum; live when configured)
- [x] **Plane** — project/task sync for the LinkSites run (mock/shadow minimum; studio secrets via GSM)
- [x] **LiNKbots** — judgment stages execute through runtime adapter with governance payload
- [x] **LiNKautowork** — deterministic workflow handles complete for artifact, mirror, Payload sync, checks, CRM/outreach gates
- [x] **LinkSkills** — capability leases on all gated side effects
- [x] **LiNKbrain** — audit events for run/stage/lease/workflow lifecycle; memory write proof for MVO path
- [x] **LiNKguard** — worker session cleanup and IP/confidentiality hooks engaged on bot runs

## 4. Repo boundaries

- [x] LinkSites **product** assets remain in `/Users/linktrend/Projects/LiNKsites` — integration only in this repo
- [x] Suite workflow map canonical in `suites/linksites/`

## 5. LiNKdev factory gates

- [x] Demo command or URL recorded in `LiNKdev/product/reports/<program-id>/STATUS.md`
- [x] `LiNKdev/factory/scripts/verify.sh` passes at `LINKDEV_TIER=critical` for release scope
- [x] Per-issue proof manifest where required (`proof-manifest.sh`)
- [x] Program proof manifest (`program-proof-manifest.sh`)
- [ ] Merge replay traceability (`replay-merge-verify.sh`) — run after completion PR merges
- [x] No open `linkdev:blocked` issues in STATE
- [ ] **Principal Release OK** (human gate before staging/main)

---

## Demo pointer

**MVO demo command:**

```bash
./scripts/run-mvo-linksites-demo.sh
```

Program STATUS: `LiNKdev/product/reports/linktrend-system/STATUS.md`

Historical runbook: `LiNKdev/product/archive/grounding-legacy/DEMO_RUNBOOK_WEBSITEFACTORY_MVO.md`
