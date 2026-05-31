# WP-064 - LinkSkills Kill Switch and Safety Controls

## Objective

Implement kill switch state management, automated triggers, and admin override per SOP_MVO_CLASS_A §10.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-064-linkskills-kill-switch`
- Base: `development`

## Allowed files

- `packages/linkskills-core/src/safety/`
- `packages/linkskills-core/src/killswitch/`
- `packages/linkskills-core/src/api/safety.ts`
- `packages/linkskills-core/src/monitoring/`
- `packages/linklogic-sdk/src/types/safety.ts`
- `LiNKdev/product/reports/archive/legacy-ai-swarm/linkskills-agent.md`

## Prohibited files

- Old repo implementation
- LiNKaios kernel code
- Capability backends

## Required context

- `LiNKdev/product/grounding/LINKSKILLS_COMPLETION_PLAN.md` §4.4
- `/Users/linktrend/Projects/LiNKskills/SOP_MVO_CLASS_A.md` §10
- `/Users/linktrend/Projects/LiNKskills/SOP_MACHINE_MVO_CLASS_A.md` §9
- WP-061 (kill_switches table)

## Steps

1. Define kill switch types in SDK:
   - `KillSwitchLevel` enum (1=open, 2=halt, 3=emergency)
   - `KillSwitchState` enum (open, tripped)
   - `KillSwitchConfig` interface

2. Implement kill switch state API:
   - `GET /v1/safety/kill-switches` - list switches
   - `GET /v1/safety/kill-switches/{capability}` - specific switch
   - `POST /v1/safety/kill-switches/{capability}/trip` - manual trip
   - `POST /v1/safety/kill-switches/{capability}/reset` - admin reset
   - Global switch at `capability=null`

3. Implement kill switch check service:
   - `checkKillSwitch(tenant_id, capability)` - returns state
   - Called by lease request (WP-063)
   - If tripped, lease request returns `denied` with `LEASE_KILL_SWITCH`

4. Implement automated triggers:

   a. Runaway cost detection:
   - Monitor spend per 15-minute window
   - Threshold: > $75 in 15 min
   - Threshold: burn-rate > 3x 24h average for 10 min
   - Threshold: projected month-end > $1000 in 2 consecutive 5-min windows

   b. Security trigger detection:
   - Count critical exceptions per 10-min window
   - Threshold: >= 3 critical in 10 min
   - Count invalid signature/replay failures per 5-min window
   - Threshold: >= 10 from one source in 5 min
   - Credential compromise signal (manual trigger)

5. Implement Level 2 halt behavior:
   - Block new lease requests immediately
   - In-flight leases complete (unless hard-cancel)
   - Emit `safety.level_2_halt` audit event

6. Implement Level 3 emergency rollback (scaffold):
   - Trigger condition: pass rate < 0.80 (min 30 samples)
   - Deterministic rollback to last certified version
   - Deferred: full implementation post-MVO

7. Implement admin dashboard API:
   - Current safety status
   - Trigger history
   - Override controls

## Acceptance criteria

- [ ] Per-capability kill switch state stored and checked
- [ ] Global Level 2 halt blocks new lease requests
- [ ] Runaway cost detection triggers correctly
- [ ] Security exception detection triggers correctly
- [ ] Manual trip/reset works
- [ ] Kill switch state included in `LeaseDecision`
- [ ] In-flight leases complete during halt (no hard cancel)
- [ ] Audit events: `safety.level_2_halt`, `killswitch.tripped`, `killswitch.reset`

## Proof required

- Kill switch integration test (trip → lease denied → reset → lease granted)
- Automated trigger simulation tests
- Admin API test output
- Audit event verification

## Blockers

- WP-061 (kill_switches table) must complete
- Cost monitoring requires billing integration (coordinate with LiNKbrain)

## Notes

- Thresholds from SOP_MVO_CLASS_A are starting points
- Actual thresholds may be tuned based on operational data
- Level 3 rollback is scaffolding only for MVO
- Coordinate with WP-063 for lease integration
