# Ship criteria (program complete)

Checklist for **Program Definition of Done** (DS-B14). Planner fills when building the program after Chairman OK on the finished-product narrative.

- [ ] Demo command or URL recorded in `dev-swarm/product/reports/<program-id>/STATUS.md`
- [ ] `dev-swarm/factory/scripts/verify.sh` passes at `DEV_SWARM_TIER=critical` for release scope
- [ ] Per-issue proof manifest where required (`dev-swarm/factory/scripts/proof-manifest.sh <report.md>`)
- [ ] Program proof manifest (`dev-swarm/factory/scripts/program-proof-manifest.sh <program-id>`)
- [ ] Merge replay traceability (`dev-swarm/factory/scripts/replay-merge-verify.sh <program-id>`)
- [ ] No open `swarm:blocked` issues in STATE
- [ ] Chairman Release OK (human; before staging/main)
