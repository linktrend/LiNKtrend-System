# Wave 7 — LiNKaios Client (Linktrend tenant)

**Plan:** `STUDIO_FORWARD_PLAN.md` Wave 7 (7.1–7.6)  
**Branch:** `issue/wave6-7-10-studio-forward`  
**Date:** 2026-06-06

## Deliverables

| # | Deliverable | Status | Evidence |
|---|-------------|--------|----------|
| 7.1 | Client tenant `linktrend` + `ceo-client` | **PASS** | `studio-tenant-seed.ts`, `client-tenant-linktrend.ts` |
| 7.2 | LinkSites suite subscribed | **PASS** | `suite-subscribe.ts`, `company-fixtures` linktrend-studio |
| 7.3 | LiNKdeveloper Client-only subscribe | **PASS** | `suites/linkdeveloper/`, subscribe guard tests |
| 7.4 | Project Zulip + inbox parity | **PASS** | `project-channel-parity-panel.tsx` on project detail |
| 7.5 | Company modules → real entitlements | **PASS** | `modulesForCompany("linktrend-studio")` linksites + linkdeveloper |
| 7.6 | Cockpit / work / projects traces | **PASS** | `workers/page.tsx` studio suite run labels |

## Tests

```bash
./scripts/verify-wave7-client.sh
# client-tenant-linktrend.test.ts, studio-tenant-seed.test.ts — pass
```

**Wave 7: PASS**
