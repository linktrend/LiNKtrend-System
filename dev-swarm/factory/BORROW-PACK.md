# Dev Swarm Borrow Pack

Quality and verification patterns borrowed from UBS and peer factories. **Not full UBS.** No second orchestration stack (CrewAI/LangGraph/n8n brain). No mandatory gstack `/ship` on every issue.

| ID | Item | Status |
|----|------|--------|
| DS-B1 | Mechanical verify (`factory/scripts/verify.sh`) | Active |
| DS-B2 | No vacuous PASS (Reviewer) | Active |
| DS-B3 | Testable acceptance criteria | Active |
| DS-B4 | DAG validation (`validate-dag.sh`) | Active |
| DS-B5 | Structured proof block in reports | Active |
| DS-B6 | Issue tiers (`standard`, `critical`) | Active |
| DS-B7 | Light proof manifest (`proof-manifest.sh`) | Active |
| DS-B8 | Portable `dev-swarm/AGENTS.md` | Active |
| DS-B9 | Git + verify before `swarm:merge-ready` | Active |
| DS-B10 | Trajectory / debug in reports | Active |
| DS-B11 | Benchmark hook stub | `factory/install/automations/README.md` |
| DS-B12 | Sandbox decision | `docs/DEV_SWARM_SANDBOX.md` |
| DS-B13 | Per-issue `runtime` field | Active |
| DS-B14 | **Program Definition of Done** in every `PROGRAM.md` | Required for new programs |
| DS-B15 | **Release phase** with ≥1 `critical` issue | Required for new programs |
| DS-B16 | `DEV_SWARM_SCOPE=.` on release verify | Release issues |
| DS-B17 | No vacuous program complete (Integrator) | Active |
| DS-B18 | Commit traceability `(<issue-id>)` | Integrator + Executor |

**Rejected:** 28-gate UBS bundle, mandatory multi-Opus adversarial review, mandatory cosign witness, Antigravity in core.
