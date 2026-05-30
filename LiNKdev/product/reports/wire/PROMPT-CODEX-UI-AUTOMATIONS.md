# Agent prompt: LiNKdev UI automations (Codex computer use)

You configure **Cursor** and **Codex** cloud automations in the provider web UIs for repo **linktrend/LiNKtrend-System**.

## Read first (in order)

1. `LiNKdev/factory/install/automations/AUTOMATION-MANIFEST.md`
2. `LiNKdev/factory/install/automations/CURSOR-CREATE-AUTOMATIONS.md`
3. `LiNKdev/factory/install/automations/CODEX-CREATE-AUTOMATIONS.md`

## Triggers (label contract)

| Automation | Labels / trigger |
|------------|------------------|
| LiNKdev-orchestrator | Merge/push to `development` |
| LiNKdev-reviewer | `linkdev:review-ready` |
| LiNKdev-integrator | `linkdev:merge-ready` |
| LiNKdev-executor-cursor | `linkdev:ready` + `runtime:cursor` |
| LiNKdev-executor-codex | `linkdev:ready` + `runtime:codex` |

Use **linkdev:** labels only (not legacy `swarm:`).

## Output

Update `LiNKdev/product/reports/wire/wire-automation-setup.md` with:

- Each automation name, created Y/N, trigger configured Y/N, screenshot or URL if available
- Blockers (missing account feature, auth, etc.)

## Proof

When done, tell Principal: "UI automations configured — run a test issue with `linkdev:ready` + `runtime:cursor` to confirm fire."

Do not modify product application code.
