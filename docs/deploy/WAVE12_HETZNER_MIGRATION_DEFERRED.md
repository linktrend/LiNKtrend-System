# Wave 12 — Hetzner migration (DEFERRED)

**Status:** **DEFERRED** — do not execute until Wave 11 DigitalOcean acceptance is complete **and** Principal grants Release OK (11.7) **and** Hetzner account is ready.

**Date:** 2026-06-06  
**Plan:** `STUDIO_FORWARD_PLAN.md` Wave 12 (12.1–12.8)

---

## Why deferred

| Prerequisite | State |
|--------------|-------|
| Wave 11 DO acceptance | In progress — `wave11-do-acceptance.md` |
| Principal Release OK (11.7) | **Human gate** — not automated |
| Hetzner account + EX44 ordering | Principal / ops |
| DO 48h standby rollback window | Required after cutover |

Launch and test remain on **DigitalOcean** (`linkdroplet-00`, `linkdroplet-01`) per STUDIO_FORWARD_PLAN §1.7 Phase A.

---

## Intended topology (when un-deferred)

| Node | Hetzner | Replaces | Services |
|------|---------|----------|----------|
| Compute | EX44 64 GB | `linkdroplet-00` | Traefik, LiNKaios, OpenClaw, AZ, n8n, CMS, LiNKdeveloper, LiNKsuitegen, council |
| Collaboration | EX44 64 GB | `linkdroplet-01` | Zulip, Plane, Odoo |

Same compose topology, GSM env render, Tailscale DNS — provider and sizing change only.

---

## Wave 12 deliverables (not started)

| # | Deliverable | Acceptance |
|---|-------------|------------|
| 12.1 | Provision 2× Hetzner EX44, Tailscale join | SSH + tailscale ping |
| 12.2 | Docker, Traefik, internal CA | HTTPS internal |
| 12.3 | Parallel deploy: GSM render + `docker compose up` | Health URLs green |
| 12.4 | Supabase cloud; webhook URL updates | Zulip/Plane callbacks |
| 12.5 | Volume migration (OpenClaw state, n8n, CMS media) | Stateful continuity |
| 12.6 | DNS/Tailscale cutover; DO standby 48h | Rollback documented |
| 12.7 | Re-run Wave 11.2–11.4 on Hetzner | Parity proof |
| 12.8 | Decommission or downsize DO | Cost confirmation |

---

## Un-defer checklist

- [ ] `./scripts/verify-wave11-do-acceptance.sh` PASS on DO
- [ ] Principal **Release OK** for staging → production on DO (11.7)
- [ ] RAM snapshot reviewed (`docs/ops/linkdroplet-00-ram-snapshot.md`)
- [ ] Hetzner account funded; EX44 instances provisioned
- [ ] Runbook owner assigned for 12.6 cutover window

---

## References

- `deploy/README.md`
- `LiNKdev/product/reports/linktrend-system/STUDIO_FORWARD_PLAN.md` Wave 12
- `docs/ecosystem/FLEET_AND_RUNTIME_POLICY.md` §7
