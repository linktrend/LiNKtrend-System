# Dev Swarm Borrow Pack (frozen optional)

Quality and verification patterns borrowed from UBS and peer factories. **Not full UBS.** Implement phased; see bootstrap issues DS-031–DS-034.

| ID | Item | Status in LiNKtrend bootstrap |
|----|------|------------------------------|
| DS-B1 | Mechanical verify subset (`scripts/verify.sh`) | Implemented |
| DS-B2 | No vacuous PASS in Reviewer | Implemented in reviewer prompt |
| DS-B3 | Testable acceptance criteria on issues | Implemented in issue template |
| DS-B4 | DAG validation on program plan | Implemented (`scripts/validate-dag.sh`) |
| DS-B5 | Structured proof block in reports | Implemented in report template |
| DS-B6 | Issue tiers (`standard`, `critical`) | Implemented in issue template |
| DS-B7 | Light proof manifest | Implemented (`scripts/proof-manifest.sh`) |
| DS-B8 | Portable root `AGENTS.md` | Implemented at repo root |
| DS-B9 | Git + verify before `swarm:merge-ready` | Documented in executor/integrator prompts |
| DS-B10 | Trajectory / debug in reports | Implemented in report template |
| DS-B11 | Benchmark hook stub | `automations/README.md` |
| DS-B12 | Sandbox decision | `docs/DEV_SWARM_SANDBOX.md` |
| DS-B13 | Per-issue `runtime` field | Implemented in contracts + templates |

**Rejected for Dev Swarm:** 28-gate UBS bundle, mandatory multi-Opus adversarial review, mandatory cosign witness, Antigravity in core, second Python orchestration stack (CrewAI/LangGraph).
