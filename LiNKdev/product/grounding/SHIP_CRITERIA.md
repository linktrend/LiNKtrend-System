# Ship criteria (program complete)

**MVO = LiNKaios Client + LiNKtrend Admin + LinkSites one-lead full loop.**

Checklist for **Program Definition of Done**. The program is not complete until every item below is satisfied.

**Honest status (2026-06-01):** Engineering mock/shadow proof on `development` — **YES**. First-licensee production proof (UI-linked live persisted run) — **NO** until Principal signs that path. Live GSM-backed Payload, Zulip, and Plane **live** modes require Principal env + Release OK before production ship.

**UI/UX review (2026-06-01):** [MVO_UI_UX_REVIEW_REPORT_2026-06-01.md](../../../MVO_UI_UX_REVIEW_REPORT_2026-06-01.md) — see **Amendments** for Principal framing.

---

## Production vs development proof

Two layers must not be conflated:

| Layer | What it proves | How |
|-------|----------------|-----|
| **Development / engineering** | Mock/shadow loop, leases, workflows, brain events, trace plumbing, factory verify | `./scripts/run-mvo-linksites-demo.sh`, `verify.sh`, checked items below tagged *(eng)* |
| **Production / Principal** | First LinkSites client can operate end-to-end with **persisted** run visible in UI, mocks **off**, no fixture labels on sign-off path | Browser proof + same run IDs in Client/Admin; Release OK; live capability modes where required |

**Rules:**

- A checked box below means **engineering/mock proof** unless the row says *(production)*.
- `./scripts/run-mvo-linksites-demo.sh` alone is **not** UI E2E proof.
- `LINKAIOS_UI_MOCKS=1` is for UX fixture review only; Principal turned mocks **off** for production-like UI review (see `.env.example`).
- Alerts: integration warnings acceptable on mock/thin env; **blocking** for production until log-backed alerts load without fixture copy.

**Production proof still open *(production)*:**

- [ ] One full LinkSites run **persisted** and visible in Client + Admin UI (Lead → … → Close/Recycle) with trace IDs, mocks off
- [ ] No “Synthetic … layout review” (or equivalent) on the Principal sign-off path
- [ ] Admin Alerts (and equivalent operational panels) load from real logs/telemetry in production-like config
- [ ] Principal **Release OK** before `development` → `staging` → `main`

---

## 1. System surfaces (Client + Admin)

- [x] **LiNKaios Client** *(eng)* — sign-in, LinkSites Suite, project launch, trace surfaces (kernel + Client; optional kernel E2E with local `.env`)
- [ ] **LiNKaios Client** *(production)* — licensee follows a **persisted** live run in UI with mocks off and no fixture-only proof path
- [x] **LiNKtrend Admin** *(eng)* — full vendor catalogue (**D4 B**): licensees, Suite publish/visibility, cross-tenant LiNKbot fleet, Capability admin, troubleshoot — with cross-tenant safety
- [ ] **LiNKtrend Admin** *(production)* — cross-tenant ops panels (e.g. Alerts) stable without fixture rows on sign-off path
- [x] Role-based access *(eng)* — operator approvals (budget, knowledge, side effects) per company policy

## 2. LinkSites end-to-end (one lead)

*Eng = demo script / mock-shadow / tests. Production = same stages with persisted UI proof and Principal sign-off path.*

- [x] **Lead intake** *(eng)* — governed **mock** demo lead (**D1 B**); lease/audit/trace (live Maps post-MVO)
- [x] **Research & enrichment** *(eng)* — LiNKbot provenance-backed context in demo path
- [x] **Template & build** *(eng)* — package from LiNKsites template guidance (`marketing-smb-v1` registry)
- [x] **Publish** *(eng)* — Payload sync mock/shadow (`LINKAUTOWORK_MVO_MODE`); `businessname.linktrend.media` pattern documented
- [x] **Outreach** *(eng)* — **draft-only** (**D2 A**); approval gate + trace; live send only when explicitly approved
- [x] **Librarian loop** *(eng)* — company knowledge + world brain contribution (**D3 B**; LiNKguard policy)
- [x] **Trace completeness** *(eng)* — lease + workflow + audit refs in trace view (kernel + autowork tests)
- [x] **Close or recycle path** *(eng)* — subscribe/transfer vs recycle documented (`close-recycle.ts` + workflow.md)
- [ ] **Full loop UI proof** *(production)* — one lead through all stages above, **visible in Client/Admin UI** with run IDs, mocks off (see STATUS.md checklist)

## 3. Required infrastructure

- [x] **Supabase** *(eng)* — migrations in repo; RLS; brain/kernel schemas exposed to API (live apply = deploy step)
- [x] **Zulip** *(eng)* — mock send minimum for run messaging
- [ ] **Zulip** *(production)* — live stream/topic for sign-off run when Principal enables
- [x] **Plane** *(eng)* — mock/shadow minimum; studio secrets via GSM
- [ ] **Plane** *(production)* — live sync on sign-off run when approved
- [x] **LiNKbots** — judgment stages execute through runtime adapter with governance payload
- [x] **LiNKautowork** — deterministic workflow handles complete for artifact, mirror, Payload sync, checks, CRM/outreach gates
- [x] **LinkSkills** — capability leases on all gated side effects
- [x] **LiNKbrain** — audit events for run/stage/lease/workflow lifecycle; memory write proof for MVO path
- [x] **LiNKguard** — worker session cleanup and IP/confidentiality hooks engaged on bot runs

## 4. Repo boundaries

- [x] LinkSites **product** assets remain in `/Users/linktrend/Projects/LiNKsites` — integration only in this repo
- [x] Suite workflow map canonical in `suites/linksites/`

## 5. LiNKdev factory gates

- [x] Demo command recorded in `LiNKdev/product/reports/<program-id>/STATUS.md` *(eng — not UI E2E)*
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
