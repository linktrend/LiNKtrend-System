# LiNKbot-core Upstream Sync + Integration Readiness (WP-061)

Date: 2026-05-15
Coordinator repo: `/Users/linktrend/Projects/LiNKtrend-System-wp061`
Target repo: `/Users/linktrend/Projects/LiNKbot-core`

## 1) Target repo git proof

### Remotes

```bash
git -C /Users/linktrend/Projects/LiNKbot-core remote -v
origin   https://github.com/linktrend/LiNKbot-core (fetch)
origin   https://github.com/linktrend/LiNKbot-core (push)
upstream https://github.com/openclaw/openclaw.git (fetch)
upstream https://github.com/openclaw/openclaw.git (push)
```

### Branch/state before sync trial

```bash
git -C /Users/linktrend/Projects/LiNKbot-core status --short --branch
## dev/codex/WP-061-linkbot-core-upstream-sync-integration-readiness
```

```bash
git -C /Users/linktrend/Projects/LiNKbot-core rev-parse HEAD
ee1716c5ba2b46a19ea8beebaf7096791d4e1052
```

### Sync commands executed

```bash
git -C /Users/linktrend/Projects/LiNKbot-core fetch upstream --prune
git -C /Users/linktrend/Projects/LiNKbot-core fetch origin --prune
```

Upstream moved during this run:

- previous observed upstream main: `778ad09ff2456d52f7b5a761ee99f2330498179b`
- current upstream main after fetch: `21b6dcbe37...` (from fetch output `778ad09ff2..21b6dcbe37 main -> upstream/main`)

Divergence snapshot captured immediately after fetch:

```bash
git -C /Users/linktrend/Projects/LiNKbot-core rev-list --left-right --count upstream/main...HEAD
16537 8
```

### Sync attempt result

```bash
git -C /Users/linktrend/Projects/LiNKbot-core merge --no-commit --no-ff upstream/main
```

Result: conflict-heavy; merge was aborted.

Conflict classes observed:

- `modify/delete` across many `.github/workflows/*` files (fork deleted while upstream modified)
- `content` conflicts in:
  - `.github/workflows/ci.yml`
  - `src/agents/command/types.ts`
  - `src/agents/pi-embedded-runner/run.ts`
  - `src/config/types.openclaw.ts`
  - `src/gateway/server-methods/agent.ts`

Rollback executed:

```bash
git -C /Users/linktrend/Projects/LiNKbot-core merge --abort
```

### Branch/state after sync trial

```bash
git -C /Users/linktrend/Projects/LiNKbot-core status --short --branch
## dev/codex/WP-061-linkbot-core-upstream-sync-integration-readiness
```

No target-repo file was committed in WP-061.

## 2) Integration readiness findings (evidence-based)

### Already present in LiNKbot-core fork

1. Governance payload ingress exists on gateway `agent` RPC:
   - `src/gateway/protocol/schema/agent.ts` includes `linktrendGovernance` in `AgentParamsSchema`.

2. Governance is forwarded at runtime ingress boundary:
   - `src/gateway/server-methods/agent.ts` passes `linktrendGovernance: request.linktrendGovernance` into `agentCommandFromIngress(...)`.

3. Governance enforcement and injection surface exists:
   - `src/linktrend/governance.ts` enforces bootstrap checks and optional fail-closed flags.
   - emits lifecycle events with `data.kind = "linktrend.gov"` and phases like `bootstrap_check`, `bootstrap_denied`, `bootstrap_accepted`, `context_injected`, `capability_surface_set`.

4. Approved tool slicing exists:
   - `approvedTools.toolNames` maps to `toolsAllow` and is applied in embedded runner path.

5. Upstream-safe fork policy exists:
   - `.github/workflows/upstream-sync.yml` syncs only to fork `development` and explicitly says manual conflict resolution in fork.

### Gaps to close for LiNKtrend planes

1. LiNKaios dispatch hardening gap
   - Governance fields are optional by schema/config default.
   - For production readiness, enable fail-closed policy in fork config:
     - `linktrendGovernance.enabled=true`
     - `requireIngressGovernancePayload=true`
     - `requireBootstrapAuthorization=true`
     - `requireMissionContext=true`

2. LinkSkills lease/capability governance gap
   - Current fork constrains tool names (`toolsAllow`) but does not validate LinkSkills lease ids / capability permissions at engine boundary.
   - Needed in wrapper packets: pass lease-derived allowed surface and verify lease context before ingress call.

3. LiNKbrain audit contract mapping gap
   - Fork emits local lifecycle events, but translation into canonical LiNKbrain audit envelope and event taxonomy is not implemented in this repo.
   - Needed packet: bridge event mapping in LiNKtrend monorepo observer/ingress path.

4. LiNKautowork deterministic handoff gap
   - No built-in deterministic workflow handles (`autowork.linksites.*`) live in fork.
   - Needed packet: wrapper-level orchestrator that receives stage outputs and runs LiNKautowork handles with lease ids and idempotency keys.

5. Zulip integration gap
   - Fork supports generic channel delivery, but LiNKtrend-specific run/status messaging policy (mock/shadow/live modes, stream/topic templates, and governance approval path) remains outside fork.
   - Needed packet: LinkSkills capability + LiNKaios policy wiring for Zulip run notifications.

6. Hooks ingress mismatch warning (already documented)
   - `docs/linktrend-governance.md` states `/hooks/.../agent` normalization does not carry `linktrendGovernance` reliably.
   - Integration should target gateway `agent` RPC (or an adapter that preserves full governed payload).

## 3) Recommended next packets

- WP-061A: Upstream conflict strategy (workflow file policy + governance file conflict resolution) to allow recurring sync without manual large conflict sets.
- WP-061B: LiNKaios ingress fail-closed policy rollout for `linktrendGovernance` required fields.
- WP-061C: LinkSkills lease -> `toolsAllow` projection and lease evidence propagation.
- WP-061D: LiNKbrain lifecycle event mapping from `linktrend.gov` to canonical audit envelope.
- WP-061E: LiNKautowork stage handoff pipeline with deterministic workflow ids and idempotency propagation.
- WP-061F: Zulip run-notification governance adapter (mock/shadow defaults).

## 4) Constraints honored

- No force push
- No upstream PR
- No live messaging sends
- No secrets
