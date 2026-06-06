# Scripts

`scripts/` contains repo-level developer and verification scripts.

Current scripts:

- `run-e2e.ts`: local MVO end-to-end harness for the WebsiteFactory flow.
- `run-mvo-linksites-demo.sh` / `run-mvo-linksites-live.sh`: LinkSites MVO harnesses.
- `run-mvo-linksites-acceptance.sh`: Wave 11.3 MVO re-run + 13/13 verification.
- `verify-mvo-13-stages.mjs`: Assert `mvo-latest-run.json` has 13 succeeded stages.
- `verify-wave11-do-acceptance.sh`: Wave 11 DigitalOcean acceptance suite.
- `run-linkdeveloper-g2-pilot-prep.sh`: Wave 11.4 LiNKdeveloper G2 pilot local gates.
- `capture-ram-snapshot.sh`: Wave 11.5 RAM snapshot capture (VPS or local).

Do not place long-running product services here. Product runtime code belongs under its owning system folder, and reusable library code belongs under `packages/`.
